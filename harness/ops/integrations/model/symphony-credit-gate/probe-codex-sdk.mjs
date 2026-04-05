import { Codex } from "@openai/codex-sdk";

import { CODEX_PROBE_TIMEOUT_MS } from "./codex-probe-timeout-ms.mjs";
import { CODEX_SANDBOX_MODE } from "./codex-sandbox-mode.mjs";
import { CODEX_SUCCESS_WINDOW_MS } from "./codex-success-window-ms.mjs";
import { PROJECT_ROOT } from "./project-root.mjs";
import { loadStats } from "./load-stats.mjs";
import { recordProbeResult } from "./record-probe-result.mjs";
import { recordProviderFailure } from "./record-provider-failure.mjs";
import { saveProbeResult } from "./save-probe-result.mjs";
import { logWarn } from "./logger.mjs";

export async function probeCodexSdk(model) {
  const stats = loadStats();
  const lastSuccess = stats.lastSuccess.codex;
  if (lastSuccess && Date.now() - lastSuccess < CODEX_SUCCESS_WINDOW_MS) {
    return true;
  }

  const probeStart = Date.now();
  try {
    const codex = new Codex({ env: process.env });
    const thread = codex.startThread({
      model: model || undefined,
      workingDirectory: PROJECT_ROOT,
      sandboxMode: CODEX_SANDBOX_MODE,
      approvalPolicy: "never",
      webSearchEnabled: false,
      networkAccessEnabled: false,
    });
    const probe = thread.run("Reply with exactly: ok");
    const result = await Promise.race([
      probe,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Codex SDK probe timed out")), CODEX_PROBE_TIMEOUT_MS),
      ),
    ]);
    const finalResponse = String(result?.finalResponse || "")
      .trim()
      .toLowerCase();
    const success = finalResponse.includes("ok");
    recordProbeResult("codex", { success, durationMs: Date.now() - probeStart });
    saveProbeResult("codex", success, {
      status: success ? "success" : "unavailable",
      reason: success ? "Codex SDK probe succeeded" : "Codex SDK returned empty response",
      message: finalResponse,
      detail: finalResponse,
    });
    return success;
  } catch (err) {
    const message = String(err?.message || err);
    recordProbeResult("codex", { success: false, durationMs: Date.now() - probeStart });
    saveProbeResult("codex", false, {
      status: "provider_error",
      reason: message,
      message,
      detail: message,
    });
    if (message.toLowerCase().includes("usage limit") || message.toLowerCase().includes("quota")) {
      logWarn(`codex: unavailable (quota exhausted)`);
      recordProviderFailure("codex", "quota_exhausted");
    } else if (message.toLowerCase().includes("timeout")) {
      logWarn(`codex: unavailable (timeout)`);
      recordProviderFailure("codex", "timeout");
    } else {
      logWarn(`codex: unavailable (${message})`);
      recordProviderFailure("codex", "provider_error");
    }
    return false;
  }
}
