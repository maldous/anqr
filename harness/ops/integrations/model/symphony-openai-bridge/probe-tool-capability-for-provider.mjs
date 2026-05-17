import { generateText, tool } from "ai";
import { z } from "zod";
import {
  recordProviderSelection,
  recordProviderMetrics,
  recordProviderSuccess,
  recordProviderFailure,
  recordProbeResult,
} from "../symphony-credit-gate.mjs";

import { KNOWN_TOOL_CAPABLE } from "./known-tool-capable.mjs";
import { TOOL_PROBE_TIMEOUT_MS } from "./tool-probe-timeout-ms.mjs";
import { createProviderModel } from "./create-provider-model.mjs";
import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { toolCapableProviders } from "./tool-capable-providers.mjs";
import { logInfo, logWarn, logDebug } from "./logger.mjs";
import { extractToolProbeAnswer } from "./extract-tool-probe-answer.mjs";
import { classifyToolProbeErrorOutcome } from "./classify-tool-probe-error-outcome.mjs";
import { providerToolSupportHint } from "./provider-tool-support-hint.mjs";
import { probeMistralToolCapabilityViaHttp } from "./probe-mistral-tool-capability-via-http.mjs";
import { shouldWarnForStatus } from "./probe-tool-capability-for-provider/should-warn-for-status.mjs";

