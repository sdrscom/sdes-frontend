// Arabic and Urdu are written with the same core Unicode block (U+0600–U+06FF),
// so checking for "any Arabic-range character" misclassifies every Arabic reply
// as Urdu. Urdu adds its own letters on top of the Arabic alphabet that Arabic
// never uses — retroflex/extra letters like ٹ ڈ ڑ ں ھ ے گ چ پ ژ — so only those
// reliably distinguish the two scripts.
const URDU_ONLY_LETTERS = /[\u0679\u0688\u0691\u06BA\u06BE\u06D2\u06AF\u0686\u067E\u0698]/;
const ARABIC_SCRIPT = /[\u0600-\u06FF]/;

/**
 * Picks the Google Translate TTS language code for a piece of assistant text.
 * Returns 'ur' for Urdu script, 'ar' for Arabic script, otherwise 'en-US'.
 */
export function detectVoiceLanguage(text) {
    const value = String(text ?? '');
    if (URDU_ONLY_LETTERS.test(value)) return 'ur';
    if (ARABIC_SCRIPT.test(value)) return 'ar';
    return 'en-US';
}
