import {
  RUNNER_OLLAMA_BASE_URL,
  RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS,
} from "../../../symphony-config.mjs";

import { TIER_LOCAL_SAFETY_NET } from "./tier-local-safety-net.mjs";
import { TIER_PAID } from "./tier-paid.mjs";
import { probeCodexSdk } from "./probe-codex-sdk.mjs";
import { probeGeminiModels } from "./probe-gemini-models.mjs";
import { probeGitHubModels } from "./probe-git-hub-models.mjs";
import { probeOllamaModel } from "./probe-ollama-model.mjs";

export const PROVIDERS = [
  {
    name: "codex",
    tier: TIER_PAID,
    model: process.env.CODEX_MODEL || "gpt-5-codex",
    baseUrl: "codex-sdk",
    envVar: null,
    driver: "codex-sdk",
    failureWindowSecs: RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS,
    probe: (provider) => probeCodexSdk(provider.model),
  },

  {
    name: "groq",
    model: "llama-3.3-70b-versatile",
    baseUrl: "https://api.groq.com/openai/v1",
    envVar: "GROQ_TOKEN",
  },
  {
    name: "mistral",
    model: "mistral-small-latest",
    baseUrl: "https://api.mistral.ai/v1",
    envVar: "MISTRAL_TOKEN",
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
  // OpenRouter FREE models — 27 free tier models ranked by quality score
  // See: https://openrouter.ai/docs/models/rankings
  {
    name: "openrouter-nemotron-super",
    model: "nvidia/nemotron-3-super-120b-a12b:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-free",
    model: "openrouter/free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-nemotron-nano-30b",
    model: "nvidia/nemotron-3-nano-30b-a3b:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-qwen3-next-80b",
    model: "qwen/qwen3-next-80b-a3b-instruct:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-step3-5-flash",
    model: "stepfun/step-3.5-flash:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-trinity-mini",
    model: "arcee-ai/trinity-mini:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-nemotron-nano-9b",
    model: "nvidia/nemotron-nano-9b-v2:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-minimax-m2.5",
    model: "minimax/minimax-m2.5:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-qwen3-coder",
    model: "qwen/qwen3-coder:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-lfm-2.5-thinking",
    model: "liquid/lfm-2.5-1.2b-thinking:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-lfm-2.5-instruct",
    model: "liquid/lfm-2.5-1.2b-instruct:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-nemotron-nano-12b-vl",
    model: "nvidia/nemotron-nano-12b-v2-vl:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-trinity-large",
    model: "arcee-ai/trinity-large-preview:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-mistral-small-3.1",
    model: "mistralai/mistral-small-3.1-24b-instruct:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-llama-3.3-70b",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-qwen3-4b",
    model: "qwen/qwen3-4b:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-gpt-oss-120b",
    model: "openai/gpt-oss-120b:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-gpt-oss-20b",
    model: "openai/gpt-oss-20b:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-llama-3.2-3b",
    model: "meta-llama/llama-3.2-3b-instruct:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-dolphin-mistral",
    model: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-gemma-3-27b",
    model: "google/gemma-3-27b-it:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-glm-4.5-air",
    model: "z-ai/glm-4.5-air:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-gemma-3n-e2b",
    model: "google/gemma-3n-e2b-it:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-gemma-3-4b",
    model: "google/gemma-3-4b-it:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-gemma-3n-e4b",
    model: "google/gemma-3n-e4b-it:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-gemma-3-12b",
    model: "google/gemma-3-12b-it:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "openrouter-hermes-3-405b",
    model: "nousresearch/hermes-3-llama-3.1-405b:free",
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
  },
  {
    name: "sambanova",
    model: "Meta-Llama-3.3-70B-Instruct",
    baseUrl: "https://api.sambanova.ai/v1",
    envVar: "SAMBANOVA_TOKEN",
  },
  {
    name: "cerebras",
    model: "llama3.1-8b",
    baseUrl: "https://api.cerebras.ai/v1",
    envVar: "CEREBRAS_TOKEN",
  },
  {
    name: "github-models",
    model: "gpt-4.1-mini",
    baseUrl: "https://models.github.ai/inference/v1",
    envVar: "GITHUB_MODELS_TOKEN",
    probe: (_p, apiKey) => probeGitHubModels(apiKey, "gpt-4.1-mini"),
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
