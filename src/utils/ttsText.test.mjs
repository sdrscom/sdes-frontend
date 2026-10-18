import assert from 'node:assert/strict';
import { stripMarkdownForSpeech } from './ttsText.js';

assert.equal(
    stripMarkdownForSpeech('**Storage**: closed warehouses, cold chambers.'),
    'Storage: closed warehouses, cold chambers.',
    'bold markers must be removed, keeping the inner text'
);

assert.equal(
    stripMarkdownForSpeech('- Save money on VAT\n- Save time with 24/7 customs\n- Flexible storage'),
    'Save money on VAT. Save time with 24/7 customs. Flexible storage',
    'bullet markers must be stripped and lines turned into separate spoken sentences'
);

assert.equal(
    stripMarkdownForSpeech('1. First step\n2. Second step'),
    'First step. Second step',
    'numbered list markers must be stripped the same way as bullets'
);

assert.equal(
    stripMarkdownForSpeech('Contact us at [our contact page](https://sdrs.com.sa/contact) for a quote.'),
    'Contact us at our contact page for a quote.',
    'markdown links must keep only the visible label, not the URL'
);

assert.equal(
    stripMarkdownForSpeech('# Services\nWe offer storage and customs.'),
    'Services. We offer storage and customs.',
    'heading markers must be removed'
);

assert.equal(
    stripMarkdownForSpeech('Plain sentence with no markdown at all.'),
    'Plain sentence with no markdown at all.',
    'plain text must pass through unchanged'
);

assert.equal(stripMarkdownForSpeech(''), '', 'empty input must return empty output, not throw');
assert.equal(stripMarkdownForSpeech(null), '', 'null/undefined input must not throw');

console.log('stripMarkdownForSpeech turns markdown-formatted text into natural, speakable sentences.');
