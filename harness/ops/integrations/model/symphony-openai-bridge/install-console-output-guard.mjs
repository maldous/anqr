import { inspect } from "node:util";

const CONSOLE_GUARD_KEY = Symbol.for("anqr.symphony-openai-bridge.console-guard");
const MAX_ITEMS = 8;
const MAX_STRING = 240;

function trimString(value, limit = MAX_STRING) {
  const text = String(value || "");
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

function summarize(value, depth = 0, seen = new WeakSet()) {
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
      responseBody:
        typeof value.responseBody === "string"
          ? trimString(value.responseBody, 300)
          : value.responseBody && typeof value.responseBody === "object"
            ? { keys: Object.keys(value.responseBody).slice(0, MAX_ITEMS) }
            : undefined,
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

export function installConsoleOutputGuard() {

  function formatArgs(args) {
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
        responseBody:
          typeof value.responseBody === "string"
            ? trimString(value.responseBody, 300)
            : value.responseBody && typeof value.responseBody === "object"
              ? { keys: Object.keys(value.responseBody).slice(0, MAX_ITEMS) }
              : undefined,
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

  function formatArgs(args) {
    return args
      .map((arg) => {
        if (typeof arg === "string") return arg;
        return inspect(summarize(arg), {
          depth: 3,
          breakLength: 140,
          maxArrayLength: MAX_ITEMS,
          maxStringLength: MAX_STRING,
          colors: false,
          compact: true,
        });
      })
      .join(" ");
  }

  if (globalThis[CONSOLE_GUARD_KEY]) return;
  globalThis[CONSOLE_GUARD_KEY] = true;

  for (const methodName of ["error", "warn"]) {
    const original = console[methodName].bind(console);
    console[methodName] = (...args) => original(formatArgs(args));
  }
}
