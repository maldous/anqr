export function extractDocumentation(result) {
  if (!result) return null;

  // MCP tools/call returns { content: [{ type: "text", text: "..." }] }
  if (Array.isArray(result.content)) {
    const texts = result.content
      .filter((block) => block.type === "text" && block.text)
      .map((block) => block.text);
    if (texts.length > 0) return texts.join("\n\n");
  }

  // Direct fields
  if (result.documentation) return result.documentation;
  if (result.content && typeof result.content === "string") return result.content;

  return null;
}
