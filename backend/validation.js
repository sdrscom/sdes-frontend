// Pure request-validation helpers for /api/chat. Extracted so they can be unit
// tested directly (see test/system-instruction.mjs) instead of only being
// exercised indirectly through the Express route.

export const MAX_MESSAGE_LENGTH = 6000;
// Matches the frontend's MAX_ATTACHMENT_BYTES guard in Chatbot.jsx, plus room for
// base64's ~33% inflation and JSON overhead, kept comfortably under Vercel's
// ~4.5MB serverless request body limit.
export const MAX_ATTACHMENT_BASE64_LENGTH = 6 * 1024 * 1024;
// `history` only ever needs to hold a handful of short chat turns — the
// frontend itself never sends more than a normal conversation's worth of
// text. Without an explicit cap here, any direct API caller (bypassing the
// widget entirely) could attach megabytes of text across many history turns
// on every request; sanitizeHistoryForGemini() only trims the *number* of
// turns (to 24), not their size, so an oversized payload would still reach
// Gemini on every single request, burning shared quota/cost and latency for
// every visitor. 80KB comfortably covers dozens of real turns.
export const MAX_HISTORY_JSON_BYTES = 80 * 1024;

/**
 * Validates a /api/chat request body before any Gemini call is made. Returns
 * { valid: true } or { valid: false, status, error } with a user-safe message.
 * Catches the cases that previously either crashed, silently wasted a Gemini
 * quota call on garbage input, or had no server-side check at all (the widget
 * enforced some of this client-side, but a direct API call bypassed it).
 */
export function validateChatRequest(body) {
    const { message, attachmentBase64 } = body || {};

    if (message !== undefined && typeof message !== 'string') {
        return { valid: false, status: 400, error: 'message must be a string.' };
    }

    if (attachmentBase64 !== undefined && typeof attachmentBase64 !== 'string') {
        return { valid: false, status: 400, error: 'attachmentBase64 must be a string.' };
    }

    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!trimmedMessage && !attachmentBase64) {
        return { valid: false, status: 400, error: 'Message cannot be empty.' };
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        return {
            valid: false,
            status: 400,
            error: `Message is too long (${trimmedMessage.length} characters). Please keep it under ${MAX_MESSAGE_LENGTH} characters.`
        };
    }

    if (attachmentBase64 && attachmentBase64.length > MAX_ATTACHMENT_BASE64_LENGTH) {
        return { valid: false, status: 413, error: 'Attachment is too large.' };
    }

    const historyCheck = validateHistoryPayload(body?.history);
    if (!historyCheck.valid) {
        return historyCheck;
    }

    return { valid: true };
}

/**
 * Shared by /api/chat and /api/voice-chat. `history` is optional, but if
 * present it must be a reasonably-sized array — see MAX_HISTORY_JSON_BYTES.
 */
export function validateHistoryPayload(history) {
    if (history === undefined || history === null) {
        return { valid: true };
    }

    if (!Array.isArray(history)) {
        return { valid: false, status: 400, error: 'history must be an array.' };
    }

    let serializedLength;
    try {
        serializedLength = Buffer.byteLength(JSON.stringify(history), 'utf8');
    } catch (e) {
        return { valid: false, status: 400, error: 'history is not valid JSON.' };
    }

    if (serializedLength > MAX_HISTORY_JSON_BYTES) {
        return { valid: false, status: 413, error: 'Conversation history is too large.' };
    }

    return { valid: true };
}
