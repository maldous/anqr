function addPart(parts, value) {
  const text = String(value || "").trim();
  if (text) parts.push(text);
}

function renderCodeBlock(value) {
  const text = String(value || "").trim();
  return text ? `\`\`\`\n${text}\n\`\`\`` : "";
}

export function formatCloudContext(data) {
  const parts = [];

  if (Array.isArray(data?.results)) {
    for (const result of data.results) {
      const resultParts = [];
      addPart(resultParts, result?.title ? `## ${result.title}` : "");
      addPart(resultParts, result?.description);
      addPart(resultParts, renderCodeBlock(result?.codeExample));
      addPart(resultParts, result?.snippet);
      addPart(resultParts, result?.sourceUrl ? `Source: ${result.sourceUrl}` : "");
      addPart(parts, resultParts.join("\n\n"));
    }
  }

  if (Array.isArray(data?.infoSnippets)) {
    for (const snippet of data.infoSnippets) {
      addPart(parts, snippet?.content || snippet?.text || snippet?.description);
    }
  }

  if (Array.isArray(data?.codeSnippets)) {
    for (const snippet of data.codeSnippets) {
      const snippetParts = [];
      addPart(snippetParts, snippet?.codeTitle || snippet?.title);
      if (Array.isArray(snippet?.codeList)) {
        for (const entry of snippet.codeList) {
          addPart(snippetParts, renderCodeBlock(entry?.code));
        }
      } else {
        addPart(snippetParts, renderCodeBlock(snippet?.code));
      }
      addPart(parts, snippetParts.join("\n\n"));
    }
  }

  for (const key of ["documentation", "content", "markdown", "text"]) {
    if (typeof data?.[key] === "string") {
      addPart(parts, data[key]);
    }
  }

  const deduped = [];
  const seen = new Set();
  for (const part of parts) {
    const key = part.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(key);
  }

  return deduped.length > 0 ? deduped.join("\n\n") : null;
}
