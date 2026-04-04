// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:173

export function getResponseHeaders(err) {
  if (err?.responseHeaders) return err.responseHeaders;
  let current = err;
  const seen = new Set();
  while (current?.cause && !seen.has(current.cause)) {
    seen.add(current.cause);
    current = current.cause;
    if (current?.responseHeaders) return current.responseHeaders;
  }
  return null;
}
