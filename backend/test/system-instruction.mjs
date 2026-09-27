import assert from 'node:assert/strict';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadKnowledgeBase } from '../knowledgeBase.js';
import { chatbotTools, executeTool } from '../tools.js';
import { readFunctionCalls, readReplyText } from '../readFunctionCalls.js';

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
    tools: chatbotTools
});

const result = await model.startChat({ history: [] }).sendMessage('What are you?');
const reply = result.response.text();
const body = calls[0]?.body;
const sentInstruction = JSON.stringify(body?.systemInstruction ?? '');

assert.equal(calls.length, 1, 'expected one Gemini request');
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

console.log('Gemini request includes the SDRS system instruction and knowledge base.');
console.log('Blocked finish reasons no longer crash /api/chat.');
