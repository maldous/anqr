import { sanitizeText } from "./sanitize-text.mjs";

export function summarizeResponseBody(body) {
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
