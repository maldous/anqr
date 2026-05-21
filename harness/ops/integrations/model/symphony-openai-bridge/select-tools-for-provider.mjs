import { tools } from "./tools.mjs";
import { estimateToolOverheadTokens } from "./estimate-tool-overhead-tokens.mjs";
import { filterToolsByTier } from "./filter-tools-by-tier.mjs";
import { wrapToolsWithFallback } from "./wrap-tools-with-fallback.mjs";

const MIN_USEFUL_MESSAGE_BUDGET = 2000;

const MINIMAL_TOOL_NAMES = new Set([
  "read",
  "write",
  "exec",
  "end_turn",
  "set_output",
  "task_completed",
]);

const CORE_TOOL_NAMES = new Set([
  "read",
  "read_file",
  "read_files",
  "write",
  "write_file",
  "str_replace",
  "apply_patch",
  "exec",
  "run_terminal_command",
  "code_search",
  "list_directory",
  "glob",
  "task_completed",
  "end_turn",
  "set_output",
]);

const STANDARD_TOOL_NAMES = new Set([
  ...CORE_TOOL_NAMES,
  "spawn_agents",
  "find_files",
  "read_subtree",
  "think_deeply",
  "thinker",
  "write_todos",
  "suggest_followups",
  "ask_user",
  "memory_search",
  "memory_get",
  "web_search",
  "read_docs",
  "search_linear_issues",
  "create_linear_issue",
  "str_replace",
  "write_file",
  "add_message",
  "set_messages",
  "skill",
  "run_file_change_hooks",
  "add_subgoal",
  "update_subgoal",
  "lookup_agent_info",
  "voice_speak",
  "create_plan",
  "shell",
  "message",
  "run_typecheck",
  "run_lint",
  "run_ast_density",
  "run_tests",
]);

export function selectToolsForProvider(effectiveMaxTokens) {
  const allNames = Object.keys(tools);
  const fullCount = allNames.length;
  const standardCount = STANDARD_TOOL_NAMES.size;
  const coreCount = CORE_TOOL_NAMES.size;

  const fullOverhead = estimateToolOverheadTokens({ toolCount: fullCount });
  const standardOverhead = estimateToolOverheadTokens({ toolCount: standardCount });
  const coreOverhead = estimateToolOverheadTokens({ toolCount: coreCount });

  if (effectiveMaxTokens - fullOverhead >= MIN_USEFUL_MESSAGE_BUDGET) {
    return { tools: wrapToolsWithFallback(tools), toolCount: fullCount, tier: "full" };
  }

  if (effectiveMaxTokens - standardOverhead >= MIN_USEFUL_MESSAGE_BUDGET) {
    return {
      tools: wrapToolsWithFallback(filterToolsByTier(STANDARD_TOOL_NAMES)),
      toolCount: standardCount,
      tier: "standard",
    };
  }

  if (effectiveMaxTokens - coreOverhead >= MIN_USEFUL_MESSAGE_BUDGET) {
    return {
      tools: wrapToolsWithFallback(filterToolsByTier(CORE_TOOL_NAMES)),
      toolCount: coreCount,
      tier: "core",
    };
  }

  // Always provide at least a minimal tool set — the model was probed and
  // confirmed tool-capable, so it must never be completely neutered.
  const minimalCount = MINIMAL_TOOL_NAMES.size;
  return {
    tools: wrapToolsWithFallback(filterToolsByTier(MINIMAL_TOOL_NAMES)),
    toolCount: minimalCount,
    tier: "minimal",
  };
}
