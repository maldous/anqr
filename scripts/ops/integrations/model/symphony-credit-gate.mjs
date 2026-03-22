#!/usr/bin/env node

/**
 * symphony-credit-gate.mjs — Provider cascade for Symphony agent
 *
 * Probes providers in priority order (matching legacy codex-credit-gate.sh),
 * skips recently-failed providers, and returns the first available provider.
 *
 * Cascade order (best-to-worst):
 *   1. Codex (OpenAI)  — cloud, gpt-5.4 (when credits available)
 *   2. Codebuff        — cloud, codebuff/base (programmatic SDK)
 *   3. Groq            — free cloud, fast, llama-3.3-70b-versatile
 *   4. Mistral         — free experimental tier, devstral-small-2507
 *   5. Gemini          — free cloud tier, gemini-2.5-flash
 *   6. Gemini Lite     — separate quota, gemini-2.5-flash-lite
 *   7. OpenRouter FREE — free :free models, llama-3.3-70b-instruct
 *   8. SambaNova       — free cloud, 20 req/day, llama-3.3-70b
 *   9. Cerebras        — free cloud, 1M tok/day, 8K context, llama3.1-8b
 *  10. GitHub Models   — free, gpt-4.1-mini
 *  11. Ollama local    — local fallback, qwen3.5:35b-a3b-32t
 *
 * All probes use lightweight /v1/models listings (not generation requests)
 * to preserve free-tier quotas.
 *
 * Legacy lessons encoded:
 *   - Always probe before selecting
 *   - Track failures with a time window (skip broken providers for 360s)
 *   - Ollama is the last-resort local fallback
 *   - State files live in /run/user/ for crash recovery
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  RUNNER_OLLAMA_MODEL,
  RUNNER_OLLAMA_BASE_URL,
  RUNNER_PROVIDER_FAILURE_WINDOW_SECS,
} from "../../symphony-config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "../../../..");
const STATE_DIR = resolve(PROJECT_ROOT, "reports", "symphony");
const FAILURE_STATE_FILE = resolve(STATE_DIR, "provider-failures.json");

const PROBE_TIMEOUT_MS = 5_000;

// ---------------------------------------------------------------------------
// Probe helpers
// ---------------------------------------------------------------------------

async function probeWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

async function probeOpenAIModels(baseUrl, model, apiKey) {
  const res = await probeWithTimeout(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res || !res.ok) return false;
  const text = await res.text();
  return text.includes(model);
}

async function probeGeminiModels(apiKey, model) {
  const res = await probeWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
  );
  if (!res || !res.ok) return false;
  const text = await res.text();
  return text.includes(model);
}

async function probeGitHubModels(apiKey, model) {
  const res = await probeWithTimeout("https://models.github.ai/catalog/models", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${apiKey}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res || !res.ok) return false;
  const text = await res.text();
  return text.includes(model);
}

async function probeOllama() {
  const res = await probeWithTimeout(`${RUNNER_OLLAMA_BASE_URL.replace("/v1", "")}/api/tags`);
  if (!res || !res.ok) return false;
  try {
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    return models.includes(RUNNER_OLLAMA_MODEL);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Provider definitions — cascade order matches legacy codex-credit-gate.sh
// ---------------------------------------------------------------------------

const PROVIDERS = [
  {
    name: "codex",
    model: "gpt-5.4",
    baseUrl: "https://api.openai.com/v1",
    envVar: "OPENAI_API_KEY",
    useMaxCompletionTokens: true,
  },
  {
    name: "codebuff",
    model: "codebuff/base@latest",
    baseUrl: "codebuff",
    envVar: "CODEBUFF_API_KEY",
    requiresSdk: true,
  },
  {
    name: "openclaw",
    model: "openclaw:main",
    baseUrl: "http://127.0.0.1:18789/v1",
    envVar: "OPENCLAW_TOKEN",
    // Token loaded from ~/.openclaw/openclaw.json gateway.auth.token
    // Can override with OPENCLAW_TOKEN env var
    loadToken: () => {
      const openclawConfig = path.join(process.env.HOME || process.env.USERPROFILE || "", ".openclaw", "openclaw.json");
      try {
        if (existsSync(openclawConfig)) {
          const config = JSON.parse(readFileSync(openclawConfig, "utf-8"));
          return config.gateway?.auth?.token || null;
        }
      } catch {}
      return null;
    },
    // Custom probe - check if gateway port is reachable (simplified)
    probe: async () => {
      const res = await probeWithTimeout("http://127.0.0.1:18789/");
      return res !== null;
    },
  },
  {
    name: "groq",
    model: "llama-3.3-70b-versatile",
    baseUrl: "https://api.groq.com/openai/v1",
    envVar: "GROQ_TOKEN",
  },
  {
    name: "mistral",
    model: "devstral-small-2507",
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
    name: "ollama-local",
    model: RUNNER_OLLAMA_MODEL,
    baseUrl: RUNNER_OLLAMA_BASE_URL,
    envVar: null,
    probe: () => probeOllama(),
  },
];

// ---------------------------------------------------------------------------
// Failure memory
// ---------------------------------------------------------------------------

function ensureStateDir() {
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
  }
}

function loadFailures() {
  try {
    return JSON.parse(readFileSync(FAILURE_STATE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveFailures(failures) {
  ensureStateDir();
  writeFileSync(FAILURE_STATE_FILE, JSON.stringify(failures, null, 2));
}

function isRecentlyFailed(providerName) {
  const failures = loadFailures();
  const failedAt = failures[providerName];
  if (!failedAt) return false;
  const now = Math.floor(Date.now() / 1000);
  return now - failedAt < RUNNER_PROVIDER_FAILURE_WINDOW_SECS;
}

export function recordProviderFailure(providerName) {
  const failures = loadFailures();
  failures[providerName] = Math.floor(Date.now() / 1000);
  saveFailures(failures);
}

export function clearProviderFailure(providerName) {
  const failures = loadFailures();
  delete failures[providerName];
  saveFailures(failures);
}

// ---------------------------------------------------------------------------
// Main: select best available provider
// ---------------------------------------------------------------------------

export async function selectProvider() {
  ensureStateDir();

  for (const provider of PROVIDERS) {
    // Get API key: first try env var, then try loadToken function
    let apiKey = provider.envVar ? process.env[provider.envVar] : null;
    
    // If no env var and loadToken function exists, try loading token
    if (!apiKey && provider.loadToken) {
      apiKey = await provider.loadToken();
    }

    if (provider.envVar && !apiKey) {
      console.log(`[credit-gate] ${provider.name}: skipped (no ${provider.envVar})`);
      continue;
    }

    if (isRecentlyFailed(provider.name)) {
      console.log(`[credit-gate] ${provider.name}: skipped (recently failed)`);
      continue;
    }

    // SDK-based providers (like Codebuff) don't need HTTP probing
    if (provider.requiresSdk) {
      console.log(`[credit-gate] ${provider.name}: using SDK ✅`);
      clearProviderFailure(provider.name);
      return {
        name: provider.name,
        model: provider.model,
        baseUrl: provider.baseUrl,
        apiKey: apiKey || null,
        requiresSdk: true,
        cwd: PROJECT_ROOT,
      };
    }

    console.log(`[credit-gate] ${provider.name}: probing...`);
    const available = provider.probe
      ? await provider.probe(provider, apiKey)
      : await probeOpenAIModels(provider.baseUrl, provider.model, apiKey);

    if (available) {
      console.log(`[credit-gate] ${provider.name}: available ✅`);
      clearProviderFailure(provider.name);
      return {
        name: provider.name,
        model: provider.model,
        baseUrl: provider.baseUrl,
        apiKey: apiKey || null,
        useMaxCompletionTokens: provider.useMaxCompletionTokens || false,
      };
    }

    console.log(`[credit-gate] ${provider.name}: unavailable ❌`);
  }

  return null;
}
