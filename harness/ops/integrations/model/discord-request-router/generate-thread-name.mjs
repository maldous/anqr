export function generateThreadName(messages) {
  if (!Array.isArray(messages)) return null;
  // Find the last user message
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg?.role === "user") {
      function getMessageContent(msg) {
        if (typeof msg?.content === "string") return msg.content;
        if (Array.isArray(msg?.content)) {
          return msg.content
            .filter((p) => p?.type === "text")
            .map((p) => p.text)
            .join(" ");
        }
        return null;
      }
      const content = getMessageContent(msg);
      if (content && content.trim()) {
        const preview = content.trim().slice(0, 80).replaceAll("\n", " ");
        return `🔧 ${preview}`;
      }
    }
  }
  return null;
}
