import { extractObjectProperties } from "./extract-object-properties";
import { safeJsonReplacer } from "./safe-json-replacer";

export function safeSerializeContext(context: unknown): unknown {
  if (context === null || context === undefined) {
    return context;
  }

  try {
    return structuredClone(context);
  } catch {}

  try {
    const jsonStr = JSON.stringify(context, safeJsonReplacer);
    return JSON.parse(jsonStr);
  } catch {}

  if (typeof context === "object") {
    return extractObjectProperties(context as Record<string, unknown>);
  }

  return "[Unserializable]";
}
