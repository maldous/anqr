// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:3054

import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { OPENROUTER_PROVIDER_NAME_SET } from "./openrouter-provider-name-set.mjs";
import { createOpenAiCompatibleModel } from "./create-open-ai-compatible-model.mjs";
import { logError } from "./logger.mjs";

export function createProviderModel(provider) {
  const { name, model, baseUrl, apiKey } = provider;

  if (name === "groq") {
    return createGroq({ apiKey })(model);
  }
  if (name === "gemini" || name === "gemini-lite") {
    return createGoogleGenerativeAI({ apiKey })(model);
  }
  if (OPENROUTER_PROVIDER_NAME_SET.has(name)) {
    return createOpenRouter({ apiKey })(model);
  }
  if (name === "mistral") {
    return createOpenAiCompatibleModel(model, apiKey, "https://api.mistral.ai/v1");
  }
  if (name === "codex") {
    return createOpenAiCompatibleModel(model, apiKey, baseUrl || "https://api.openai.com/v1");
  }
  if (name === "sambanova") {
    return createOpenAiCompatibleModel(model, apiKey, baseUrl || "https://api.sambanova.ai/v1");
  }
  if (name === "cerebras") {
    return createOpenAiCompatibleModel(model, apiKey, baseUrl || "https://api.cerebras.ai/v1");
  }
  if (name === "github-models") {
    return createOpenAiCompatibleModel(
      model,
      apiKey,
      baseUrl || "https://models.github.ai/inference/v1",
    );
  }
  if (name === "ollama-local" || name.startsWith("ollama-qwen")) {
    return createOpenAiCompatibleModel(
      model,
      apiKey,
      baseUrl || "http://127.0.0.1:11434/v1",
      "ollama",
    );
  }
  if (!baseUrl) {
    logError(`Provider ${name} not supported - no baseUrl for default fallback`);
    throw new Error(`Provider ${name} not supported - no baseUrl for default fallback`);
  }
  return createOpenAiCompatibleModel(model, apiKey, baseUrl);
}
