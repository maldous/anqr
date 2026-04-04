// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:3493

import { MODEL_ID } from "./model-id.mjs";

export function normalizeModelId(modelId) {
  if (!modelId) {
    return MODEL_ID;
  }
  if (modelId.startsWith("symphony-bridge/")) {
    return modelId.slice("symphony-bridge/".length);
  }
  if (modelId === "symphony/main@latest" || modelId === "main@latest" || modelId === "main") {
    return "symphony/main";
  }
  return modelId;
}
