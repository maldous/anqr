import { addPart } from "./add-part.mjs";
import { renderCodeSnippet } from "./render-code-snippet.mjs";

export function collectDocumentation(value, parts) {
  if (!value) return;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return;

    try {
      collectDocumentation(JSON.parse(trimmed), parts);
      return;
    } catch {
      addPart(parts, trimmed);
      return;
    }
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectDocumentation(item, parts);
    }
    return;
  }

  if (typeof value !== "object") {
    return;
  }

  if (Array.isArray(value.content)) {
    const textBlocks = value.content
      .filter((block) => block && block.type === "text" && block.text)
      .map((block) => block.text);
    if (textBlocks.length > 0) {
      addPart(parts, textBlocks.join("\n\n"));
    }
  }

  for (const key of ["documentation", "markdown", "content", "text", "snippet", "description"]) {
    if (typeof value[key] === "string") {
      addPart(parts, value[key]);
    }
  }

  if (Array.isArray(value.results)) {
    for (const result of value.results) {
      const resultParts = [];
      addPart(resultParts, result?.title ? `## ${result.title}` : "");
      addPart(resultParts, result?.description);
      if (result?.codeExample) {
        resultParts.push(`\`\`\`\n${result.codeExample}\n\`\`\``);
      }
      addPart(resultParts, result?.snippet);
      addPart(resultParts, result?.sourceUrl ? `Source: ${result.sourceUrl}` : "");
      addPart(parts, resultParts.join("\n\n"));
    }
  }

  if (Array.isArray(value.infoSnippets)) {
    for (const snippet of value.infoSnippets) {
      addPart(parts, snippet?.content || snippet?.text || snippet?.description);
    }
  }

  if (Array.isArray(value.codeSnippets)) {
    for (const snippet of value.codeSnippets) {
      addPart(parts, renderCodeSnippet(snippet));
    }
  }

  for (const nested of Object.values(value)) {
    if (nested !== value.content && nested !== value.results) {
      collectDocumentation(nested, parts);
    }
  }
}
