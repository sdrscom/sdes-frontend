import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadKnowledgeBase } from './knowledgeBase.js';
import { chatbotTools, executeTool } from './tools.js';
import { readFunctionCalls, readReplyText } from './readFunctionCalls.js';
import { sanitizeHistoryForGemini, buildMessageParts } from './chatHistory.js';
import { validateChatRequest, validateHistoryPayload } from './validation.js';
import { withTimeout, withSingleRetry } from './reliability.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Vercel sits in front of this function as a reverse proxy, so Express needs to
// trust its X-Forwarded-For header to see the real visitor IP. Without this,
// express-rate-limit would either rate-limit everyone as one shared IP or refuse
// to start under its own anti-misconfiguration check.
app.set('trust proxy', 1);

const allowedOrigins = ['https://www.sdrs.com.sa', 'https://sdrs.com.sa'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// A malformed JSON body throws inside express.json() itself, before any route
// handler runs. Without this, Express falls back to its default HTML error page
// instead of a response consistent with the rest of this API.
app.use((err, req, res, next) => {
    if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
        return res.status(400).send('Invalid request body.');
    }
    next(err);
});

// Basic abuse/flood protection. Chat requests cost real money and count against a
// shared, limited Gemini quota — one visitor (or bot) sending requests in a tight
// loop can exhaust the day's budget for everyone else. This is intentionally
// generous for genuine back-and-forth conversation.
const chatRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests. Please wait a moment before sending another message.'
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let systemInstruction = loadKnowledgeBase();

// Cheap, dependency-free cost visibility: Gemini reports token counts on every
// response, but the code previously discarded that. Logging it gives at least a
// basic signal in Vercel's function logs for spotting unusually expensive turns,
// without standing up a full analytics/observability service.
function logTokenUsage(kind, response, startedAt) {
    const usage = response?.usageMetadata;
    const elapsedMs = startedAt ? Date.now() - startedAt : undefined;
    if (!usage && elapsedMs === undefined) return;
    console.log(`[gemini:${kind}] latency=${elapsedMs ?? '?'}ms prompt=${usage?.promptTokenCount ?? '?'} candidates=${usage?.candidatesTokenCount ?? '?'} total=${usage?.totalTokenCount ?? '?'}`);
}

// vercel.json sets maxDuration to 30s; keep our own timeout comfortably below
// that so our catch block gets to respond with a friendly message before the
// platform kills the function outright with a generic error.
const GEMINI_TIMEOUT_MS = 25000;

