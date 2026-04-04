export function isContextError(errStr) {
  return (
    errStr.includes("request too large") ||
    errStr.includes("body too large") ||
    errStr.includes("context_length_exceeded") ||
    errStr.includes("maximum context length") ||
    errStr.includes("too many tokens") ||
    errStr.includes("token limit") ||
    errStr.includes("max_tokens") ||
    errStr.includes("max size") ||
    errStr.includes("input is too long")
  );
}
