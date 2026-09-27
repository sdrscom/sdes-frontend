import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadKnowledgeBase } from './knowledgeBase.js';
import { chatbotTools, executeTool } from './tools.js';
import { readFunctionCalls, readReplyText } from './readFunctionCalls.js';
import { sanitizeHistoryForGemini } from './chatHistory.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let systemInstruction = loadKnowledgeBase();

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // Normalize and sanitize incoming history so Gemini always receives a valid,
        // strictly-alternating chat transcript, no matter what the client sent.
        const sanitizedHistory = sanitizeHistoryForGemini(history, message);

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

        let result = await chat.sendMessage(message);
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
        // The widget always shows its own generic apology to the visitor regardless
        // of this body, so it's safe to include a diagnostic reason here — it helps
        // tell apart a Gemini quota/rate-limit error (429), a bad-request/config
        // error (400), and a genuine network failure without exposing secrets.
        const status = error?.status || error?.response?.status;
        res.status(500).send(`Connection error with AI server.${status ? ` [status:${status}]` : ''} ${error?.message || ''}`.trim());
    }
});

app.post('/api/voice-chat', async (req, res) => {
    try {
        const { audioBase64 } = req.body;

        if (!audioBase64) {
            throw new Error('No audio data received from frontend.');
        }

        const base64Data = audioBase64.split(',')[1];
        const mimeType = audioBase64.split(';')[0].split(':')[1];

        const voiceModel = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemInstruction,
            generationConfig: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        const prompt = `Listen to the audio. First, transcribe exactly what the user said in their original language. Then, provide a helpful answer as the SDRS AI Assistant. CRITICAL: You MUST write your 'reply' in the EXACT SAME LANGUAGE that the user spoke in the audio (e.g., if they speak Urdu, write your reply in Urdu script. If they speak Arabic, reply in Arabic). Output ONLY valid JSON. Format: {"transcript": "what they said", "reply": "your answer"}`;

        const audioPart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType || 'audio/webm'
            }
        };

        const result = await voiceModel.generateContent([prompt, audioPart]);
        const responseText = result.response.text();

        res.json(JSON.parse(responseText));
    } catch (error) {
        console.error('\n❌ Voice Processing Error:', error);
        res.status(500).json({
            reply: 'Sorry, I had trouble processing that audio. Could you try again?',
            transcript: '(Audio processing failed)'
        });
    }
});

// Reload knowledge base into memory without restarting the server.
app.post('/api/reload-knowledge', (req, res) => {
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