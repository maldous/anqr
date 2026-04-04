import { inferSymphonyResultFromCompletion } from "../../../core/bridge-result.mjs";

import { maybeFlushLogBuffer } from "./maybe-flush-log-buffer.mjs";

export function processSSELine(line, state, onDiscordChunk) {
  const dataMatch = line.match(/^data: (.+)$/);
  if (!dataMatch) {
    return line;
  }

  if (dataMatch[1] === "[DONE]") {
    state.sawDone = true;
    return line;
  }

  try {
    const parsed = JSON.parse(dataMatch[1]);
    const choice = parsed.choices?.[0];
    const content = choice?.delta?.content;
    if (content && content.length > 0) {
      state.fullText += content;
      state.logBuffer += content; // Stream content to Discord (filter out standalone light bulb emoji)
      if (onDiscordChunk) {
        const trimmed = content.trim();
        const isLightbulb = trimmed === "💡" || content === "\n💡 ";
        if (!isLightbulb) {
          onDiscordChunk(content);
        }
      }

      maybeFlushLogBuffer(state);
    }

    const finishReason = choice?.finish_reason;
    if (finishReason) {
      state.finishReason = finishReason;
    }

    if (parsed._symphonyResult) {
      state.symphonyResult = parsed._symphonyResult;
    } else if (finishReason) {
      const inferred = inferSymphonyResultFromCompletion({
        finishReason,
        text: state.fullText,
      });
      if (inferred) {
        state.symphonyResult = inferred;
        parsed._symphonyResult = inferred;
        return `data: ${JSON.stringify(parsed)}`;
      }
    }
  } catch {
    // Parse error - ignore and forward the original line.
  }

  return line;
}
