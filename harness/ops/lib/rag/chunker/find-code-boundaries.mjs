import { CODE_BOUNDARY_PATTERNS } from "./code-boundary-patterns.mjs";
import { includeDecoratorsAndJSDoc } from "./include-decorators-and-jsdoc.mjs";

export function findCodeBoundaries(lines) {
  const boundaries = new Set([0]);

  for (let i = 1; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();
    if (!trimmed) continue;

    if (CODE_BOUNDARY_PATTERNS.some((pattern) => pattern.test(trimmed))) {
      boundaries.add(includeDecoratorsAndJSDoc(lines, i));
    }
  }

  return Array.from(boundaries).sort((a, b) => a - b);
}
