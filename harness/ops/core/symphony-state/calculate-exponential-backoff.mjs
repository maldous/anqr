// Generated from ../../../scripts/ops/core/symphony-state.mjs:307

export function calculateExponentialBackoff(
  retryCount,
  baseMs = 10 * 60 * 1000,
  maxMs = 60 * 60 * 1000,
) {
  // Exponential: base * 2^retryCount, capped at maxMs
  const exponential = Math.min(baseMs * Math.pow(2, retryCount), maxMs);
  // Add random jitter (±20%) to prevent thundering herd
  const jitter = exponential * (0.8 + Math.random() * 0.4);
  return Math.floor(jitter);
}
