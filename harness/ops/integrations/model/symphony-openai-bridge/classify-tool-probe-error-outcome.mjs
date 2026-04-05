export function classifyToolProbeErrorOutcome(errorText) {
  const text = String(errorText || '');
  const normalized = text.toLowerCase();
  if (!normalized) return { status: 'probe-error', detail: text };
  if (/tool calling[`' ]+is not supported|does not support tools|no endpoints.*tool|tool_choice|enable-auto-tool-choice|tool-call-parser/.test(normalized)) {
    return { status: 'non-capable-rejected', detail: text };
  }
  if (/invalid json response/.test(normalized)) {
    return { status: 'invalid-json-response', detail: text };
  }
  if (/payment required|positive credit balance|required|credit limit exceeded|add credits|insufficient credits|quota/.test(normalized)) {
    return { status: 'quota-exhausted', detail: text };
  }
  if (/too many requests|rate limit exceeded|rate.?limited|429|session limit|weekly limit/.test(normalized)) {
    return { status: 'rate-limited', detail: text };
  }
  if (/unavailable model|model not found|no endpoints found/.test(normalized)) {
    return { status: 'unavailable-model', detail: text };
  }
  if (/forbidden|unauthorized|invalid api key|invalid format of key|not part of team|401|403/.test(normalized)) {
    return { status: 'auth-invalid', detail: text };
  }
  if (/bad request|400/.test(normalized)) {
    return { status: 'bad-request', detail: text };
  }
  if (/failed to call a function/.test(normalized)) {
    return { status: 'failed-function-call', detail: text };
  }
  if (/timeout|timed out|tool-probe-timeout|abort/.test(normalized)) {
    return { status: 'timeout', detail: text };
  }
  return { status: 'probe-error', detail: text };
}
