// Generated from ../../../../scripts/ops/runtime/mcp/context7-server.mjs:563

export function extractLibraryId(result) {
  if (!result) return null;

  // MCP tools/call returns { content: [{ type: "text", text: "..." }] }
  if (Array.isArray(result.content)) {
    for (const block of result.content) {
      if (block.type === "text" && block.text) {
        // The text may be a JSON string containing the library ID
        try {
          const parsed = JSON.parse(block.text);
          if (parsed?.libraryId) return parsed.libraryId;
          if (parsed?.context7CompatibleLibraryID) return parsed.context7CompatibleLibraryID;
          // Sometimes the ID is returned as a plain string
          if (typeof parsed === "string") return parsed;
        } catch {
          // Not JSON — parse plain text response
          // Format: "Context7-compatible library ID: /org/project"
          const match = block.text.match(/Context7-compatible library ID:\s*(\/[^\s]+)/);
          if (match && match[1]) {
            return match[1].trim();
          }
          // Fallback: if the text starts with /, assume it's the ID
          if (block.text.trim().startsWith("/")) return block.text.trim();
        }
      }
    }
  }

  // Direct fields
  if (result.libraryId) return result.libraryId;
  if (result.context7CompatibleLibraryID) return result.context7CompatibleLibraryID;

  return null;
}
