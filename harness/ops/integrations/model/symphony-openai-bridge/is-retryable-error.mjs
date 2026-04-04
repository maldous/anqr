import { errorToString } from "./error-to-string.mjs";
import { logDebug } from "./logger.mjs";

export function isRetryableError(err) {
  let errStr = "";
  try {
    errStr = (typeof err === "string" ? err : errorToString(err)).toLowerCase();
  } catch {
    // If errorToString fails, treat as non-retryable
    return false;
  }

  const isRetryable =
    errStr.includes("429") ||
    errStr.includes("402") ||
    errStr.includes("quota") ||
    errStr.includes("insufficient_quota") ||
    errStr.includes("usage limit") ||
    errStr.includes("rate_limit") ||
    errStr.includes("payment required") ||
    errStr.includes("out of credits") ||
    errStr.includes("insufficient credits") ||
    errStr.includes("free credits reset") ||
    errStr.includes("both modes failed") ||
    errStr.includes("both modes exhausted") ||
    errStr.includes("both paid and free") ||
    errStr.includes("codebuff provider exhausted") ||
    errStr.includes("codebuff provider failed") ||
    errStr.includes("codebuff continuation exhausted") ||
    errStr.includes("codebuff continuation failed") ||
    errStr.includes("provider exhausted") ||
    errStr.includes("triggering fallback") ||
    errStr.includes("timeout") ||
    errStr.includes("503") ||
    errStr.includes("502") ||
    errStr.includes("network") ||
    errStr.includes("econnrefused") ||
    errStr.includes("ECONNREFUSED") ||
    errStr.includes("econnreset") ||
    errStr.includes("ECONNRESET") ||
    errStr.includes("socket hang up") ||
    errStr.includes("premature close") ||
    errStr.includes("aborted") ||
    errStr.includes("fetch failed") ||
    errStr.includes("connection") ||
    errStr.includes("enotfound") ||
    errStr.includes("no output generated") ||
    errStr.includes("nooutputgeneratederror") || // cspell:disable-line
    errStr.includes("context_length_exceeded") ||
    errStr.includes("request too large") ||
    errStr.includes("reduce the length") ||
    errStr.includes("too many tokens") ||
    errStr.includes("failed_generation") ||
    errStr.includes("logDebug is not defined"); // Defensive: catch this specific error

  // Only log if logDebug is actually defined (defensive)
  if (typeof logDebug === "function") {
    if (
      isRetryable &&
      (errStr.includes("codebuff") || errStr.includes("credits") || errStr.includes("payment"))
    ) {
      logDebug(`💳 Detected retryable credit/payment error: ${errStr.slice(0, 150)}`);
    }

    // Log connection errors for debugging
    if (
      isRetryable &&
      (errStr.includes("econnrefused") ||
        errStr.includes("econnreset") ||
        errStr.includes("aborted") ||
        errStr.includes("socket"))
    ) {
      logDebug(`🔌 Detected retryable connection error: ${errStr.slice(0, 150)}`);
    }
  }

  return isRetryable;
}
