export function convertMessages(messages) {
  return messages.map((msg) => {
    // Map "developer" → "system" — Responses API / newer OpenAI models use
    // "developer" but the AI SDK ModelMessage schema only accepts "system".
    const role = msg.role === "developer" ? "system" : msg.role;
    const converted = { role };

    if (typeof msg.content === "string") {
      converted.content = msg.content;
    } else if (Array.isArray(msg.content)) {
      // Handle multi-part messages
      const parts = msg.content.map((part) => {
        if (part.type === "text") {
          return { type: "text", text: part.text };
        }
        // Handle other part types
        return part;
      });
      converted.content = parts;
    } else if (msg.content === null) {
      // Preserve explicit null content (e.g. assistant messages with tool_calls)
      converted.content = null;
    }

    // Preserve tool_calls on assistant messages (required by AI SDK for tool use)
    if (Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0) {
      converted.tool_calls = msg.tool_calls;
    }

    // Preserve tool_call_id on tool messages (required by AI SDK for tool responses)
    if (msg.tool_call_id) {
      converted.tool_call_id = msg.tool_call_id;
    }

    return converted;
  });
}
