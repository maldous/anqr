import { OLLAMA_BASE } from "./ollama-base.mjs";
import { PINNED_MODEL } from "./pinned-model.mjs";
import { record } from "./record.mjs";

export async function checkModelAvailable() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    const found = models.includes(PINNED_MODEL);
    if (found) {
      record("model-available", true, `${PINNED_MODEL} found in local model list`);
    } else {
      record(
        "model-available",
        false,
        `${PINNED_MODEL} not found. Available: ${models.join(", ") || "none"}`,
      );
    }
    return found;
  } catch (err) {
    record("model-available", false, `Failed to list models: ${err.message}`);
    return false;
  }
}
