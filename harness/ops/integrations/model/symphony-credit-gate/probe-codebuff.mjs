import { probeCodebuffDetailed } from "./probe-codebuff-detailed.mjs";
import { recordProbeResult } from "./record-probe-result.mjs";
import { recordProviderFailure } from "./record-provider-failure.mjs";
import { logWarn } from "./logger.mjs";

export async function probeCodebuff(provider = {}) {
  const probeStart = Date.now();
  const result = await probeCodebuffDetailed(provider);
  const success = result.available;
  recordProbeResult(provider.name || "codebuff", { success, durationMs: Date.now() - probeStart });
  if (!success) {
    logWarn(`codebuff: unavailable (${result.reason})`);
    recordProviderFailure(provider.name || "codebuff", result.status || "unknown");
  }
  return success;
}
