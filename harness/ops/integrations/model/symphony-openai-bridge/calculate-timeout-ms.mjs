// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:436

export function calculateTimeoutMs(seconds) {
  // Convert timeout from seconds to milliseconds
  const DEFAULT_SECONDS = 30;
  if (seconds === -1) return undefined; // no timeout
  if (seconds == null) return DEFAULT_SECONDS * 1000;
  return seconds * 1000;
}
