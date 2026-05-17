import { truncateText } from "./truncate-text.mjs";
import { summarizeObjectKeys } from "./summarize-object-keys.mjs";

const MAX_LOG_STRING_LENGTH = 240;
const MAX_LOG_ARRAY_ITEMS = 8;
const MAX_LOG_OBJECT_KEYS = 20;
const MAX_LOG_DEPTH = 3;

export function sanitizeValue(value, key = "", depth = 0, seen = new WeakSet()) {
  if (value === null || value === undefined) return value;
  if (depth > MAX_LOG_DEPTH) return "[depth-limited]";

  if (typeof value === "string") {
    if (/^requestBodyValues$|^responseBody$|^body$|^stack$/i.test(key)) {
      return truncateText(value, 160);
    }
    return truncateText(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "function" || typeof value === "symbol") {
    return `[${typeof value}]`;
  }

  if (value instanceof Error) {
    let causeResult = null;
    if (value.cause && typeof value.cause === "object") {
      causeResult = sanitizeValue(value.cause, "cause", depth + 1, seen);
    } else if (value.cause) {
      causeResult = truncateText(value.cause, 120);
    }

    return {
      name: value.name,
      message: truncateText(value.message, 200),
      code: value.code || null,
      statusCode: value.statusCode || value.status || null,
      cause: causeResult,
    };
  }

  if (typeof value === "object" && value !== null) {
    if (seen.has(value)) return "[circular]";
    seen.add(value);

    // Key-specific summaries — checked before array/object discrimination
    if (key === "tools") {
      const sample = Array.isArray(value)
        ? value
            .slice(0, MAX_LOG_ARRAY_ITEMS)
            .map((item) => item?.name || item?.toolName || item?.type || "tool")
        : summarizeObjectKeys(value);
      return {
        count: Array.isArray(value) ? value.length : Object.keys(value).length,
        sample,
      };
    }

    if (/requestBodyValues|responseBody|body|raw/i.test(key)) {
      return {
        summary: summarizeObjectKeys(value),
        type: Array.isArray(value) ? "array" : "object",
      };
    }

    if (/headers/i.test(key)) {
      const entries = Object.entries(value).slice(0, MAX_LOG_OBJECT_KEYS);
      return Object.fromEntries(
        entries.map(([childKey, childValue]) => [childKey, truncateText(childValue, 80)]),
      );
    }

    // Arrays without special key handling
    if (Array.isArray(value)) {
      const prefix = value
        .slice(0, MAX_LOG_ARRAY_ITEMS)
        .map((item) => sanitizeValue(item, key, depth + 1, seen));
      if (value.length > MAX_LOG_ARRAY_ITEMS) {
        prefix.push(`[+${value.length - MAX_LOG_ARRAY_ITEMS} more]`);
      }
      return prefix;
    }

    // Generic object
    const entries = Object.entries(value).slice(0, MAX_LOG_OBJECT_KEYS);
    const sanitized = {};
    for (const [childKey, childValue] of entries) {
      sanitized[childKey] = sanitizeValue(childValue, childKey, depth + 1, seen);
    }
    const totalKeys = Object.keys(value).length;
    if (totalKeys > MAX_LOG_OBJECT_KEYS) {
      sanitized.__truncatedKeys = totalKeys - MAX_LOG_OBJECT_KEYS;
    }
    return sanitized;
  }

  return truncateText(value);
}