app.post('/api/chat', chatRateLimiter, async (req, res) => {
    try {
        const { message, history, attachmentBase64, attachmentMimeType, uiLanguage } = req.body;

        const validation = validateChatRequest(req.body);
        if (!validation.valid) {
            return res.status(validation.status).send(validation.error);
        }

        // Normalize and sanitize incoming history so Gemini always receives a valid,
        // strictly-alternating chat transcript, no matter what the client sent.
        const sanitizedHistory = sanitizeHistoryForGemini(history, message);

        // Build the message as multiple parts so an attachment's actual bytes reach
        // Gemini instead of just its filename. Previously the widget only sent a text
        // placeholder like "[Attachment: invoice.pdf (245 KB)]" — Gemini never saw the
        // file itself, so it could not answer any question about its contents.
        const messageParts = buildMessageParts(message, attachmentBase64, attachmentMimeType);

        // The site has its own English/Arabic toggle. The system prompt already
        // replies in whichever language the user's message is clearly written in,
        // but that does nothing for an ambiguous first message (e.g. just a name,
        // a number, or "hi") sent while the site is set to Arabic — previously
        // that always defaulted to English regardless. Only ever honor the exact
        // literal value 'ar' here; anything else (including an absent field) is
        // ignored rather than interpolated, since this comes from client input.
        if (uiLanguage === 'ar') {
            messageParts.unshift({
                text: "[Context, not part of the user's message: this chat widget's interface is currently set to Arabic. If the message below is ambiguous about language (e.g. a short greeting, a name, or a number), reply in Arabic. If the message is clearly written in English or another language, reply in that language instead.]"
            });
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemInstruction,
            tools: chatbotTools,
            // Casual and short factual replies don't need extended internal reasoning.
            // Keeping a small thinking budget cuts latency well below Vercel's function
            // timeout, which was likely why some replies hung for 60+ seconds and failed.
            generationConfig: { thinkingConfig: { thinkingBudget: 0 } }
        });

        const chat = model.startChat({ history: sanitizedHistory });

        const startedAt = Date.now();
        let result = await withSingleRetry(() => withTimeout(() => chat.sendMessage(messageParts), GEMINI_TIMEOUT_MS, 'Gemini chat request'));
        logTokenUsage('chat', result?.response, startedAt);
        const callList = readFunctionCalls(result?.response);
        let finalMessage = readReplyText(result?.response);

        if (callList.length > 0) {
            const toolCall = callList[0];
            const toolResult = await executeTool(toolCall.name, toolCall.args);

            try {
                result = await chat.sendMessage([{
                    functionResponse: {
                        name: toolCall.name,
                        response: toolResult
                    }
                }]);
                finalMessage = readReplyText(result?.response) || finalMessage;
            } catch (toolError) {
                console.error('Tool follow-up failed:', toolError);
            }
        }

        if (!finalMessage) {
            finalMessage = 'I could not complete that answer. Please ask again, or contact the SDRS commercial team at info@sdrs.com.sa.';
        }

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        const chunkSize = 20;
        for (let i = 0; i < finalMessage.length; i += chunkSize) {
            res.write(finalMessage.slice(i, i + chunkSize));
        }
        res.end();
    } catch (error) {
        console.error('\n❌ Text Chat Error:', error);
        // Regression fix: this previously always sent HTTP 500, even for a Gemini
        // 429 (quota exhausted) or 400 (bad request) — so the frontend's
        // "usage limit reached" branch, which checked response.status === 429, could
        // never actually trigger; users only ever saw the generic apology. Forward
        // the real upstream status when it's a valid HTTP error code so the widget
        // can tell these cases apart, and fall back to 500 only for genuine
        // unknown/network failures.
        const upstreamStatus = error?.status || error?.response?.status;
        const status = (upstreamStatus >= 400 && upstreamStatus < 600) ? upstreamStatus : 500;
        const message = status === 429
            ? 'Our assistant has reached its usage limit for now. Please try again later, or reach our team directly at info@sdrs.com.sa.'
            : status === 504
                ? 'That took longer than expected to answer. Please try asking again, perhaps with a shorter question.'
                : `Connection error with AI server. ${error?.message || ''}`.trim();
        res.status(status).send(message);
    }
});

