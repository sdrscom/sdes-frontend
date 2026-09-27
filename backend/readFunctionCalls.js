export function readFunctionCalls(response) {
    const calls = typeof response?.functionCalls === 'function'
        ? response.functionCalls()
        : response?.functionCalls;

    if (!Array.isArray(calls)) return [];

    return calls.filter(call => call && typeof call.name === 'string' && call.name.length > 0);
}

export function readReplyText(response) {
    const parts = response?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
        const text = parts
            .map(part => (typeof part?.text === 'string' ? part.text : ''))
            .join('')
            .trim();
        if (text) return text;
    }

    if (typeof response?.text === 'function') {
        try {
            const text = response.text();
            if (typeof text === 'string' && text.trim()) return text.trim();
        } catch {
            // RECITATION and similar finish reasons throw even when text parts exist.
        }
    }

    return '';
}
