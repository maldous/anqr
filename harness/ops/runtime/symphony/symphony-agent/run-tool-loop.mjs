import { RUNNER_TURN_BUDGET_WARNING } from "../../../symphony-config.mjs";

import { assertMutationContext } from "./assert-mutation-context.mjs";
import { callLLM } from "./call-llm.mjs";
import { executeTool } from "./execute-tool.mjs";
import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

const PLANNING_ACTION_RE = /\blet me (understand|read|check|analyze|review)\b/i;
const PLANNING_INTENT_RE = /\bI('ll| will) (start by|need to|first)\b/i;
const PLANNING_HERE_RE = /\bhere('s| is) my plan\b/i;
const PLANNING_SECTION_RE = /\b(steps|approach|thinking|analyzing|reviewing):\b/i;

function isPlanningText(text) {
  return PLANNING_ACTION_RE.test(text) || PLANNING_INTENT_RE.test(text) || PLANNING_HERE_RE.test(text) || PLANNING_SECTION_RE.test(text);
}

export async function runToolLoop({
  provider,
  messages,
  projectRoot,
  worktreeId,
  worktreeRoot,
  leaseId,
  executionMode,
  maxTurns,
  maxMs,
  startTime,
  taskDescription,
}) {
  const filesChanged = new Set();
  let totalToolCalls = 0;

  let turn = 0;
  const validationsAfterMutation = {
    typecheck: false,
    lint: false,
    astDensity: false,
    tests: false,
  };

  for (; turn < maxTurns; turn++) {
    if (Date.now() - startTime > maxMs) {
      logInfo(`[agent] Hard timeout reached (${maxMs}ms) at turn ${turn}`);
      return {
        completed: false,
        summary: "Execution timed out",
        turns: turn,
        toolCalls: totalToolCalls,
        filesChanged: [...filesChanged],
        timedOut: true,
        error: null,
        messages,
        providerName: provider.name,
      };
    }
    logDebug(`[agent] Turn ${turn + 1}/${maxTurns}`);

    let response;
    try {
      response = await callLLM(provider, messages, taskDescription, {
        projectRoot,
        worktreeId,
        _worktreeRoot: worktreeRoot,
        _leaseId: leaseId,
        _executionMode: executionMode,
      });
    } catch (err) {
      logError(`[agent] LLM call failed: ${err.message}`);
      return {
        completed: false,
        summary: `LLM call failed: ${err.message}`,
        turns: turn,
        toolCalls: totalToolCalls,
        filesChanged: [...filesChanged],
        timedOut: false,
        error: err.message,
        messages,
        providerName: provider.name,
      };
    }

    const choice = response.choices?.[0];
    const actualProviderName = response.providerName || provider.name;
    if (!choice) {
      logError("[agent] No choices in LLM response");
      return {
        completed: false,
        summary: "No choices in LLM response",
        turns: turn,
        toolCalls: totalToolCalls,
        filesChanged: [...filesChanged],
        timedOut: false,
        error: "Empty LLM response",
        messages,
        providerName: actualProviderName,
      };
    }

    const msg = choice.message;

    // Structured result contract: if bridge returned _symphonyResult, use it directly
    // This bypasses ALL heuristic text analysis for symphony-bridge (P1-2 / P2-7)
    if (response._symphonyResult) {
      const sr = response._symphonyResult;
      messages.push(msg);
      return {
        completed: sr.completed,
        summary: msg.content || "",
        turns: sr.stepCount || turn + 1,
        toolCalls: sr.toolCallCount || totalToolCalls,
        filesChanged: sr.changedFiles || [...filesChanged],
        timedOut: false,
        error: sr.failureClass,
        messages,
        needsContinuation: sr.needsContinuation,
        providerName: actualProviderName,
        mutationCount: sr.mutationCount,
        validationIntent: sr.validationIntent,
      };
    }

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      messages.push(msg);

      if (provider.name === "symphony-bridge" && !response._symphonyResult) {
        const content = (msg.content || "").trim();
        // TRACE: Detailed logging to diagnose bridge_contract_missing
        logError(`[agent] 🚨 bridge_contract_missing DETECTED`);
        logError(`[agent]   Provider: ${provider.name}`);
        logError(`[agent]   Response keys: ${Object.keys(response).join(", ")}`);
        logError(
          `[agent]   Response._symphonyResult: ${response._symphonyResult ? "present" : "MISSING"}`,
        );
        logError(`[agent]   Response.providerName: ${response.providerName}`);
        logError(`[agent]   Message.content length: ${(msg.content || "").length}`);
        logError(`[agent]   Message.tool_calls: ${msg.tool_calls?.length || 0}`);
        logError(`[agent]   Choice keys: ${Object.keys(choice).join(", ")}`);
        logError(`[agent]   Content preview: ${content.slice(0, 300)}`);
        return {
          completed: false,
          summary: content
            ? `Symphony bridge returned text without structured result: ${content}`
            : "Symphony bridge returned no structured result",
          turns: turn + 1,
          toolCalls: totalToolCalls,
          filesChanged: [...filesChanged],
          timedOut: false,
          error: "bridge_contract_missing",
          messages,
          providerName: actualProviderName,
        };
      }

      // Handle autonomous agents (like Codebuff) and streaming responses
      // that complete in one run or return content without tool calls
      if (
        (provider.requiresSdk || response.needsContinuation) &&
        msg.content &&
        msg.content.trim().length > 0
      ) {
        const content = msg.content;

        // Refined failure detection based on actual Codebuff outputs:
        // - "All X attempts failed: Timeout after XXXms" - timeout error
        // - "accounts exhausted" - all accounts rate limited
        // - "All codebuff" - all attempts failed
        const isFailure =
          (/All \d+ attempts failed/i.test(content) ||
            /accounts exhausted/i.test(content) ||
            /Timeout after \d+ms/i.test(content) ||
            (/error/i.test(content) &&
              !content.includes("Typecheck passed") &&
              !content.includes("Lint passed"))) &&
          // Exclude success patterns (be specific to avoid false negatives)
          !content.includes("✅") &&
          !content.includes("Successfully") &&
          !content.includes("passed");

        if (isFailure) {
          logWarn("[agent] Autonomous agent reported failure");
          return {
            completed: false,
            summary: `Autonomous agent failed: ${content}`,
            turns: turn + 1,
            toolCalls: totalToolCalls,
            filesChanged: [...filesChanged],
            timedOut: content.includes("Timeout"),
            error: content,
            messages,
            providerName: actualProviderName,
          };
        }

        // Parse and handle JSON metadata blocks (subgoals, lastMessage, etc.)
        let cleanContent = content;
        let hasActiveSubgoals = false;
        let subgoalSummary = [];

        // Look for lastMessage metadata anywhere in content (not just at end)
        // Use a more flexible regex that can handle nested structures
        const lastMessageMatch = content.match(/\{"type":"lastMessage","value":\[.*?\]\}/s);
        if (lastMessageMatch) {
          const metadataStr = lastMessageMatch[0];

          try {
            const metadata = JSON.parse(metadataStr);

            // Handle subgoal updates from Codebuff
            if (metadata.type === "lastMessage" && metadata.value) {
              const msgs = Array.isArray(metadata.value) ? metadata.value : [metadata.value];
              for (const msg of msgs) {
                if (msg.content && Array.isArray(msg.content)) {
                  for (const item of msg.content) {
                    if (
                      (item.toolName === "update_subgoal" || item.toolName === "add_subgoal") &&
                      item.input
                    ) {
                      const input = item.input;
                      const status = input.status || "UNKNOWN";
                      const objective = input.objective || "";
                      const log = input.log || "";

                      // Log subgoal update
                      logDebug(
                        `[agent] Subgoal ${input.id}: ${status} - ${objective.slice(0, 80)}`,
                      );
                      if (log) {
                        logDebug(`[agent]   Log: ${log.slice(0, 120)}`);
                      }

                      // Track active subgoals (IN_PROGRESS means work is ongoing)
                      if (status === "IN_PROGRESS" || status === "NOT_STARTED") {
                        hasActiveSubgoals = true;
                        const desc = objective || log || "unknown task";
                        subgoalSummary.push(
                          `Subgoal ${input.id} (${status}): ${desc.slice(0, 100)}`,
                        );
                      }
                    }
                  }
                }
              }
            }
          } catch (err) {
            logDebug(`[agent] Could not parse metadata JSON: ${err.message}`);
          }

          // Remove metadata from clean content
          cleanContent = content.replace(lastMessageMatch[0], "").trim();
        }

        // If there are active subgoals, this is NOT completion - it's ongoing work
        if (hasActiveSubgoals) {
          logDebug(`[agent] Active subgoals detected - work is ongoing, not complete`);
          return {
            completed: false,
            summary: `Agent created subgoals - work is ongoing:\n${subgoalSummary.join("\n")}`,
            turns: turn + 1,
            toolCalls: totalToolCalls,
            filesChanged: [...filesChanged],
            timedOut: false,
            error: null,
            messages,
            needsContinuation: true,
            providerName: actualProviderName,
          };
        }

        // No active subgoals - agent actually completed
        logInfo("[agent] Autonomous agent completed - no active subgoals");
        const summary = cleanContent;
        return {
          completed: true,
          summary: summary,
          turns: turn + 1,
          toolCalls: totalToolCalls,
          filesChanged: [...filesChanged],
          timedOut: false,
          error: null,
          messages,
          providerName: actualProviderName,
        };
      }

      // Check if this is a legitimate non-tool turn (planning, thinking, continuation signal)
      const content = msg.content || "";
      const isLegitimateNonToolTurn =
        // Bridge signaled continuation needed
        response.needsContinuation ||
        // Planning/understanding phrases
        isPlanningText(content) ||
        // Subgoal management activity
        /\bsubgoal/i.test(content) ||
        // Reading/context gathering
        /\b(reading|examining|looking at|checking) (the |files?|code)/i.test(content);

      if (isLegitimateNonToolTurn) {
        logDebug("[agent] Legitimate non-tool turn detected (planning/streaming/continuation)");
        if (turn < maxTurns - 1) {
          messages.push({
            role: "user",
            content:
              "Continue implementing the changes. Use the available tools to read and modify files. Call task_complete when done.",
          });
          continue;
        }
        break;
      }

      // Not a legitimate turn - this might be stuck behavior
      // But give the agent a few chances before aborting
      if (turn < maxTurns - 1) {
        logDebug("[agent] No tool calls — prompting to continue");
        messages.push({
          role: "user",
          content:
            "Continue implementing the changes. Use the available tools to read and modify files. Call task_complete when done.",
        });
        continue;
      }
      break;
    }

    messages.push(msg);

    let taskCompleteResult = null;

    for (const toolCall of msg.tool_calls) {
      totalToolCalls++;
      const toolName = toolCall.function.name;

      if (toolName === "task_complete") {
        let parsed;
        try {
          parsed = JSON.parse(toolCall.function.arguments);
        } catch {
          parsed = { summary: toolCall.function.arguments };
        }
        const missing = Object.entries(validationsAfterMutation)
          .filter(([, ran]) => !ran)
          .map(([name]) => name);
        if (missing.length > 0) {
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Error: task_complete rejected. You must run these validations after your last file change: ${missing.join(", ")}.`,
          });
          continue;
        }
        taskCompleteResult = parsed;
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: "Task marked as complete.",
        });
        continue;
      }

      logDebug(
        `[agent]   Tool: ${toolName}(${toolCall.function.arguments.slice(0, 100)}${toolCall.function.arguments.length > 100 ? "..." : ""})`,
      );

      // ENFORCEMENT: Assert mutation context BEFORE executing any file modification tool
      if (toolName === "write_file" || toolName === "patch_file" || toolName === "delete_file") {
        try {
          assertMutationContext({
            executionMode,
            worktreeId,
            leaseId,
            projectRoot,
            worktreeRoot,
          });
        } catch (err) {
          // Mutation blocked - return error to agent
          const errorMsg = `MUTATION BLOCKED: ${err.message}`;
          logError(`[agent] ${errorMsg}`);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: errorMsg,
          });
          continue;
        }
      }

      let result;
      try {
        result = executeTool(projectRoot, toolCall, { filesChanged });
      } catch (err) {
        result = `Error: ${err.message}`;
      }

      if (toolName === "write_file" || toolName === "patch_file" || toolName === "delete_file") {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          if (args.path) filesChanged.add(args.path);
        } catch {
          /* ignore parse errors */
        }
        validationsAfterMutation.typecheck = false;
        validationsAfterMutation.lint = false;
        validationsAfterMutation.astDensity = false;
        validationsAfterMutation.tests = false;
      }

      if (toolName === "run_typecheck") validationsAfterMutation.typecheck = true;
      if (toolName === "run_lint") validationsAfterMutation.lint = true;
      if (toolName === "run_ast_density") validationsAfterMutation.astDensity = true;
      if (toolName === "run_tests") validationsAfterMutation.tests = true;

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: typeof result === "string" ? result : JSON.stringify(result),
      });
    }

    if (taskCompleteResult) {
      logInfo(`[agent] Task complete: ${taskCompleteResult.summary}`);
      return {
        completed: true,
        summary: taskCompleteResult.summary || "No summary provided",
        turns: turn + 1,
        toolCalls: totalToolCalls,
        filesChanged: [...filesChanged],
        timedOut: false,
        error: null,
        messages,
        providerName: actualProviderName,
      };
    }

    const turnsRemaining = maxTurns - (turn + 1);
    if (turnsRemaining === RUNNER_TURN_BUDGET_WARNING) {
      logWarn(`[agent] Turn budget warning: ${turnsRemaining} turns remaining`);
      messages.push({
        role: "user",
        content: `⚠️ TURN BUDGET WARNING: You have only ${turnsRemaining} turns remaining out of ${maxTurns}. Stop making new changes immediately. Run run_typecheck, run_lint, run_ast_density, and run_tests to verify your work, fix any errors, then call task_complete. Do not start any new modifications.`,
      });
    }
  }

  logInfo(`[agent] Max turns (${maxTurns}) reached`);
  return {
    completed: false,
    summary: "Max turns reached without task_complete",
    turns: turn,
    toolCalls: totalToolCalls,
    filesChanged: [...filesChanged],
    timedOut: false,
    error: null,
    messages,
    providerName: provider.name,
  };
}
