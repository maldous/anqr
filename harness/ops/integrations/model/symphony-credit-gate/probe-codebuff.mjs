import { tryMode } from "../codebuff-direct/try-mode.mjs";
import { getApiKey } from "../codebuff-direct/get-api-key.mjs";
import { normalizeCwd } from "../codebuff-direct/normalize-cwd.mjs";
import { recordProbeResult } from "./record-probe-result.mjs";
import { recordProviderFailure } from "./record-provider-failure.mjs";
import { logWarn } from "./logger.mjs";

const CODEBUFF_PROBE_TIMEOUT_MS = 30_000;

export async function probeCodebuff() {
  const apiKey = getApiKey();
  if (!apiKey) {
    logWarn(`codebuff: unavailable (CODEBUFF_API_KEY not set)`);
    recordProviderFailure("codebuff");
    return false;
  }

  const probeStart = Date.now();
  try {
    const normalizedCwd = normalizeCwd(process.cwd());
    const probePrompt = "Reply with exactly: ok";

    // Use the same Codebuff execution path that invokeCodebuffDirect uses
    const result = await Promise.race([
      tryMode(apiKey, normalizedCwd, undefined, probePrompt, null),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Codebuff probe timed out")), CODEBUFF_PROBE_TIMEOUT_MS),
      ),
    ]);

    const text = (result?.text || "").trim().toLowerCase();
    const success = text.includes("ok");
    recordProbeResult("codebuff", { success, durationMs: Date.now() - probeStart });
    return success;
  } catch (err) {
    recordProbeResult("codebuff", { success: false, durationMs: Date.now() - probeStart });
    const errStr = String(err).toLowerCase();
    if (errStr.includes("usage limit") || errStr.includes("quota") || errStr.includes("payment")) {
      logWarn(`codebuff: unavailable (quota exhausted)`);
    } else if (errStr.includes("timeout")) {
      logWarn(`codebuff: unavailable (timeout)`);
    } else {
      logWarn(`codebuff: unavailable (${err.message || err})`);
    }
    recordProviderFailure("codebuff");
    return false;
  }
}