app.post('/api/voice-chat', chatRateLimiter, async (req, res) => {
    try {
        const { audioBase64, history, uiLanguage } = req.body;

        if (!audioBase64) {
            throw new Error('No audio data received from frontend.');
        }

        if (typeof audioBase64 !== 'string' || audioBase64.length > 10 * 1024 * 1024) {
            return res.status(400).json({
                reply: 'That recording is too large to process. Please try a shorter message.',
                transcript: '(Audio rejected: too large)'
            });
        }

        const historyCheck = validateHistoryPayload(history);
        if (!historyCheck.valid) {
            return res.status(historyCheck.status).json({
                reply: historyCheck.error,
                transcript: ''
            });
        }

        const base64Data = audioBase64.split(',')[1];
        const mimeType = audioBase64.split(';')[0].split(':')[1];

        const voiceModel = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemInstruction,
            generationConfig: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 0 },
                // The prompt below already asks for "2 to 4 short sentences",
                // but nothing previously stopped the model from occasionally
                // generating a much longer reply anyway — and every extra
                // token directly adds to how long the caller sits waiting
                // before anything can be spoken back. 300 tokens comfortably
                // covers a few conversational sentences while capping the
                // worst case.
                maxOutputTokens: 300
            }
        });

        // The shared system instruction's "3-6 short bullets" sales-desk format is
        // written for the text chat window, not for a voice call — a bulleted list
        // read aloud sentence-by-sentence with no connecting words is a big part of
        // why live voice mode sounds stilted/robotic even with a good TTS voice.
        // Explicitly override that formatting rule for this endpoint only.
        // Same site-wide language hint as /api/chat: only acted on for genuinely
        // ambiguous audio (e.g. a one-word reply, or speech in an unclear accent)
        // where the model can't otherwise tell what language to answer in.
        const uiLanguageHint = uiLanguage === 'ar'
            ? ' This widget\'s interface is currently set to Arabic — if the speaker\'s language is genuinely ambiguous or unclear from the audio, default to replying in Arabic.'
            : '';
        const prompt = `Listen to the audio. First, transcribe exactly what the user said in their original language. Then, provide a helpful answer as Fares, the SDRS AI Assistant. CRITICAL: You MUST write your 'reply' in the EXACT SAME LANGUAGE that the user spoke in the audio (e.g., if they speak Urdu, write your reply in Urdu script. If they speak Arabic, reply in Arabic).${uiLanguageHint} This reply will be read aloud by text-to-speech, not displayed as text, so write it the way a knowledgeable person would actually speak on a phone call: short, flowing, natural sentences connected with normal spoken words like "and", "also", or "on top of that". Do NOT use bullet points, numbered lists, markdown formatting (no asterisks, dashes, or headers), or any symbols that would sound strange read aloud. Keep it warm and concise — 2 to 4 short sentences is usually enough. Output ONLY valid JSON. Format: {"transcript": "what they said", "reply": "your answer"}`;

        const audioPart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType || 'audio/webm'
            }
        };

        // Each voice turn previously called generateContent() in isolation, with no
        // memory of earlier turns in the same voice session — a follow-up question
        // like "what about pricing" had no idea what it was following up on. Route
        // it through a chat session with sanitized history instead, same as text chat.
        const sanitizedHistory = sanitizeHistoryForGemini(history, undefined);
        const voiceChat = voiceModel.startChat({ history: sanitizedHistory });

        const voiceStartedAt = Date.now();
        const result = await withTimeout(() => voiceChat.sendMessage([prompt, audioPart]), GEMINI_TIMEOUT_MS, 'Gemini voice-chat request');
        logTokenUsage('voice-chat', result?.response, voiceStartedAt);
        const responseText = readReplyText(result?.response);

        if (!responseText) {
            throw new Error('Gemini returned no usable text for the audio turn.');
        }

        // Gemini can occasionally wrap JSON in a ```json fence even with
        // responseMimeType set, especially for longer replies. Strip that before parsing
        // instead of letting a strict JSON.parse throw on an otherwise-valid response.
        const cleaned = responseText.trim().replace(/^```json\s*|```$/g, '').trim();
        res.json(JSON.parse(cleaned));
    } catch (error) {
        console.error('\n❌ Voice Processing Error:', error);
        res.status(500).json({
            reply: 'Sorry, I had trouble processing that audio. Could you try again?',
            transcript: '(Audio processing failed)'
        });
    }
});

// Reload knowledge base into memory without restarting the server. This is an
// operator/admin action, not something the public widget ever calls — it was
// previously wide open, so anyone who found the URL could trigger it. Require a
// shared secret; with none configured, deny by default rather than staying open.
app.post('/api/reload-knowledge', (req, res) => {
    const configuredSecret = process.env.RELOAD_SECRET;
    const providedSecret = req.get('x-reload-secret');

    if (!configuredSecret || providedSecret !== configuredSecret) {
        return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    try {
        systemInstruction = loadKnowledgeBase();
        res.json({ success: true, message: 'Knowledge base reloaded.' });
    } catch (e) {
        console.error('Failed to reload knowledge base:', e);
        res.status(500).json({ success: false, error: e.toString() });
    }
});

// Only start the standalone server if running locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`\n🚀 Server is running on port ${port}`);
    });
}

export default app;