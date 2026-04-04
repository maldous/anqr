import { tool } from "ai";
import { z } from "zod";
import { execSync, execFileSync } from "node:child_process";
import { getSearchStats as getHybridSearchStats } from "../../../lib/search/hybrid-search.mjs";
import { getLinearIndexStats } from "../../../lib/search/linear-search.mjs";

import { CONTEXT7_HTTP_BASE } from "./context7-http-base.mjs";
import { addMessageTool } from "./add-message-tool.mjs";
import { addSubgoalTool } from "./add-subgoal-tool.mjs";
import { applyPatchTool } from "./apply-patch-tool.mjs";
import { askUserTool } from "./ask-user-tool.mjs";
import { calculateTimeoutMs } from "./calculate-timeout-ms.mjs";
import { codeSearchTool } from "./code-search-tool.mjs";
import { coerceOptionalNumberInput } from "./coerce-optional-number-input.mjs";
import { coerceStringArrayInput } from "./coerce-string-array-input.mjs";
import { execTool } from "./exec-tool.mjs";
import { findFilesTool } from "./find-files-tool.mjs";
import { getCurrentRequestCwd } from "./get-current-request-cwd.mjs";
import { globTool } from "./glob-tool.mjs";
import { listDirectoryTool } from "./list-directory-tool.mjs";
import { lookupAgentInfoTool } from "./lookup-agent-info-tool.mjs";
import { memoryGetTool } from "./memory-get-tool.mjs";
import { memorySearchTool } from "./memory-search-tool.mjs";
import { proposeStrReplaceTool } from "./propose-str-replace-tool.mjs";
import { proposeWriteFileTool } from "./propose-write-file-tool.mjs";
import { readDocsTool } from "./read-docs-tool.mjs";
import { readFileTool } from "./read-file-tool.mjs";
import { readFilesTool } from "./read-files-tool.mjs";
import { readSubtreeTool } from "./read-subtree-tool.mjs";
import { resolveRequestDir } from "./resolve-request-dir.mjs";
import { runFileChangeHooksTool } from "./run-file-change-hooks-tool.mjs";
import { searchLinearIssuesTool } from "./search-linear-issues-tool.mjs";
import { setMessagesTool } from "./set-messages-tool.mjs";
import { setOutputTool } from "./set-output-tool.mjs";
import { skillTool } from "./skill-tool.mjs";
import { spawnAgentsTool } from "./spawn-agents-tool.mjs";
import { strReplaceTool } from "./str-replace-tool.mjs";
import { suggestFollowupsTool } from "./suggest-followups-tool.mjs";
import { taskCompletedTool } from "./task-completed-tool.mjs";
import { thinkDeeplyTool } from "./think-deeply-tool.mjs";
import { updateSubgoalTool } from "./update-subgoal-tool.mjs";
import { voiceSpeakTool } from "./voice-speak-tool.mjs";
import { webSearchTool } from "./web-search-tool.mjs";
import { writeFileTool } from "./write-file-tool.mjs";
import { writeTodosTool } from "./write-todos-tool.mjs";

