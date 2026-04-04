import { addPart } from "./add-part.mjs";

export function renderCodeSnippet(snippet) {
  const parts = [];
  addPart(parts, snippet?.codeTitle || snippet?.title);

  const codeList = Array.isArray(snippet?.codeList) ? snippet.codeList : [];
  for (const item of codeList) {
    if (item?.code) {
      parts.push(`\`\`\`\n${item.code}\n\`\`\``);
    }
  }

  if (snippet?.codeExample) {
    parts.push(`\`\`\`\n${snippet.codeExample}\n\`\`\``);
  }

  if (snippet?.snippet) {
    addPart(parts, snippet.snippet);
  }

  return parts.join("\n\n").trim();
}
