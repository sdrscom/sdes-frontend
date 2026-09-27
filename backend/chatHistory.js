// Gemini's chat API requires turns in `contents` to strictly alternate user/model,
// starting with a user turn. The frontend is expected to send well-formed history,
// but a client bug (or any future caller) can easily produce two user turns in a
// row — for example, if a prior turn failed and its unanswered user message stayed
// in the transcript. When that happens the Gemini API rejects the whole request,
// which previously surfaced to the user as a generic, hard-to-diagnose 500.
//
// These helpers normalize whatever a client sends into a shape Gemini will accept,
// so a single malformed turn degrades gracefully instead of breaking the request.

export function normalizeHistory(hist) {
    if (!Array.isArray(hist)) return [];

    return hist.map(h => {
        const roleRaw = (h?.role || '').toString().toLowerCase();
        const role = (roleRaw === 'bot' || roleRaw === 'assistant' || roleRaw === 'model') ? 'model' : 'user';
        let parts = h?.parts;
        if (!Array.isArray(parts)) {
            parts = [{ text: h?.text || (typeof h === 'string' ? h : '') }];
        }
        return { role, parts };
    });
}

/**
 * Merges consecutive entries that share the same role into one entry, so the
 * result always alternates user/model. This preserves every message's text
 * (nothing is dropped) rather than silently discarding orphaned turns.
 */
export function enforceAlternatingRoles(history) {
    const merged = [];

    for (const entry of history) {
        const last = merged[merged.length - 1];
        if (last && last.role === entry.role) {
            last.parts = [...last.parts, ...(entry.parts || [])];
        } else {
            merged.push({ role: entry.role, parts: [...(entry.parts || [])] });
        }
    }

    return merged;
}

/**
 * Applies the full sanitization pipeline: normalize shapes, drop any leading
 * non-user turns (Gemini requires the transcript to start with 'user'), merge
 * consecutive same-role turns into a strict alternation, then drop a trailing
 * user turn that duplicates the message about to be sent (the widget currently
 * only sends prior turns, but this stays defensive in case a caller includes
 * the current turn inside history too).
 */
export function sanitizeHistoryForGemini(rawHistory, incomingMessage) {
    let history = normalizeHistory(rawHistory);

    while (history.length > 0 && history[0].role !== 'user') {
        history.shift();
    }

    history = enforceAlternatingRoles(history);

    const incoming = String(incomingMessage || '').trim();
    if (history.length > 0) {
        const last = history[history.length - 1];
        const lastText = (last.parts || []).map(part => part?.text || '').join('').trim();
        if (last.role === 'user' && lastText === incoming) {
            history.pop();
        }
    }

    return history;
}
