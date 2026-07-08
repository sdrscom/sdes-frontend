import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';

// Define the URL logic at the top or inside the component
const getBackendUrl = () => {
    return window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://sdes-backend.vercel.app';
};

const css = `
/* ... (Your existing CSS remains exactly the same) ... */
`;

export default function Chatbot() {
    // ... (All your existing state and refs remain the same) ...
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am the SDRS AI Assistant. How can I help you today?', time: 'Just now' }
    ]);
    const [input, setInput] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [voiceState, setVoiceState] = useState('connecting');

    const messagesRef = useRef(null);
    const micStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const currentAudioRef = useRef(null);
    const audioQueueRef = useRef([]);
    const silenceDetectorRef = useRef(null);

    // Initialize backend URL
    const backendUrl = getBackendUrl();
    const initialBotGreeting = 'Hello! I am the SDRS AI Assistant. How can I help you today?';

    // ... (Keep your existing useEffects, playHumanVoice, stopAudioEngine, handleInterrupterClick, startListeningLoop functions as they were) ...
    
    // Updated sendAudioToGemini
    async function sendAudioToGemini(base64Audio) {
        if (!isVoiceActive) return;
        try {
            const response = await fetch(`${backendUrl}/api/voice-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioBase64: base64Audio })
            });
            const data = await response.json();

            if (data.transcript && data.transcript !== '...') appendMessage(data.transcript, 'user');

            if (data.reply) {
                appendMessage(data.reply, 'bot');
                playHumanVoice(data.reply);
            } else {
                startListeningLoop();
            }
        } catch (error) {
            console.error(error);
            startListeningLoop();
        }
    }

    // ... (Keep openVoice, closeVoice, openChat, hideChat functions) ...

    // Updated handleSendMessage
    async function handleSendMessage() {
        const userMessage = input.trim();
        if (!userMessage) return;

        appendMessage(userMessage, 'user');
        setInput('');

        const history = messages
            .filter((msg, idx) => !(idx === 0 && msg.role === 'bot' && msg.text === initialBotGreeting))
            .map(({ role, text }) => ({
                role: role === 'bot' ? 'model' : 'user',
                parts: [{ text }]
            }));

        try {
            const response = await fetch(`${backendUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history
                })
            });

            const botReply = await response.text();
            if (!response.ok) {
                console.error('Chat API error', response.status, botReply);
                appendMessage('Sorry, the assistant could not respond right now.', 'bot');
                return;
            }

            appendMessage(botReply || 'Sorry, I could not generate a reply right now.', 'bot');
        } catch (error) {
            console.error('Chat request failed', error);
            appendMessage('Sorry, I could not reach the assistant right now.', 'bot');
        }
    }

    // ... (Keep the rest of your render code exactly as it was) ...
    return (
        // ... (Keep your existing return JSX) ...
    );
}