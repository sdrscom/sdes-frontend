export function readFunctionCalls(response) {
    const calls = typeof response?.functionCalls === 'function'
        ? response.functionCalls()
        : response?.functionCalls;

    if (!Array.isArray(calls)) return [];

    return calls.filter(call => call && typeof call.name === 'string' && call.name.length > 0);
}
