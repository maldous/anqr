// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:272

export function isToolHallucinationError(errStr) {
  return (
    errStr.includes("unknown tool") ||
    errStr.includes("tool not found") ||
    errStr.includes("invalid tool") ||
    errStr.includes("no such tool") ||
    errStr.includes("tool does not exist") ||
    errStr.includes("unrecognized tool")
  );
}
