import { maxDepthRedaction } from "./max-depth-redaction";
import { REDACTED } from "./redacted.const";
import { SENSITIVE_KEYS } from "./sensitive-keys.const";

export function redactSensitive(obj: unknown, depth = 0): unknown {
  const maxDepth = maxDepthRedaction(depth);
  if (maxDepth !== null) return maxDepth;
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitive(item, depth + 1));
  }

  if (obj instanceof Error) return obj;
  if (obj instanceof Set || obj instanceof Map) return obj;
  if (typeof Node !== "undefined" && obj instanceof Node) return obj;
  if (ArrayBuffer.isView(obj)) return obj;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEYS.has(key.toLowerCase())
      ? REDACTED
      : redactSensitive(value, depth + 1);
  }
  return result;
}
