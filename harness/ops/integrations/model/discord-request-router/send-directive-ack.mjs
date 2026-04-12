import { logInfo } from "./logger.mjs";

export function sendDirectiveAck(res, rawBody) {
  const ackText =
    "[Symphony] Memory directive acknowledged \u2014 handled internally at router level.";

  let isStream = false;
  try {
    const body = JSON.parse(rawBody || "{}");
    isStream = body.stream === true;
  } catch {
    /* best-effort */
  }

  if (isStream) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    const ssePayload = {
      id: `chatcmpl-directive-${Date.now()}`,
      object: "chat.completion.chunk",
      created: Math.floor(Date.now() / 1000),
      model: "symphony-router",
      choices: [{ index: 0, delta: { content: ackText }, finish_reason: "stop" }],
    };
    res.write(`data: ${JSON.stringify(ssePayload)}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        id: `chatcmpl-directive-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "symphony-router",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: ackText },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      }),
    );
  }

  logInfo("\uD83D\uDD07 Sent synthetic directive ack from router (no worktree consumed)");
}