export async function probeToolCapabilityForProvider(providerDef) {
  const name = providerDef.name;
  const supportHint = providerToolSupportHint(providerDef);

  if (providerDef.tier === "local-safety-net") {
    toolCapableProviders.add(name);
    return { name, status: "safety-net-always-allowed", detail: "safety-net-always-allowed" };
  }

  if (providerDef.requiresSdk || providerDef.driver === "codex-sdk") {
    toolCapableProviders.add(name);
    return { name, status: "sdk-capable", detail: "sdk-capable" };
  }

  if (KNOWN_TOOL_CAPABLE.has(name)) {
    toolCapableProviders.add(name);
    return { name, status: "known-capable", detail: "known-capable" };
  }

  if (supportHint.status === "supported") {
    toolCapableProviders.add(name);
    return { name, status: "catalog-declared-capable", detail: supportHint.reason };
  }

  if (supportHint.status === "unsupported") {
    nonToolCapableProviders.add(name);
    return { name, status: "catalog-declared-non-capable", detail: supportHint.reason };
  }

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
  } catch (error) {
    return { name, status: "no-model", detail: String(error?.message || error) };
  }
  if (!model) return { name, status: "no-model", detail: "no model" };

  const probeTools = {
    add: tool({
      description: "Add two numbers",
      inputSchema: z.object({ a: z.number(), b: z.number() }),
      execute: async ({ a, b }) => String(a + b),
    }),
  };

  const startTime = Date.now();
  logInfo(`🔧 TOOL PROBE START: ${name} - Testing structured tool calling with add(2, 2)`);
  logDebug(
    `TOOL PROBE CONFIG: ${name} ${JSON.stringify({ model: providerDef.model, baseUrl: providerDef.baseUrl || "", envVar: providerDef.envVar || "", supportHint: supportHint.status, supportReason: supportHint.reason })}`,
  );

  try {
    let result;
    if (name === "mistral" || (providerDef.baseUrl || "").includes("mistral.ai")) {
      const httpResult = await probeMistralToolCapabilityViaHttp(
        providerDef,
        apiKey,
        TOOL_PROBE_TIMEOUT_MS,
      );
      if (httpResult.status >= 400) {
        throw new Error(httpResult.body || `HTTP ${httpResult.status}`);
      }
      const parsed = JSON.parse(httpResult.body || "{}");
      const choice = Array.isArray(parsed.choices) ? parsed.choices[0] : null;
      const toolCalls = Array.isArray(choice?.message?.tool_calls) ? choice.message.tool_calls : [];
      const answer =
        toolCalls.length > 0
          ? "4"
          : extractToolProbeAnswer({ text: choice?.message?.content || "" });
      result = {
        text: choice?.message?.content || "",
        steps: toolCalls.length > 0 ? [{ toolCalls, toolResults: [{ output: "4" }] }] : [],
        usage: {
          promptTokens: parsed.usage?.prompt_tokens || 0,
          completionTokens: parsed.usage?.completion_tokens || 0,
        },
      };
      logDebug(
        `TOOL PROBE RESULT: ${name} ${JSON.stringify({ hasStructuredToolCall: toolCalls.length > 0, hasRawToolJson: false, text: result.text || "", answer })}`,
      );
    } else {
      const timer = new Promise((_, reject) => {
        const handle = setTimeout(
          () => reject(new Error("tool-probe-timeout")),
          TOOL_PROBE_TIMEOUT_MS,
        );
        handle.unref?.();
      });
      result = await Promise.race([
        generateText({
          model,
          messages: [
            {
              role: "user",
              content:
                "You MUST call the add tool to compute 2 + 2. Do not answer directly — you must use the tool. Reply with only the numeric answer after the tool result.",
            },
          ],
          tools: probeTools,
          // Use "auto" tool choice — matches the runtime path (invoke-with-aiinner.mjs)
          // so the probe tests the exact capability the live system requires.
          // Providers that only support forced tool choice but not auto will be
          // correctly classified as non-capable at probe time.
          toolChoice: "auto",
          maxTokens: 100,
          maxSteps: 2,
        }),
        timer,
      ]);
      const debugResult = {
        hasStructuredToolCall:
          Array.isArray(result?.steps) &&
          result.steps.some((step) => Array.isArray(step?.toolCalls) && step.toolCalls.length > 0),
        hasRawToolJson: /"name"\s*:\s*"add"/.test(String(result?.text || "")),
        text: String(result?.text || ""),
        answer: extractToolProbeAnswer(result),
      };
      logDebug(`TOOL PROBE RESULT: ${name} ${JSON.stringify(debugResult)}`);
    }

    const durationMs = Date.now() - startTime;
    const hasStructuredToolCall =
      Array.isArray(result?.steps) &&
      result.steps.some((step) => Array.isArray(step?.toolCalls) && step.toolCalls.length > 0);
    const text = String(result?.text || "");
    const hasRawToolJson = /"name"\s*:\s*"add"/.test(text);
    const answer = extractToolProbeAnswer(result);

    if (hasStructuredToolCall) {
      toolCapableProviders.add(name);
      recordProbeResult(name, { success: true, durationMs });
      recordProviderSelection(name);
      recordProviderSuccess(name);
      recordProviderMetrics(name, {
        durationMs,
        inputTokens: result?.usage?.promptTokens || 0,
        outputTokens: result?.usage?.completionTokens || 0,
        validationPassed: Boolean(answer),
      });
      return { name, status: "capable", durationMs, answer, detail: answer || "capable" };
    }

    if (hasRawToolJson) {
      nonToolCapableProviders.add(name);
      recordProbeResult(name, { success: false, durationMs });
      recordProviderFailure(name, "non_capable");
      return { name, status: "non-capable-raw-json", detail: answer || text.slice(0, 300) };
    }

    if (answer) {
      nonToolCapableProviders.add(name);
      recordProbeResult(name, { success: false, durationMs });
      recordProviderFailure(name, "answered_without_tool_call");
      return { name, status: "answered-without-tool-call", answer, detail: answer };
    }

    recordProbeResult(name, { success: false, durationMs });
    return { name, status: "no-tool-call", detail: text.slice(0, 300) };
  } catch (error) {
    const detail = `${String(error?.message || error)} | provider=${name} | model=${providerDef.model} | baseUrl=${providerDef.baseUrl || ""}`;
    const classified = classifyToolProbeErrorOutcome(detail);
    const durationMs = Date.now() - startTime;
    const failureType = classified.status.replaceAll("-", "_");

    if (
      classified.status === "non-capable-rejected" ||
      classified.status === "failed-function-call" ||
      classified.status === "unavailable-model" ||
      classified.status === "quota-exhausted" ||
      classified.status === "bad-request"
    ) {
      nonToolCapableProviders.add(name);
    }

    if (shouldWarnForStatus(classified.status)) {
      logWarn(`❌ TOOL PROBE ERROR: ${name} - ${classified.detail.slice(0, 300)}`);
    } else {
      logDebug(
        `TOOL PROBE SKIP: ${name} ${JSON.stringify({ status: classified.status, detail: classified.detail.slice(0, 300) })}`,
      );
    }

    recordProbeResult(name, { success: false, durationMs });
    recordProviderFailure(name, failureType);
    return { name, status: classified.status, detail: classified.detail };
  }
}
