import { tryMode } from "../codebuff-direct/try-mode.mjs";

import { providerProbeStage } from "./provider-probe-stage.mjs";
import { sanitizeCodebuffProbeError } from "./sanitize-codebuff-probe-error.mjs";

export async function runCodebuffProbeMode({ apiKey, cwd, prompt, costMode, stages, progress }) {
  const mode = costMode || "paid";
  stages.push(providerProbeStage("mode_started", { mode }));
  progress?.({ type: "stage", providerName: "codebuff", stage: `mode:${mode}:started` });
  let result;
  try {
    result = await tryMode(apiKey, cwd, costMode, prompt, null);
  } catch (error) {
    throw sanitizeCodebuffProbeError(error);
  }
  stages.push(
    providerProbeStage("mode_succeeded", {
      mode,
      finishReason: result?.finishReason || null,
      textLength: String(result?.text || "").length,
    }),
  );
  progress?.({ type: "stage", providerName: "codebuff", stage: `mode:${mode}:succeeded` });
  return result;
}
