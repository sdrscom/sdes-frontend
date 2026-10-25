// Live voice asks Gemini for {"transcript","reply"} JSON. The model often
// wraps that in a fence, truncates it at maxOutputTokens, or slips into
// prose. A strict JSON.parse then threw and the caller heard
// "trouble processing that audio" even when a usable reply was there.

function unescapeJsonString(value) {
    try {
        return JSON.parse(`"${value}"`);
    } catch {
        return String(value || '').replace(/\\"/g, '"').replace(/\\n/g, ' ');
    }
}

export function parseVoiceModelOutput(text) {
    if (!text || typeof text !== 'string') return null;
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
    if (!cleaned) return null;

    try {
        const parsed = JSON.parse(cleaned);
        const reply = typeof parsed?.reply === 'string' ? parsed.reply.trim() : '';
        const transcript = typeof parsed?.transcript === 'string' ? parsed.transcript.trim() : '';
        if (reply) return { transcript, reply };
    } catch {
        // Fall through to a looser extract.
    }

    const replyMatch = cleaned.match(/"reply"\s*:\s*"((?:\\.|[^"\\])*)"/);
    if (replyMatch) {
        const transcriptMatch = cleaned.match(/"transcript"\s*:\s*"((?:\\.|[^"\\])*)"/);
        const reply = unescapeJsonString(replyMatch[1]).trim();
        if (reply) {
            return {
                transcript: transcriptMatch ? unescapeJsonString(transcriptMatch[1]).trim() : '',
                reply
            };
        }
    }

    if (cleaned.length <= 400 && !/GoogleGenerativeAI|generativelanguage\.googleapis/i.test(cleaned) && !cleaned.startsWith('{')) {
        return { transcript: '', reply: cleaned };
    }

    return null;
}
