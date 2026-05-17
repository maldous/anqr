function getContentText(content) {
  if (Array.isArray(content)) {
    return content.map((part) => (typeof part === "string" ? part : part?.text || "")).join("\n");
  }
  return typeof content === "string" ? content : "";
}

const GREETINGS_RE = /\b(hello|hi|hey)\b/i;
const THANKS_RE = /\b(thanks|thank you)\b/i;
const QUESTIONS_RE = /\b(who are you|what are you|what can you do)\b/i;
const ACKS_RE = /\b(ok|okay|are you there)\b/i;
const TEST_RE = /\b(test|ping)\b/i;
const HELP_RE = /\b(help)\b/i;

function isSimpleChat(text) {
  return GREETINGS_RE.test(text) || THANKS_RE.test(text) || QUESTIONS_RE.test(text) || ACKS_RE.test(text) || TEST_RE.test(text) || HELP_RE.test(text);
}

const TOOL_SYMBOLS_RE = /[`$]/;
const TOOL_PATH_RE = /\/[\w.-]+/;
const TOOL_FILE_EXT_RE = /\b[a-z0-9_-]+\.(?:mjs|js|ts|tsx|json|md|yaml|yml|sh|py|txt|zip)\b/i;

const CODE_OPS_RE = /\b(read|write|edit|patch|replace|search|grep|find|open|inspect|fix|change)\b/i;
const EXEC_RE = /\b(run|execute|test|lint|build|compile)\b/i;
const GIT_FILE_RE = /\b(commit|branch|worktree|file|files|directory|repo|repository|code)\b/i;
const DEBUG_ISSUE_RE = /\b(log|logs|trace|debug|issue|ticket|linear|discord)\b/i;
const INFRA_RE = /\b(provider|probe|service|systemd|curl|http|api|json|yaml|markdown|md|tsconfig|eslint|vitest|jest)\b/i;
const OPS_RE = /\b(docker|kubernetes|helm|grafana|alloy|otlp|zip)\b/i;

function hasToolIntent(text) {
  return CODE_OPS_RE.test(text) || EXEC_RE.test(text) || GIT_FILE_RE.test(text) || DEBUG_ISSUE_RE.test(text) || INFRA_RE.test(text) || OPS_RE.test(text) || TOOL_SYMBOLS_RE.test(text) || TOOL_PATH_RE.test(text) || TOOL_FILE_EXT_RE.test(text);
}

export function shouldUseToolsForRequest(messages = [], route = null) {
  const force = String(process.env.SYMPHONY_FORCE_TOOLS || "") === "1";
  const disable = String(process.env.SYMPHONY_DISABLE_TOOLS || "") === "1";
  if (force) return true;
  if (disable) return false;

  const latestUserContent = [...messages]
    .reverse()
    .find((message) => message?.role === "user")?.content;
  const latestUserText = getContentText(latestUserContent);
  const normalized = latestUserText.trim();

  if (!normalized) return false;
  if (
    isSimpleChat(normalized) &&
    normalized.length <= 400 &&
    !hasToolIntent(normalized)
  ) {
    return false;
  }
  if (normalized.length <= 240 && !hasToolIntent(normalized)) {
    return false;
  }
  if (
    (messages?.length || 0) > 20 &&
    normalized.length <= 400 &&
    !hasToolIntent(normalized)
  ) {
    return false;
  }
  if (route?.allowedNames?.length === 1 && route.allowedNames[0]?.startsWith("ollama-")) {
    return false;
  }
  return true;
}
