// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:3635

export function unwrapAIError(err) {
  let current = err;
  let deepest = err;
  const seen = new Set();
  while (current?.cause && !seen.has(current.cause)) {
    seen.add(current.cause);
    current = current.cause;
    deepest = current;
  }
  return deepest;
}
