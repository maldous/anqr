import { Codex } from "@openai/codex-sdk";

import { CODEX_SANDBOX_MODE } from "./codex-sandbox-mode.mjs";
import { normalizeRequestCwd } from "./normalize-request-cwd.mjs";

export async function invokeWithCodex(provider, messages, options = {}) {
  const { stream = false, onChunk } = options;
  const codex = new Codex({
    env: process.env,
  });
  const thread = codex.startThread({
    model: provider.model || undefined,
    workingDirectory: normalizeRequestCwd(options.cwd),
    sandboxMode: CODEX_SANDBOX_MODE,
    approvalPolicy: "never",
    webSearchEnabled: false,
    networkAccessEnabled: true,
  });

  const prompt = messages
    .map((message) => {
      const role = (message.role || "user").toUpperCase();
      const content =
        typeof message.content === "string" ? message.content : JSON.stringify(message.content);
      return `${role}:\n${content}`;
    })
    .join("\n\n");

  if (stream) {
    const streamed = await thread.runStreamed(prompt);
    let fullText = "";
    let usage = null;
    const emittedByItem = new Map();

    for await (const event of streamed.events) {
      if ((event.type === "item.updated" || event.type === "item.completed") && event.item) {
        if (event.item.type === "agent_message" && event.item.id) {
          const prior = emittedByItem.get(event.item.id) || "";
          const next = event.item.text || "";
          const delta = next.startsWith(prior) ? next.slice(prior.length) : next;
          emittedByItem.set(event.item.id, next);
          if (delta && onChunk) {
            onChunk({ type: "text", text: delta });
          }
          fullText = next;
        }
      } else if (event.type === "turn.completed") {
        usage = event.usage;
      }
    }

    return {
      text: fullText,
      providerName: provider.name,
      usage: usage
        ? {
            promptTokens: usage.input_tokens + usage.cached_input_tokens,
            completionTokens: usage.output_tokens,
          }
        : undefined,
    };
  }

  const result = await thread.run(prompt);
  return {
    text: result.finalResponse || "",
    providerName: provider.name,
    usage: result.usage
      ? {
          promptTokens: result.usage.input_tokens + result.usage.cached_input_tokens,
          completionTokens: result.usage.output_tokens,
        }
      : undefined,
  };
}
