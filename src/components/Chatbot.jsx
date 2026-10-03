import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { detectVoiceLanguage } from '../utils/voiceLanguage.js';
import { stripMarkdownForSpeech } from '../utils/ttsText.js';

const getBackendUrl = () => {
    return window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://sdes-backend.vercel.app';
};

const INITIAL_BOT_GREETING = "Hello! I'm Fares, your SDRS Trade Assistant. How can I help you today?";

// A small, friendly "robot head" mark used both on the floating launcher button
// and in the chat header. Built as inline SVG (no image asset to load/cache)
// using layered gradients and a glossy highlight to read as dimensional/"3D"
// rather than a flat line icon, matching the brand's navy/red palette.
// idSuffix keeps gradient ids unique whenever more than one instance could ever
// render in the DOM at once (launcher + header + greeting bubble).
function RoboticIcon({ size = 28, idSuffix = 'a' }) {
    const headGrad = `botHead-${idSuffix}`;
    const eyeGrad = `botEye-${idSuffix}`;
    const antennaGrad = `botAntenna-${idSuffix}`;
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <linearGradient id={headGrad} x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#5366e0" />
                    <stop offset="55%" stopColor="#2d3b76" />
                    <stop offset="100%" stopColor="#141b3d" />
                </linearGradient>
                <radialGradient id={eyeGrad} cx="42%" cy="32%" r="70%">
                    <stop offset="0%" stopColor="#d6f9ff" />
                    <stop offset="45%" stopColor="#3ddcff" />
                    <stop offset="100%" stopColor="#0d8fb5" />
                </radialGradient>
                <linearGradient id={antennaGrad} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff8f8f" />
                    <stop offset="100%" stopColor="#b82227" />
                </linearGradient>
            </defs>

            <line x1="24" y1="4" x2="24" y2="11" stroke="#9aa3c7" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24" cy="4" r="3.2" fill={`url(#${antennaGrad})`} />

            <rect x="6.5" y="10" width="35" height="30" rx="12" fill={`url(#${headGrad})`} />
            <path d="M11 15c4.5-4.5 11-5.6 17.5-4.3 5.5 1.1 9.8 3.4 12 6.6-3.4-2.3-9.8-4.3-16.3-4.3-6.4 0-10.8 1.1-13.2 2z" fill="rgba(255,255,255,0.22)" />

            <circle cx="17.5" cy="26" r="5.2" fill={`url(#${eyeGrad})`} />
            <circle cx="30.5" cy="26" r="5.2" fill={`url(#${eyeGrad})`} />
            <circle cx="16" cy="23.8" r="1.3" fill="#fff" />
            <circle cx="29" cy="23.8" r="1.3" fill="#fff" />

            <rect x="16.5" y="33.5" width="15" height="3" rx="1.5" fill="rgba(255,255,255,0.32)" />

            <circle cx="7" cy="25" r="1.7" fill="#aab3d6" />
            <circle cx="41" cy="25" r="1.7" fill="#aab3d6" />
        </svg>
    );
}

