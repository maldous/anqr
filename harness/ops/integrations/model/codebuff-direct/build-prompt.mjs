// Generated from ../../../../scripts/ops/integrations/model/codebuff-direct.mjs:172

export function buildPrompt(messages) {
  return (messages || [])
    .map((message) => {
      const role = String(message?.role || "user").toUpperCase();
      const content =
        typeof message?.content === "string" ? message.content : JSON.stringify(message?.content);
      return `${role}:\n${content}`;
    })
    .join("\n\n");
}
