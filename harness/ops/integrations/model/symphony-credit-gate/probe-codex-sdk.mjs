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

    // Try with the specified model first, fall back to SDK default if null
    const threadOpts = {
      workingDirectory: PROJECT_ROOT,
      sandboxMode: CODEX_SANDBOX_MODE,
      approvalPolicy: "never",
      webSearchEnabled: false,
      networkAccessEnabled: false,
    };
    let thread = await codex.startThread({ model: model || undefined, ...threadOpts });

    // startThread returns null when model is unsupported or quota exhausted.
    // Retry without a model so the SDK picks its default — this allows the
    // provider to become available dynamically when the model issue clears.
    if (!thread && model) {
      logWarn(`codex: startThread returned null with model=${model}, retrying without model`);
      thread = await codex.startThread({ model: undefined, ...threadOpts });
    }

    if (!thread) {
      // null without a model means quota exhausted or account issue — classify
      // dynamically so the system can recover when quota resets.
      const quotaErr = new Error("Codex SDK startThread returned null — quota exhausted or temporarily unavailable");
      quotaErr.code = "QUOTA_EXHAUSTED";
      throw quotaErr;
    }

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
    const code = err?.code || "";
    // Classify dynamically — quota_exhausted and timeout are recoverable states
    // that the probe cycle can clear on the next pass; provider_error is generic.
    let errorStatus = "provider_error";
    if (
      code === "QUOTA_EXHAUSTED" ||
      message.toLowerCase().includes("usage limit") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("quota exhausted")
    ) {
      errorStatus = "quota_exhausted";
      logWarn(`codex: unavailable (quota exhausted — will retry on next probe cycle)`);
      recordProviderFailure("codex", "quota_exhausted");
    } else if (message.toLowerCase().includes("timeout")) {
      errorStatus = "timeout";
      logWarn(`codex: unavailable (timeout)`);
      recordProviderFailure("codex", "timeout");
    } else {
      logWarn(`codex: unavailable (${message})`);
      recordProviderFailure("codex", "provider_error");
    }
    recordProbeResult("codex", { success: false, durationMs: Date.now() - probeStart });
    saveProbeResult("codex", false, {
      status: errorStatus,
      reason: message,
      message,
      detail: message,
    });
    return false;
  }
}
