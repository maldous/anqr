#!/usr/bin/env node

/**
 * symphony-agent.mjs — Tool-calling AI agent for Symphony
 *
 * Executes a tool-calling loop against an LLM provider (Ollama or cloud)
 * to implement code changes for a given Linear issue.
 *
 * Tools available to the agent:
 *   - read_file(path)                — read a project file
 *   - write_file(path, content)      — write/create a file
 *   - delete_file(path)             — delete a file or directory
 *   - patch_file(path, search, replace) — targeted str_replace
 *   - run_command(command)           — run an allowlisted read-only command
 *   - list_directory(path)           — list directory contents
 *   - run_typecheck()               — run tsc --noEmit and return errors
 *   - run_lint()                    — run oxlint and return errors/warnings
 *   - run_cspell()                  — run cspell spell checker and return errors
 *   - run_ast_density()             — run AST density audit and return violations
 *   - task_complete(summary)         — signal completion
 *
 * Limits:
 *   - MAX_TURNS: tool-calling rounds before forced stop
 *   - MAX_EXECUTION_MS: hard wall-time timeout
 *   - run_command: allowlisted read-only commands only
 *
 * Legacy lessons:
 *   - Ollama tool calling works via /v1/chat/completions
 *   - qwen3.5 may emit <think> blocks — Ollama strips them from tool_calls
 *   - Single-slot Ollama means sequential tool calls only
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
  mkdirSync,
  unlinkSync,
  rmSync,
  mkdirSync as mkDirSync,
} from "node:fs";
import { resolve, relative, dirname, join as pathJoin } from "node:path";
import { execFileSync } from "node:child_process";
import {
  RUNNER_MAX_TURNS,
  RUNNER_MAX_EXECUTION_MS,
  RUNNER_MAX_OUTPUT_TOKENS,
  RUNNER_TURN_BUDGET_WARNING,
} from "../../symphony-config.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger();
import {
  runTypecheck,
  runLint,
  runCspell,
  runAstDensity,
  runTests,
} from "../../symphony-validation.mjs";
import { REPORTS_DIR, PROJECT_ROOT } from "../../integrations/model/codebuff-sdk-runner.mjs";
import { invokeCodebuffDirect } from "../../integrations/model/codebuff-direct.mjs";
import { inferSymphonyResultFromCompletion } from "../../core/bridge-result.mjs";

const SYMPHONY_BRIDGE_URL = process.env.SYMPHONY_BRIDGE_URL || "http://127.0.0.1:4319";
const SYMPHONY_BRIDGE_API_KEY = process.env.SYMPHONY_BRIDGE_API_KEY || "local-symphony";
const SYMPHONY_BRIDGE_MODEL = process.env.SYMPHONY_MODEL_ID || "symphony/main";

// Main repo root - mutations to this directory are FORBIDDEN
const MAIN_REPO_ROOT = "/home/user/src/anqr";

// Mutation context assertion - enforce that mutating requests must run in worktrees
function assertMutationContext(ctx) {
  if (ctx.executionMode !== "mutating") return; // Read-only requests can pass through

  if (!ctx.worktreeId) {
    throw new Error("Mutation blocked: missing worktreeId - mutating requests must have assigned worktree");
  }
  if (!ctx.leaseId) {
    throw new Error("Mutation blocked: missing leaseId - mutating requests must have valid lease");
  }
  if (!ctx.projectRoot) {
    throw new Error("Mutation blocked: missing projectRoot - mutating requests must specify project root");
  }
  const resolvedProjectRoot = ctx.projectRoot.replaceAll("\\", "/");
  const resolvedMainRoot = MAIN_REPO_ROOT;
  if (resolvedProjectRoot === resolvedMainRoot) {
    throw new Error("Mutation blocked: main repo is forbidden for mutating requests - must use worktree");
  }
  if (ctx.worktreeRoot && resolvedProjectRoot !== ctx.worktreeRoot.replaceAll("\\", "/")) {
    throw new Error("Mutation blocked: projectRoot must equal worktreeRoot for mutating requests");
  }
}

function isRateLimitError(errStr) {
  const s = errStr.toLowerCase();
  return (
    s.includes("429") ||
    s.includes("rate_limit") ||
    s.includes("too many requests") ||
    s.includes("session limit") ||
    s.includes("rate_limit_exceeded") ||
    s.includes("failed after") ||
    s.includes("retryerror") ||
    s.includes("weekly limit") ||
    s.includes("subscription") ||
    s.includes("limit resets") ||
    s.includes("continue with credits")
  );
}

// ---------------------------------------------------------------------------
// Tool definitions (OpenAI function calling format)
// ---------------------------------------------------------------------------

function paramTool(name, description, properties, required) {
  return {
    type: "function",
    function: {
      name,
      description,
      parameters: { type: "object", properties, required },
    },
  };
}

function noParamTool(name, description) {
  return {
    type: "function",
    function: { name, description, parameters: { type: "object", properties: {} } },
  };
}

const pathParam = { path: { type: "string", description: "File path relative to project root" } };

const TOOL_DEFINITIONS = [
  paramTool(
    "read_file",
    "Read a file from the project. Returns the full file content.",
    pathParam,
    ["path"],
  ),
  paramTool(
    "write_file",
    "Write or create a file with the given content. Creates parent directories if needed. Do NOT use this with empty content to delete files — use delete_file instead.",
    { ...pathParam, content: { type: "string", description: "Complete file content to write" } },
    ["path", "content"],
  ),
  paramTool(
    "delete_file",
    "Delete a file or directory (recursively) from the project. Use this to remove files — do NOT use write_file with empty content.",
    { path: { type: "string", description: "File or directory path relative to project root" } },
    ["path"],
  ),
  paramTool(
    "patch_file",
    "Make a targeted edit to a file by replacing the first occurrence of a search string with a replacement string. Use this for small, precise edits.",
    {
      ...pathParam,
      search: { type: "string", description: "Exact string to find (first occurrence)" },
      replace: { type: "string", description: "Replacement string" },
    },
    ["path", "search", "replace"],
  ),
  paramTool(
    "run_command",
    "Run a read-only shell command. Only allowlisted commands: rg, grep, cat, ls, find, head, tail, wc, tree, file, echo, pwd. No pipes, redirects, or chaining.",
    { command: { type: "string", description: "Shell command to run" } },
    ["command"],
  ),
  paramTool(
    "list_directory",
    "List files and directories at the given path.",
    { path: { type: "string", description: "Directory path relative to project root" } },
    ["path"],
  ),
  noParamTool(
    "run_typecheck",
    "Run the TypeScript compiler (tsc --noEmit) to check for type errors. Returns the compiler output. Always run this after making changes and fix any errors before calling task_complete.",
  ),
  noParamTool(
    "run_lint",
    "Run the linter (oxlint) to check for lint errors and warnings. Returns the linter output. Always run this after making changes and fix any errors or warnings before calling task_complete.",
  ),
  noParamTool(
    "run_cspell",
    'Run the spell checker (cspell) on source files. Returns any misspelled words. If a domain-specific word is flagged, add it to the "words" array in cspell.json. Always run this after making changes and fix any issues before calling task_complete.',
  ),
  noParamTool(
    "run_ast_density",
    "Run the AST density audit on source files. Each file should have at most 1 top-level declaration (function, class, type, or const). If a file exceeds the threshold, split it into smaller files. Always run this after making changes and fix any violations before calling task_complete.",
  ),
  noParamTool(
    "run_tests",
    "Run the unit test suite used by the runner. Always run this after making changes and fix any failures before calling task_complete.",
  ),
  paramTool(
    "task_complete",
    "Signal that you have finished implementing the changes. You MUST run run_typecheck, run_lint, run_cspell, and run_ast_density first and fix any errors or warnings before calling this.",
    { summary: { type: "string", description: "Brief summary of what was changed and why" } },
    ["summary"],
  ),
];

const ALLOWED_COMMANDS = new Set([
  "rg",
  "grep",
  "cat",
  "ls",
  "find",
  "head",
  "tail",
  "wc",
  "tree",
  "file",
  "echo",
  "pwd",
]);

const REQUEST_TIMEOUT_MS = 900_000; // 15 min — sufficient for large-context turns and complex operations

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

function validatePath(projectRoot, filePath) {
  const resolved = resolve(projectRoot, filePath);
  const rel = relative(projectRoot, resolved);
  if (rel.startsWith("..") || resolve(projectRoot, rel) !== resolved) {
    throw new Error(`Path escapes project root: ${filePath}`);
  }
  if (rel.includes("node_modules") || rel === ".git" || rel.startsWith(".git/")) {
    throw new Error(`Access denied: ${filePath}`);
  }
  return resolved;
}

function toolReadFile(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path);
  if (!existsSync(fullPath)) {
    return `Error: File not found: ${args.path}`;
  }
  const stat = statSync(fullPath);
  if (stat.isDirectory()) {
    return `Error: ${args.path} is a directory, not a file. Use list_directory instead.`;
  }
  if (stat.size > 100_000) {
    return `Error: File too large (${stat.size} bytes). Use run_command with head/tail for partial reads.`;
  }
  return readFileSync(fullPath, "utf-8");
}

function toolWriteFile(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path);
  const dir = dirname(fullPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(fullPath, args.content, "utf-8");
  return `Written: ${args.path} (${args.content.length} chars)`;
}

function toolDeleteFile(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path);
  const rel = relative(projectRoot, fullPath);

  // Guard: never delete the project root itself
  if (!rel || rel === ".") {
    return "Error: Cannot delete the project root.";
  }

  // Guard: must be inside a git working tree
  try {
    const gitRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: projectRoot,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    if (!fullPath.startsWith(gitRoot + "/") && fullPath !== gitRoot) {
      return `Error: Path is outside the git repository: ${args.path}`;
    }
  } catch {
    return "Error: Not inside a git repository — delete_file is disabled.";
  }

  // Guard: block deletion of top-level directories (e.g. src/, scripts/, docs/)
  const depth = rel.split("/").length;
  if (depth === 1 && existsSync(fullPath) && statSync(fullPath).isDirectory()) {
    return `Error: Cannot delete top-level directory "${rel}/". Delete its contents individually instead.`;
  }

  if (!existsSync(fullPath)) {
    return `Error: Not found: ${args.path}`;
  }
  const stat = statSync(fullPath);
  if (stat.isDirectory()) {
    try {
      rmSync(fullPath, { recursive: true });
      return `Deleted directory: ${args.path}`;
    } catch (err) {
      return `Error: Could not delete directory ${args.path}: ${err.message}`;
    }
  }
  unlinkSync(fullPath);
  return `Deleted: ${args.path}`;
}

function toolPatchFile(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path);
  if (!existsSync(fullPath)) {
    return `Error: File not found: ${args.path}`;
  }
  const content = readFileSync(fullPath, "utf-8");
  const idx = content.indexOf(args.search);
  if (idx === -1) {
    return `Error: Search string not found in ${args.path}. Ensure the search string is an exact match including whitespace.`;
  }
  const patched = content.slice(0, idx) + args.replace + content.slice(idx + args.search.length);
  writeFileSync(fullPath, patched, "utf-8");
  return `Patched: ${args.path} (replaced ${args.search.length} chars at offset ${idx})`;
}

function toolRunCommand(projectRoot, args) {
  const cmd = (args.command || "").trim();
  if (/[|;&><$`]/.test(cmd)) {
    return "Error: Pipes, redirects, chaining, and variable expansion are not allowed.";
  }
  const parts = cmd.split(/\s+/);
  if (!ALLOWED_COMMANDS.has(parts[0])) {
    return `Error: Command "${parts[0]}" is not in the allowlist. Allowed: ${[...ALLOWED_COMMANDS].join(", ")}`;
  }
  try {
    const output = execFileSync(parts[0], parts.slice(1), {
      cwd: projectRoot,
      timeout: 15_000,
      maxBuffer: 512 * 1024,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const trimmed = output.length > 8000 ? output.slice(0, 8000) + "\n... (truncated)" : output;
    return trimmed || "(no output)";
  } catch (err) {
    const stderr = err.stderr ? String(err.stderr).slice(0, 2000) : "";
    const stdout = err.stdout ? String(err.stdout).slice(0, 2000) : "";
    return `Command exited with code ${err.status || 1}:\n${stdout}\n${stderr}`.trim();
  }
}

function toolListDirectory(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path || ".");
  if (!existsSync(fullPath)) {
    return `Error: Directory not found: ${args.path}`;
  }
  const stat = statSync(fullPath);
  if (!stat.isDirectory()) {
    return `Error: ${args.path} is a file, not a directory. Use read_file instead.`;
  }
  const entries = readdirSync(fullPath, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name + "/");
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  return [...dirs.sort(), ...files.sort()].join("\n") || "(empty directory)";
}

function toolRunTypecheck(projectRoot) {
  const result = runTypecheck(projectRoot);
  return result.pass ? "Typecheck passed — no errors." : result.detail;
}

function toolRunAstDensity(projectRoot, changedFiles) {
  const result = runAstDensity(projectRoot, changedFiles);
  return result.pass ? "AST density passed — no violations." : result.detail;
}

function toolRunCspell(projectRoot, changedFiles) {
  const result = runCspell(projectRoot, changedFiles);
  return result.pass ? "Spell check passed — no issues." : result.detail;
}

function toolRunLint(projectRoot) {
  const result = runLint(projectRoot);
  return result.pass ? "Lint passed — no errors or warnings." : result.detail;
}

function toolRunTests(projectRoot) {
  const result = runTests(projectRoot);
  return result.pass ? "Unit tests passed." : result.detail;
}

function executeTool(projectRoot, toolCall, context = {}) {
  const name = toolCall.function.name;
  const changedFiles = [...(context.filesChanged || [])];

  if (name === "run_typecheck") return toolRunTypecheck(projectRoot);
  if (name === "run_lint") return toolRunLint(projectRoot);
  if (name === "run_cspell") return toolRunCspell(projectRoot, changedFiles);
  if (name === "run_ast_density") return toolRunAstDensity(projectRoot, changedFiles);
  if (name === "run_tests") return toolRunTests(projectRoot);

  let args;
  try {
    args = JSON.parse(toolCall.function.arguments);
  } catch {
    return `Error: Invalid JSON arguments: ${toolCall.function.arguments}`;
  }

  switch (name) {
    case "read_file":
      return toolReadFile(projectRoot, args);
    case "write_file":
      return toolWriteFile(projectRoot, args);
    case "delete_file":
      return toolDeleteFile(projectRoot, args);
    case "patch_file":
      return toolPatchFile(projectRoot, args);
    case "run_command":
      return toolRunCommand(projectRoot, args);
    case "list_directory":
      return toolListDirectory(projectRoot, args);
    default:
      return `Error: Unknown tool: ${name}`;
  }
}

// ---------------------------------------------------------------------------
// LLM API call
// ---------------------------------------------------------------------------

async function callLLM(provider, messages, taskDescription, projectRoot = PROJECT_ROOT, worktreeId = null, _worktreeRoot = null, _leaseId = null, _executionMode = null) {
  if (provider.name === "symphony-bridge") {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SYMPHONY_BRIDGE_API_KEY}`,
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
        throw new Error(`Symphony bridge ${res.status}: ${body.slice(0, 500)}`);
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
        error: String(err?.message || err).slice(0, 500),
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
      throw new Error(`LLM API ${res.status}: ${body.slice(0, 500)}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Build issue prompt
// ---------------------------------------------------------------------------

function buildIssuePrompt(issue) {
  const lines = [`## Goal: ${issue.identifier} — ${issue.title}`, ""];

  if (issue.description) {
    lines.push("### Goal Description", "", issue.description, "");
  }

  const aiHints = (issue.comments?.nodes || [])
    .filter((c) => c.body.includes("AI Hint:") || c.body.includes("AI hint:"))
    .map((c) => c.body);
  if (aiHints.length > 0) {
    lines.push("### AI Hints", "", ...aiHints, "");
  }

  lines.push(
    "### Your Goal",
    "",
    "Your goal is to achieve the outcome described above. To accomplish this goal, you should:",
    "",
    "1. Create appropriate subtasks (using subgoal tools if available) to break down the goal into achievable steps",
    "2. **CRITICAL: If this is a multi-phase issue, FIRST verify that all previous phases completed successfully.**",
    "   - Check for comments indicating previous phase failures (provider errors, model errors, timeouts)",
    "   - If a previous phase failed, DO NOT proceed to the next phase",
    "   - Instead, complete the failed phase first before moving forward",
    "   - This prevents building on incomplete or failed work",
    "3. Read relevant files to understand the current state",
    "4. Plan your changes to achieve the goal",
    "5. Make the minimal necessary changes using write_file, patch_file, or delete_file",
    "6. Run run_typecheck to verify there are no type errors",
    "7. If there are type errors, fix them and run run_typecheck again",
    "8. Run run_lint to verify there are no lint errors or warnings",
    "9. If there are lint errors or warnings, fix them and run run_lint again",
    "10. Run run_cspell to verify there are no spelling errors",
    '11. If there are spelling errors, fix them or add domain-specific words to the "words" array in cspell.json',
    "12. Run run_ast_density to verify no file has more than 1 top-level declaration",
    "13. Run run_tests to verify the unit test suite passes",
    "14. If there are density violations or test failures, fix them before proceeding",
    "15. Call task_complete with a summary of how you achieved the goal",
    "",
    "Keep changes minimal. Focus on achieving the goal with the least amount of modification.",
    "IMPORTANT: Always run run_typecheck, run_lint, run_cspell, run_ast_density, AND run_tests before calling task_complete. Fix all errors and warnings first.",
    "IMPORTANT: For multi-phase issues, verify previous phase completion BEFORE starting new work to avoid building on failed foundations.",
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Core tool-calling loop (shared by runAgent and continueAgent)
// ---------------------------------------------------------------------------

async function runToolLoop({
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
    cspell: false,
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
      response = await callLLM(provider, messages, taskDescription, projectRoot, worktreeId, worktreeRoot, leaseId, executionMode);
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
        summary: (msg.content || "").slice(0, 1000),
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
        logError(`[agent]   Response._symphonyResult: ${response._symphonyResult ? "present" : "MISSING"}`);
        logError(`[agent]   Response.providerName: ${response.providerName}`);
        logError(`[agent]   Message.content length: ${(msg.content || "").length}`);
        logError(`[agent]   Message.tool_calls: ${msg.tool_calls?.length || 0}`);
        logError(`[agent]   Choice keys: ${Object.keys(choice).join(", ")}`);
        logError(`[agent]   Content preview: ${content.slice(0, 300)}`);
        return {
          completed: false,
          summary: content
            ? `Symphony bridge returned text without structured result: ${content.slice(0, 500)}`
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
            summary: `Autonomous agent failed: ${content.slice(0, 500)}`,
            turns: turn + 1,
            toolCalls: totalToolCalls,
            filesChanged: [...filesChanged],
            timedOut: content.includes("Timeout"),
            error: content.slice(0, 500),
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
        const summary = cleanContent.slice(0, 1000);
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
        /\b(let me (understand|read|check|analyze|review)|I('ll| will) (start by|need to|first)|here('s| is) my plan|steps?:|approach:|thinking:|analyzing:|reviewing:)/i.test(
          content,
        ) ||
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
        validationsAfterMutation.cspell = false;
        validationsAfterMutation.astDensity = false;
        validationsAfterMutation.tests = false;
      }

      if (toolName === "run_typecheck") validationsAfterMutation.typecheck = true;
      if (toolName === "run_lint") validationsAfterMutation.lint = true;
      if (toolName === "run_cspell") validationsAfterMutation.cspell = true;
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
        content: `⚠️ TURN BUDGET WARNING: You have only ${turnsRemaining} turns remaining out of ${maxTurns}. Stop making new changes immediately. Run run_typecheck, run_lint, run_cspell, run_ast_density, and run_tests to verify your work, fix any errors, then call task_complete. Do not start any new modifications.`,
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

// ---------------------------------------------------------------------------
// Public: start a new agent session
// ---------------------------------------------------------------------------

export async function runAgent({ provider, issue, projectRoot, worktreeId, worktreeRoot, leaseId, executionMode, systemPrompt, maxMs }) {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: buildIssuePrompt(issue) },
  ];
  const taskDescription = issue ? `${issue.identifier}: ${issue.title}` : "Symphony agent run";
  return runToolLoop({
    provider,
    messages,
    projectRoot,
    worktreeId,
    worktreeRoot,
    leaseId,
    executionMode,
    maxTurns: RUNNER_MAX_TURNS,
    maxMs: maxMs || RUNNER_MAX_EXECUTION_MS,
    startTime: Date.now(),
    taskDescription,
  });
}

// ---------------------------------------------------------------------------
// Public: continue an existing session with validation feedback
// ---------------------------------------------------------------------------

export async function continueAgent({
  provider,
  messages,
  projectRoot,
  worktreeId,
  worktreeRoot,
  leaseId,
  executionMode,
  feedback,
  maxTurns,
  maxMs,
  taskDescription,
}) {
  messages.push({ role: "user", content: feedback });
  return runToolLoop({
    provider,
    messages,
    projectRoot,
    worktreeId,
    worktreeRoot,
    leaseId,
    executionMode,
    maxTurns,
    maxMs,
    startTime: Date.now(),
    taskDescription: taskDescription || "Symphony agent continuation",
  });
}
