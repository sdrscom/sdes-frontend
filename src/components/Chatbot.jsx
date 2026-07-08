import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';

const css = `
:root {
        --primary-bg: #f4f6f9; --header-bg: #0033a0; --user-msg-bg: #0033a0;
        --bot-msg-bg: #ffffff; --border-color: #e2e8f0; --text-main: #1e293b; --text-muted: #64748b;
}
#chat-container { width: 340px; height: 520px; max-height: calc(100vh - 40px); background: rgba(255,255,255,0.95); border-radius: 24px; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18); display: flex; flex-direction: column; overflow: hidden; position: fixed; bottom: 20px; right: 20px; z-index: 9999; backdrop-filter: blur(10px); border: 1px solid rgba(0, 51, 160, 0.12); }
#chat-header { background: linear-gradient(135deg, #00266b 0%, #0033a0 100%); color: white; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; font-weight: 700; font-size: 14px; }
.header-logo { width: 34px; height: 34px; background: white; border-radius: 50%; margin-right: 12px; display: flex; align-items: center; justify-content: center; color: #0033a0; font-size: 11px; font-weight: 700; }
.chat-close-btn { background: rgba(255,255,255,0.12); border: none; color: white; cursor: pointer; width: 34px; height: 34px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; transition: background 0.2s ease; }
.chat-close-btn:hover { background: rgba(255,255,255,0.24); }
.chat-toggle-button { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: #0033a0; color: #fff; border: none; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.22); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10000; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.chat-toggle-button:hover { transform: translateY(-2px); box-shadow: 0 24px 48px rgba(0, 0, 0, 0.26); }
.chat-toggle-button .button-label { position: absolute; right: 70px; bottom: 8px; font-size: 12px; color: #fff; background: rgba(0, 51, 160, 0.95); padding: 6px 10px; border-radius: 999px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18); }
#messages { flex: 1; padding: 18px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; background: #eef4ff; }
.message-wrapper { display: flex; flex-direction: column; max-width: 82%; }
.message-wrapper.user { align-self: flex-end; align-items: flex-end; }
.message-wrapper.bot { align-self: flex-start; align-items: flex-start; }
.message { padding: 14px 16px; border-radius: 18px; font-size: 14px; line-height: 1.6; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06); }
.user .message { background: #00266b; color: white; border-bottom-right-radius: 6px; }
.bot .message { background: #ffffff; color: #102a43; border-bottom-left-radius: 6px; border: 1px solid rgba(15, 23, 42, 0.08); }
.message p { margin: 0 0 8px 0; } .message p:last-child { margin: 0; }
.timestamp { font-size: 11px; color: #52637a; margin-top: 6px; }
#input-area { display: flex; align-items: center; padding: 12px 14px; background: #ffffff; border-top: 1px solid rgba(15, 23, 42, 0.08); }
.icon-btn { background: none; border: none; cursor: pointer; color: #64748b; padding: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; border-radius: 50%; width: 36px; height: 36px; }
.icon-btn:hover { color: #0033a0; background: #f1f5f9; }
#message-input { flex: 1; border: none; outline: none; padding: 10px; font-size: 14px; background: transparent; color: #102a43; }
#send-btn { background: #0033a0; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 8px; }

/* VOICE OVERLAY */
#voice-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.98); z-index: 100; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 40px 20px; box-sizing: border-box; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
#voice-overlay.active { transform: translateY(0); }
.voice-center-ring { width: 250px; height: 250px; border-radius: 50%; border: 4px solid #f1f5f9; background: transparent; display: flex; justify-content: center; align-items: center; margin-top: 100px; position: relative; cursor: pointer; }
.voice-center-ring:hover { border-color: #e2e8f0; }
#visualizer { display: flex; align-items: center; justify-content: center; height: 80px; gap: 6px; pointer-events: none;}

.dot { width: 10px; height: 10px; background: #cbd5e1; border-radius: 50%; display: none; }
.state-connecting .dot { display: block; animation: bounce 1.4s infinite ease-in-out both; }
.state-connecting .dot:nth-child(1) { animation-delay: -0.32s; background: #0f172a; }
.state-connecting .dot:nth-child(2) { animation-delay: -0.16s; }

.bar { width: 6px; height: 20px; background: #0f172a; border-radius: 4px; display: none; }
.state-listening .bar { display: block; animation: wave 1s infinite ease-in-out; }
.state-listening .bar:nth-child(2) { animation-delay: 0.1s; height: 40px; }
.state-listening .bar:nth-child(3) { animation-delay: 0.2s; height: 60px; }
.state-listening .bar:nth-child(4) { animation-delay: 0.3s; height: 30px; }
.state-listening .bar:nth-child(5) { animation-delay: 0.4s; height: 50px; }

.speaker-dot { width: 24px; height: 24px; background: #0f172a; border-radius: 50%; display: none; position: relative; }
.state-speaking .speaker-dot { display: block; }
.state-speaking .speaker-dot::after { content: ''; position: absolute; top: -20px; left: -20px; right: -20px; bottom: -20px; border-radius: 50%; background: rgba(15, 23, 42, 0.1); animation: pulse-ring 1.5s infinite cubic-bezier(0.215, 0.61, 0.355, 1); }

.voice-controls { width: 100%; display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; }
.voice-btn-circle { width: 50px; height: 50px; border-radius: 50%; border: 1px solid #e2e8f0; background: white; display: flex; justify-content: center; align-items: center; cursor: pointer; color: #64748b; }
.voice-btn-circle:hover { background: #f8fafc; color: #0f172a; }
#voice-status-text { font-size: 14px; font-weight: 500; color: #475569; pointer-events: none;}
.interrupt-hint { position: absolute; bottom: -30px; font-size: 11px; color: #94a2b8; text-align: center; width: 100%; }

@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
@keyframes wave { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1.2); } }
@keyframes pulse-ring { 0% { transform: scale(0.5); opacity: 0; } 50% { opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
`;

