import assert from 'node:assert/strict';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadKnowledgeBase } from '../knowledgeBase.js';
import { chatbotTools, executeTool } from '../tools.js';
import { readFunctionCalls, readReplyText } from '../readFunctionCalls.js';
import { sanitizeHistoryForGemini, enforceAlternatingRoles, buildMessageParts, MAX_HISTORY_MESSAGES } from '../chatHistory.js';
import { validateChatRequest, MAX_MESSAGE_LENGTH } from '../validation.js';

const calls = [];

globalThis.fetch = async (url, init) => {
    calls.push({
        url: String(url),
        body: JSON.parse(init.body)
    });

    return new Response(JSON.stringify({
        candidates: [{
            content: {
                role: 'model',
                parts: [{ text: 'I am the SDRS Intelligent Trade Assistant.' }]
            },
            finishReason: 'STOP',
            index: 0
        }]
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};

const systemInstruction = loadKnowledgeBase();
const model = new GoogleGenerativeAI('test-key').getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction,
    tools: chatbotTools,
    generationConfig: { thinkingConfig: { thinkingBudget: 0 } }
});

const result = await model.startChat({ history: [] }).sendMessage('What are you?');
const reply = result.response.text();
const body = calls[0]?.body;
const sentInstruction = JSON.stringify(body?.systemInstruction ?? '');

assert.equal(calls.length, 1, 'expected one Gemini request');
assert.equal(body?.generationConfig?.thinkingConfig?.thinkingBudget, 0, 'thinking should be disabled to keep replies fast');
assert.match(sentInstruction, /SDRS Intelligent Trade Assistant/);
assert.match(sentInstruction, /King Abdulaziz Port/);
assert.match(sentInstruction, /0% VAT/);
assert.match(sentInstruction, /three years/);
assert.match(sentInstruction, /Manama, Bahrain 46 km/);
assert.match(sentInstruction, /360 m²/);
assert.match(sentInstruction, /www\.sdrs\.com\.sa\/careers/);
assert.match(sentInstruction, /www\.sdrs\.com\.sa\/faqs/);
assert.match(sentInstruction, /logipoint\.sa/);
assert.match(sentInstruction, /CMS-only/);
assert.match(sentInstruction, /Greetings and small talk/);
assert.match(sentInstruction, /Do not use bullets.*for these/);
assert.equal(reply, 'I am the SDRS Intelligent Trade Assistant.');
assert.deepEqual(readFunctionCalls(result.response), []);
assert.equal(typeof result.response.functionCalls, 'function');
assert.deepEqual(readFunctionCalls({
    functionCalls: () => [{ name: 'track_container', args: { container_id: 'ABCU1234567' } }]
}), [{ name: 'track_container', args: { container_id: 'ABCU1234567' } }]);
assert.equal(readReplyText({
    candidates: [{
        finishReason: 'RECITATION',
        content: { parts: [{ text: 'Closed warehouses and a cold chamber.' }] }
    }],
    text() {
        throw new Error('Candidate was blocked due to RECITATION');
    }
}), 'Closed warehouses and a cold chamber.');

const tracking = await executeTool('track_container', { container_id: 'MSCU7654321' });
assert.equal(tracking.live_tracking, false);
assert.equal(tracking.status, undefined);

const lead = await executeTool('capture_lead', { name: 'A', email: 'a@example.com', inquiry: 'warehouse quote' });
assert.equal(lead.saved, false);

// Regression: the real SDK's response.functionCalls() throws for a bad finish reason
// (SAFETY, RECITATION, LANGUAGE, OTHER) even when the model never asked for a tool.
// That used to crash the whole /api/chat request with a 500 before any text was read.
globalThis.fetch = async () => new Response(JSON.stringify({
    candidates: [{
        content: { role: 'model', parts: [{ text: 'SDRS runs six service lines from Dammam.' }] },
        finishReason: 'RECITATION',
        index: 0
    }]
}), { status: 200, headers: { 'Content-Type': 'application/json' } });

const blockedResult = await new GoogleGenerativeAI('test-key')
    .getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction, tools: chatbotTools })
    .startChat({ history: [] })
    .sendMessage('Tell me about Facilities');

assert.doesNotThrow(() => readFunctionCalls(blockedResult.response), 'readFunctionCalls must not throw on a blocked finish reason');
assert.deepEqual(readFunctionCalls(blockedResult.response), []);
assert.equal(readReplyText(blockedResult.response), 'SDRS runs six service lines from Dammam.');

// Fully blocked prompt: no candidates at all, only promptFeedback.
globalThis.fetch = async () => new Response(JSON.stringify({
    promptFeedback: { blockReason: 'OTHER' }
}), { status: 200, headers: { 'Content-Type': 'application/json' } });

const fullyBlockedResult = await new GoogleGenerativeAI('test-key')
    .getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction, tools: chatbotTools })
    .startChat({ history: [] })
    .sendMessage('How are you');

assert.doesNotThrow(() => readFunctionCalls(fullyBlockedResult.response));
assert.equal(readReplyText(fullyBlockedResult.response), '');

// Regression: Gemini's chat API rejects a transcript that doesn't strictly
// alternate user/model turns. This happened live whenever a prior turn failed —
// its unanswered user message stayed in history, so the next request contained
// two user turns in a row and Gemini returned a fast 400, surfaced to users as
// "Sorry, the assistant could not respond right now."
assert.deepEqual(
    enforceAlternatingRoles([
        { role: 'user', parts: [{ text: 'Tell me about Facilities' }] }, // orphaned: never answered
        { role: 'user', parts: [{ text: 'How are you' }] }
    ]),
    [{ role: 'user', parts: [{ text: 'Tell me about Facilities' }, { text: 'How are you' }] }],
    'consecutive user turns must be merged into one, not sent to Gemini as-is'
);