export const tools = {
  code_search: tool({
    description: "Search for string patterns in the project's files using ripgrep",
    inputSchema: z.object({
      pattern: z.string().describe("The pattern to search for"),
      flags: z.string().optional().describe("Optional ripgrep flags"),
      cwd: z.string().optional().describe("Working directory to search within"),
      maxResults: z.number().optional().describe("Maximum results per file (default 15)"),
    }),
    execute: codeSearchTool,
  }),
  read_files: tool({
    description: "Read multiple files from the filesystem",
    inputSchema: z.object({
      paths: z.preprocess(
        (val) => coerceStringArrayInput(val, { fallback: [] }),
        z.array(z.string()).describe("List of file paths to read (accepts string or array)"),
      ),
    }),
    execute: readFilesTool,
  }),
  str_replace: tool({
    description: "Replace strings in a file with new strings",
    inputSchema: z.object({
      path: z.string().describe("Path to the file to edit"),
      replacements: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
              try {
                const parsed = JSON.parse(trimmed);
                return Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                return [];
              }
            }
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            old: z.string().describe("String to replace"),
            new: z.string().describe("Replacement string"),
            allowMultiple: z.boolean().optional().describe("Allow multiple replacements"),
          }),
        ),
      ),
    }),
    execute: strReplaceTool,
  }),
  list_directory: tool({
    description: "List files and directories in a path",
    inputSchema: z.object({
      path: z.string().describe("Directory path to list"),
    }),
    execute: listDirectoryTool,
  }),
  read_subtree: tool({
    description: "Read directory subtree with file contents",
    inputSchema: z.object({
      paths: z.preprocess(
        (val) => coerceStringArrayInput(val, { fallback: ["."] }),
        z
          .array(z.string())
          .optional()
          .describe("Paths to read (default: ['.']; accepts string or array)"),
      ),
      maxTokens: z.preprocess(
        (val) => coerceOptionalNumberInput(val, undefined),
        z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Maximum token budget (default: 50000; accepts numeric string)"),
      ),
    }),
    execute: readSubtreeTool,
  }),
  spawn_agents: tool({
    description: "Spawn multiple agents to run in parallel",
    inputSchema: z.object({
      agents: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            agent_type: z.string().describe("Agent to spawn"),
            prompt: z.string().optional().describe("Prompt to send"),
            params: z.record(z.any()).optional().describe("Parameters object"),
          }),
        ),
      ),
    }),
    execute: spawnAgentsTool,
  }),
  propose_str_replace: tool({
    description: "Propose string replacements without applying them",
    inputSchema: z.object({
      path: z.string().describe("Path to the file"),
      replacements: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            old: z.string().describe("String to replace"),
            new: z.string().describe("Replacement string"),
            allowMultiple: z.boolean().optional().describe("Allow multiple replacements"),
          }),
        ),
      ),
    }),
    execute: proposeStrReplaceTool,
  }),
  propose_write_file: tool({
    description: "Propose creating or editing a file without applying",
    inputSchema: z.object({
      path: z.string().describe("Path to the file"),
      instructions: z.string().describe("What the change is intended to do"),
      content: z.string().describe("Edit snippet to apply"),
    }),
    execute: proposeWriteFileTool,
  }),
  add_message: tool({
    description: "Add a message to the conversation history",
    inputSchema: z.object({
      role: z.enum(["user", "assistant"]).describe("Message role"),
      content: z.string().describe("Message content"),
    }),
    execute: addMessageTool,
  }),
  set_messages: tool({
    description: "Set the conversation history",
    inputSchema: z.object({
      messages: z.preprocess((val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (!trimmed) return [];
          try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [];
          }
        }
        if (val && typeof val === "object") return [val];
        return [];
      }, z.array(z.any()).describe("Array of messages (accepts string or array)")),
    }),
    execute: setMessagesTool,
  }),
  set_output: tool({
    description: "Set the agent output",
    inputSchema: z.any(),
    execute: setOutputTool,
  }),
  skill: tool({
    description: "Load a skill's instructions",
    inputSchema: z.object({
      name: z.string().describe("Skill name"),
    }),
    execute: skillTool,
  }),
  suggest_followups: tool({
    description: "Suggest followup prompts to the user",
    inputSchema: z.object({
      followups: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            prompt: z.string().describe("Full prompt text"),
            label: z.string().optional().describe("Short display label"),
          }),
        ),
      ),
    }),
    execute: suggestFollowupsTool,
  }),
  task_completed: tool({
    description: "Signal that the task is complete",
    inputSchema: z.object({}),
    execute: taskCompletedTool,
  }),
  write_todos: tool({
    description: "Write a todo list to track tasks",
    inputSchema: z.object({
      todos: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            task: z.string().describe("Task description"),
            completed: z.boolean().describe("Whether task is completed"),
          }),
        ),
      ),
    }),
    execute: writeTodosTool,
  }),
  apply_patch: tool({
    description: "Apply a file operation using Codex-style patch format",
    inputSchema: z.object({
      operation: z.object({
        type: z.enum(["create_file", "update_file", "delete_file"]).describe("Operation type"),
        path: z.string().describe("File path"),
        diff: z.string().optional().describe("Diff content"),
      }),
    }),
    execute: applyPatchTool,
  }),
  ask_user: tool({
    description: "Ask the user multiple choice questions",
    inputSchema: z.object({
      questions: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (!trimmed) return [];
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            question: z.string().describe("Question to ask"),
            header: z.string().optional().describe("Short label"),
            options: z.preprocess(
              (val) => {
                if (Array.isArray(val)) return val;
                if (typeof val === "string") {
                  const trimmed = val.trim();
                  if (!trimmed) return [];
                  try {
                    const parsed = JSON.parse(trimmed);
                    return Array.isArray(parsed) ? parsed : [parsed];
                  } catch {
                    return [];
                  }
                }
                if (val && typeof val === "object") return [val];
                return [];
              },
              z.array(
                z.object({
                  label: z.string().describe("Option label"),
                  description: z.string().optional().describe("Option description"),
                }),
              ),
            ),
            multiSelect: z.boolean().optional().describe("Allow multiple selection"),
            validation: z
              .object({
                maxLength: z.number().optional(),
                minLength: z.number().optional(),
                pattern: z.string().optional(),
                patternError: z.string().optional(),
              })
              .optional(),
          }),
        ),
      ),
    }),
    execute: askUserTool,
  }),
  lookup_agent_info: tool({
    description: "Retrieve information about an agent by ID",
    inputSchema: z.object({
      agentId: z.string().describe("Agent ID"),
    }),
    execute: lookupAgentInfoTool,
  }),
  exec: tool({
    description: "Execute a shell command and return the output",
    inputSchema: z.object({
      command: z.string().describe("Shell command to execute"),
      cwd: z.string().optional().describe("Working directory for the command"),
    }),
    execute: execTool,
  }),
  read: tool({
    description: "Read a file from the filesystem",
    inputSchema: z.object({
      path: z.string().describe("Path to the file to read"),
      offset: z.number().optional().describe("Line offset to start reading from"),
      lines: z.number().optional().describe("Number of lines to read"),
    }),
    execute: readFileTool,
  }),
  read_file: tool({
    description: "Read a file from the filesystem (alias for read)",
    inputSchema: z.object({
      path: z.string().describe("Path to the file to read"),
      offset: z.number().optional().describe("Line offset to start reading from"),
      lines: z.number().optional().describe("Number of lines to read"),
    }),
    execute: readFileTool,
  }),
  write: tool({
    description: "Write content to a file",
    inputSchema: z.object({
      path: z.string().describe("Path to the file to write"),
      content: z.string().describe("Content to write to the file"),
    }),
    execute: writeFileTool,
  }),
  glob: tool({
    description: "Find files matching a glob pattern",
    inputSchema: z.object({
      pattern: z.string().describe("Glob pattern (e.g., '*.ts')"),
      cwd: z.string().optional().describe("Directory to search in"),
    }),
    execute: globTool,
  }),
  memory_search: tool({
    description:
      "Search through memory and knowledge files (MEMORY.md, knowledge.md) for specific content",
    inputSchema: z.object({
      query: z.string().describe("Search query to find in memory files"),
    }),
    execute: memorySearchTool,
  }),
  memory_get: tool({
    description: "Get the full content of a memory or knowledge file",
    inputSchema: z.object({
      file: z
        .string()
        .optional()
        .describe("File to read: MEMORY.md (default), knowledge.md, or CLAUDE.md"),
    }),
    execute: memoryGetTool,
  }),
  run_file_change_hooks: tool({
    description: "Execute file change hooks for modified files",
    inputSchema: z.object({
      files: z.preprocess((val) => {
        // Normalize to array: handle string, array, or malformed input
        // This workaround handles the Codebuff SDK bug where it passes a single string
        // instead of an array (see docs/known-issues/codebuff-sdk-run-file-change-hooks.md)
        if (Array.isArray(val)) {
          // Already an array - filter out non-strings and return
          const filtered = val.filter((item) => typeof item === "string" && item.trim());
          return filtered.length > 0 ? filtered : [];
        }
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (!trimmed) return [];
          // Handle JSON-encoded arrays like '["file1.ts", "file2.ts"]'
          if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed)) {
                const filtered = parsed.filter((item) => typeof item === "string" && item.trim());
                return filtered.length > 0 ? filtered : [];
              }
              return [trimmed];
            } catch {
              // JSON parse failed - treat the whole string as a single file path
              return [trimmed];
            }
          }
          // Single string - wrap in array (this is the Codebuff SDK bug case)
          return [trimmed];
        }
        // Fallback: return empty array
        return [];
      }, z.array(z.string()).describe("List of file paths that were changed (accepts string or array)")),
    }),
    execute: runFileChangeHooksTool,
  }),
  think_deeply: tool({
    description:
      "Deeply consider complex tasks by brainstorming approaches and tradeoffs step-by-step",
    inputSchema: z.object({
      thought: z.string().describe("Detailed step-by-step analysis"),
    }),
    execute: thinkDeeplyTool,
  }),
  update_subgoal: tool({
    description: "Update a subgoal to track progress on multi-step tasks",
    inputSchema: z.object({
      id: z.string().describe("The id of the subgoal to update"),
      status: z
        .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETE", "ABORTED"])
        .optional()
        .describe("Change the status of the subgoal"),
      log: z.string().optional().describe("Add a log message to the subgoal"),
      plan: z.string().optional().describe("Change the plan for the subgoal"),
    }),
    execute: updateSubgoalTool,
  }),
  add_subgoal: tool({
    description: "Add a new subgoal for tracking progress on complex requests",
    inputSchema: z.object({
      id: z.string().describe("A unique identifier for the subgoal"),
      objective: z.string().describe("The objective of the subgoal, concisely and clearly stated"),
      status: z
        .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETE", "ABORTED"])
        .optional()
        .describe("The status of the subgoal"),
      log: z.string().optional().describe("A log message for the subgoal progress"),
      plan: z.string().optional().describe("A plan for the subgoal"),
    }),
    execute: addSubgoalTool,
  }),
  find_files: tool({
    description:
      "Find files using local hybrid search first (BM25 + semantic embeddings/RAG), with basic filename fallback. Prefer this before broad code_search when you only need likely files.",
    inputSchema: z.object({
      prompt: z
        .string()
        .describe(
          "Natural language description of files to find, or function/class name. Mention directories to narrow search.",
        ),
    }),
    execute: findFilesTool,
  }),
  web_search: tool({
    description: "Search the web for current information using Linkup API",
    inputSchema: z.object({
      query: z.string().describe("The search query to find relevant web content"),
      depth: z
        .enum(["standard", "deep"])
        .optional()
        .describe(
          "Search depth - 'standard' for quick results, 'deep' for comprehensive search. Default is 'standard'.",
        ),
    }),
    execute: webSearchTool,
  }),
  read_docs: tool({
    description:
      "Fetch up-to-date documentation using ANQR's local Context7 MCP/HTTP service first, with cloud Context7 fallback only if local resolution is unavailable",
    inputSchema: z.object({
      libraryTitle: z
        .string()
        .describe(
          "The library or framework name (e.g., 'Next.js', 'MongoDB', 'React'). Use official name as it appears in documentation.",
        ),
      topic: z
        .string()
        .describe("Specific topic to focus on (e.g., 'routing', 'hooks', 'authentication')"),
      max_tokens: z
        .number()
        .optional()
        .describe(
          "Maximum number of tokens to return. Defaults to 20000. Values less than 10000 are automatically increased to 10000.",
        ),
    }),
    execute: readDocsTool,
  }),
  search_linear_issues: tool({
    description:
      "Search the local Linear RAG index for relevant ANQR issues using cached local retrieval. Prefer this before direct Linear API lookups when you need prior issue context.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "Natural-language search query for prior Linear issues, incidents, regressions, or decisions",
        ),
      limit: z.number().optional().describe("Maximum number of matches to return. Defaults to 5."),
    }),
    execute: searchLinearIssuesTool,
  }),

  // ========================================================================
  // Codebuff-native aliases (critical — these are the canonical tool names
  // used by the Codebuff SDK and many models trained on Codebuff docs)
  // ========================================================================

  run_terminal_command: tool({
    description:
      "Execute a shell command and return the output (Codebuff-native name for exec/shell)",
    inputSchema: z.object({
      command: z.string().describe("CLI command valid for user's OS"),
      cwd: z.string().optional().describe("Working directory for the command"),
      timeout_seconds: z.preprocess(
        (val) => coerceOptionalNumberInput(val, undefined),
        z.number().optional().describe("Timeout in seconds (default 30, -1 for no timeout)"),
      ),
    }),
    execute: async ({ command, cwd, timeout_seconds }) => {
      const timeoutMs = calculateTimeoutMs(timeout_seconds);
      try {
        const result = execSync(command, {
          cwd: resolveRequestDir(cwd),
          encoding: "utf-8",
          timeout: timeoutMs || undefined,
          maxBuffer: 10 * 1024 * 1024,
        });
        return { output: result, exitCode: 0 };
      } catch (error) {
        return {
          output: error.stdout || error.message,
          exitCode: error.status || 1,
          error: error.message,
        };
      }
    },
  }),
  write_file: tool({
    description: "Create or overwrite a file with the given content (Codebuff-native)",
    inputSchema: z.object({
      path: z.string().describe("Path to the file relative to the project root"),
      instructions: z.string().optional().describe("What the change is intended to do"),
      content: z.string().describe("Complete file content to write"),
    }),
    execute: async ({ path: filePath, content }) => writeFileTool({ path: filePath, content }),
  }),
  end_turn: tool({
    description: "Signal that the current turn is complete",
    inputSchema: z.object({}),
    execute: taskCompletedTool,
  }),
  create_plan: tool({
    description: "Create a step-by-step plan for a task (alias for write_todos)",
    inputSchema: z.object({
      steps: z.preprocess(
        (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            try {
              const p = JSON.parse(val);
              return Array.isArray(p) ? p : [p];
            } catch {
              return [];
            }
          }
          if (val && typeof val === "object") return [val];
          return [];
        },
        z.array(
          z.object({
            step: z.string().optional().describe("Step description"),
            task: z.string().optional().describe("Task description"),
            completed: z.boolean().optional().describe("Whether step is done"),
          }),
        ),
      ),
    }),
    execute: async ({ steps }) => {
      const todos = steps.map((s) => ({
        task: s.task || s.step || "(unnamed step)",
        completed: s.completed || false,
      }));
      return writeTodosTool({ todos });
    },
  }),
  browser_logs: tool({
    description: "Check browser console logs (limited — no live browser in this environment)",
    inputSchema: z.object({
      url: z.string().optional().describe("URL to check"),
    }),
    execute: async () => ({
      message:
        "Browser logs are not available in this headless environment. Use run_terminal_command with a linter or test runner instead.",
      logs: [],
    }),
  }),

  // ========================================================================
  // Cross-provider compatibility shims (map external provider tool names
  // to our canonical implementations)
  // ========================================================================

  message: tool({
    description: "Add a message to the conversation (compatibility alias for add_message)",
    inputSchema: z.object({
      role: z.enum(["user", "assistant"]).optional().describe("Message role"),
      content: z.string().describe("Message content"),
    }),
    execute: async ({ role, content }) => addMessageTool({ role: role || "assistant", content }),
  }),
  thinker: tool({
    description: "Think deeply about a problem (alias for think_deeply)",
    inputSchema: z.object({
      thought: z.string().optional().describe("The thought or problem to analyze"),
      prompt: z.string().optional().describe("The problem to think about"),
    }),
    execute: async ({ thought, prompt }) =>
      thinkDeeplyTool({ thought: thought || prompt || "(no thought provided)" }),
  }),
  shell: tool({
    description: "Execute a shell command (OpenAI shell tool compatibility)",
    inputSchema: z.object({
      command: z.string().describe("Shell command to execute"),
      cwd: z.string().optional().describe("Working directory"),
    }),
    execute: execTool,
  }),
  local_shell: tool({
    description: "Execute a command on the local machine (alias for exec/shell)",
    inputSchema: z.object({
      command: z.string().describe("Shell command to execute"),
      cwd: z.string().optional().describe("Working directory"),
    }),
    execute: execTool,
  }),
  code_interpreter: tool({
    description: "Execute code in a sandbox (runs via local shell — Python, Node, etc.)",
    inputSchema: z.object({
      code: z.string().optional().describe("Code to execute"),
      command: z.string().optional().describe("Shell command to execute the code"),
      language: z.string().optional().describe("Programming language (python, javascript, etc.)"),
    }),
    execute: async ({ code, command, language }) => {
      // If a raw shell command is provided, use execTool directly
      if (command) return execTool({ command });
      if (!code) return { error: "No code or command provided" };

      // Use execFileSync to avoid shell escaping issues with user-provided code
      const lang = (language || "python").toLowerCase();
      let bin, args;
      if (lang === "python" || lang === "python3") {
        bin = "python3";
        args = ["-c", code];
      } else if (lang === "javascript" || lang === "node" || lang === "js") {
        bin = "node";
        args = ["-e", code];
      } else if (lang === "bash" || lang === "sh") {
        bin = "bash";
        args = ["-c", code];
      } else {
        bin = "python3";
        args = ["-c", code];
      }
      try {
        const result = execFileSync(bin, args, {
          cwd: getCurrentRequestCwd(),
          encoding: "utf-8",
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024,
        });
        return { output: result, exitCode: 0 };
      } catch (error) {
        return {
          output: error.stdout || error.message,
          exitCode: error.status || 1,
          error: error.message,
        };
      }
    },
  }),
  file_search: tool({
    description:
      "Search local project context using ANQR's native retrieval stack: code_search for exact query/pattern matches and hybrid RAG-backed find_files for natural-language prompts",
    inputSchema: z.object({
      query: z.string().optional().describe("Search query"),
      pattern: z.string().optional().describe("Search pattern"),
      prompt: z.string().optional().describe("Natural language file description"),
    }),
    execute: async ({ query, pattern, prompt }) => {
      if (pattern || query) {
        return codeSearchTool({ pattern: pattern || query });
      }
      if (prompt) {
        return findFilesTool({ prompt });
      }
      return { error: "Provide a query, pattern, or prompt to search" };
    },
  }),
  browser_search: tool({
    description: "Search the web interactively (Groq GPT-OSS compatibility — uses web_search)",
    inputSchema: z.object({
      query: z.string().describe("Search query"),
    }),
    execute: async ({ query }) => webSearchTool({ query }),
  }),
  visit_website: tool({
    description: "Fetch or navigate to a specific web page (uses web search as best-effort)",
    inputSchema: z.object({
      url: z.string().optional().describe("URL to visit"),
      query: z.string().optional().describe("Search query if no URL"),
    }),
    execute: async ({ url, query }) => {
      const searchQuery = url || query || "";
      if (!searchQuery) return { error: "Provide a url or query" };
      return webSearchTool({ query: searchQuery });
    },
  }),

  // ========================================================================
  // Graceful no-ops for tools that exist on other platforms but cannot be
  // implemented locally. Return a helpful message instead of crashing.
  // ========================================================================

  image_generation: tool({
    description: "Generate or edit images from prompts (not available in this environment)",
    inputSchema: z.object({
      prompt: z.string().optional().describe("Image generation prompt"),
      size: z.string().optional().describe("Image size"),
    }),
    execute: async ({ prompt }) => ({
      error: "image_generation is not available in this environment",
      message: `Cannot generate image for: ${(prompt || "").slice(0, 100)}. Use a web-based image generation service instead.`,
      available: false,
    }),
  }),
  wolfram_alpha: tool({
    description:
      "Query Wolfram Alpha for computation (not available — use code_interpreter instead)",
    inputSchema: z.object({
      query: z.string().describe("Mathematical or scientific query"),
    }),
    execute: async ({ query }) => {
      // Best-effort: try to evaluate with python (using execFileSync to avoid shell escaping issues)
      try {
        const output = execFileSync("python3", ["-c", `print(eval(${JSON.stringify(query)}))`], {
          encoding: "utf-8",
          timeout: 10000,
          maxBuffer: 1024 * 1024,
        });
        return { result: output, source: "python_eval" };
      } catch {
        /* fall through */
      }
      return {
        error: "wolfram_alpha is not available in this environment",
        message: `Use code_interpreter or run_terminal_command with python to compute: ${query.slice(0, 100)}`,
        suggestion: "Use python3 or node for mathematical computation",
      };
    },
  }),
  browser_automation: tool({
    description: "Automate browser interactions (not available in this headless environment)",
    inputSchema: z.object({
      action: z.string().optional().describe("Browser action to perform"),
      url: z.string().optional().describe("URL to navigate to"),
    }),
    execute: async () => ({
      error: "browser_automation is not available in this environment",
      message: "Use Playwright tests (npm run test:basic) or web_search for web interactions.",
      available: false,
    }),
  }),
  computer_use: tool({
    description: "Control computer UI (not available in this headless environment)",
    inputSchema: z.object({
      action: z.string().optional().describe("UI action to perform"),
      coordinate: z.array(z.number()).optional().describe("Screen coordinates"),
      text: z.string().optional().describe("Text to type"),
    }),
    execute: async () => ({
      error: "computer_use is not available in this environment",
      message:
        "This is a headless server environment. Use run_terminal_command for CLI operations.",
      available: false,
    }),
  }),
  tts: tool({
    description:
      "Text-to-speech synthesis (not available — use voice_speak to speak in Discord voice channels instead)",
    inputSchema: z.object({
      text: z.string().optional().describe("Text to synthesize"),
      input: z.string().optional().describe("Text input"),
    }),
    execute: async () => ({
      error: "tts is not available in this environment",
      message:
        "Text-to-speech is not supported in this headless server environment. Use voice_speak to speak in Discord voice channels instead.",
      available: false,
      suggestion: "Use the voice_speak tool to speak text in a Discord voice channel via TTS.",
    }),
  }),
  voice_speak: tool({
    description:
      "Speak text in a Discord voice channel via TTS through the OpenClaw Gateway. " +
      "The bot must already be connected to a voice channel. " +
      "Omit guildId to use the first active voice session.",
    inputSchema: z.object({
      text: z.string().describe("Text to speak in the Discord voice channel via TTS"),
      guildId: z
        .string()
        .optional()
        .describe("Optional Discord guild ID. Uses first active voice session if omitted."),
    }),
    execute: voiceSpeakTool,
  }),
  connector_gmail: tool({
    description: "Gmail connector (not available — requires Groq connector setup)",
    inputSchema: z.object({
      action: z.string().optional().describe("Gmail action"),
      query: z.string().optional().describe("Search query"),
    }),
    execute: async () => ({
      error: "connector_gmail is not available in this environment",
      message: "Gmail connector requires Groq platform. Not available locally.",
      available: false,
    }),
  }),
  connector_googlecalendar: tool({
    description: "Google Calendar connector (not available — requires Groq connector setup)",
    inputSchema: z.object({
      action: z.string().optional().describe("Calendar action"),
    }),
    execute: async () => ({
      error: "connector_googlecalendar is not available in this environment",
      message: "Google Calendar connector requires Groq platform. Not available locally.",
      available: false,
    }),
  }),
  connector_googledrive: tool({
    description: "Google Drive connector (not available — requires Groq connector setup)",
    inputSchema: z.object({
      action: z.string().optional().describe("Drive action"),
      query: z.string().optional().describe("Search query"),
    }),
    execute: async () => ({
      error: "connector_googledrive is not available in this environment",
      message: "Google Drive connector requires Groq platform. Not available locally.",
      available: false,
    }),
  }),
  mcp_list_tools: tool({
    description:
      "List the locally available tools plus ANQR-native context systems such as Context7 docs resolution and hybrid RAG/file retrieval",
    inputSchema: z.object({
      server: z.string().optional().describe("MCP server name"),
    }),
    execute: async () => {
      let context7 = {
        configured: true,
        reachable: false,
        endpoint: `${CONTEXT7_HTTP_BASE}/health`,
      };
      try {
        const res = await fetch(`${CONTEXT7_HTTP_BASE}/health`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          context7 = {
            configured: true,
            reachable: data.status === "ok" || data.status === "degraded",
            endpoint: `${CONTEXT7_HTTP_BASE}/health`,
            status: data.status,
          };
        }
      } catch {
        // best effort only
      }

      return {
        available_tools: Object.keys(tools),
        native_context: {
          context7,
          rag_search: {
            preferred_tools: [
              "read_docs",
              "search_linear_issues",
              "find_files",
              "file_search",
              "code_search",
            ],
            stats: getHybridSearchStats(),
          },
          linear_rag: getLinearIndexStats(),
        },
        preferred_workflow: [
          "Use read_docs for library/framework questions before web_search.",
          "Use search_linear_issues when you need prior ANQR issue context before calling the Linear API directly.",
          "Use find_files or file_search for natural-language repository discovery before broad glob/code scans.",
          "Use code_search after file discovery when exact symbols or strings are needed.",
        ],
        message:
          "MCP server tools are not directly exposed through this bridge, but ANQR-native Context7 and hybrid RAG retrieval are available through the local tools above.",
      };
    },
  }),
};
