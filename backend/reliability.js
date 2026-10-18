// Timeout and retry helpers for calls to the Gemini API, extracted so their
// logic (which errors are retryable, which aren't) can be unit tested directly
// instead of only being exercised indirectly through the Express routes.

// Vercel kills a function outright at vercel.json's maxDuration, with a generic
// platform error and no chance for our own catch block to send a friendly
// message. Racing each Gemini call against a shorter internal timeout lets a
// stuck call fail on our terms first, with a clear reason and a clean status.
export class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimeoutError';
        this.status = 504;
    }
}

export function withTimeout(promiseFactory, ms, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new TimeoutError(`${label} timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promiseFactory(), timeout]).finally(() => clearTimeout(timer));
}

// Retrying a 429 (quota exhausted) or a 4xx (bad request) immediately cannot
// succeed and only burns another call against the same limited quota. A
// timeout is also not retried — doing so would just double the worst-case wait
// for a user who is already waiting too long. Only genuinely transient errors
// (a dropped connection, or a 5xx from Google's side) are worth retrying.
export function isRetryableError(error) {
    if (error instanceof TimeoutError) return false;
    const status = error?.status || error?.response?.status;
    if (status === undefined) return true; // network-level failure, no HTTP status at all
    return status >= 500;
}

export async function withSingleRetry(fn) {
    try {
        return await fn();
    } catch (error) {
        if (!isRetryableError(error)) throw error;
        console.warn('Transient Gemini error, retrying once:', error?.message);
        await new Promise(r => setTimeout(r, 400));
        return fn();
    }
}
