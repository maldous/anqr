import {
  RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS,
} from "../../../symphony-config.mjs";
import { TIER_FREE_CLOUD } from "./tier-free-cloud.mjs";
import { TIER_PAID } from "./tier-paid.mjs";
import { probeCodexSdk } from "./probe-codex-sdk.mjs";
import { probeCodebuff } from "./probe-codebuff.mjs";
import { probeGeminiModels } from "./probe-gemini-models.mjs";
import { probeGitHubModels } from "./probe-git-hub-models.mjs";

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
      name: "codebuff-paid",
      tier: TIER_PAID,
      model: process.env.CODEBUFF_MODEL_ID || "codebuff/base",
      baseUrl: "codebuff-sdk",
      envVar: "CODEBUFF_API_KEY",
      driver: "codebuff-sdk",
      requiresSdk: true,
      costMode: "paid",
      sessionMode: "paid",
      failureWindowSecs: RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS,
      probe: (provider) => probeCodebuff(provider),
    },
    {
      name: "codebuff-free",
      tier: TIER_FREE_CLOUD,
      model: process.env.CODEBUFF_MODEL_ID || "codebuff/base",
      baseUrl: "codebuff-sdk",
      envVar: "CODEBUFF_API_KEY",
      driver: "codebuff-sdk",
      requiresSdk: true,
      costMode: "free",
      sessionMode: "free",
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
    // cerebras llama3.1-8b excluded — 8B params is below the minimum coding
    // capability threshold (14B). It produces false-positive completions
    // (calls task_complete without writing any code). Replaced by dynamic
    // catalog providers that respect the MIN_CODING_PARAMS_B filter.
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
    // ollama 3b/0.5b excluded — below 14B minimum coding capability.
    // They produce false-positive completions with zero file changes.
    // Re-enable only if a larger model (e.g. qwen2.5-coder:14b) is available.
    {
      name: "deepseek",
      model: "deepseek-v4-pro",
      baseUrl: "https://api.deepseek.com/v1",
      envVar: "DEEPSEEK_TOKEN",
    },
  ];
}
