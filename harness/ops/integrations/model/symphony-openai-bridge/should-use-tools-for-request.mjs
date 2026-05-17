import { getContentText } from "./should-use-tools-for-request/get-content-text.mjs";
import { isSimpleChat } from "./should-use-tools-for-request/is-simple-chat.mjs";
import { hasToolIntent } from "./should-use-tools-for-request/has-tool-intent.mjs";

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
