import { getApiKey } from "../codebuff-direct/get-api-key.mjs";
import { isPaymentRequiredError } from "../codebuff-direct/is-payment-required-error.mjs";
import { isRateLimitError } from "../codebuff-direct/is-rate-limit-error.mjs";
import { isRecoverableError } from "../codebuff-direct/is-recoverable-error.mjs";
import { normalizeCwd } from "../codebuff-direct/normalize-cwd.mjs";
import { tryMode } from "../codebuff-direct/try-mode.mjs";

import { recordProbeResult } from "./record-probe-result.mjs";
import { recordProviderFailure } from "./record-provider-failure.mjs";
import { saveProbeResult } from "./save-probe-result.mjs";
import { logWarn } from "./logger.mjs";

const CODEBUFF_PROBE_TIMEOUT_MS = Number(process.env.CODEBUFF_PROBE_TIMEOUT_MS || 90000);

function makeStage(name, extra = {}) {
  return { name, at: new Date().toISOString(), ...extra };
}

function classifyCodebuffError(error) {
  const message = error?.message || String(error || "unknown error");
  const normalized = message.toLowerCase();
  if (isPaymentRequiredError(normalized))
    return { status: "quota_exhausted", reason: "paid mode exhausted credits", message };
  if (isRateLimitError(normalized))
    return { status: "rate_limited", reason: "provider rate limit or session limit", message };
  if (normalized.includes("timed out") || normalized.includes("timeout"))
    return { status: "timeout", reason: "probe timed out", message };
  if (normalized.includes("not set"))
    return { status: "auth_missing", reason: "CODEBUFF_API_KEY is not set", message };
  return { status: "provider_error", reason: "codebuff probe failed", message };
}

function timeoutPromise(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Codebuff probe timed out after ${ms}ms`)), ms);
  });
}

async function runMode({ apiKey, cwd, prompt, costMode, stages }) {
  const mode = costMode || "paid";
  stages.push(makeStage("mode_started", { mode }));
  const result = await tryMode(apiKey, cwd, costMode, prompt, null);
  stages.push(
    makeStage("mode_succeeded", {
      mode,
      finishReason: result?.finishReason || null,
      textLength: (result?.text || "").length,
    }),
  );
  return result;
}

export async function probeCodebuffDetailed(provider = {}) {
  const apiKey = getApiKey();
  const startedAt = Date.now();
  const stages = [];
  const model = provider.model || process.env.CODEBUFF_MODEL_ID || "codebuff/base";

  if (!apiKey) {
    stages.push(makeStage("env_missing", { envVar: "CODEBUFF_API_KEY" }));
    return {
      providerName: provider.name || "codebuff",
      model,
      available: false,
      status: "auth_missing",
      reason: "CODEBUFF_API_KEY is not set",
      durationMs: Date.now() - startedAt,
      stages,
      mode: null,
      message: "CODEBUFF_API_KEY is not set",
    };
  }

  const cwd = normalizeCwd(process.cwd());
  const prompt = "Reply with exactly: ok";

  try {
    const paidAttempt = runMode({ apiKey, cwd, prompt, costMode: undefined, stages });
    const paidResult = await Promise.race([paidAttempt, timeoutPromise(CODEBUFF_PROBE_TIMEOUT_MS)]);
    const text = String(paidResult?.text || "").trim();
    const success = text.length > 0;
    return {
      providerName: provider.name || "codebuff",
      model,
      available: success,
      status: success ? "success" : "unavailable",
      reason: success ? "paid mode probe succeeded" : "paid mode returned no text",
      durationMs: Date.now() - startedAt,
      stages,
      mode: paidResult?.mode || "paid",
      message: text,
    };
  } catch (error) {
    const initial = classifyCodebuffError(error);
    stages.push(
      makeStage("mode_failed", { mode: "paid", status: initial.status, message: initial.message }),
    );
    if (!isRecoverableError(initial.message)) {
      return {
        providerName: provider.name || "codebuff",
        model,
        available: false,
        status: initial.status,
        reason: initial.reason,
        durationMs: Date.now() - startedAt,
        stages,
        mode: "paid",
        message: initial.message,
      };
    }
    stages.push(makeStage("fallback_started", { fromMode: "paid", toMode: "free" }));
    try {
      const freeAttempt = runMode({ apiKey, cwd, prompt, costMode: "free", stages });
      const freeResult = await Promise.race([
        freeAttempt,
        timeoutPromise(CODEBUFF_PROBE_TIMEOUT_MS),
      ]);
      const text = String(freeResult?.text || "").trim();
      const success = text.length > 0;
      return {
        providerName: provider.name || "codebuff",
        model,
        available: success,
        status: success ? "degraded" : "unavailable",
        reason: success
          ? `paid mode failed, free mode probe succeeded (${initial.status})`
          : "free mode returned no text after paid-mode fallback",
        durationMs: Date.now() - startedAt,
        stages,
        mode: freeResult?.mode || "free",
        message: text || initial.message,
      };
    } catch (fallbackError) {
      const finalError = classifyCodebuffError(fallbackError);
      stages.push(
        makeStage("fallback_failed", {
          fromMode: "paid",
          toMode: "free",
          status: finalError.status,
          message: finalError.message,
        }),
      );
      return {
        providerName: provider.name || "codebuff",
        model,
        available: false,
        status: finalError.status,
        reason: `paid mode failed (${initial.status}), free mode failed (${finalError.status})`,
        durationMs: Date.now() - startedAt,
        stages,
        mode: "free",
        message: finalError.message,
      };
    }
  }
}

export async function probeCodebuff(provider = {}) {
  const probeStart = Date.now();
  const result = await probeCodebuffDetailed(provider);
  const success = result.available;
  recordProbeResult(provider.name || "codebuff", { success, durationMs: Date.now() - probeStart });
  saveProbeResult(provider.name || "codebuff", success, {
    status: result.status,
    reason: result.reason,
    message: result.message,
    detail: result.message,
    mode: result.mode,
  });
  if (!success) {
    logWarn(`codebuff: unavailable (${result.reason})`);
    recordProviderFailure(provider.name || "codebuff", result.status || "unknown");
  }
  return success;
}
