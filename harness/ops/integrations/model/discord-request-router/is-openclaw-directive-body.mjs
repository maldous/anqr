const OPENCLAW_DIRECTIVE_RE =
  /Pre-compaction memory flush|Store durable memories only in memory\//i;

export function isOpenClawDirectiveBody(rawBody) {
  try {
    const body = JSON.parse(rawBody || "{}");
    const messages = body.messages || [];
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    function getMessageText(msg) {
      if (typeof msg?.content === "string") return msg.content;
      if (Array.isArray(msg?.content)) {
        return msg.content
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join(" ");
      }
      return "";
    }
    const text = getMessageText(lastUserMsg);
    return OPENCLAW_DIRECTIVE_RE.test(text);
  } catch {
    return false;
  }
}
