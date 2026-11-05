// Direct REST generateContent. @google/generative-ai 0.24 is deprecated and
// does not send Gemini 3 thinkingLevel correctly, so chat turns hang until our
// timeout and the visitor only ever sees the phone/email fallback.
import { TimeoutError, thinkingConfigForModel } from './reliability.js';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function generateGeminiTurn({
    apiKey,
    modelName,
    systemInstruction,
    history = [],
    userParts,
    maxOutputTokens,
    timeoutMs,
    label
}) {
    if (!apiKey) {
        const err = new Error('GEMINI_API_KEY is not set');
        err.status = 500;
        throw err;
    }

    const url = `${GEMINI_API_BASE}/${encodeURIComponent(modelName)}:generateContent`;
    const body = {
        systemInstruction: {
            parts: [{ text: String(systemInstruction || '') }]
        },
        contents: [
            ...(Array.isArray(history) ? history : []),
            { role: 'user', parts: userParts }
        ],
        generationConfig: {
            ...thinkingConfigForModel(modelName),
            maxOutputTokens
        }
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = Date.now();
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        const payload = await response.json().catch(() => ({}));
        const elapsedMs = Date.now() - startedAt;
        if (!response.ok) {
            const apiMessage = payload?.error?.message || `Gemini HTTP ${response.status}`;
            console.warn(`[gemini] ${label} ${modelName} ${response.status} ${elapsedMs}ms ${apiMessage}`);
            const err = new Error(apiMessage);
            err.status = response.status;
            throw err;
        }
        const usage = payload?.usageMetadata;
        console.log(`[gemini:${label}] model=${modelName} latency=${elapsedMs}ms prompt=${usage?.promptTokenCount ?? '?'} candidates=${usage?.candidatesTokenCount ?? '?'} total=${usage?.totalTokenCount ?? '?'}`);
        return { response: payload };
    } catch (error) {
        if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
            console.warn(`[gemini] ${label} ${modelName} aborted after ${timeoutMs}ms`);
            throw new TimeoutError(`${label} timed out after ${timeoutMs}ms`);
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
}
