import assert from 'node:assert/strict';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadKnowledgeBase } from '../knowledgeBase.js';
import { chatbotTools } from '../tools.js';

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
assert.equal(reply, 'I am the SDRS Intelligent Trade Assistant.');

console.log('Gemini request includes the SDRS system instruction and knowledge base.');
