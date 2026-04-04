// Generated from ../../../../scripts/ops/integrations/model/codebuff-direct.mjs:110

export function isPaymentRequiredError(errStr) {
  const s = String(errStr || "").toLowerCase();
  return (
    s.includes("402") ||
    s.includes("payment required") ||
    s.includes("out of credits") ||
    s.includes("add credits") ||
    s.includes("insufficient credits")
  );
}
