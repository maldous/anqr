import { normalizeName } from "./normalize-name.mjs";

export function pickTool(tools, preferredNames, fallbackPattern) {
  for (const preferredName of preferredNames) {
    const match = tools.find((tool) => normalizeName(tool.name) === normalizeName(preferredName));
    if (match) return match;
  }
  return tools.find((tool) => fallbackPattern.test(normalizeName(tool.name))) || null;
}
