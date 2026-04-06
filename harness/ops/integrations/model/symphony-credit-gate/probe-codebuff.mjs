import { probeCodebuffDetailed } from "./probe-codebuff-detailed.mjs";
import { recordProbeResult } from "./record-probe-result.mjs";
import { recordProviderFailure } from "./record-provider-failure.mjs";
import { saveProbeResult } from "./save-probe-result.mjs";
import { logWarn } from "./logger.mjs";

export async function probeCodebuff(provider = {}) {
  const providerName = provider.name || "codebuff";
  const probeStart = Date.now();
  const result = await probeCodebuffDetailed(provider);
  const success = result.available;

  recordProbeResult(providerName, { success, durationMs: Date.now() - probeStart });
  saveProbeResult(providerName, success, {
    status: result.status,
    reason: result.reason,
    message: result.message,
    detail: result.message,
    mode: result.mode,
  });

  if (!success) {
    logWarn(`codebuff: unavailable (${result.reason})`);
    recordProviderFailure(providerName, result.status || "unknown");
  }

  return success;
}
