import { sanitizeText } from "./error-to-string/sanitize-text.mjs";
import { summarizeResponseBody } from "./error-to-string/summarize-response-body.mjs";

export function errorToString(err) {
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
