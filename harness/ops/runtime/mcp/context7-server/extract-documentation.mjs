function addPart(parts, value) {
  const text = String(value || "").trim();
  if (text) parts.push(text);
}

function renderCodeSnippet(snippet) {
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

function collectDocumentation(value, parts) {
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

export function extractDocumentation(result) {
  if (!result) return null;

  const parts = [];
  collectDocumentation(result, parts);

  const seen = new Set();
  const deduped = [];
  for (const part of parts) {
    const key = part.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(key);
  }

  return deduped.length > 0 ? deduped.join("\n\n") : null;
}
