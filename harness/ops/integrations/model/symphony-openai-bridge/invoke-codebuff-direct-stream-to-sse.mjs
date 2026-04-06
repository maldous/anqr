import { invokeCodebuffDirectStream } from "../codebuff-direct.mjs";

import { getCurrentRequestCwd } from "./get-current-request-cwd.mjs";

export async function invokeCodebuffDirectStreamToSSE(
  messages,
  res,
  onDiscordChunk = null,
  cwd = null,
  provider = null,
) {
  const completionId = `chatcmpl-symphony-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);
  const selectedProvider = provider || {};
  const providerName = selectedProvider.name || "codebuff-paid";
  const model = selectedProvider.model || "codebuff/base";
  const costMode = selectedProvider.costMode === "free" ? "free" : undefined;
  let fullText = "";

  const result = await invokeCodebuffDirectStream({
    messages,
    cwd: cwd || getCurrentRequestCwd(),
    costMode,
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
        model,
        choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
      };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    },
  });

  const finalChunk = {
    id: completionId,
    object: "chat.completion.chunk",
    created,
    model,
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
    providerName,
    model,
    finishReason: result.finishReason || (result.needsContinuation ? "length" : "stop"),
    _symphonyResult: result._symphonyResult,
    mode: result.mode || selectedProvider.sessionMode || (costMode ? "free" : "paid"),
  };
}
