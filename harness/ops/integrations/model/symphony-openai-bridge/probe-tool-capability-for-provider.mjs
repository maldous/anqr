import { generateText, tool } from "ai";
import { z } from "zod";
import {
  recordProviderSelection,
  recordProviderMetrics,
  recordProviderSuccess,
  recordProbeResult,
} from "../symphony-credit-gate.mjs";

import { KNOWN_TOOL_CAPABLE } from "./known-tool-capable.mjs";
import { OPENROUTER_PROVIDER_NAME_SET } from "./openrouter-provider-name-set.mjs";
import { RAW_TOOL_JSON_RE } from "./raw-tool-json-re.mjs";
import { TOOL_PROBE_TIMEOUT_MS } from "./tool-probe-timeout-ms.mjs";
import { createProviderModel } from "./create-provider-model.mjs";
import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { toolCapableProviders } from "./tool-capable-providers.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function probeToolCapabilityForProvider(providerDef) {
  const name = providerDef.name;

  // CHANGED: Skip early-exit for already-classified providers to ensure we always
  // collect fresh metrics. Classification is still used for provider selection,
  // but we probe everyone every cycle to maintain up-to-date performance data.
  // Cached classification allows fast startup; fresh probes provide ongoing metrics.

  // P0 FIX: Safety-net providers (local Ollama) are NEVER excluded from selection.
  // They may not support structured tool calling, but a degraded response is always
  // preferable to a total outage. If tools fail at runtime, invokeWithAI will handle
  // the provider without tools (useTools=false via providerSupportsTools).
  if (providerDef.tier === "local-safety-net") {
    toolCapableProviders.add(name);
    return { name, status: "safety-net-always-allowed" };
  }

  // SDK-based providers are handled outside AI SDK tool protocol
  if (providerDef.requiresSdk || providerDef.driver === "codex-sdk") {
    toolCapableProviders.add(name);
    return { name, status: "sdk-capable" };
  }

  // Known tool-capable providers (e.g., codebuff) skip the actual probe.
  // Codebuff routes through its own bridge (port 4318) and uses internal tools
  // (spawn_agent_inline, set_messages, end_turn) rather than OpenAI-style function
  // calling. Probing it wastes ~15s (paid->free fallback) and always returns
  // INCONCLUSIVE. Since we trust the configuration, skip the probe entirely.
  if (KNOWN_TOOL_CAPABLE.has(name)) {
    toolCapableProviders.add(name);
    return { name, status: "known-capable" };
  }

  // OpenRouter: all models share the same API key and gateway.
  // If another OpenRouter model already proved capable/non-capable,
  // infer the same for this model (saves API quota and avoids rate limits).
  // Models that genuinely lack tool support return a distinct "No endpoints
  // found that support tool use" error, so inference from a capable sibling
  // is safe — non-capable models will still be caught by their own probes.
  if (OPENROUTER_PROVIDER_NAME_SET.has(name)) {
    for (const orName of OPENROUTER_PROVIDER_NAME_SET) {
      if (toolCapableProviders.has(orName) && !KNOWN_TOOL_CAPABLE.has(orName)) {
        toolCapableProviders.add(name);
        return { name, status: "inferred-capable" };
      }
    }
  }

  // Resolve API key (mirrors credit-gate's resolveProviderApiKey)
  let apiKey = providerDef.envVar ? process.env[providerDef.envVar] : null;
  if (!apiKey && providerDef.loadToken) {
    try {
      apiKey = await providerDef.loadToken();
    } catch {
      /* ignore */
    }
  }

  const providerObj = { ...providerDef, apiKey };
  let model;
  try {
    model = createProviderModel(providerObj);
  } catch {
    return { name, status: "no-model" };
  }
  if (!model) return { name, status: "no-model" };

  const probeTools = {
    add: tool({
      description: "Add two numbers",
      inputSchema: z.object({ a: z.number(), b: z.number() }),
      execute: async ({ a, b }) => String(a + b),
    }),
  };

  const startTime = Date.now();
  logInfo(`🔧 TOOL PROBE START: ${name} - Testing structured tool calling with add(2, 2)`);
  logInfo(`⏳ PROBING: ${name} - Sending test request to validate tool capability...`);
  try {
    const result = await Promise.race([
      generateText({
        model,
        messages: [{ role: "user", content: "Compute 2+2. You must use the add tool." }],
        tools: probeTools,
        toolChoice: "auto",
        maxTokens: 100,
        maxSteps: 2,
      }),
      new Promise((_, reject) =>
        setTimeout(() => {
          logError("Tool probe timeout exceeded");
          reject(new Error("tool-probe-timeout"));
        }, TOOL_PROBE_TIMEOUT_MS),
      ),
    ]);

    const durationMs = Date.now() - startTime;
    const hasStructuredToolCall = result.steps?.some((s) => s.toolCalls?.length > 0);
    const text = result.text || "";
    const hasRawToolJson = RAW_TOOL_JSON_RE.test(text);

    logInfo(
      `🔧 TOOL PROBE RESULT: ${name} - hasStructuredToolCall=${hasStructuredToolCall}, hasRawToolJson=${hasRawToolJson}, answer="${text.slice(0, 50)}"`,
    );

    if (hasStructuredToolCall && !hasRawToolJson) {
      toolCapableProviders.add(name);

      // Record successful probe in dedicated probe metrics (separate from runtime)
      recordProbeResult(name, { success: true, durationMs });

      // ALSO record as runtime metrics to populate rankings immediately
      // This ensures providers appear in rankings even before real requests
      recordProviderSelection(name);
      recordProviderSuccess(name);
      recordProviderMetrics(name, {
        durationMs,
        inputTokens: result.usage?.promptTokens || 0,
        outputTokens: result.usage?.completionTokens || 0,
        validationPassed: true,
      });

      logInfo(
        `✅ TOOL PROBE PASS: ${name} - Structured tool calling validated (${durationMs}ms, answer: "${text.slice(0, 50)}")`,
      );
      logInfo(
        `✅ DETERMINATION: ${name} marked as TOOL-CAPABLE (supports structured tool calling)`,
      );
      return { name, status: "capable", durationMs, answer: text };
    }

    if (hasRawToolJson) {
      nonToolCapableProviders.add(name);
      recordProbeResult(name, { success: false, durationMs });
      logWarn(`❌ TOOL PROBE FAIL: ${name} - Emitted raw JSON instead of structured tool calls`);
      logWarn(
        `❌ DETERMINATION: ${name} marked as NON-TOOL-CAPABLE (excluded from future selection)`,
      );
      return { name, status: "non-capable-raw-json" };
    }

    // Model responded with text but didn't use the tool — inconclusive.
    // Don't exclude; the runtime safety net will catch it if needed.
    logWarn(
      `⚠️ TOOL PROBE INCONCLUSIVE: ${name} - No tool call detected, leaving in pool for runtime validation`,
    );
    return { name, status: "no-tool-call" };
  } catch (err) {
    const errStr = String(err).slice(0, 300);

    // Rate limit — don't exclude; assume capable until proven otherwise
    // Don't record probe failure for rate limits — not indicative of capability
    if (/429|rate.?limit|too many|quota|resource.?exhausted/i.test(errStr)) {
      logWarn(`⏳ TOOL PROBE RATE LIMITED: ${name} - Will retry later`);
      return { name, status: "rate-limited" };
    }

    // Explicit tool rejection by the API — definitive negative signal
    if (
      /tool_choice|tools.*not.*support|function.*call.*not|does not support|no endpoints.*tool/i.test(
        errStr,
      )
    ) {
      nonToolCapableProviders.add(name);
      recordProbeResult(name, { success: false, durationMs: Date.now() - startTime });
      logWarn(`❌ TOOL PROBE FAIL: ${name} - API explicitly rejected tool support`);
      logWarn(`❌ DETERMINATION: ${name} marked as NON-TOOL-CAPABLE (API rejected tools)`);
      return { name, status: "non-capable-rejected" };
    }

    // Infrastructure/config errors — NOT indicative of tool capability
    // (account guardrails, data policy restrictions, invalid/expired API keys, team membership)
    if (
      /guardrail|data.?policy|invalid.*key|expired.*token|invalid.*format.*key|not part of team/i.test(
        errStr,
      )
    ) {
      logWarn(`🔧 TOOL PROBE INFRA: ${name} - ${errStr.slice(0, 150)}`);
      return { name, status: "infrastructure-error" };
    }

    if (/timeout|tool-probe-timeout/i.test(errStr)) {
      recordProbeResult(name, { success: false, durationMs: Date.now() - startTime });
      logWarn(`⏱️ TOOL PROBE TIMEOUT: ${name} - Exceeded ${TOOL_PROBE_TIMEOUT_MS}ms`);
      return { name, status: "timeout" };
    }

    // Log the actual error for debugging
    logWarn(`❌ TOOL PROBE ERROR: ${name} - ${errStr.slice(0, 150)}`);

    // Record probe error in dedicated probe metrics (separate from runtime)
    recordProbeResult(name, { success: false, durationMs: Date.now() - startTime });

    return { name, status: "probe-error" };
  }
}
