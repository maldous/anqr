import { invokeCodebuffDirectStream } from "../codebuff-direct.mjs";

import { getCurrentRequestCwd } from "./get-current-request-cwd.mjs";

export async function invokeCodebuffDirectStreamToSSE(
  messages,
  res,
  onDiscordChunk = null,
  cwd = null,
) {
  const completionId = `chatcmpl-symphony-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);
  let fullText = "";

  const result = await invokeCodebuffDirectStream({
    messages,
    cwd: cwd || getCurrentRequestCwd(),
    onTextChunk: (text) => {
      fullText += text;
      if (onDiscordChunk) {
        const trimmed = text.trim();
        const isLightbulb = trimmed === "💡" || text === "\n💡 ";
        if (!isLightbulb) {
          onDiscordChunk(text);
        }
      }
      const chunk = {
        id: completionId,
        object: "chat.completion.chunk",
        created,
        model: "codebuff/base",
        choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
      };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    },
  });

  const finalChunk = {
    id: completionId,
    object: "chat.completion.chunk",
    created,
    model: "codebuff/base",
    choices: [
      {
        index: 0,
        delta: {},
        finish_reason: result.finishReason || (result.needsContinuation ? "length" : "stop"),
      },
    ],
    _symphonyResult: result._symphonyResult,
  };
  res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
  res.write("data: [DONE]\n\n");

  return {
    text: result.text || fullText,
    providerName: "codebuff",
    finishReason: result.finishReason || (result.needsContinuation ? "length" : "stop"),
    _symphonyResult: result._symphonyResult,
    mode: result.mode,
  };
}
