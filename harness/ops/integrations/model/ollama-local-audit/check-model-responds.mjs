// Generated from ../../../../scripts/ops/integrations/model/ollama-local-audit.mjs:71

import { OLLAMA_BASE } from "./ollama-base.mjs";
import { PINNED_MODEL } from "./pinned-model.mjs";
import { PROMPT_TIMEOUT_MS } from "./prompt-timeout-ms.mjs";
import { record } from "./record.mjs";

export async function checkModelResponds() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROMPT_TIMEOUT_MS);
    const start = Date.now();
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: PINNED_MODEL,
        prompt: "Reply OK",
        stream: false,
        options: { num_predict: 8, temperature: 0 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await res.json();
    const elapsed = Date.now() - start;
    const evalCount = data.eval_count || 0;
    if (evalCount > 0) {
      record("model-responds", true, `Model generated ${evalCount} tokens in ${elapsed}ms`);
      return true;
    }
    record("model-responds", false, `No tokens generated after ${elapsed}ms`);
    return false;
  } catch (err) {
    record("model-responds", false, `Prompt failed: ${err.message}`);
    return false;
  }
}
