export function extractObjectProperties(obj: Record<string, unknown>): unknown {
  const result: Record<string, unknown> = {};
  try {
    for (const [key, value] of Object.entries(obj)) {
      try {
        if (value === null || value === undefined) {
          result[key] = value;
        } else if (typeof value === "function") {
          result[key] = "[Function]";
        } else if (typeof value === "object") {
          result[key] = structuredClone(value);
        } else {
          result[key] = value;
        }
      } catch {
        result[key] = `[Unserializable: ${typeof value}]`;
      }
    }
    return result;
  } catch {
    return "[Unserializable object]";
  }
}
