import { buildPrompt } from "./build-prompt.mjs";
import { getApiKey } from "./get-api-key.mjs";
import { isRecoverableError } from "./is-recoverable-error.mjs";
import { normalizeCwd } from "./normalize-cwd.mjs";
import { tryMode } from "./try-mode.mjs";
import { logWarn } from "./logger.mjs";

export async function invokeCodebuffDirect({ messages, cwd }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("CODEBUFF_API_KEY is not set");
  }

  const normalizedCwd = normalizeCwd(cwd);
  const prompt = buildPrompt(messages);

  try {
    return await tryMode(apiKey, normalizedCwd, undefined, prompt, null);
  } catch (err) {
    const errStr = err?.message || String(err);
    if (!isRecoverableError(errStr)) throw err;
    logWarn(`[codebuff-direct] paid mode failed, retrying free mode: ${errStr.slice(0, 160)}`);
    return tryMode(apiKey, normalizedCwd, "free", prompt, null);
  }
}
