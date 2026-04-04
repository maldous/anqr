// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:5111

import { flushDiscordStream } from "../../notifications/openclaw-discord.mjs";

import { processSSELine } from "./process-sseline.mjs";
import { logDebug } from "./logger.mjs";

export async function _handleProxyEnd(res, state, resolve) {
  if (state.partialBuffer.length > 0) {
    const transformed = processSSELine(state.partialBuffer, state, null);
    if (transformed !== null) {
      res.write(`${transformed}\n`);
    }
    state.partialBuffer = "";
  }

  // Log any remaining buffered text
  if (state.logBuffer.trim().length > 0) {
    logDebug(`🌊 ${state.logBuffer.trim().slice(0, 200)}`);
  }

  // Flush any remaining Discord stream buffer
  await flushDiscordStream({ emoji: "" }).catch(() => {
    /* ignore */
  });

  if (!state.sawDone) {
    if (state.symphonyResult && state.finishReason) {
      const finalChunk = {
        id: `chatcmpl-symphony-${Date.now()}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: "codebuff/base",
        choices: [{ index: 0, delta: {}, finish_reason: state.finishReason }],
        _symphonyResult: state.symphonyResult,
      };
      res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
    }
    res.write("data: [DONE]\n\n");
  }

  logDebug(`🌊 Relay complete: ${state.fullText.length} chars`);
  resolve({
    text: state.fullText,
    providerName: "codebuff",
    finishReason: state.finishReason,
    _symphonyResult: state.symphonyResult,
  });
}
