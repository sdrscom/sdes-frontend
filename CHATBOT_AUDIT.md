# SDRS Intelligent Trade Assistant — Audit & Backlog

Living document. Last updated: 2026-09-27.

Legend: ✅ implemented · ⚠️ partially implemented · ❌ missing · ➖ not applicable / out of scope for a chatbot code change.

Key files referenced below:
- Frontend widget: `src/components/Chatbot.jsx`
- Backend server: `backend/server.mjs`
- History sanitation: `backend/chatHistory.js`
- Input validation (new): `backend/validation.js`
- System prompt / knowledge: `backend/knowledgeBase.js`
- Tool stubs: `backend/tools.js`
- Tests: `backend/test/system-instruction.mjs`, `src/utils/voiceLanguage.test.mjs`

---

## 1. Conversation & Context Management

| Item | Status | Notes |
|---|---|---|
| Context retention across turns | ✅ | `conversationHistoryRef` (text) and `voiceHistoryRef` (voice) resend prior turns; `sanitizeHistoryForGemini` keeps them valid for Gemini. |
| Context window / history growth bound | ✅ *(new)* | `chatHistory.js` `MAX_HISTORY_MESSAGES = 24` caps how much history is resent. Previously unbounded. |
| Multi-turn coherence (follow-ups referencing earlier turns) | ✅ | Works for both text and voice chat since history is included in `startChat({ history })`. |
| Session reset / clear conversation | ✅ *(new)* | "Clear conversation" button added to the chat header (`clearConversation()` in `Chatbot.jsx`) — resets messages, text history, and voice history. |
| Cross-session persistence (survive page reload/close) | ❌ | State is only in React memory; refreshing the page loses the conversation. Backlog item — see below. |
| Server-side conversation storage / conversation IDs | ❌ | No database or storage layer exists; each request is stateless server-side, history lives only in the browser tab. Backlog item. |

## 2. Response Quality

