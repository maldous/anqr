// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:3044

import { createOpenAI } from "@ai-sdk/openai";

export function createOpenAiCompatibleModel(model, apiKey, baseURL, fallbackApiKey) {
  return createOpenAI({
    baseURL,
    apiKey: apiKey || fallbackApiKey,
    compatibility: "compatible",
    // .chat() forces /v1/chat/completions — required for non-OpenAI providers
    // (AI SDK v6 defaults to /v1/responses which third-party APIs don't support)
  }).chat(model);
}
