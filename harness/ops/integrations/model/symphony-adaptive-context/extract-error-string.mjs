function sanitizeText(value) {
  return String(value || "")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function summarizeResponseBody(body) {
  if (!body) return "";
  if (typeof body === "string") {
    return sanitizeText(body).slice(0, 160);
  }
  if (typeof body === "object") {
    const message =
      body.message || body.error?.message || body.error || body.detail || body.reason;
    if (message) return sanitizeText(message).slice(0, 160);
    return `[responsebody:${Object.keys(body).slice(0, 8).join(",")}]`;
  }
  return sanitizeText(body).slice(0, 160);
}

export function extractErrorString(err) {
  const parts = [];
  if (typeof err === "string") {
    parts.push(err);
  } else if (err && typeof err === "object") {
    if (err.message) parts.push(err.message);
    if (err.code) parts.push(`code=${err.code}`);
    if (err.statusCode || err.status) parts.push(`status=${err.statusCode || err.status}`);
    const body = summarizeResponseBody(err.responseBody);
    if (body) parts.push(body);
  }
  let current = err;
  const seen = new Set();
  while (current?.cause && !seen.has(current.cause)) {
    seen.add(current.cause);
    current = current.cause;
    if (typeof current === "string") parts.push(current);
    else if (current?.message) parts.push(current.message);
    if (current?.code) parts.push(`code=${current.code}`);
    if (current?.statusCode || current?.status) {
      parts.push(`status=${current.statusCode || current.status}`);
    }
    const body = summarizeResponseBody(current?.responseBody);
    if (body) parts.push(body);
  }
  return sanitizeText(parts.join(" | ")).toLowerCase();
}
