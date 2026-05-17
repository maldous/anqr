import { trimString } from "./trim-string.mjs";
import { getResponseBodySummary } from "./get-response-body-summary.mjs";

const MAX_ITEMS = 8;

export function summarize(value, depth = 0, seen = new WeakSet()) {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return trimString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "function" || typeof value === "symbol") return `[${typeof value}]`;
  if (value instanceof Error) {
    return {
      name: value.name,
      message: trimString(value.message, 300),
      statusCode: value.statusCode || value.status || null,
      requestBodyValues: value.requestBodyValues
        ? { keys: Object.keys(value.requestBodyValues).slice(0, MAX_ITEMS) }
        : undefined,
      responseHeaders: value.responseHeaders
        ? Object.keys(value.responseHeaders).slice(0, MAX_ITEMS)
        : undefined,
      responseBody: getResponseBodySummary(value.responseBody),
      isRetryable: value.isRetryable,
    };
  }
  if (Array.isArray(value)) {
    return value.slice(0, MAX_ITEMS).map((item) => summarize(item, depth + 1, seen));
  }
  if (typeof value === "object") {
    if (seen.has(value)) return "[circular]";
    seen.add(value);
    if (depth >= 2) return `[object keys: ${Object.keys(value).slice(0, MAX_ITEMS).join(",")}]`;
    const entries = Object.entries(value).slice(0, MAX_ITEMS);
    return Object.fromEntries(
      entries.map(([key, item]) => [key, summarize(item, depth + 1, seen)]),
    );
  }
  return trimString(value);
}
