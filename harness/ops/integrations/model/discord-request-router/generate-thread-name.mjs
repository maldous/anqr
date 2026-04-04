export function generateThreadName(messages) {
  if (!Array.isArray(messages)) return null;
  // Find the last user message
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg?.role === "user") {
      const content =
        typeof msg.content === "string"
          ? msg.content
          : Array.isArray(msg.content)
            ? msg.content
                .filter((p) => p?.type === "text")
                .map((p) => p.text)
                .join(" ")
            : null;
      if (content && content.trim()) {
        const preview = content.trim().slice(0, 80).replace(/\n/g, " ");
        return `🔧 ${preview}`;
      }
    }
  }
  return null;
}