export default function Chatbot() {
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am the SDRS AI Assistant. How can I help you today?', time: 'Just now' }
    ]);
    const [input, setInput] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [voiceState, setVoiceState] = useState('connecting');

    const messagesRef = useRef(null);
    const endRef = useRef(null);

    const micStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const currentAudioRef = useRef(null);
    const audioQueueRef = useRef([]);
    const silenceDetectorRef = useRef(null);

    useEffect(() => {
        // Setup SpeechRecognition if available
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recog = new SpeechRecognition();
            recog.continuous = false;
            recog.interimResults = false;
            recog.onend = () => {
                const mr = mediaRecorderRef.current;
                if (isVoiceActive && mr && mr.state === 'recording') mr.stop();
            };
            silenceDetectorRef.current = recog;
        }

        return () => {
            // cleanup
            if (silenceDetectorRef.current) {
                try { silenceDetectorRef.current.stop(); } catch (e) {}
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // scroll on new message
        if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, [messages]);

    function appendMessage(text, role) {
        setMessages(prev => [...prev, { role, text, time: new Date().toLocaleTimeString() }]);
    }

    async function initHardware() {
        if (!micStreamRef.current) {
            micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
    }

    function setVisualizerState(state) {
        setVoiceState(state);
    }

    async function playHumanVoice(text) {
        stopAudioEngine();
        const isUrdu = /[\u0600-\u06FF]/.test(text) || text.toLowerCase().includes('aur') || text.toLowerCase().includes('hai');
        const lang = isUrdu ? 'ur' : 'en-US';

        audioQueueRef.current = text.match(/[^.!?،۔]+[.!?،۔]+/g) || [text];
        setVisualizerState('speaking');

        for (let i = 0; i < audioQueueRef.current.length; i++) {
            if (!isVoiceActive || voiceState !== 'speaking') break;
            const sentence = audioQueueRef.current[i].trim();
            if (!sentence) continue;

            const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(sentence)}`;
            currentAudioRef.current = new Audio(url);

            await new Promise(resolve => {
                currentAudioRef.current.onended = resolve;
                currentAudioRef.current.onerror = resolve;
                currentAudioRef.current.play().catch(resolve);
            });
        }

        if (isVoiceActive && voiceState === 'speaking') {
            startListeningLoop();
        }
    }

    function stopAudioEngine() {
        if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
        audioQueueRef.current = [];
    }

    function handleInterrupterClick() {
        if (voiceState === 'speaking') {
            stopAudioEngine();
            startListeningLoop();
        } else if (voiceState === 'listening') {
            if (silenceDetectorRef.current) {
                try { silenceDetectorRef.current.stop(); } catch (e) {}
            }
            const mr = mediaRecorderRef.current;
            if (mr && mr.state === 'recording') mr.stop();
        }
    }

    function startListeningLoop() {
        setVisualizerState('listening');
        audioChunksRef.current = [];

        try {
            const mr = new MediaRecorder(micStreamRef.current, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mr;
            mr.ondataavailable = e => audioChunksRef.current.push(e.data);
            mr.onstop = async () => {
                if (!isVoiceActive) return;
                setVisualizerState('processing');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size < 1000) {
                    startListeningLoop();
                    return;
                }

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => sendAudioToGemini(reader.result);
            };
            mr.start();
        } catch (e) {
            console.error('MediaRecorder init error', e);
        }

        if (silenceDetectorRef.current) {
            try { silenceDetectorRef.current.start(); } catch (e) {}
        }
    }

    async function sendAudioToGemini(base64Audio) {
        if (!isVoiceActive) return;
        try {
            const response = await fetch('https://sdes-backend-yourname.vercel.app/api/chat', { ... })
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

    async function openVoice() {
        try {
            setVisualizerState('connecting');
            setIsVoiceActive(true);
            await initHardware();
            setTimeout(() => startListeningLoop(), 300);
        } catch (e) {
            console.error('Hardware access denied.', e);
            setIsVoiceActive(false);
            try { if (silenceDetectorRef.current) silenceDetectorRef.current.stop(); } catch (err) {}
        }
    }

    function closeVoice() {
        setIsVoiceActive(false);
        stopAudioEngine();
        try { if (silenceDetectorRef.current) silenceDetectorRef.current.stop(); } catch (e) {}
        const mr = mediaRecorderRef.current;
        if (mr && mr.state === 'recording') mr.stop();
    }

    function openChat() {
        setIsChatOpen(true);
    }

    function hideChat() {
        setIsChatOpen(false);
        if (isVoiceActive) {
            closeVoice();
        }
    }

    const backendUrl = 'http://127.0.0.1:5000';
    const initialBotGreeting = 'Hello! I am the SDRS AI Assistant. How can I help you today?';

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

    return (
        <>
            <style>{css}</style>
            {!isChatOpen && (
                <button className="chat-toggle-button" onClick={openChat} title="Open SDRS chat">
                    <span className="button-label">Talk to SDRS</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/><path d="M7 10h10M7 14h7"/></svg>
                </button>
            )}

            {isChatOpen && (
                <div id="chat-container">
                    <div id="chat-header">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="header-logo">SDRS</div>
                            <div>SDRS AI Assistant</div>
                        </div>
                        <button className="chat-close-btn" onClick={hideChat} title="Close chat">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>

                    <div id="messages" ref={messagesRef}>
                        {messages.map((m, idx) => (
                            <div key={idx} className={`message-wrapper ${m.role}`}>
                                <div className="message" dangerouslySetInnerHTML={m.role === 'bot' ? { __html: marked.parse(m.text) } : undefined}>
                                    {m.role !== 'bot' ? m.text : null}
                                </div>
                                <div className="timestamp">{m.time}</div>
                            </div>
                        ))}
                        <div ref={endRef} />
                    </div>

                    <div id="input-area">
                        <button className="icon-btn" title="Attach File">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        </button>
                        <input id="message-input" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." autoComplete="off" />
                        <button className="icon-btn" id="open-voice-btn" title="Start Voice Mode" onClick={openVoice}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 7v10M22 10v4M7 7v10M2 10v4"/></svg>
                        </button>
                        <button id="send-btn" onClick={handleSendMessage}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
                    </div>

                    <div id="voice-overlay" className={isVoiceActive ? 'active' : ''}>
                        <div className="voice-center-ring" id="voice-interrupter" onClick={handleInterrupterClick}>
                            <div id="visualizer" className={`state-${voiceState}`}>
                                <div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div>
                                <div className="bar"></div><div className="bar"></div><div className="bar"></div><div className="bar"></div><div className="bar"></div>
                                <div className="speaker-dot"></div>
                            </div>
                            <div className="interrupt-hint" id="interrupt-hint-text">Tap to interrupt</div>
                        </div>
                        <div className="voice-controls">
                            <button id="close-voice-btn" className="voice-btn-circle" onClick={closeVoice}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                            <div id="voice-status-text">{voiceState === 'speaking' ? 'Speaking...' : voiceState === 'listening' ? 'Listening...' : voiceState === 'processing' ? 'Processing...' : 'Connecting...'}</div>
                            <button className="voice-btn-circle"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg></button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