| Item | Status | Notes |
|---|---|---|
| Grounded in a defined knowledge base | ✅ | `knowledgeBase.js` loads CMS/site content into the system prompt; rules forbid inventing facts. |
| Refuses to fabricate live data (tracking status, lead confirmation) | ✅ | `tools.js` stubs (`track_container`, `capture_lead`) explicitly return `live_tracking:false`/`saved:false` and instruct the model never to claim otherwise. |
| Sales-desk tone / formatting rules | ✅ | Explicit formatting and tone rules already in the system prompt. |
| Language matching (reply in the user's language) | ✅ | System prompt rule + voice prompt explicitly requires matching reply language (Arabic/Urdu/English). |
| Handles blocked/empty Gemini responses gracefully | ✅ | `readFunctionCalls`/`readReplyText` handle `SAFETY`/`RECITATION`/`OTHER` finish reasons and fully-blocked prompts without crashing (covered by tests). |

## 3. Knowledge Base / RAG

| Item | Status | Notes |
|---|---|---|
| Knowledge base sourced from real site content | ✅ | `loadKnowledgeBase()` reads CMS-authored content. |
| Distinguishes CMS-only vs. placeholder/mock content | ✅ | Explicit "CMS-only" and "ignore placeholder stats" rules in the prompt. |
| Hot-reload without redeploying | ⚠️ → ✅ *(secured)* | `/api/reload-knowledge` existed but had **no authentication at all** — anyone who found the URL could trigger it. Now requires a matching `x-reload-secret` header against a `RELOAD_SECRET` env var, and denies by default if that env var isn't set. |
| Real-time backend data (tracking, inventory) in the knowledge base | ➖ | Out of scope for a chatbot code change — `TrackingPage.jsx` itself uses mock data; there is no real tracking backend to connect to yet. This is the access/integration the user is separately arranging with the client. |

## 4. User Intent & Query Understanding

| Item | Status | Notes |
|---|---|---|
| Function/tool calling for structured intents (tracking, lead capture) | ✅ | `chatbotTools` + `executeTool` wired into `/api/chat`. |
| Quick-reply intents (common questions) | ✅ | Quick-pill buttons (About/Services/Investment/Contact) auto-send and hide after first message. |
| Attachment understanding (images/PDFs the user shares) | ✅ *(fixed this session)* | Previously only a filename label was sent; now real bytes go to Gemini as `inlineData` via `buildMessageParts`. |
| Voice input understanding | ✅ | Dictation (`webkitSpeechRecognition`) and live voice mode both send real audio/text. |

## 5. Conversation Flow & UX

| Item | Status | Notes |
|---|---|---|
| Typing/thinking indicator | ✅ | Animated dots shown while `isThinking`. |
| Voice-to-text dictation | ✅ | Confirmed working correctly by the user, including language auto-detection. |
| Live voice mode (spoken replies) | ✅ *(fixed this session)* | Was silently producing no audio (broken `translate.google.com` hack); replaced with native `speechSynthesis`, plus Chrome-specific hardening (voice-load wait, cancel/speak race delay, watchdog). **Awaiting final user confirmation it's now audible on their machine — see Remaining issues.** |
| Attachment upload UX | ✅ *(fixed this session)* | Oversized files rejected client-side with a friendly message; accepted files are actually transmitted now. |
| Message-length guard (both directions) | ✅ *(new)* | Client-side guard in `Chatbot.jsx` (6000 chars) plus a real server-side enforcement in `validation.js` (previously nothing capped input length server-side). |
| Clear/reset conversation control | ✅ *(new)* | See section 1. |

## 6. Performance & Scalability

| Item | Status | Notes |
|---|---|---|
| Fast model / low latency config | ✅ | `gemini-2.5-flash` with `thinkingConfig: { thinkingBudget: 0 }` on both endpoints. |
| Streaming responses | ⚠️ | `/api/chat` chunks the *already-complete* reply text over `Transfer-Encoding: chunked` to animate it client-side — this is a typing-animation effect, not true token-by-token streaming from Gemini. Real streaming (`generateContentStream`) would need a moderately larger change; left as backlog rather than built unilaterally given the existing UX already reads as "streaming" to a user. |
| Caching of repeated/common queries | ❌ | Every request hits Gemini fresh, even for identical quick-pill questions. Backlog item. |
| Rate limiting / abuse protection | ❌ → ✅ *(new)* | Nothing existed before. Added `express-rate-limit` (20 requests/min per IP) on both `/api/chat` and `/api/voice-chat`. **Caveat:** the store is in-memory, so on Vercel's serverless model this only limits bursts within one warm function instance, not perfectly across all instances — noted as a known limitation, not a full fix. |
| Automatic retry on transient failures | ❌ → ✅ *(new)* | Added a single retry with backoff in `server.mjs` (`withSingleRetry`), but only for 5xx/network-level errors — a 429 (quota) or 400 (bad request) is never retried, since retrying those immediately cannot succeed and would just waste another quota-counted call. |

## 7. Safety / Security / Privacy

| Item | Status | Notes |
|---|---|---|
| CORS restricted to the production domain | ✅ | Already restricted to `sdrs.com.sa`/`www.sdrs.com.sa` in `server.mjs`. |
| Input validation (type/length/emptiness) | ❌ → ✅ *(new)* | Previously nothing rejected an empty message, a non-string payload, or an unbounded-length message before it reached Gemini. Added `backend/validation.js` + wired into `/api/chat`. |
| Prompt-injection resistance | ❌ → ✅ *(new)* | No explicit rule existed telling the model to ignore embedded instructions in user text/attachments or refuse to reveal its system prompt. Added to `knowledgeBase.js`. |
| PII minimization | ❌ → ✅ *(new)* | No guidance existed against soliciting or repeating sensitive personal data (ID numbers, card details, passwords). Added a rule limiting lead capture to name/email/inquiry and instructing the model not to echo back anything more sensitive a user volunteers. |
| Authentication/authorization on admin endpoints | ❌ → ✅ *(new)* | `/api/reload-knowledge` had zero auth; see section 3. |
| Malformed-request handling (bad JSON body) | ❌ → ✅ *(new)* | A malformed JSON body previously fell through to Express's default HTML error page. Added a JSON-parse error-handling middleware returning a plain 400. |
| Secrets management | ✅ | `GEMINI_API_KEY` (and the new `RELOAD_SECRET`) live in Vercel environment variables, not in source. |

## 8. Reliability & Error Handling

| Item | Status | Notes |
|---|---|---|
| Graceful handling of blocked/empty Gemini responses | ✅ | See section 2; covered by existing regression tests. |
| Graceful handling of malformed conversation history | ✅ | `sanitizeHistoryForGemini`/`enforceAlternatingRoles`, covered by tests. |
| Accurate error status codes surfaced to the client | ⚠️ → ✅ *(bug fixed this session)* | **Found a real pre-existing bug:** `/api/chat`'s catch block always returned HTTP 500 no matter what Gemini actually returned, so the frontend's `response.status === 429` branch (meant to show a friendly "usage limit reached" message) could never fire — users only ever saw the generic apology, even during a real quota exhaustion. Fixed to forward the real upstream status (429/400/etc.) when known. |
| Retry on transient failure | ❌ → ✅ *(new)* | See section 6. |
| Fallback message when the model returns nothing | ✅ | Already present (`finalMessage` fallback string in `/api/chat`). |

## 9. Conversation State & Data Management

| Item | Status | Notes |
|---|---|---|
| In-memory session state (current tab) | ✅ | React state + refs. |
| Persisted state across reloads | ❌ | Backlog (localStorage). |
| Server-side conversation logs/storage | ❌ | Backlog (would need a database — a deliberate architectural decision, not built unilaterally). |
| Conversation history UI (view/search past chats) | ❌ | Backlog; depends on server-side storage above. |
| Data retention / deletion policy | ➖ | No data is currently stored server-side at all, so there is nothing to retain or delete yet. Revisit once/if server-side storage is added. |

## 10. Monitoring & Analytics

| Item | Status | Notes |
|---|---|---|
| Token usage visibility | ❌ → ✅ *(new)* | Gemini's `usageMetadata` was returned on every response but discarded. Added `logTokenUsage()` — logs prompt/candidate/total token counts to the server console (visible in Vercel function logs) for both `/api/chat` and `/api/voice-chat`. |
| Error logging | ✅ | Already logs to `console.error` on chat/voice failures (visible in Vercel logs). |
| Real analytics/observability service (e.g. dashboards, alerting) | ❌ | No Vercel Analytics/Sentry/Datadog-style integration exists. Backlog — a genuine product decision (which service, budget) rather than something to wire up unilaterally. |
| Usage/conversation metrics (volume, common questions, drop-off) | ❌ | Backlog, depends on the analytics/storage decisions above. |

## 11. Testing

| Item | Status | Notes |
|---|---|---|
| Backend regression tests | ✅ *(expanded this session)* | `backend/test/system-instruction.mjs` — now covers: system prompt content, blocked finish reasons, history sanitization/alternation, attachment `inlineData` construction, **input validation (`validateChatRequest`)**, and **history-length capping**. Run via `npm test` in `backend/`. |
| Frontend unit tests | ✅ | `src/utils/voiceLanguage.test.mjs` covers language detection for TTS voice selection. |
| End-to-end/manual test coverage | ⚠️ | No automated E2E/browser test suite (e.g. Playwright) exists for the widget UI itself; testing has been manual. See "Recommended tests" below. |

## 12. Final Developer Verification

| Item | Status | Notes |
|---|---|---|
| `npm test` (backend) passes | ✅ | Verified after every change in this session. |
| `npm run build` (frontend) succeeds | ✅ | Verified after the `Chatbot.jsx` header/validation changes. |
| Model is `gemini-2.5-flash` in both endpoints | ✅ | Confirmed in a prior session pass. |
| No secrets committed to source | ✅ | Confirmed — keys only in Vercel env vars. |

---

## Changes made this session

1. **`backend/validation.js`** *(new)* — `validateChatRequest()`: rejects empty messages (with no attachment), non-string `message`/`attachmentBase64`, over-length messages (>6000 chars), and oversized attachment payloads, before any Gemini call is made.
2. **`backend/chatHistory.js`** — added `MAX_HISTORY_MESSAGES = 24` cap inside `sanitizeHistoryForGemini`, re-enforcing the "must start with user" rule after trimming.
3. **`backend/server.mjs`**:
   - `app.set('trust proxy', 1)` so rate limiting sees real client IPs behind Vercel's proxy.
   - Installed and wired `express-rate-limit` (20 req/min/IP) onto `/api/chat` and `/api/voice-chat`.
   - Added a JSON body-parse error handler (malformed JSON → clean 400 instead of Express's default HTML error page).
   - Wired `validateChatRequest` into `/api/chat`.
   - Added `logTokenUsage()` — logs Gemini's token usage for both endpoints.
   - Added `withSingleRetry()` — retries only genuinely transient (5xx/network) errors once, never 429/4xx.
   - Added a size guard on `/api/voice-chat`'s `audioBase64`.
   - **Fixed a real bug**: `/api/chat`'s error handler always returned HTTP 500 regardless of the actual upstream error, silently disabling the frontend's 429/quota-specific messaging. Now forwards the real status.
   - Secured `/api/reload-knowledge` with a `RELOAD_SECRET`/`x-reload-secret` shared-secret check (previously open to anyone).
4. **`backend/knowledgeBase.js`** — added prompt-injection resistance and PII-minimization rules to the system prompt.
5. **`src/components/Chatbot.jsx`**:
   - Added a "Clear conversation" button in the chat header (`clearConversation()`), resetting visible messages, text history, and voice history.
   - Added a client-side message-length guard (6000 chars) mirroring the new backend limit.
   - Updated error-message handling to surface the backend's specific 4xx reason (validation/rate-limit/quota) instead of only a generic apology, and fixed to work correctly now that the backend forwards real status codes.
6. **`backend/test/system-instruction.mjs`** — added regression tests for `validateChatRequest` (valid/empty/whitespace/missing/over-length/non-string/oversized-attachment cases) and for history capping (bounded length, starts with `user`, keeps the most recent turns).
7. Installed `express-rate-limit@^8` as a backend dependency.

All changes verified locally: `npm test` (backend) passes, `npm run build` (frontend) succeeds, `voiceLanguage.test.mjs` passes.

---

## Remaining issues

- **Live voice mode audio — unconfirmed on the user's machine.** The Chrome-specific `speechSynthesis` hardening (wait-for-voices, cancel/speak delay, per-utterance watchdog, explicit "no TTS voice installed" fallback message) is deployed, but the user has not yet reported back the result of the requested DevTools diagnostic (`speechSynthesis.getVoices().length`, and whether a manual `speechSynthesis.speak(...)` call is audible). If it's still silent after this, the next hypothesis is a genuinely missing OS-level TTS voice pack on that machine (an environment issue, not a code issue) — Windows Settings → Time & Language → Speech would confirm this.
- **In-memory rate limiting on serverless.** `express-rate-limit`'s default in-memory store doesn't share state across separate Vercel function instances/regions. It still helps against a single abusive client hammering one warm instance, but isn't a hard global cap. A proper fix would need a shared store (e.g. Upstash Redis) — not added, to avoid introducing a new paid dependency without the user's decision.
- **Real tracking-backend integration** remains blocked on the client (SDRS) granting API/data access — separately being arranged by the user, outside this codebase.
- **No true token-by-token streaming** from Gemini — the current "typing" effect chunks an already-complete reply. Cosmetically similar to streaming, but doesn't reduce time-to-first-visible-word the way real streaming would.
- **No persistence across page reloads** — closing or refreshing the tab loses the conversation (both for the visible transcript and for Gemini's context). Not fixed, since this needs a decision on scope (`localStorage` only, vs. real server-side sessions).

---

## Recommended tests before production deployment

1. **Rate limiting**: send >20 `/api/chat` requests within 60 seconds from one machine and confirm the 21st gets a clear "too many requests" message, not a raw error.
2. **Validation**: try sending an empty message with no attachment, a message over 6000 characters, and a malformed JSON body directly (e.g. via `curl`/Postman, bypassing the widget) — confirm each gets a clean 400, not a 500 or a hang.
3. **Attachment flow**: attach an image and ask a question about its visible content (not just its filename) in both English and Arabic; attach a file just under and just over the 3MB client limit.
4. **Voice mode, end-to-end, on the actual reported environment (Chrome desktop)**: open live voice mode, speak a question, pause, and confirm an audible spoken reply — not just a text transcript. Also test on Chrome on a second machine to isolate a local voice-pack issue from a code issue.
5. **Quota/429 path**: temporarily exhaust or fake a Gemini quota error and confirm the widget now shows the "usage limit reached" message (this path was silently broken until this session's fix — needs explicit re-verification since it was never actually exercised correctly before).
6. **Clear conversation button**: verify it resets the visible transcript, that a subsequent question doesn't reference anything from before the clear, and that it also stops/resets live voice mode if it was active.
7. **Reload-knowledge endpoint**: confirm a request without the `x-reload-secret` header (or with the wrong value) gets a 403, and that a request with the correct header (once `RELOAD_SECRET` is set in Vercel) still works. If `RELOAD_SECRET` is never configured in Vercel, this endpoint is now permanently disabled — decide if/when it's actually needed operationally.
8. **Regression**: re-run `npm test` in `backend/` and `npm run build` at the root before every deploy — both are fast and already catch most of the above logically (not visually).

---

## Backlog — larger items, not built unilaterally

These are real gaps but each implies an architectural or product decision (data storage, budget, third-party service) that shouldn't be made silently inside a "fix the chatbot" pass:

- **Conversation persistence across reloads** — at minimum `localStorage` for the current tab; at most, server-side storage with a conversation ID (requires a database).
- **Server-side conversation storage + history UI** — needed for support/QA to review past conversations; requires a database and a privacy/retention policy decision.
- **Real analytics/observability integration** — e.g. Vercel Analytics, Sentry, or a dashboard for volume/common-questions/drop-off; needs a product decision on which service and budget.
- **True token streaming** from Gemini (`generateContentStream`) instead of chunking a complete reply — a moderate refactor of both `server.mjs` and the frontend's fetch handling.
- **Response caching** for repeated/common questions (e.g. the quick-pill questions) to cut latency and Gemini quota usage.
- **Shared rate-limit store** (e.g. Upstash Redis) for a hard global cap across all Vercel instances, not just per warm instance.
- **Live human-agent handoff** — escalate to a real person when the bot can't help; needs a decision on channel (email, live chat, phone).
- **Real container/shipment tracking backend integration** — pending the client (SDRS) granting API/data access, discussed separately with the user.
- **End-to-end/browser test suite** (e.g. Playwright) for the widget itself, covering attachment upload, voice mode, and quick-pills in an actual browser rather than only backend unit tests.
