import {
  RUNNER_OLLAMA_BASE_URL,
  RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS,
} from "../../../symphony-config.mjs";
import { TIER_LOCAL_SAFETY_NET } from "./tier-local-safety-net.mjs";
import { TIER_PAID } from "./tier-paid.mjs";
import { probeCodexSdk } from "./probe-codex-sdk.mjs";
import { probeCodebuff } from "./probe-codebuff.mjs";
import { probeGeminiModels } from "./probe-gemini-models.mjs";
import { probeGitHubModels } from "./probe-git-hub-models.mjs";
import { probeOllamaModel } from "./probe-ollama-model.mjs";

export function buildStaticProviders() {
  return [
    {
      name: "codex",
      tier: TIER_PAID,
      model: process.env.CODEX_MODEL || "gpt-5-codex",
      baseUrl: "codex-sdk",
      envVar: "OPENAI_API_KEY",
      driver: "codex-sdk",
      failureWindowSecs: RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS,
      probe: (provider) => probeCodexSdk(provider.model),
    },
    {
      name: "codebuff",
      tier: TIER_PAID,
      model: process.env.CODEBUFF_MODEL_ID || "codebuff/base",
      baseUrl: "codebuff-sdk",
      envVar: "CODEBUFF_API_KEY",
      driver: "codebuff-sdk",
      requiresSdk: true,
      failureWindowSecs: RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS,
      probe: (provider) => probeCodebuff(provider),
    },
    {
      name: "groq",
      model: "llama-3.3-70b-versatile",
      baseUrl: "https://api.groq.com/openai/v1",
      envVar: "GROQ_TOKEN",
      modelsUrl: "https://api.groq.com/openai/v1/models",
      catalogCacheKey: "groq",
    },
    {
      name: "mistral",
      model: "mistral-small-latest",
      baseUrl: "https://api.mistral.ai/v1",
      envVar: "MISTRAL_TOKEN",
      modelsUrl: "https://api.mistral.ai/v1/models",
      catalogCacheKey: "mistral",
    },
    {
      name: "gemini",
      model: "gemini-2.5-flash",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      envVar: "GEMINI_TOKEN",
      probe: (p, apiKey) => probeGeminiModels(apiKey, p.model),
    },
    {
      name: "gemini-lite",
      model: "gemini-2.5-flash-lite",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      envVar: "GEMINI_TOKEN",
      probe: (p, apiKey) => probeGeminiModels(apiKey, p.model),
    },
    {
      name: "sambanova",
      model: "Meta-Llama-3.3-70B-Instruct",
      baseUrl: "https://api.sambanova.ai/v1",
      envVar: "SAMBANOVA_TOKEN",
      modelsUrl: "https://api.sambanova.ai/v1/models",
      catalogCacheKey: "sambanova",
    },
    {
      name: "cerebras",
      model: "llama3.1-8b",
      baseUrl: "https://api.cerebras.ai/v1",
      envVar: "CEREBRAS_TOKEN",
      modelsUrl: "https://api.cerebras.ai/v1/models",
      catalogCacheKey: "cerebras",
    },
    {
      name: "github-models",
      model: "gpt-4.1-mini",
      baseUrl: "https://models.github.ai/inference/v1",
      envVar: "GITHUB_MODELS_TOKEN",
      modelsUrl: "https://models.github.ai/catalog/models",
      catalogCacheKey: "github-models",
      probe: (_p, apiKey) => probeGitHubModels(apiKey, "gpt-4.1-mini"),
    },
    {
      name: "huggingface",
      model: "openai/gpt-oss-20b",
      baseUrl: "https://router.huggingface.co/v1",
      envVar: "HUGGING_TOKEN",
      modelsUrl: "https://router.huggingface.co/v1/models",
      catalogCacheKey: "huggingface",
    },
    {
      name: "fireworks",
      model: "accounts/fireworks/models/deepseek-v3p1",
      baseUrl: "https://api.fireworks.ai/inference/v1",
      envVar: "FIREWORKS_KEY",
      modelsUrl: "https://api.fireworks.ai/inference/v1/models",
      catalogCacheKey: "fireworks",
    },
    {
      name: "together",
      model: "openai/gpt-oss-20b",
      baseUrl: "https://api.together.xyz/v1",
      envVar: "TOGETHER_KEY",
      modelsUrl: "https://api.together.xyz/v1/models",
      catalogCacheKey: "together",
    },
    {
      name: "ollama-qwen2.5-coder-3b",
      tier: TIER_LOCAL_SAFETY_NET,
      model: "qwen2.5-coder:3b-instruct",
      baseUrl: RUNNER_OLLAMA_BASE_URL,
      envVar: null,
      probe: () => probeOllamaModel("qwen2.5-coder:3b-instruct"),
    },
    {
      name: "ollama-qwen2.5-coder-0.5b",
      tier: TIER_LOCAL_SAFETY_NET,
      model: "qwen2.5-coder:0.5b",
      baseUrl: RUNNER_OLLAMA_BASE_URL,
      envVar: null,
      probe: () => probeOllamaModel("qwen2.5-coder:0.5b"),
    },
  ];
}
