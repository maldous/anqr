import { REPORTS_DIR, PROJECT_ROOT } from "../../../integrations/model/codebuff-sdk-runner.mjs";
import { inferSymphonyResultFromCompletion } from "../../../core/bridge-result.mjs";
import { invokeCodebuffDirect } from "../../../integrations/model/codebuff-direct.mjs";
import { writeFileSync, existsSync, mkdirSync as mkDirSync } from "node:fs";
import { join as pathJoin } from "node:path";
import { RUNNER_MAX_OUTPUT_TOKENS } from "../../../symphony-config.mjs";

import { REQUEST_TIMEOUT_MS } from "./request-timeout-ms.mjs";
import { SYMPHONY_BRIDGE_API_KEY } from "./symphony-bridge-api-key.mjs";
import { SYMPHONY_BRIDGE_MODEL } from "./symphony-bridge-model.mjs";
import { SYMPHONY_BRIDGE_URL } from "./symphony-bridge-url.mjs";
import { TOOL_DEFINITIONS } from "./tool-definitions.mjs";
import { logDebug } from "./logger.mjs";
import { safetyCap } from "../../../lib/safety-cap.mjs";

export async function callLLM(
  provider,
  messages,
  taskDescription,
  projectRoot = PROJECT_ROOT,
  worktreeId = null,
  _worktreeRoot = null,
  _leaseId = null,
  _executionMode = null,
) {
  if (provider.name === "symphony-bridge") {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SYMPHONY_BRIDGE_API_KEY}`,
        "X-Symphony-Origin": "runner",
      };
      if (worktreeId) {
        headers["X-Worktree-ID"] = worktreeId;
      }
      const res = await fetch(`${SYMPHONY_BRIDGE_URL}/v1/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: provider.model || SYMPHONY_BRIDGE_MODEL,
          messages,
          stream: true,
          temperature: 0.2,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(safetyCap(`Symphony bridge ${res.status}: ${body}`));
      }

      // Stream the response and accumulate content
      let fullContent = "";
      let symphonyResult = null;
      let finishReason = null;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        // Process the current chunk BEFORE checking done
        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }

        // If done, process all remaining buffer content (including the final chunk)
        if (done) {
          // Split buffer into lines and process ALL of them
          const lines = buffer.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            if (!data.trim()) continue;

            try {
              const parsed = JSON.parse(data);
              const choice = parsed.choices?.[0];
              const content = choice?.delta?.content;
              if (content) {
                fullContent += content;
              }
              const reason = choice?.finish_reason;
              if (reason) {
                finishReason = reason;
              }
              // Capture structured result from bridge (embedded in final SSE chunk)
              if (parsed._symphonyResult) {
                symphonyResult = parsed._symphonyResult;
                logDebug(`[agent] 📦 Captured _symphonyResult from final buffer`);
              }
            } catch (error_) {
              logDebug(`[agent] ⚠️ Final buffer parse error: ${error_.message}`);
            }
          }
          break;
        }

        // Process complete lines (keep the last incomplete line in buffer)
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          if (!data.trim()) continue;

          try {
            const parsed = JSON.parse(data);
            const choice = parsed.choices?.[0];
            const content = choice?.delta?.content;
            if (content) {
              fullContent += content;
              logDebug(`[agent] 🌊 ${content.slice(0, 200)}`);
            }
            const reason = choice?.finish_reason;
            if (reason) {
              finishReason = reason;
            }
            // Capture structured result from bridge (embedded in any SSE chunk)
            if (parsed._symphonyResult) {
              symphonyResult = parsed._symphonyResult;
              logDebug(`[agent] 📦 Captured _symphonyResult from stream`);
            }
          } catch (error_) {
            // Skip non-JSON chunks but log for debugging
            logDebug(`[agent] ⚠️ SSE chunk parse error: ${error_.message}`);
          }
        }
      }

      if (fullContent) {
        process.stdout.write("\n"); // Final newline
      }

      if (!symphonyResult) {
        symphonyResult = inferSymphonyResultFromCompletion({
          finishReason,
          text: fullContent,
        });
        if (symphonyResult) {
          logDebug(
            `[agent] 🛟 Inferred _symphonyResult from bridge stream (finish_reason=${finishReason || "unknown"})`,
          );
        }
      }

      return {
        choices: [
          {
            message: {
              role: "assistant",
              content: fullContent,
              tool_calls: [],
            },
          },
        ],
        providerName: provider.name,
        _symphonyResult: symphonyResult,
      };
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  // Handle direct SDK providers inside the selected worktree.
  if (provider.requiresSdk) {
    logDebug(`[agent] Using direct SDK provider in worktree`, {
      provider: provider.name,
      cwd: projectRoot,
      worktreeId,
    });

    try {
      const result = await invokeCodebuffDirect({
        messages,
        cwd: projectRoot,
      });

      const finishReason = result.needsContinuation ? "length" : "stop";

      const report = {
        timestamp: new Date().toISOString(),
        task: taskDescription?.slice(0, 500) || "Symphony agent run",
        project: projectRoot,
        exitCode: 0,
        method: "codebuff-direct",
        outputLength: result.text.length,
        output: result.text.slice(-5000),
        needsContinuation: result.needsContinuation,
        error: null,
      };

      if (!existsSync(REPORTS_DIR)) {
        mkDirSync(REPORTS_DIR, { recursive: true });
      }
      const reportFile = pathJoin(REPORTS_DIR, `latest-${Date.now()}.json`);
      writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");
      logDebug(`[agent] Codebuff direct report written to: ${reportFile}`);

      return {
        choices: [
          {
            message: {
              role: "assistant",
              content: result.text,
              tool_calls: [],
            },
          },
        ],
        providerName: provider.name,
        _symphonyResult:
          result._symphonyResult ||
          inferSymphonyResultFromCompletion({
            finishReason,
            text: result.text,
          }),
        needsContinuation: result.needsContinuation,
      };
    } catch (err) {
      const failureReport = {
        timestamp: new Date().toISOString(),
        task: taskDescription?.slice(0, 500) || "Symphony agent run",
        project: projectRoot,
        exitCode: 1,
        method: "codebuff-direct",
        outputLength: 0,
        output: "",
        error: String(err?.message || err),
      };

      try {
        if (!existsSync(REPORTS_DIR)) {
          mkDirSync(REPORTS_DIR, { recursive: true });
        }
        const reportFile = pathJoin(REPORTS_DIR, `latest-${Date.now()}.json`);
        writeFileSync(reportFile, JSON.stringify(failureReport, null, 2) + "\n");
      } catch {
        // ignore report write failures
      }

      throw err;
    }
  }

  // Standard HTTP-based provider
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const headers = { "Content-Type": "application/json" };
    if (provider.apiKey) {
      headers["Authorization"] = `Bearer ${provider.apiKey}`;
    }
    if (worktreeId) {
      headers["X-Worktree-ID"] = worktreeId;
    }
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages,
        tools: TOOL_DEFINITIONS,
        cwd: projectRoot,
        ...(provider.useMaxCompletionTokens
          ? { max_completion_tokens: RUNNER_MAX_OUTPUT_TOKENS }
          : { max_tokens: RUNNER_MAX_OUTPUT_TOKENS }),
        stream: false,
        temperature: 0.2,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(safetyCap(`LLM API ${res.status}: ${body}`));
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
