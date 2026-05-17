import { buildPrompt } from "./build-prompt.mjs";
import { getApiKey } from "./get-api-key.mjs";
import { normalizeCwd } from "./normalize-cwd.mjs";
import { tryMode } from "./try-mode.mjs";

export async function invokeCodebuffDirectStream({
  messages,
  cwd,
  onTextChunk,
  costMode = undefined,
}) {
  const apiKey = getApiKey(costMode);
  if (!apiKey) {
    throw new Error("CODEBUFF_API_KEY is not set");
  }

  const normalizedCwd = normalizeCwd(cwd);
  const prompt = buildPrompt(messages);

  return tryMode(apiKey, normalizedCwd, costMode, prompt, onTextChunk);
}
