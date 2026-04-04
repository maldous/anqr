// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:316

import { DECORATOR_PATTERN } from "./decorator-pattern.mjs";
import { JSDOC_START_PATTERN } from "./jsdoc-start-pattern.mjs";

export function includeDecoratorsAndJSDoc(lines, lineIndex) {
  let start = lineIndex;

  while (start > 0 && DECORATOR_PATTERN.test(lines[start - 1].trimStart())) {
    start -= 1;
  }

  if (start > 0 && lines[start - 1].trim() === "*/") {
    for (let i = start - 1; i >= 0; i--) {
      if (JSDOC_START_PATTERN.test(lines[i])) {
        start = i;
        break;
      }
      if (!lines[i].trim()) break;
    }
  } else if (start > 0 && JSDOC_START_PATTERN.test(lines[start - 1])) {
    start -= 1;
  }

  return start;
}