const css = `
#chat-container, #chat-container * { box-sizing: border-box; }
#chat-container {
    width: min(400px, calc(100vw - 32px));
    height: min(640px, calc(100vh - 104px));
    /* Mobile browsers resize 100vh as the address bar/keyboard show or hide,
       which can leave the input area hidden. 100dvh tracks the real visible
       viewport instead; browsers that don't support dvh simply ignore this
       line and keep the vh-based height above. */
    height: min(640px, calc(100dvh - 104px));
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 22px 50px rgba(26, 35, 71, 0.22), 0 2px 8px rgba(26, 35, 71, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    border: 1px solid rgba(45, 59, 118, 0.14);
    font-family: "Segoe UI", system-ui, sans-serif;
    color: #1a2347;
}
#chat-header {
    background: linear-gradient(135deg, #1a2347 0%, #2d3b76 100%);
    color: white;
    padding: 16px 14px 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 3px solid #b82227;
    flex: 0 0 auto;
}
.header-identity { display: flex; align-items: center; gap: 12px; min-width: 0; }
.header-logo {
    width: 40px; height: 40px; background: #fff; border-radius: 12px; flex: 0 0 auto;
    display: flex; align-items: center; justify-content: center;
    color: #2d3b76; font-size: 11px; font-weight: 800; letter-spacing: 0.02em;
}
.header-copy { min-width: 0; }
.header-title { font-size: 15px; font-weight: 700; line-height: 1.2; letter-spacing: 0.01em; }
.header-status { display: flex; align-items: center; gap: 6px; margin-top: 3px; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.78); }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: #3ddc97; box-shadow: 0 0 0 3px rgba(61, 220, 151, 0.18); }
.chat-close-btn, .chat-clear-btn {
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.16); color: white;
    cursor: pointer; width: 34px; height: 34px; border-radius: 10px; flex: 0 0 auto;
    display: inline-flex; align-items: center; justify-content: center; transition: background 0.2s ease;
}
.chat-close-btn:hover, .chat-clear-btn:hover { background: rgba(255,255,255,0.2); }
.header-actions { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.chat-toggle-button {
    position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px; border-radius: 50%;
    background: linear-gradient(145deg, #3a4a8f 0%, #2d3b76 55%, #161d42 100%);
    color: #fff; border: 3px solid #fff;
    box-shadow: 0 12px 28px rgba(26, 35, 71, 0.32), inset 0 2px 4px rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10000;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.chat-toggle-button:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 16px 32px rgba(26, 35, 71, 0.38), inset 0 2px 4px rgba(255,255,255,0.25); }
/* A soft pulsing ring that radiates outward from the launcher to draw the eye
   without being as intrusive/animated as the greeting bubble itself. */
.chat-toggle-button::before {
    content: ""; position: absolute; top: -6px; left: -6px; right: -6px; bottom: -6px;
    border-radius: 50%; border: 2px solid rgba(61, 220, 151, 0.5);
    animation: togglePulse 2.6s infinite ease-out; pointer-events: none;
}
@keyframes togglePulse { 0% { transform: scale(0.88); opacity: 0.9; } 100% { transform: scale(1.4); opacity: 0; } }
.chat-toggle-button .button-label {
    position: absolute; right: 72px; top: 50%; transform: translateY(-50%);
    font-size: 13px; font-weight: 700; letter-spacing: 0.01em; color: #1a2347; white-space: nowrap;
    background: #fff; padding: 8px 12px; border-radius: 999px;
    box-shadow: 0 8px 20px rgba(26, 35, 71, 0.16); border: 1px solid rgba(45, 59, 118, 0.1);
}
.chat-toggle-button .button-label::after {
    content: ""; position: absolute; right: -5px; top: 50%; width: 8px; height: 8px;
    background: #fff; border-right: 1px solid rgba(45, 59, 118, 0.1); border-top: 1px solid rgba(45, 59, 118, 0.1);
    transform: translateY(-50%) rotate(45deg);
}
#messages {
    flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;
    background: #f4f6fb;
}
#messages::-webkit-scrollbar { width: 8px; }
#messages::-webkit-scrollbar-thumb { background: rgba(45, 59, 118, 0.25); border-radius: 99px; }
.message-wrapper { display: flex; flex-direction: column; max-width: 84%; }
.message-wrapper.user { align-self: flex-end; align-items: flex-end; }
.message-wrapper.bot { align-self: flex-start; align-items: flex-start; }
.message { padding: 12px 14px; border-radius: 16px; font-size: 14px; line-height: 1.55; }
.user .message { background: #2d3b76; color: white; border-bottom-right-radius: 4px; }
.bot .message { background: #fff; color: #1a2347; border-bottom-left-radius: 4px; border: 1px solid rgba(45, 59, 118, 0.1); }
.message p { margin: 0 0 8px 0; } .message p:last-child { margin: 0; }
.message ul, .message ol { margin: 6px 0 0; padding-left: 18px; }
.message a { color: #b82227; }
.user .message a { color: #fff; }
.timestamp { font-size: 11px; color: #7b8499; margin-top: 5px; padding: 0 2px; }
#input-area {
    display: flex; align-items: flex-end; gap: 4px; padding: 10px 12px 12px;
    background: #fff; border-top: 1px solid rgba(45, 59, 118, 0.1); flex: 0 0 auto;
}
.composer { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.icon-btn {
    background: none; border: none; cursor: pointer; color: #5c6784; padding: 0;
    display: flex; align-items: center; justify-content: center; transition: color 0.2s, background 0.2s;
    border-radius: 10px; width: 36px; height: 40px; flex: 0 0 auto;
}
.icon-btn:hover { color: #2d3b76; background: rgba(45, 59, 118, 0.08); }
#message-input {
    width: 100%; border: 1px solid rgba(45, 59, 118, 0.16); outline: none; padding: 10px 14px;
    font-size: 14px; line-height: 1.4; border-radius: 14px; background: #f7f8fc; color: #1a2347;
    resize: none; overflow-y: auto; min-height: 42px; max-height: 120px; font-family: inherit;
}
#message-input:focus { border-color: #2d3b76; background: #fff; box-shadow: 0 0 0 3px rgba(45, 59, 118, 0.12); }
.icon-btn.mic-active { background: rgba(184, 34, 39, 0.1); color: #b82227; }
.icon-btn.voice-active { background: rgba(45, 59, 118, 0.12); color: #2d3b76; }
#send-btn {
    background: #2d3b76; color: white; border: none; border-radius: 12px; width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center; cursor: pointer; flex: 0 0 auto;
}
#send-btn:hover { background: #1a2347; }
#send-btn:disabled { opacity: 0.55; cursor: wait; }
.attachment-chip {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 6px 10px; border-radius: 10px; background: rgba(45, 59, 118, 0.08);
    color: #2d3b76; font-size: 12px; max-width: 100%;
}
.attachment-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attachment-chip button { border: none; background: transparent; color: #2d3b76; cursor: pointer; padding: 0; font-size: 16px; line-height: 1; }
.typing-indicator { display: inline-flex; align-items: center; gap: 6px; min-width: 64px; }
.typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #2d3b76; animation: typingPulse 1.2s infinite ease-in-out; }
.typing-dot:nth-child(2) { animation-delay: 0.15s; }
.typing-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes typingPulse { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-3px); opacity: 1; } }

.quick-pills { display: flex; gap: 8px; padding: 10px 12px 0; flex-wrap: wrap; background: #fff; }
.pill {
    background: #fff; border: 1px solid rgba(45, 59, 118, 0.16); color: #2d3b76;
    padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; cursor: pointer;
}
.pill:hover { background: rgba(45, 59, 118, 0.06); border-color: #2d3b76; }
.header-title, .header-status { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

@media (max-width: 520px) {
    #chat-container {
        right: 12px; left: 12px; bottom: 12px; width: auto;
        height: min(720px, calc(100vh - 24px));
        height: min(720px, calc(100dvh - 24px));
        border-radius: 16px;
    }
    .chat-toggle-button { right: 16px; bottom: 16px; }
    .chat-toggle-button .button-label { display: none; }
    /* iOS Safari auto-zooms the page when focusing an input with font-size
       under 16px — bump it up only on small screens so typing a message
       doesn't unexpectedly zoom the whole widget in. */
    #message-input { font-size: 16px; }
    /* Keep every tap target comfortably within Apple/Google's ~44px guidance
       once the composer icons are squeezed onto a narrow screen. */
    .icon-btn { width: 40px; height: 44px; }
    #send-btn { width: 44px; height: 44px; }
    .chat-greeting-bubble { right: 16px; left: 16px; max-width: none; bottom: 86px; }
    .chat-greeting-bubble::after { display: none; }
}

/* GREETING BUBBLE */
.chat-greeting-bubble {
    position: fixed; bottom: 94px; right: 20px; max-width: 240px; z-index: 9998;
    background: #fff; color: #1a2347; padding: 12px 30px 12px 12px; border-radius: 16px;
    box-shadow: 0 14px 32px rgba(26, 35, 71, 0.26), 0 2px 8px rgba(26, 35, 71, 0.1);
    border: 1px solid rgba(45, 59, 118, 0.12);
    display: flex; align-items: flex-start; gap: 9px; cursor: pointer;
    font-family: "Segoe UI", system-ui, sans-serif;
    animation: bubblePop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chat-greeting-bubble.closing { animation: bubbleOut 0.22s ease forwards; }
.chat-greeting-bubble::after {
    content: ""; position: absolute; bottom: -6px; right: 30px; width: 14px; height: 14px;
    background: #fff; transform: rotate(45deg);
    border-right: 1px solid rgba(45, 59, 118, 0.12); border-bottom: 1px solid rgba(45, 59, 118, 0.12);
}
.bubble-avatar {
    flex: 0 0 auto; width: 30px; height: 30px; border-radius: 9px; background: #f4f6fb;
    display: flex; align-items: center; justify-content: center;
}
.bubble-copy { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.bubble-copy strong { font-size: 13px; font-weight: 700; line-height: 1.3; }
.bubble-copy span { font-size: 12.5px; font-weight: 500; line-height: 1.4; color: #4c5578; }
.bubble-close {
    position: absolute; top: 7px; right: 8px; width: 18px; height: 18px; border-radius: 50%;
    background: rgba(45, 59, 118, 0.08); border: none; color: #5c6784; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 13px; line-height: 1; padding: 0;
}
.bubble-close:hover { background: rgba(45, 59, 118, 0.16); }
.bubble-sparkle { position: absolute; pointer-events: none; font-size: 13px; color: #ffcb4d; animation: sparkleTwinkle 1.8s infinite ease-in-out; }
.bubble-sparkle-1 { top: -9px; left: 14px; animation-delay: 0s; }
.bubble-sparkle-2 { top: 10px; right: -7px; font-size: 9px; color: #6fd6ff; animation-delay: 0.55s; }
.bubble-sparkle-3 { bottom: -7px; left: 44px; font-size: 10px; color: #ff9fb0; animation-delay: 1.05s; }
@keyframes bubblePop { from { opacity: 0; transform: translateY(14px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes bubbleOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(8px) scale(0.92); } }
@keyframes sparkleTwinkle { 0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); } 50% { opacity: 1; transform: scale(1) rotate(18deg); } }

/* VOICE OVERLAY */
#voice-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.98); z-index: 100; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 40px 20px; box-sizing: border-box; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
#voice-overlay.active { transform: translateY(0); }
.voice-center-ring { width: 200px; height: 200px; border-radius: 50%; border: 4px solid rgba(45, 59, 118, 0.12); background: transparent; display: flex; justify-content: center; align-items: center; margin-top: 48px; position: relative; cursor: pointer; }
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
        { role: 'bot', text: INITIAL_BOT_GREETING, time: 'Just now' }
    ]);
    const [input, setInput] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    // Mirrors isVoiceActive for async callbacks (MediaRecorder.onstop, fetch
    // continuations) that were created from an earlier render. Reading the state
    // variable directly in those closures can see a stale "still active" value
    // even after closeVoice() has already turned voice mode off, letting a
    // recording made just before closing still get sent and spoken aloud.
    const isVoiceActiveRef = useRef(false);
    const [voiceState, setVoiceState] = useState('connecting');
    // Root cause of "live voice mode never speaks": playHumanVoice() is an async
    // function that awaits across multiple sentences/delays. Its loop condition
    // read the `voiceState` React state variable directly, which is captured once
    // per render — by the time setVisualizerState('speaking') was called and the
    // loop started, this closure's `voiceState` was still whatever it was BEFORE
    // that render (e.g. 'listening' or 'processing'), so `voiceState !== 'speaking'`
    // was true on the very first check and the loop broke immediately, before
    // speechSynthesis.speak() was ever called. A transcript still appeared because
    // that comes from a separate code path. Mirror the state into a ref, updated
    // everywhere setVisualizerState runs, and read the ref inside the async loop.
    const voiceStateRef = useRef('connecting');
    const [isThinking, setIsThinking] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState(null);
    const [isDictating, setIsDictating] = useState(false);
    // A one-time attention-getting bubble shown a few seconds after a visitor
    // lands on the page, similar to what most live-chat widgets do. Tracked in
    // sessionStorage (not state alone) so navigating between pages in the same
    // visit doesn't re-show it on every single page load.
    const [showGreetingBubble, setShowGreetingBubble] = useState(false);
    const [bubbleClosing, setBubbleClosing] = useState(false);

    const messagesRef = useRef(null);
    const endRef = useRef(null);
    const fileInputRef = useRef(null);
    const messageInputRef = useRef(null);
    const speechBufferRef = useRef('');
    const dictationBaseRef = useRef('');
    // Tracks whether the user still wants dictation running. Needed because even
    // with continuous=true, some browsers still end a recognition session on
    // their own after a longer pause or a transient hiccup — onend uses this to
    // decide whether to auto-resume instead of forcing the user to click the mic
    // button again.
    const dictationActiveRef = useRef(false);
    // Set on a fatal error (mic permission denied, no microphone, etc.) so onend
    // doesn't try to auto-restart a session that can never succeed.
    const dictationFatalErrorRef = useRef(false);

    const micStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const currentUtteranceRef = useRef(null);
    const audioQueueRef = useRef([]);
    const silenceDetectorRef = useRef(null);
    const speechRecognitionRef = useRef(null);
    const recorderTimerRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recog = new SpeechRecognition();
            recog.continuous = false;
            recog.interimResults = false;
            recog.onend = () => {
                const mr = mediaRecorderRef.current;
                if (isVoiceActiveRef.current && mr && mr.state === 'recording') mr.stop();
            };
            silenceDetectorRef.current = recog;
        }

        return () => {
            if (silenceDetectorRef.current) {
                try { silenceDetectorRef.current.stop(); } catch (e) {}
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        const fitInput = () => {
            const el = messageInputRef.current;
            if (!el) return;
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 120) + 'px';
        };
        window.addEventListener('resize', fitInput);
        return () => window.removeEventListener('resize', fitInput);
    }, []);

    useEffect(() => {
        if (isChatOpen) return;
        let alreadyShown = false;
        try { alreadyShown = sessionStorage.getItem('sdrs_chat_bubble_shown') === '1'; } catch (e) {}
        if (alreadyShown) return;

        const showTimer = setTimeout(() => {
            setShowGreetingBubble(true);
            try { sessionStorage.setItem('sdrs_chat_bubble_shown', '1'); } catch (e) {}
        }, 2500);

        return () => clearTimeout(showTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!showGreetingBubble) return;
        const hideTimer = setTimeout(() => dismissBubble(), 9000);
        return () => clearTimeout(hideTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showGreetingBubble]);

    function dismissBubble() {
        setBubbleClosing(true);
        setTimeout(() => {
            setShowGreetingBubble(false);
            setBubbleClosing(false);
        }, 220);
    }

    function openChatFromBubble() {
        dismissBubble();
        openChat();
    }

    function appendMessage(text, role) {
        setMessages(prev => [...prev, { role, text, time: new Date().toLocaleTimeString() }]);
    }

    function triggerFileUpload() {
        fileInputRef.current?.click();
    }

    // Vercel serverless functions cap the request body around 4.5MB, and base64
    // inflates a file's size by roughly a third. Reject oversized files up front
    // with an honest message instead of letting the upload silently fail later.
    const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
    // Mirrors backend/validation.js's MAX_MESSAGE_LENGTH. This is just a fast,
    // friendly client-side check — the backend enforces the real limit
    // regardless, since a direct API call could always skip this file entirely.
    const MAX_MESSAGE_LENGTH = 6000;
    // Gemini's inlineData understands images, PDFs, and plain text well; other
    // binary types (zip, exe, docx, etc.) either fail silently or waste a call
    // producing a confused reply. Reject them up front with an honest message
    // instead of sending bytes Gemini can't actually use.
    const ACCEPTED_ATTACHMENT_TYPES = ['image/', 'application/pdf', 'text/plain'];

    async function handleAttachmentSelect(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        if (file.size > MAX_ATTACHMENT_BYTES) {
            appendMessage(`That file is too large (${Math.round(file.size / 1024)} KB). Please attach something under ${Math.round(MAX_ATTACHMENT_BYTES / 1024 / 1024)} MB.`, 'bot');
            return;
        }

        const isAccepted = ACCEPTED_ATTACHMENT_TYPES.some(prefix => file.type?.startsWith(prefix));
        if (!isAccepted) {
            appendMessage(`That file type (${file.type || 'unknown'}) isn't supported yet. Please attach an image, a PDF, or a plain text file.`, 'bot');
            return;
        }

        setSelectedAttachment(file);
    }

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function initHardware() {
        if (!micStreamRef.current) {
            micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
    }

    function setVisualizerState(state) {
        voiceStateRef.current = state;
        setVoiceState(state);
    }

    // Picks a loaded voice matching the target language, if the browser has one.
    // getVoices() can return [] before the async 'voiceschanged' event fires in some
    // browsers, so this is best-effort — omitting a voice still works fine, the
    // browser just falls back to its own default for the utterance's lang.
    //
    // Chrome typically exposes two kinds of voices per language: the OS's local
    // SAPI/system voices (voice.localService === true — usually the flatter,
    // more "robotic"-sounding ones) and Chrome's own cloud-backed Google voices
    // (localService === false — noticeably more natural, and still completely
    // free/built into the browser, no API calls or billing involved). Prefer the
    // latter whenever one is available for the target language.
    function pickVoice(lang) {
        try {
            const voices = window.speechSynthesis.getVoices();
            const short = lang.split('-')[0];
            const candidates = voices.filter(v => v.lang === lang || v.lang?.startsWith(short));
            if (candidates.length === 0) return null;
            const cloudVoice = candidates.find(v => v.localService === false);
            return cloudVoice || candidates[0];
        } catch (e) {
            return null;
        }
    }

    // Chrome (and some other browsers) load TTS voices asynchronously and can
    // report zero voices for a short window right after page load, or in rare
    // cases forever if the OS has no TTS voices installed at all. Wait briefly for
    // them rather than speaking into a voice list that isn't ready yet.
    function waitForVoices(timeoutMs = 1000) {
        return new Promise(resolve => {
            const existing = window.speechSynthesis.getVoices();
            if (existing.length > 0) return resolve(existing);

            let done = false;
            const finish = (voices) => {
                if (done) return;
                done = true;
                window.speechSynthesis.onvoiceschanged = null;
                resolve(voices);
            };
            window.speechSynthesis.onvoiceschanged = () => finish(window.speechSynthesis.getVoices());
            setTimeout(() => finish(window.speechSynthesis.getVoices()), timeoutMs);
        });
    }

    async function playHumanVoice(text) {
        stopAudioEngine();

        if (!window.speechSynthesis) {
            // No TTS engine available in this browser — skip straight back to
            // listening instead of leaving the overlay silently stuck.
            if (isVoiceActiveRef.current) startListeningLoop();
            return;
        }

        // Chrome has a known quirk where speak() called immediately after cancel()
        // in the same tick can silently be dropped. A short delay, plus waiting for
        // the voice list, avoids racing that.
        await new Promise(r => setTimeout(r, 50));
        const availableVoices = await waitForVoices();

        if (availableVoices.length === 0) {
            // Genuinely no TTS voice installed on this device/browser — speaking is
            // not possible here regardless of what our code does. Say so once in the
            // transcript instead of the overlay silently doing nothing forever.
            appendMessage('(Spoken replies are not available in this browser — no text-to-speech voice is installed. You can still type or use "Voice to Text".)', 'bot');
            if (isVoiceActiveRef.current) startListeningLoop();
            return;
        }

        const lang = detectVoiceLanguage(text);
        // Markdown (bullets, bold, links) reads aloud as disjointed fragments, not
        // flowing speech — the voice-chat prompt now asks the model to avoid it,
        // but this is a cheap defensive normalization in case any slips through.
        const speakableText = stripMarkdownForSpeech(text);
        audioQueueRef.current = speakableText.match(/[^.!?،۔]+[.!?،۔]+/g) || [speakableText];
        setVisualizerState('speaking');

        // If the reply is Arabic/Urdu but this browser/OS has no voice installed
        // for that language at all, speechSynthesis will still try to speak it —
        // usually with a default English voice reading the script under English
        // phonetic rules, which comes out as garbled noise rather than Arabic,
        // not just "accented". The reply text itself is still correct (it's shown
        // in the transcript normally); only the audio is affected. Warn once,
        // non-blockingly, instead of leaving the user confused by bad audio with
        // no explanation.
        const langPrefix = lang.split('-')[0];
        const hasMatchingVoice = availableVoices.some(v => v.lang === lang || v.lang?.toLowerCase()?.startsWith(langPrefix));
        if (!hasMatchingVoice && langPrefix !== 'en') {
            console.warn(`[voice] no installed TTS voice found for "${lang}" — spoken audio may not sound right. Available voice langs:`, availableVoices.map(v => v.lang));
            const languageName = lang === 'ar-SA' ? 'Arabic' : lang === 'ur-PK' ? 'Urdu' : lang;
            appendMessage(`(This browser doesn't have a ${languageName} voice installed, so the spoken reply above may not sound right — the text itself is correct. You can still type or use "Voice to Text".)`, 'bot');
        }

        for (let i = 0; i < audioQueueRef.current.length; i++) {
            if (!isVoiceActiveRef.current || voiceStateRef.current !== 'speaking') break;
            const sentence = audioQueueRef.current[i].trim();
            if (!sentence) continue;

            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.lang = lang;
            const voice = pickVoice(lang);
            if (voice) utterance.voice = voice;
            // The default rate (1.0) reads noticeably flat and rushed on most
            // browser TTS voices. A slightly slower, calmer pace sounds more like
            // someone actually talking. Pitch is deliberately left at the engine's
            // default — these are formant/concatenative voices, not neural ones,
            // and shifting pitch away from default tends to make them sound worse
            // (more "cartoonish"), not more human.
            utterance.rate = 0.95;
            currentUtteranceRef.current = utterance;

            // Guard against a Chrome bug where onend/onerror can simply never fire
            // for a given utterance — without this, that would hang the overlay in
            // "speaking" state forever instead of just skipping that sentence.
            await new Promise(resolve => {
                let settled = false;
                const finish = () => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(watchdog);
                    resolve();
                };
                const watchdog = setTimeout(finish, 8000);
                utterance.onend = finish;
                utterance.onerror = finish;
                try {
                    window.speechSynthesis.speak(utterance);
                } catch (e) {
                    finish();
                }
            });

            // A brief natural pause between sentences, like a real speaker taking a
            // breath, instead of the engine cutting straight into the next
            // utterance — that abrupt back-to-back restart is part of what makes
            // consecutive short utterances sound mechanical.
            if (isVoiceActiveRef.current && voiceStateRef.current === 'speaking' && i < audioQueueRef.current.length - 1) {
                await new Promise(r => setTimeout(r, 180));
            }
        }

        if (isVoiceActiveRef.current && voiceStateRef.current === 'speaking') {
            startListeningLoop();
        }
    }

    function stopAudioEngine() {
        if (window.speechSynthesis) {
            try { window.speechSynthesis.cancel(); } catch (e) {}
        }
        currentUtteranceRef.current = null;
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
            if (mr && mr.state === 'recording') {
                try { mr.stop(); } catch (e) {}
                setVisualizerState('processing');
            }
            try { clearTimeout(recorderTimerRef.current); recorderTimerRef.current = null; } catch (e) {}
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
                if (!isVoiceActiveRef.current) return;
                setVisualizerState('processing');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                // allow smaller blobs to be processed to avoid endless listening loops
                try { clearTimeout(recorderTimerRef.current); recorderTimerRef.current = null; } catch (e) {}
                if (audioBlob.size < 200) {
                    // if tiny, keep listening
                    startListeningLoop();
                    return;
                }

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => sendAudioToGemini(reader.result);
            };
            mr.start();
            // ensure recording doesn't run forever — stop after 7s to force processing
            try {
                recorderTimerRef.current = setTimeout(() => {
                    const mr2 = mediaRecorderRef.current;
                    if (mr2 && mr2.state === 'recording') {
                        try { mr2.stop(); } catch (e) {}
                    }
                }, 7000);
            } catch (e) {}
        } catch (e) {
            console.error('MediaRecorder init error', e);
        }

        if (silenceDetectorRef.current) {
            try { silenceDetectorRef.current.start(); } catch (e) {}
        }
    }

    const backendUrl = getBackendUrl();
    // History sent to Gemini must strictly alternate user/model turns. The visible
    // `messages` list also holds UI-only entries (the greeting, the "thinking"
    // placeholder, and error placeholders shown after a failed request) and, after
    // any failed turn, a user message with no matching reply. Deriving the API
    // history from that display list can produce two user turns in a row, which
    // Gemini rejects outright. To avoid that, keep a separate ref that only grows
    // once a turn actually succeeds, so it always alternates cleanly.
    const conversationHistoryRef = useRef([]);
    // Voice mode previously called the model fresh on every turn with no memory of
    // earlier exchanges in the same voice session, so a follow-up like "what about
    // pricing" had nothing to follow up on. Track it the same way text chat does.
    const voiceHistoryRef = useRef([]);

    async function sendAudioToGemini(base64Audio) {
        if (!isVoiceActiveRef.current) return;
        try {
            const response = await fetch(`${backendUrl}/api/voice-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioBase64: base64Audio, history: voiceHistoryRef.current })
            });
            const data = await response.json();

            if (data.transcript && data.transcript !== '...') appendMessage(data.transcript, 'user');

            if (data.reply) {
                appendMessage(data.reply, 'bot');
                if (data.transcript && data.transcript !== '...') {
                    voiceHistoryRef.current = [
                        ...voiceHistoryRef.current,
                        { role: 'user', parts: [{ text: data.transcript }] },
                        { role: 'model', parts: [{ text: data.reply }] }
                    ];
                }
                playHumanVoice(data.reply);
            } else {
                startListeningLoop();
            }
        } catch (error) {
            console.error(error);
            startListeningLoop();
        }
    }

    function stopDictation() {
        dictationActiveRef.current = false;
        if (speechRecognitionRef.current) {
            try { speechRecognitionRef.current.stop(); } catch (e) {}
        }
        setIsDictating(false);
    }

    function startSpeechToText() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            appendMessage('Speech-to-text is not available in this browser.', 'bot');
            return;
        }

        stopDictation();
        closeVoice();

        const recog = new SpeechRecognition();
        // Match the site's current language instead of forcing English, so
        // Arabic-speaking visitors get accurate dictation instead of the browser
        // trying (and failing) to transcribe Arabic speech as English.
        recog.lang = document.documentElement.lang === 'ar' ? 'ar-SA' : 'en-US';
        // Regression fix: this was `false`, so the browser ended the entire
        // recognition session as soon as it detected a short pause between
        // phrases — after writing "a few words" the user had to click the mic
        // button again to keep dictating. `true` lets one session span multiple
        // phrases/pauses.
        recog.continuous = true;
        recog.interimResults = true;
        dictationActiveRef.current = true;
        dictationFatalErrorRef.current = false;
        recog.onstart = () => {
            setIsDictating(true);
            setVisualizerState('listening');
            speechBufferRef.current = '';
            dictationBaseRef.current = input || '';
        };
        recog.onresult = (event) => {
            let interim = '';
            // collect final results into buffer and show interim separately
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const r = event.results[i];
                const t = (r[0] && r[0].transcript) ? r[0].transcript : '';
                if (r.isFinal) {
                    speechBufferRef.current = (speechBufferRef.current ? speechBufferRef.current + ' ' : '') + t;
                } else {
                    interim = interim ? interim + ' ' + t : t;
                }
            }

            const base = dictationBaseRef.current || '';
            const composed = (base + (speechBufferRef.current ? (base ? ' ' : '') + speechBufferRef.current : '') + (interim ? (speechBufferRef.current || base ? ' ' : '') + interim : '')).trim();
            setInput(composed);
            // auto-resize if textarea exists
            try {
                if (messageInputRef.current) {
                    messageInputRef.current.style.height = 'auto';
                    messageInputRef.current.style.height = messageInputRef.current.scrollHeight + 'px';
                }
            } catch (e) {}
        };
        recog.onerror = (event) => {
            // A brief 'no-speech' gap is normal and should not end dictation — only
            // permission/hardware errors are truly fatal and should stop it for good.
            const fatalErrors = ['not-allowed', 'audio-capture', 'service-not-allowed'];
            if (fatalErrors.includes(event?.error)) {
                dictationFatalErrorRef.current = true;
                dictationActiveRef.current = false;
                if (event.error === 'not-allowed') {
                    appendMessage('Microphone access was blocked. Please allow microphone permission to use Voice to Text.', 'bot');
                } else if (event.error === 'audio-capture') {
                    appendMessage('No microphone was found. Please connect one to use Voice to Text.', 'bot');
                }
            }
            // The browser fires onend right after onerror; let onend decide whether
            // to resume or fully stop, based on the flags set above.
        };
        recog.onend = () => {
            // Guard against a superseded session: if the mic button was clicked
            // again in the meantime, speechRecognitionRef.current now points at a
            // newer recog instance, and this stale onend must not touch it.
            const isCurrentSession = speechRecognitionRef.current === recog;
            if (isCurrentSession && dictationActiveRef.current && !dictationFatalErrorRef.current) {
                // A short delay avoids a Chrome race where calling start() again
                // synchronously inside a recognizer's own onend can throw
                // "recognition has already started".
                setTimeout(() => {
                    const stillCurrent = speechRecognitionRef.current === recog;
                    if (!stillCurrent || !dictationActiveRef.current || dictationFatalErrorRef.current) return;
                    try {
                        recog.start();
                    } catch (e) {
                        setIsDictating(false);
                        setVisualizerState('connecting');
                    }
                }, 150);
                return;
            }
            if (isCurrentSession) {
                setIsDictating(false);
                setVisualizerState('connecting');
                // ensure input is focused after dictation ends
                try { messageInputRef.current?.focus(); } catch (e) {}
            }
        };

        speechRecognitionRef.current = recog;
        try {
            recog.start();
        } catch (e) {
            console.error('Speech recognition init error', e);
            dictationActiveRef.current = false;
            setIsDictating(false);
        }
    }

    async function openVoice() {
        try {
            stopDictation();
            setVisualizerState('connecting');
            isVoiceActiveRef.current = true;
            setIsVoiceActive(true);
            await initHardware();
            setTimeout(() => startListeningLoop(), 300);
        } catch (e) {
            console.error('Hardware access denied.', e);
            isVoiceActiveRef.current = false;
            setIsVoiceActive(false);
            try { if (silenceDetectorRef.current) silenceDetectorRef.current.stop(); } catch (err) {}
        }
    }

    function closeVoice() {
        isVoiceActiveRef.current = false;
        setIsVoiceActive(false);
        stopAudioEngine();
        try { if (silenceDetectorRef.current) silenceDetectorRef.current.stop(); } catch (e) {}
        const mr = mediaRecorderRef.current;
        if (mr && mr.state === 'recording') mr.stop();

        // Closing voice mode previously left the microphone stream open, so the
        // browser's "mic in use" indicator stayed on even though the overlay was
        // closed. Release the actual hardware access; openVoice() re-requests it
        // fresh next time.
        if (micStreamRef.current) {
            try { micStreamRef.current.getTracks().forEach(track => track.stop()); } catch (e) {}
            micStreamRef.current = null;
        }
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

    function clearConversation() {
        if (isVoiceActive) {
            closeVoice();
        }
        setMessages([{ role: 'bot', text: INITIAL_BOT_GREETING, time: 'Just now' }]);
        conversationHistoryRef.current = [];
        voiceHistoryRef.current = [];
        setSelectedAttachment(null);
        setInput('');
    }

    async function handleSendMessage(messageOverride = null) {
        const typedMessage = (messageOverride ?? input).trim();
        const attachment = selectedAttachment;
        let finalMessage = typedMessage;
        let attachmentBase64 = null;

        if (attachment) {
            const attachmentLabel = attachment.name;
            const attachmentSize = Math.round(attachment.size / 1024);
            // Keep a readable label in the visible transcript, but this is display-only
            // now — the actual file bytes are sent separately below so Gemini can read
            // the real contents, not just the filename.
            finalMessage = typedMessage
                ? `${typedMessage}\n\n[Attachment: ${attachmentLabel} (${attachmentSize} KB)]`
                : `Please review this attachment: ${attachmentLabel} (${attachmentSize} KB)`;

            try {
                attachmentBase64 = await readFileAsDataUrl(attachment);
            } catch (e) {
                console.error('Failed to read attachment', e);
                appendMessage('Sorry, I could not read that attachment. Please try again.', 'bot');
                return;
            }
        }

        if (!finalMessage) return;

        if (typedMessage.length > MAX_MESSAGE_LENGTH) {
            appendMessage(`That message is too long (${typedMessage.length} characters). Please keep it under ${MAX_MESSAGE_LENGTH} characters.`, 'bot');
            return;
        }

        appendMessage(finalMessage, 'user');
        setInput('');
        setSelectedAttachment(null);
        setIsThinking(true);

        // Snapshot before this turn. Only committed to conversationHistoryRef once
        // we know the exchange actually succeeded.
        const history = conversationHistoryRef.current;

        try {
            const response = await fetch(`${backendUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: typedMessage || (attachment ? `Please review this attachment: ${attachment.name}` : ''),
                    history,
                    ...(attachmentBase64 ? { attachmentBase64, attachmentMimeType: attachment.type || 'application/octet-stream' } : {})
                })
            });

            const botReply = await response.text();
            if (!response.ok) {
                console.error('Chat API error', response.status, botReply);
                // 400/413/429/504 responses now carry a specific, already
                // user-friendly reason (bad input, rate-limited, Gemini's own quota
                // exhausted, or a request that timed out) — show that directly
                // instead of a generic message. Only a genuine, unexplained server
                // error (500) falls back to the generic apology.
                const message = response.status !== 500 && botReply
                    ? botReply
                    : 'Sorry, the assistant could not respond right now.';
                appendMessage(message, 'bot');
                return;
            }

            if (botReply) {
                appendMessage(botReply, 'bot');
                conversationHistoryRef.current = [
                    ...history,
                    { role: 'user', parts: [{ text: finalMessage }] },
                    { role: 'model', parts: [{ text: botReply }] }
                ];
            } else {
                appendMessage('Sorry, I could not generate a reply right now.', 'bot');
            }
        } catch (error) {
            console.error('Chat request failed', error);
            appendMessage('Sorry, I could not reach the assistant right now.', 'bot');
        } finally {
            setIsThinking(false);
        }
    }

    return (
        <>
            <style>{css}</style>
            {!isChatOpen && showGreetingBubble && (
                <div className={`chat-greeting-bubble ${bubbleClosing ? 'closing' : ''}`} onClick={openChatFromBubble}>
                    <span className="bubble-sparkle bubble-sparkle-1">✦</span>
                    <span className="bubble-sparkle bubble-sparkle-2">✦</span>
                    <span className="bubble-sparkle bubble-sparkle-3">✦</span>
                    <div className="bubble-avatar"><RoboticIcon size={20} idSuffix="bubble" /></div>
                    <div className="bubble-copy">
                        <strong>Hi, I'm Fares 👋</strong>
                        <span>Need help with trade, customs, or logistics? Ask me anything.</span>
                    </div>
                    <button className="bubble-close" onClick={(e) => { e.stopPropagation(); dismissBubble(); }} aria-label="Dismiss">×</button>
                </div>
            )}
            {!isChatOpen && (
                <button className="chat-toggle-button" onClick={openChat} title="Chat with Fares">
                    <span className="button-label">Chat with Fares</span>
                    <RoboticIcon size={32} idSuffix="toggle" />
                </button>
            )}

            {isChatOpen && (
                <div id="chat-container">
                    <div id="chat-header">
                        <div className="header-identity">
                            <div className="header-logo"><RoboticIcon size={24} idSuffix="header" /></div>
                            <div className="header-copy">
                                <div className="header-title">Fares</div>
                                <div className="header-status"><span className="status-dot" /> SDRS Trade Assistant</div>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button className="chat-clear-btn" onClick={clearConversation} title="Clear conversation" disabled={isThinking}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                            </button>
                            <button className="chat-close-btn" onClick={hideChat} title="Close chat">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                    </div>

                    <div id="messages" ref={messagesRef}>
                        {messages.map((m, idx) => (
                            <div key={idx} className={`message-wrapper ${m.role}`}>
                                <div className="message" dir="auto" dangerouslySetInnerHTML={m.role === 'bot' ? { __html: marked.parse(m.text) } : undefined}>
                                    {m.role !== 'bot' ? m.text : null}
                                </div>
                                <div className="timestamp">{m.time}</div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="message-wrapper bot">
                                <div className="message typing-indicator" aria-live="polite">
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                </div>
                                <div className="timestamp">Thinking…</div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {messages.length <= 1 && (
                        <div className="quick-pills" aria-hidden={isDictating}>
                            {['About SDRS', 'Services', 'Investment', 'Contact Us'].map((s, i) => (
                                <button key={i} type="button" className="pill" onClick={() => handleSendMessage(s)} disabled={isThinking}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    <div id="input-area">
                        <input type="file" ref={fileInputRef} accept="image/*,application/pdf,text/plain" style={{ display: 'none' }} onChange={handleAttachmentSelect} />
                        <button className="icon-btn" title="Attach File" onClick={triggerFileUpload}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        </button>
                        <div className="composer">
                            {selectedAttachment && (
                                <div className="attachment-chip">
                                    <span>{selectedAttachment.name}</span>
                                    <button type="button" onClick={() => setSelectedAttachment(null)} aria-label="Remove attachment">×</button>
                                </div>
                            )}
                            <textarea id="message-input" ref={messageInputRef} value={input} onChange={e => {
                                setInput(e.target.value);
                                try {
                                    const el = messageInputRef.current;
                                    if (el) {
                                        el.style.height = 'auto';
                                        el.style.height = el.scrollHeight + 'px';
                                    }
                                } catch (err) {}
                            }} onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }} rows={1} dir="auto" placeholder={isThinking ? 'Assistant is thinking…' : isDictating ? 'Listening for speech…' : selectedAttachment ? 'Add a note and send' : 'Type a message...'} autoComplete="off" disabled={isThinking} />
                        </div>
                        <button className={`icon-btn ${isVoiceActive ? 'voice-active' : ''}`} id="open-voice-btn" title="Start Voice Mode" onClick={openVoice}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 7v10M22 10v4M7 7v10M2 10v4"/></svg>
                        </button>
                        <button className={`icon-btn ${isDictating ? 'mic-active' : ''}`} title="Voice to Text" onClick={startSpeechToText}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
                        </button>
                        <button id="send-btn" onClick={() => handleSendMessage()} disabled={isThinking}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
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