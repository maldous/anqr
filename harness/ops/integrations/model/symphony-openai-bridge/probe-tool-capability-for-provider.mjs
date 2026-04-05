import { generateText, tool } from "ai";
import { z } from "zod";
import {
  recordProviderMetrics,
  recordProviderSelection,
  recordProviderSuccess,
  recordProbeResult,
} from "../symphony-credit-gate.mjs";

import { KNOWN_TOOL_CAPABLE } from "./known-tool-capable.mjs";
import { RAW_TOOL_JSON_RE } from "./raw-tool-json-re.mjs";
import { TOOL_PROBE_TIMEOUT_MS } from "./tool-probe-timeout-ms.mjs";
import { createProviderModel } from "./create-provider-model.mjs";
import { extractToolProbeAnswer } from "./extract-tool-probe-answer.mjs";
import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { probeMistralViaHttp } from "./probe-mistral-via-http.mjs";
import { toolCapableProviders } from "./tool-capable-providers.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function probeToolCapabilityForProvider(providerDef) {
  const name = providerDef.name;
  if (providerDef.tier === "local-safety-net") {
    toolCapableProviders.add(name);
    return { name, status: "safety-net-always-allowed" };
  }
  if (providerDef.requiresSdk || providerDef.driver === "codex-sdk") {
    toolCapableProviders.add(name);
    return { name, status: "sdk-capable" };
  }
  if (KNOWN_TOOL_CAPABLE.has(name)) {
    toolCapableProviders.add(name);
    return { name, status: "known-capable" };
  }
  let apiKey = providerDef.envVar ? process.env[providerDef.envVar] : null;
  if (!apiKey && providerDef.loadToken) {
    try {
      apiKey = await providerDef.loadToken();
    } catch {}
  }
  const providerObj = { ...providerDef, apiKey };
  const probeTools = {
    add: tool({
      description: "Add two numbers",
      inputSchema: z.object({ a: z.number(), b: z.number() }),
      execute: async ({ a, b }) => String(a + b),
    }),
  };
  const startTime = Date.now();
  logInfo(`🔧 TOOL PROBE START: ${name} - Testing structured tool calling with add(2, 2)`);
  try {
    let result;
    if (name === "mistral") {
      result = await Promise.race([
        probeMistralViaHttp(providerDef, apiKey),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("tool-probe-timeout")), TOOL_PROBE_TIMEOUT_MS),
        ),
      ]);
    } else {
      const model = createProviderModel(providerObj);
      if (!model) return { name, status: "no-model" };
      result = await Promise.race([
        generateText({
          model,
          messages: [
            {
              role: "user",
              content: "Use the add tool to add 2 and 2. Then reply with only the numeric answer.",
            },
          ],
          tools: probeTools,
          toolChoice: "auto",
          maxTokens: 100,
          maxSteps: 3,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("tool-probe-timeout")), TOOL_PROBE_TIMEOUT_MS),
        ),
      ]);
    }
    const durationMs = Date.now() - startTime;
    const hasStructuredToolCall = Array.isArray(result?.toolCalls)
      ? result.toolCalls.length > 0
      : !!result?.steps?.some(
          (step) => Array.isArray(step?.toolCalls) && step.toolCalls.length > 0,
        );
    const answer = extractToolProbeAnswer(result).trim();
    const hasRawToolJson = RAW_TOOL_JSON_RE.test(answer || result?.text || "");
    if (hasStructuredToolCall && !hasRawToolJson) {
      toolCapableProviders.add(name);
      recordProbeResult(name, { success: true, durationMs });
      recordProviderSelection(name);
      recordProviderSuccess(name);
      recordProviderMetrics(name, {
        durationMs,
        inputTokens: result?.usage?.promptTokens || 0,
        outputTokens: result?.usage?.completionTokens || 0,
        validationPassed: true,
      });
      return { name, status: "capable", durationMs, answer };
    }
    if (hasRawToolJson) {
      nonToolCapableProviders.add(name);
      recordProbeResult(name, { success: false, durationMs });
      return { name, status: "non-capable-raw-json", answer };
    }
    return { name, status: "no-tool-call", answer };
  } catch (err) {
    const errStr = String(err).slice(0, 500);
    if (/429|rate.?limit|too many|quota|resource.?exhausted/i.test(errStr))
      return { name, status: "rate-limited" };
    if (
      /tool_choice|tools.*not.*support|function.*call.*not|does not support|no endpoints.*tool|tool use/i.test(
        errStr,
      )
    ) {
      nonToolCapableProviders.add(name);
      recordProbeResult(name, { success: false, durationMs: Date.now() - startTime });
      return { name, status: "non-capable-rejected" };
    }
    if (
      /guardrail|data.?policy|invalid.*key|expired.*token|invalid.*format.*key|not part of team/i.test(
        errStr,
      )
    )
      return { name, status: "infrastructure-error" };
    if (/timeout|tool-probe-timeout/i.test(errStr)) return { name, status: "timeout" };
    logWarn(`❌ TOOL PROBE ERROR: ${name} - ${errStr.slice(0, 150)}`);
    recordProbeResult(name, { success: false, durationMs: Date.now() - startTime });
    return { name, status: "probe-error" };
  }
}
