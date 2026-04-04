export function extractFromValue(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    const directTools = value.filter(
      (item) => item && typeof item === "object" && typeof item.name === "string",
    );
    if (directTools.length > 0) return directTools;

    for (const item of value) {
      const nested = extractFromValue(item);
      if (nested.length > 0) return nested;
    }
    return [];
  }

  if (typeof value === "object") {
    if (Array.isArray(value.tools)) {
      return extractFromValue(value.tools);
    }

    for (const nested of Object.values(value)) {
      const tools = extractFromValue(nested);
      if (tools.length > 0) return tools;
    }
  }

  return [];
}
