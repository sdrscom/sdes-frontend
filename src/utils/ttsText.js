// Prepares text for text-to-speech. Markdown formatting (bullets, bold markers,
// links, headers) reads aloud as an unnatural, choppy list of fragments instead
// of flowing speech — a big part of why live voice mode can sound "robotic" even
// with a decent voice engine. This strips that formatting down to plain,
// speakable sentences.
export function stripMarkdownForSpeech(text) {
    if (!text) return '';
    let out = String(text);

    // Markdown links: [label](url) -> label. The URL itself is never useful
    // spoken aloud.
    out = out.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Bold/italic emphasis markers: **text**, __text__, *text*, _text_ -> text.
    out = out.replace(/\*\*([^*]+)\*\*/g, '$1');
    out = out.replace(/__([^_]+)__/g, '$1');
    out = out.replace(/\*([^*]+)\*/g, '$1');
    out = out.replace(/_([^_]+)_/g, '$1');

    // Inline code / backticks -> plain text.
    out = out.replace(/`([^`]+)`/g, '$1');

    // Heading markers at the start of a line.
    out = out.replace(/^#{1,6}\s+/gm, '');

    // Bullet and numbered list markers at the start of a line. Removing just the
    // marker (not the line) lets each item still read as its own short sentence
    // once newlines are converted to sentence breaks below.
    out = out.replace(/^\s*[-*•]\s+/gm, '');
    out = out.replace(/^\s*\d+[.)]\s+/gm, '');

    // Newlines read as an abrupt silent gap or run words together with no
    // separation, depending on the engine. A period gives every TTS engine a
    // consistent, natural pause between what were separate lines/list items.
    out = out.replace(/\n+/g, '. ');

    // Clean up artifacts left behind (double periods from a line that already
    // ended in punctuation, repeated whitespace).
    out = out.replace(/\.\s*\./g, '.');
    out = out.replace(/[ \t]{2,}/g, ' ').trim();

    return out;
}
