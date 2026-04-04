// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:555

export function classifyProviderFailure(message = "") {
  const msg = String(message || "");
  // All retryable errors are now handled by the bridge - the bridge tries ALL providers
  // No special classification needed here - just pass through to provider handling
  if (msg.includes("LOCAL_BUSY") || msg.includes("local_busy")) return "local_busy";
  if (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("insufficient_quota") ||
    msg.includes("rate_limit") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("accounts exhausted") ||
    msg.includes("All codebuff")
  )
    return "quota";
  if (msg.includes("LLM call failed") || msg.includes("No choices")) return "provider";
  return "other";
}
