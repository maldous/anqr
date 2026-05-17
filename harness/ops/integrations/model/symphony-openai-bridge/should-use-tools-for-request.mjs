const SIMPLE_CHAT_RE =
  /\b(who are you|what are you|what can you do|hello|hi|hey|thanks|thank you|ok|okay|test|ping|are you there|help)\b/i;
const TOOL_KEYWORDS_RE = /\b(read|write|edit|patch|replace|search|grep|find|open|inspect|fix|change|run|execute|test|lint|build|compile|commit|branch|worktree|file|files|directory|repo|repository|code|log|logs|trace|debug|issue|ticket|linear|discord|provider|probe|service|systemd|curl|http|api|json|yaml|markdown|md|tsconfig|eslint|vitest|jest|docker|kubernetes|helm|grafana|alloy|otlp|zip)\b/i;
const TOOL_SYMBOLS_RE = /[`$]/;
const TOOL_PATH_RE = /\/[\w.-]+/;
const TOOL_FILE_EXT_RE = /\b[a-z0-9_-]+\.(?:mjs|js|ts|tsx|json|md|yaml|yml|sh|py|txt|zip)\b/i;

function hasToolIntent(text) {
  return TOOL_KEYWORDS_RE.test(text) || TOOL_SYMBOLS_RE.test(text) || TOOL_PATH_RE.test(text) || TOOL_FILE_EXT_RE.test(text);
}

export function shouldUseToolsForRequest(messages = [], route = null) {
  const force = String(process.env.SYMPHONY_FORCE_TOOLS || "") === "1";
  const disable = String(process.env.SYMPHONY_DISABLE_TOOLS || "") === "1";
  if (force) return true;
  if (disable) return false;

  const latestUserContent = [...messages]
    .reverse()
    .find((message) => message?.role === "user")?.content;
  const latestUserText = Array.isArray(latestUserContent)
    ? latestUserContent
        .map((part) => (typeof part === "string" ? part : part?.text || ""))
        .join("\n")
    : typeof latestUserContent === "string"
      ? latestUserContent
      : "";
  const normalized = latestUserText.trim();

  if (!normalized) return false;
  if (
    SIMPLE_CHAT_RE.test(normalized) &&
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
