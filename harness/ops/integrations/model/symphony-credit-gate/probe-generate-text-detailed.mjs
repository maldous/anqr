import { generateText } from "ai";

import { createProviderModel } from "../symphony-openai-bridge/create-provider-model.mjs";

import { classifyProviderProbeError } from "./classify-provider-probe-error.mjs";
import { providerProbeStage } from "./provider-probe-stage.mjs";
import { providerProbeTruncate } from "./provider-probe-truncate.mjs";

export async function probeGenerateTextDetailed(provider, apiKey) {
  const startedAt = Date.now();
  const stages = [];
  try {
    stages.push(providerProbeStage("invoke_started", { model: provider.model }));
    const model = createProviderModel({ ...provider, apiKey });
    const result = await generateText({
      model,
      messages: [{ role: "user", content: "Reply with exactly: ok" }],
      maxTokens: 16,
      maxSteps: 1,
    });
    const text = providerProbeTruncate(result?.text || result?.content?.[0]?.text || "");
    stages.push(providerProbeStage("invoke_completed", { textLength: text.length }));
    return {
      available: Boolean(text.trim()),
      status: text.trim() ? "success" : "unavailable",
      reason: text.trim()
        ? "provider invocation succeeded"
        : "provider invocation returned empty text",
      durationMs: Date.now() - startedAt,
      message: text,
      stages,
    };
  } catch (error) {
    const message = error?.message || String(error);
    const classified = classifyProviderProbeError(message);
    stages.push(
      providerProbeStage("invoke_failed", {
        status: classified.status,
        message: providerProbeTruncate(message),
      }),
    );
    return {
      available: false,
      status: classified.status,
      reason: classified.reason,
      durationMs: Date.now() - startedAt,
      message: providerProbeTruncate(message),
      stages,
    };
  }
}
