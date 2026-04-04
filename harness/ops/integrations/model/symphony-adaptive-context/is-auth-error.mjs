// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:244

export function isAuthError(errStr) {
  return (
    errStr.includes("unauthorized") ||
    errStr.includes("invalid api key") ||
    errStr.includes("invalid_api_key") ||
    errStr.includes("authentication") ||
    errStr.includes("forbidden")
  );
}
