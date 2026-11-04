const SMALL_TALK_RE = /^(hi|hello|hey|salam|salaam|thanks|thank you|thx|bye|goodbye|ok|مرحبا|السلام عليكم|السلام|شكراً|شكرا|مع السلامة|تمام)!?[.]?$/i;

export function isSmallTalk(text) {
    const value = String(text || '').trim();
    if (!value || value.length > 24) return false;
    return SMALL_TALK_RE.test(value);
}

export function smallTalkReply(message, uiLanguage) {
    if (!isSmallTalk(message)) return null;
    const value = String(message || '').trim();
    const arabic = uiLanguage === 'ar' || /[\u0600-\u06FF]/.test(value);
    if (/^(thanks|thank you|thx|شكراً|شكرا)!?[.]?$/i.test(value)) {
        return arabic ? 'العفو.' : "You're welcome.";
    }
    if (/^(bye|goodbye|مع السلامة)!?[.]?$/i.test(value)) {
        return arabic ? 'مع السلامة.' : 'Take care.';
    }
    if (/^(ok|تمام)!?[.]?$/i.test(value)) {
        return arabic ? 'تمام.' : 'Okay.';
    }
    return arabic
        ? 'مرحباً، أنا فارس. كيف أقدر أساعدك؟'
        : "Hi, I'm Fares. What can I help you with?";
}