assert.deepEqual(
    enforceAlternatingRoles([
        { role: 'user', parts: [{ text: 'Hi' }] },
        { role: 'model', parts: [{ text: 'Hello!' }] },
        { role: 'model', parts: [{ text: 'How can I help?' }] }, // duplicate model turn
        { role: 'user', parts: [{ text: 'Tell me about Services' }] }
    ]),
    [
        { role: 'user', parts: [{ text: 'Hi' }] },
        { role: 'model', parts: [{ text: 'Hello!' }, { text: 'How can I help?' }] },
        { role: 'user', parts: [{ text: 'Tell me about Services' }] }
    ]
);

assert.deepEqual(
    sanitizeHistoryForGemini([
        { role: 'model', parts: [{ text: 'leading model turn, must be dropped' }] },
        { role: 'user', parts: [{ text: 'Hi' }] },
        { role: 'model', parts: [{ text: 'Hello!' }] },
        { role: 'user', parts: [{ text: 'Tell me about Facilities' }] } // orphaned by an earlier failure
    ], 'How are you'),
    [
        { role: 'user', parts: [{ text: 'Hi' }] },
        { role: 'model', parts: [{ text: 'Hello!' }] },
        { role: 'user', parts: [{ text: 'Tell me about Facilities' }] }
    ],
    'full pipeline: drop leading non-user turn, merge the orphaned user turn instead of sending two user turns in a row'
);

// Regression: an attachment previously never reached Gemini at all — the widget
// only sent a text label like "[Attachment: invoice.pdf (245 KB)]" and discarded
// the actual file. buildMessageParts must include the real bytes as inlineData.
assert.deepEqual(
    buildMessageParts('What does this say?', 'data:image/png;base64,QUJD', 'image/png'),
    [
        { text: 'What does this say?' },
        { inlineData: { data: 'QUJD', mimeType: 'image/png' } }
    ],
    'attachment bytes must be sent to Gemini as inlineData, not just described in text'
);

assert.deepEqual(
    buildMessageParts('', 'QUJD', 'application/pdf'),
    [{ inlineData: { data: 'QUJD', mimeType: 'application/pdf' } }],
    'an attachment with no typed text should still be sent'
);

assert.deepEqual(
    buildMessageParts('Hello', null, null),
    [{ text: 'Hello' }],
    'plain text messages are unaffected'
);

assert.deepEqual(
    buildMessageParts('', null, null),
    [{ text: '' }],
    'never send zero parts, even for an empty message'
);

// Regression: /api/chat previously accepted anything, including an empty
// message with no attachment (wasting a Gemini call for nothing) and messages of
// unbounded length. validateChatRequest is the pure logic behind that guard.
assert.equal(validateChatRequest({ message: 'Hello' }).valid, true);
assert.equal(validateChatRequest({ message: '', attachmentBase64: 'QUJD' }).valid, true, 'an attachment alone, with no typed text, is a valid request');
assert.equal(validateChatRequest({ message: '' }).valid, false, 'empty message with no attachment must be rejected');
assert.equal(validateChatRequest({ message: '   ' }).valid, false, 'whitespace-only message must be rejected');
assert.equal(validateChatRequest({}).valid, false, 'missing message entirely must be rejected');
assert.equal(validateChatRequest({ message: 'x'.repeat(MAX_MESSAGE_LENGTH + 1) }).valid, false, 'over-length messages must be rejected');
assert.equal(validateChatRequest({ message: 'x'.repeat(MAX_MESSAGE_LENGTH) }).valid, true, 'exactly the limit is still allowed');
assert.equal(validateChatRequest({ message: 123 }).valid, false, 'non-string message must be rejected, not crash on .trim()');
assert.equal(validateChatRequest({ message: 'hi', attachmentBase64: 'x'.repeat(7 * 1024 * 1024) }).valid, false, 'oversized attachment payload must be rejected');

// Regression: a very long-running conversation resent its entire history forever
// with no bound. sanitizeHistoryForGemini must cap it and still start with 'user'.
const longHistory = [];
for (let i = 0; i < 40; i++) {
    longHistory.push({ role: 'user', parts: [{ text: `question ${i}` }] });
    longHistory.push({ role: 'model', parts: [{ text: `answer ${i}` }] });
}
const cappedHistory = sanitizeHistoryForGemini(longHistory, 'a new question');
assert.ok(cappedHistory.length <= MAX_HISTORY_MESSAGES, 'history must be capped to a bounded number of turns');
assert.equal(cappedHistory[0].role, 'user', 'capped history must still start with a user turn');
assert.equal(
    cappedHistory[cappedHistory.length - 1].parts[0].text,
    'answer 39',
    'capping must keep the most recent turns, not the oldest'
);

console.log('Gemini request includes the SDRS system instruction and knowledge base.');
console.log('Blocked finish reasons no longer crash /api/chat.');
console.log('Malformed or non-alternating history no longer crashes /api/chat.');
console.log('Attachments are sent to Gemini as real file data, not just a filename.');
console.log('Empty, oversized, and malformed /api/chat requests are rejected before calling Gemini.');
console.log('Conversation history is capped instead of growing forever.');
