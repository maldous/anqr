import { noParamTool } from "./no-param-tool.mjs";
import { paramTool } from "./param-tool.mjs";
import { pathParam } from "./path-param.mjs";

export const TOOL_DEFINITIONS = [
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
    "run_ast_density",
    "Run the AST density audit on source files. Each file should have at most 1 top-level declaration (function, class, type, or const). If a file exceeds the threshold, split it into smaller files. Always run this after making changes and fix any violations before calling task_complete.",
  ),
  noParamTool(
    "run_tests",
    "Run the unit test suite used by the runner. Always run this after making changes and fix any failures before calling task_complete.",
  ),
  paramTool(
    "task_complete",
    "Signal that you have finished implementing the changes. You MUST run run_typecheck, run_lint and run_ast_density first and fix any errors or warnings before calling this.",
    { summary: { type: "string", description: "Brief summary of what was changed and why" } },
    ["summary"],
  ),
];
