import assert from 'node:assert/strict';
import { detectVoiceLanguage } from './voiceLanguage.js';

// Real Arabic reply from the SDRS assistant — must use the Arabic voice, not Urdu.
assert.equal(
    detectVoiceLanguage('وعليكم السلام. كيف يمكنني مساعدتك اليوم؟'),
    'ar',
    'Arabic script without Urdu-only letters must map to ar, not ur'
);

// Urdu reply — distinguished only by its extra letters (ٹ ڈ ڑ ں ھ ے گ چ پ ژ).
assert.equal(
    detectVoiceLanguage('آپ کی مدد کے لیے یہاں موجود ہوں۔'),
    'ur',
    'Urdu-only letters must map to ur'
);

// Plain English reply.
assert.equal(detectVoiceLanguage('SDRS runs six service lines from Dammam.'), 'en-US');

// Regression: the old substring heuristic (text.includes('hai')) false-positived
// on ordinary English words like "chair" and "fair", forcing Urdu TTS on English text.
assert.equal(detectVoiceLanguage('Please take a chair while we check that.'), 'en-US');
assert.equal(detectVoiceLanguage('That is a fair point about demurrage.'), 'en-US');

console.log('Voice language detection distinguishes Arabic, Urdu, and English correctly.');
