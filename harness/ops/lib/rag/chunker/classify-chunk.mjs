// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:177

import { CODE_EXTENSIONS } from "./code-extensions.mjs";
import { MARKDOWN_EXTENSIONS } from "./markdown-extensions.mjs";
import { MD_HEADING_PATTERN } from "./md-heading-pattern.mjs";

export function classifyChunk(content, ext) {
  const trimmed = content.trimStart();
  const firstLine = trimmed.split("\n", 1)[0] || "";

  if (MARKDOWN_EXTENSIONS.has(ext)) {
    return MD_HEADING_PATTERN.test(firstLine) ? "section" : "paragraph";
  }

  if (CODE_EXTENSIONS.has(ext)) {
    if (/\bclass\s+[A-Za-z_$][\w$]*/.test(firstLine)) return "class";
    if (/\bfunction\s+[A-Za-z_$][\w$]*/.test(firstLine)) return "function";
    if (/^(?:export\s+)?(?:const|let|var)\s+/.test(firstLine)) return "function";
    if (/^\s*\/\*\*/.test(firstLine)) return "function";
    return "block";
  }

  return "block";
}
