// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:254

export function isTimeoutError(errStr) {
  return (
    errStr.includes("timeout") ||
    errStr.includes("timed out") ||
    errStr.includes("etimedout") ||
    errStr.includes("econnaborted")
  );
}
