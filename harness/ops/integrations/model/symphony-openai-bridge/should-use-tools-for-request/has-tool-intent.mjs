const TOOL_SYMBOLS_RE = /[`$]/;
const TOOL_PATH_RE = /\/[\w.-]+/;
const TOOL_FILE_EXT_RE = /\b[a-z0-9_-]+\.(?:mjs|js|ts|tsx|json|md|yaml|yml|sh|py|txt|zip)\b/i;

const CODE_OPS_RE = /\b(read|write|edit|patch|replace|search|grep|find|open|inspect|fix|change)\b/i;
const EXEC_RE = /\b(run|execute|test|lint|build|compile)\b/i;
const GIT_FILE_RE = /\b(commit|branch|worktree|file|files|directory|repo|repository|code)\b/i;
const DEBUG_ISSUE_RE = /\b(log|logs|trace|debug|issue|ticket|linear|discord)\b/i;
const INFRA_RE = /\b(provider|probe|service|systemd|curl|http|api|json|yaml|markdown|md|tsconfig|eslint|vitest|jest)\b/i;
const OPS_RE = /\b(docker|kubernetes|helm|grafana|alloy|otlp|zip)\b/i;

export function hasToolIntent(text) {
  return CODE_OPS_RE.test(text) || EXEC_RE.test(text) || GIT_FILE_RE.test(text) || DEBUG_ISSUE_RE.test(text) || INFRA_RE.test(text) || OPS_RE.test(text) || TOOL_SYMBOLS_RE.test(text) || TOOL_PATH_RE.test(text) || TOOL_FILE_EXT_RE.test(text);
}
