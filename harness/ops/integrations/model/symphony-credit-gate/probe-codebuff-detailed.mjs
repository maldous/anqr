import { getApiKey } from "../codebuff-direct/get-api-key.mjs";
import { normalizeCwd } from "../codebuff-direct/normalize-cwd.mjs";

import { classifyCodebuffProbeError } from "./classify-codebuff-probe-error.mjs";
import { createCodebuffProbeTimeout } from "./create-codebuff-probe-timeout.mjs";
import { providerProbeStage } from "./provider-probe-stage.mjs";
import { runCodebuffProbeMode } from "./run-codebuff-probe-mode.mjs";

export async function probeCodebuffDetailed(provider = {}, options = {}) {
  const apiKey = getApiKey();
  const startedAt = Date.now();
  const stages = [];
  const providerName = provider.name || "codebuff-paid";
  const model = provider.model || process.env.CODEBUFF_MODEL_ID || "codebuff/base";
  const progress = options.progress || null;
  const costMode = provider.costMode === "free" ? "free" : undefined;
  const mode = provider.costMode === "free" ? "free" : "paid";

  if (!apiKey) {
    stages.push(providerProbeStage("env_missing", { envVar: "CODEBUFF_API_KEY" }));
    return {
      providerName,
      model,
      available: false,
      status: "auth_missing",
      reason: "CODEBUFF_API_KEY is not set",
      durationMs: Date.now() - startedAt,
      stages,
      mode,
      message: "CODEBUFF_API_KEY is not set",
    };
  }

  const cwd = normalizeCwd(process.cwd());
  // Realistic probe: use a longer prompt that tests actual model capability,
  // not just connectivity. Short "ok" probes pass even under rate limits.
  const prompt =
    mode === "free"
      ? "Write a single JavaScript function called 'add' that takes two numbers and returns their sum. Reply with only the function, no explanation."
      : "Reply with exactly: ok";
  const timeout = createCodebuffProbeTimeout();

  try {
    const probeResult = await timeout.race(
      runCodebuffProbeMode({
        apiKey,
        cwd,
        prompt,
        costMode,
        stages,
        progress,
        providerName,
      }),
    );
    const text = String(probeResult?.text || "").trim();
    return {
      providerName,
      model,
      available: text.length > 0,
      status: text.length > 0 ? "success" : "unavailable",
      reason: text.length > 0 ? `${mode} mode probe succeeded` : `${mode} mode returned no text`,
      durationMs: Date.now() - startedAt,
      stages,
      mode: probeResult?.mode || mode,
      message: text,
    };
  } catch (error) {
    const classified = classifyCodebuffProbeError(error);
    stages.push(
      providerProbeStage("mode_failed", {
        mode,
        status: classified.status,
        message: classified.message,
      }),
    );
    progress?.({
      type: "stage",
      providerName,
      stage: `mode:${mode}:failed:${classified.status}`,
    });
    return {
      providerName,
      model,
      available: false,
      status: classified.status,
      reason: `${mode} mode failed (${classified.status})`,
      durationMs: Date.now() - startedAt,
      stages,
      mode,
      message: classified.message,
    };
  } finally {
    timeout.clear();
  }
}
