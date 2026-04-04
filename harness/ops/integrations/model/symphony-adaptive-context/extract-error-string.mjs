export function extractErrorString(err) {
  const parts = [];
  if (typeof err === "string") {
    parts.push(err);
  } else if (err && typeof err === "object") {
    if (err.message) parts.push(err.message);
    if (err.responseBody) parts.push(String(err.responseBody));
  }
  let current = err;
  const seen = new Set();
  while (current?.cause && !seen.has(current.cause)) {
    seen.add(current.cause);
    current = current.cause;
    if (typeof current === "string") parts.push(current);
    else if (current?.message) parts.push(current.message);
    if (current?.responseBody) parts.push(String(current.responseBody));
  }
  return parts.join(" | ").toLowerCase();
}
