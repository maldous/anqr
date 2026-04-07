export function errorToString(err) {
  function sanitizeText(value) {
    return String(value || "")
      .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
      .replace(
        /("?(?:authorization|api[_-]?key|token|password|secret|cookie|set-cookie)"?\s*[:=]\s*)[^,\s}]+/gi,
        "$1[redacted]",
      )
      .replace(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, "[email]")
      .replace(/\s+/g, " ")
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
      return `[responseBody keys: ${Object.keys(body).slice(0, 8).join(",")}]`;
    }
    return sanitizeText(body).slice(0, 160);
  }

  if (err instanceof Error) {
    const parts = [err.name || "Error", err.message || ""];
    if (err.code) parts.push(`code=${err.code}`);
    if (err.statusCode || err.status) parts.push(`status=${err.statusCode || err.status}`);
    const bodySummary = summarizeResponseBody(err.responseBody);
    if (bodySummary) parts.push(bodySummary);
    return sanitizeText(parts.filter(Boolean).join(": ")).slice(0, 300);
  }
  if (typeof err === "string") return sanitizeText(err).slice(0, 300);
  if (err && typeof err === "object") {
    const parts = [];
    if (err.type || err.name) parts.push(String(err.type || err.name));
    if (err.message) parts.push(String(err.message));
    if (err.code) parts.push(`code=${err.code}`);
    if (err.statusCode || err.status) parts.push(`status=${err.statusCode || err.status}`);
    const bodySummary = summarizeResponseBody(err.responseBody);
    if (bodySummary) parts.push(bodySummary);
    if (parts.length > 0) {
      return sanitizeText(parts.join(": ")).slice(0, 300);
    }
    return `[error object keys: ${Object.keys(err).slice(0, 8).join(",")}]`;
  }
  return sanitizeText(err).slice(0, 300);
}
