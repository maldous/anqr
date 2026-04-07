const OPENCLAW_DIRECTIVE_RE =
  /Pre-compaction memory flush|Store durable memories only in memory\//i;

export function isOpenClawDirectiveBody(rawBody) {
  try {
    const body = JSON.parse(rawBody || "{}");
    const messages = body.messages || [];
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const text =
      typeof lastUserMsg?.content === "string"
        ? lastUserMsg.content
        : Array.isArray(lastUserMsg?.content)
          ? lastUserMsg.content
              .filter((p) => p.type === "text")
              .map((p) => p.text)
              .join(" ")
          : "";
    return OPENCLAW_DIRECTIVE_RE.test(text);
  } catch {
    return false;
  }
}
