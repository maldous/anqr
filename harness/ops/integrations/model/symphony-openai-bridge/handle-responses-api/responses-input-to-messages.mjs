import { generateId } from "./helpers.mjs";
import { extractTextContent } from "./extract-text-content.mjs";

export function responsesInputToMessages(input, instructions) {
  const messages = [];

  // instructions → system message
  if (typeof instructions === "string" && instructions.trim()) {
    messages.push({ role: "system", content: instructions });
  }

  // Simple string input
  if (typeof input === "string") {
    messages.push({ role: "user", content: input });
    return messages;
  }

  if (!Array.isArray(input)) {
    messages.push({ role: "user", content: String(input || "") });
    return messages;
  }

  // Process array of conversation items
  for (const item of input) {
    if (typeof item === "string") {
      messages.push({ role: "user", content: item });
      continue;
    }
    if (!item || typeof item !== "object") continue;

    const itemType = item.type;

    // ── function_call: attach as tool_call on the last assistant message ──
    if (itemType === "function_call") {
      const toolCall = {
        id: item.call_id || item.id || generateId("call"),
        type: "function",
        function: {
          name: item.name || "unknown",
          arguments:
            typeof item.arguments === "string"
              ? item.arguments
              : JSON.stringify(item.arguments || {}),
        },
      };

      // Find or create the assistant message to attach this tool_call to
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === "assistant") {
        if (!lastMsg.tool_calls) lastMsg.tool_calls = [];
        lastMsg.tool_calls.push(toolCall);
      } else {
        // No preceding assistant message — create a synthetic one
        messages.push({
          role: "assistant",
          content: null,
          tool_calls: [toolCall],
        });
      }
      continue;
    }

    // ── function_call_output: convert to tool message ──
    if (itemType === "function_call_output") {
      const output =
        typeof item.output === "string" ? item.output : JSON.stringify(item.output || "");
      messages.push({
        role: "tool",
        tool_call_id: item.call_id || item.id || "",
        content: output,
      });
      continue;
    }

    // ── message item (type: "message" or implicit) ──
    const rawRole = item.role || "user";
    const role = rawRole === "developer" ? "system" : rawRole;
    const content = extractTextContent(item.content);
    messages.push({ role, content });
  }

  return messages;
}
