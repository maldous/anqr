#!/usr/bin/env node

/**
 * symphony-credit-gate.mjs — Provider cascade for Symphony agent
 *
 * Probes providers in priority order (matching legacy codex-credit-gate.sh),
 * skips recently-failed providers, and returns the first available provider.
 *
 * Cascade order (best-to-worst):
 *   1. Codex (OpenAI)  — paid cloud, gpt-5.4 (temporary rate limits, 2-min cooldown)
 *   2. Codebuff        — paid cloud, codebuff/base (temporary rate limits, 2-min cooldown)
 *   3. Groq            — free cloud, fast, llama-3.3-70b-versatile
 *   4. Mistral         — free experimental tier, devstral-small-2507
 *   5. Gemini          — free cloud tier, gemini-2.5-flash
 *   6. Gemini Lite     — separate quota, gemini-2.5-flash-lite
 *   7. OpenRouter FREE — free :free models, llama-3.3-70b-instruct
 *   8. SambaNova       — free cloud, 20 req/day, llama-3.3-70b
 *   9. Cerebras        — free cloud, 1M tok/day, 8K context, llama3.1-8b
 *  10. GitHub Models   — free, gpt-4.1-mini
 *  11. Codebuff Bridge — local proxy to codebuff
 *  12. Ollama qwen3-coder-next    — local, never rate limited
 *  13. Ollama qwen2.5-coder:3b    — local, never rate limited
 *  14. Ollama qwen2.5-coder:0.5b  — local, never rate limited
 *
 * All probes use lightweight /v1/models listings (not generation requests)
 * to preserve free-tier quotas.
 *
 * Legacy lessons encoded:
 *   - Always probe before selecting
 *   - Track failures with a time window (skip broken providers for 360s)
 *   - Local Ollama models are ultimate fallbacks (never rate limited)
 *   - Paid providers (codex, codebuff) get shorter failure cooldowns (2 min vs 6 min)
 *   - State files live in /run/user/ for crash recovery
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Codex } from "@openai/codex-sdk";
import {
  RUNNER_OLLAMA_MODEL,
  RUNNER_OLLAMA_BASE_URL,
  RUNNER_PROVIDER_FAILURE_WINDOW_SECS,
  RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS,
} from "../../symphony-config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "../../../..");
const STATE_DIR = resolve(PROJECT_ROOT, "reports", "symphony");
const FAILURE_STATE_FILE = resolve(STATE_DIR, "provider-failures.json");
const STATS_FILE = resolve(STATE_DIR, "provider-stats.json");

// Provider selection statistics - comprehensive metrics
const PROVIDER_STATS = {
  // Basic counts
  selections: {},
  successes: {},
  failures: {},

  // Timing metrics (in ms)
  metricSamples: {},
  totalDuration: {},
  avgDuration: {},
  minDuration: {},
  maxDuration: {},

  // Token metrics
  totalInputTokens: {},
  totalOutputTokens: {},
  avgInputTokens: {},
  avgOutputTokens: {},

  // Quality metrics
  validationPasses: {},
  validationFailures: {},

  // Timestamps
  lastSelected: {},
  lastSuccess: {},
  lastFailure: {},
  firstUsed: {},

  // Score (dynamic ranking)
  score: {},

  // Linear issue completion metrics (per complexity level)
  linearCompleted: {},
  linearFailed: {},
  linearHighPrioritySuccess: {},
  linearHighPriorityTotal: {},
  linearMediumPrioritySuccess: {},
  linearMediumPriorityTotal: {},
  linearLowPrioritySuccess: {},
  linearLowPriorityTotal: {},

  // Estimate-based complexity tracking
  totalEstimatePoints: {},
  avgEstimatePoints: {},
  completedEstimatePoints: {},

  // Complexity breakdown by estimate ranges
  smallIssuesCompleted: {},
  smallIssuesTotal: {},
  mediumIssuesCompleted: {},
  mediumIssuesTotal: {},
  largeIssuesCompleted: {},
  largeIssuesTotal: {},
};

// Scoring weights (customizable)
const SCORE_WEIGHTS = {
  successRate: 0.15, // 15% - general success rate
  avgDuration: 0.08, // 8% - faster is better (normalized)
  validationRate: 0.12, // 12% - passes validation
  volume: 0.05, // 5% - more usage = more data
  recency: 0.05, // 5% - recent usage weighted higher

  // Linear issue metrics (55% total)
  linearCompletionRate: 0.15, // 15% - Linear issues completed vs failed
  linearComplexitySuccess: 0.1, // 10% - success rate on complex (high priority) issues
  linearSimpleSuccess: 0.05, // 5% - success rate on simple issues

  // Estimate-based complexity metrics (25%)
  estimateSuccessRate: 0.1, // 10% - completion rate on large (8+) estimate issues
  estimateEfficiency: 0.1, // 10% - avg completed estimate vs attempted
  estimateThroughput: 0.05, // 5% - total estimate points completed
};

// Minimum selections before provider is ranked
const MIN_SELECTIONS_FOR_RANKING = 3;

// Priority thresholds for complexity classification
const HIGH_PRIORITY_THRESHOLD = 2; // P0, P1 = high complexity
const MEDIUM_PRIORITY_THRESHOLD = 4; // P2, P3 = medium complexity

const PROBE_TIMEOUT_MS = 5000;
const CODEX_PROBE_TIMEOUT_MS = 20000;
const CODEX_SUCCESS_WINDOW_MS = 5 * 60 * 1000;

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

async function probeCodexSdk(model) {
  const stats = loadStats();
  const lastSuccess = stats.lastSuccess.codex;
  if (lastSuccess && Date.now() - lastSuccess < CODEX_SUCCESS_WINDOW_MS) {
    return true;
  }

  try {
    const codex = new Codex({
      env: process.env,
    });
    const thread = codex.startThread({
      model: model || undefined,
      workingDirectory: PROJECT_ROOT,
      sandboxMode: "read-only",
      approvalPolicy: "never",
      webSearchEnabled: false,
      networkAccessEnabled: false,
    });

    const probe = thread.run("Reply with exactly: ok");
    const result = await Promise.race([
      probe,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Codex SDK probe timed out")), CODEX_PROBE_TIMEOUT_MS),
      ),
    ]);

    const finalResponse = String(result?.finalResponse || "")
      .trim()
      .toLowerCase();
    return finalResponse.includes("ok");
  } catch (err) {
    // Log the error and record failure so credit-gate can try fallback providers
    const errStr = String(err).toLowerCase();
    if (errStr.includes("usage limit") || errStr.includes("quota")) {
      console.log(`[credit-gate] codex: unavailable (quota exhausted)`);
      recordProviderFailure("codex");
    } else if (errStr.includes("timeout")) {
      console.log(`[credit-gate] codex: unavailable (timeout)`);
      recordProviderFailure("codex");
    } else {
      console.log(`[credit-gate] codex: unavailable (${err.message || err})`);
      recordProviderFailure("codex");
    }
    return false;
  }
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

async function probeOllamaModel(modelName) {
  const res = await probeWithTimeout(`${RUNNER_OLLAMA_BASE_URL.replace("/v1", "")}/api/tags`);
  if (!res || !res.ok) return false;
  try {
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    return models.some((m) => m === modelName);
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
    model: process.env.CODEX_MODEL || "gpt-5-codex",
    baseUrl: "codex-sdk",
    envVar: null,
    driver: "codex-sdk",
    failureWindowSecs: RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS,
    probe: (provider) => probeCodexSdk(provider.model),
  },
  {
    name: "codebuff",
    model: "codebuff/base@latest",
    baseUrl: "codebuff",
    envVar: "CODEBUFF_API_KEY",
    requiresSdk: true,
    failureWindowSecs: RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS,
  },
  {
    name: "openclaw",
    model: "openclaw:main",
    baseUrl: "http://127.0.0.1:18789/v1",
    envVar: "OPENCLAW_TOKEN",
    loadToken: () => {
      const openclawConfig = join(
        process.env.HOME || process.env.USERPROFILE || "",
        ".openclaw",
        "openclaw.json",
      );
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
    name: "codebuff-bridge",
    model: "codebuff/base@latest",
    baseUrl: "http://127.0.0.1:4318/v1",
    envVar: "CODEBUFF_BRIDGE_API_KEY",
    loadToken: () => "local-bridge",
    failureWindowSecs: RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS,
    probe: (p, apiKey) => probeOpenAIModels(p.baseUrl, p.model, apiKey),
  },
  {
    name: "ollama-local",
    model: RUNNER_OLLAMA_MODEL,
    baseUrl: RUNNER_OLLAMA_BASE_URL,
    envVar: null,
    probe: () => probeOllamaModel(RUNNER_OLLAMA_MODEL),
  },
  {
    name: "ollama-qwen2.5-coder-3b",
    model: "qwen2.5-coder:3b-instruct",
    baseUrl: RUNNER_OLLAMA_BASE_URL,
    envVar: null,
    probe: () => probeOllamaModel("qwen2.5-coder:3b-instruct"),
  },
  {
    name: "ollama-qwen2.5-coder-0.5b",
    model: "qwen2.5-coder:0.5b",
    baseUrl: RUNNER_OLLAMA_BASE_URL,
    envVar: null,
    probe: () => probeOllamaModel("qwen2.5-coder:0.5b"),
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
  const provider = PROVIDERS.find((p) => p.name === providerName);
  const windowSecs = provider?.failureWindowSecs || RUNNER_PROVIDER_FAILURE_WINDOW_SECS;
  return now - failedAt < windowSecs;
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
// Provider selection monitoring
// ---------------------------------------------------------------------------

function loadStats() {
  try {
    if (existsSync(STATS_FILE)) {
      const data = JSON.parse(readFileSync(STATS_FILE, "utf-8"));
      // Merge with defaults to handle new fields
      return { ...PROVIDER_STATS, ...data };
    }
  } catch {}
  return { ...PROVIDER_STATS };
}

function saveStats(stats) {
  ensureStateDir();
  writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

export function recordProviderSelection(providerName) {
  const stats = loadStats();
  stats.selections[providerName] = (stats.selections[providerName] || 0) + 1;
  stats.lastSelected[providerName] = Date.now();
  if (!stats.firstUsed[providerName]) {
    stats.firstUsed[providerName] = Date.now();
  }
  saveStats(stats);
}

export function recordProviderSuccess(providerName) {
  const stats = loadStats();
  stats.successes[providerName] = (stats.successes[providerName] || 0) + 1;
  stats.lastSuccess[providerName] = Date.now();
  saveStats(stats);
}

export function recordProviderFailureCount(providerName) {
  const stats = loadStats();
  stats.failures[providerName] = (stats.failures[providerName] || 0) + 1;
  stats.lastFailure[providerName] = Date.now();
  saveStats(stats);
}

/**
 * Record a Linear issue completion for a provider
 * @param {string} providerName - Provider name
 * @param {object} completion - { completed: boolean, priority: number, estimate: number }
 *   - completed: true if issue was successfully completed (Done), false if failed/external
 *   - priority: Linear priority (0 = highest/urgent, 4 = lowest)
 *   - estimate: story points (1, 2, 3, 5, 8, 13, etc.)
 */
export function recordLinearCompletion(providerName, { completed, priority = 4, estimate }) {
  const stats = loadStats();
  const p = typeof priority === "number" ? priority : 4; // Default to low priority
  // Auto-assign estimate based on priority if not provided (fallback for legacy issues)
  const est = typeof estimate === "number" && estimate > 0 ? estimate : Math.max(1, 5 - p); // Default: P0=5, P1=4, P2=3, P3=2, P4=1

  if (completed) {
    stats.linearCompleted[providerName] = (stats.linearCompleted[providerName] || 0) + 1;
  } else {
    stats.linearFailed[providerName] = (stats.linearFailed[providerName] || 0) + 1;
  }

  // Track by priority complexity
  if (p <= HIGH_PRIORITY_THRESHOLD) {
    stats.linearHighPriorityTotal[providerName] =
      (stats.linearHighPriorityTotal[providerName] || 0) + 1;
    if (completed) {
      stats.linearHighPrioritySuccess[providerName] =
        (stats.linearHighPrioritySuccess[providerName] || 0) + 1;
    }
  } else if (p <= MEDIUM_PRIORITY_THRESHOLD) {
    stats.linearMediumPriorityTotal[providerName] =
      (stats.linearMediumPriorityTotal[providerName] || 0) + 1;
    if (completed) {
      stats.linearMediumPrioritySuccess[providerName] =
        (stats.linearMediumPrioritySuccess[providerName] || 0) + 1;
    }
  } else {
    stats.linearLowPriorityTotal[providerName] =
      (stats.linearLowPriorityTotal[providerName] || 0) + 1;
    if (completed) {
      stats.linearLowPrioritySuccess[providerName] =
        (stats.linearLowPrioritySuccess[providerName] || 0) + 1;
    }
  }

  // Track estimate-based complexity
  if (est > 0) {
    stats.totalEstimatePoints[providerName] = (stats.totalEstimatePoints[providerName] || 0) + est;
    const totalAttempts = stats.linearCompleted[providerName] + stats.linearFailed[providerName];
    stats.avgEstimatePoints[providerName] =
      totalAttempts > 0 ? Math.round(stats.totalEstimatePoints[providerName] / totalAttempts) : 0;

    if (completed) {
      stats.completedEstimatePoints[providerName] =
        (stats.completedEstimatePoints[providerName] || 0) + est;
    }

    // Track by estimate size ranges
    if (est <= 2) {
      // Small: 1-2 points
      stats.smallIssuesTotal[providerName] = (stats.smallIssuesTotal[providerName] || 0) + 1;
      if (completed) {
        stats.smallIssuesCompleted[providerName] =
          (stats.smallIssuesCompleted[providerName] || 0) + 1;
      }
    } else if (est <= 5) {
      // Medium: 3-5 points
      stats.mediumIssuesTotal[providerName] = (stats.mediumIssuesTotal[providerName] || 0) + 1;
      if (completed) {
        stats.mediumIssuesCompleted[providerName] =
          (stats.mediumIssuesCompleted[providerName] || 0) + 1;
      }
    } else {
      // Large: 8+ points
      stats.largeIssuesTotal[providerName] = (stats.largeIssuesTotal[providerName] || 0) + 1;
      if (completed) {
        stats.largeIssuesCompleted[providerName] =
          (stats.largeIssuesCompleted[providerName] || 0) + 1;
      }
    }
  }

  // Recalculate score
  stats.score[providerName] = calculateProviderScore(providerName, stats);
  saveStats(stats);
}

/**
 * Record detailed metrics after a provider completes a job
 * @param {string} providerName - Provider name
 * @param {object} metrics - { durationMs, inputTokens, outputTokens, validationPassed }
 */
export function recordProviderMetrics(
  providerName,
  { durationMs, inputTokens, outputTokens, validationPassed },
) {
  const stats = loadStats();
  stats.metricSamples[providerName] = (stats.metricSamples[providerName] || 0) + 1;
  const metricSamples = stats.metricSamples[providerName];

  // Timing
  stats.totalDuration[providerName] = (stats.totalDuration[providerName] || 0) + durationMs;
  stats.avgDuration[providerName] =
    metricSamples > 0 ? Math.round(stats.totalDuration[providerName] / metricSamples) : 0;

  const prevMin = stats.minDuration[providerName];
  stats.minDuration[providerName] = prevMin ? Math.min(prevMin, durationMs) : durationMs;

  const prevMax = stats.maxDuration[providerName];
  stats.maxDuration[providerName] = prevMax ? Math.max(prevMax, durationMs) : durationMs;

  // Tokens
  stats.totalInputTokens[providerName] =
    (stats.totalInputTokens[providerName] || 0) + (inputTokens || 0);
  stats.totalOutputTokens[providerName] =
    (stats.totalOutputTokens[providerName] || 0) + (outputTokens || 0);
  stats.avgInputTokens[providerName] =
    metricSamples > 0 ? Math.round(stats.totalInputTokens[providerName] / metricSamples) : 0;
  stats.avgOutputTokens[providerName] =
    metricSamples > 0 ? Math.round(stats.totalOutputTokens[providerName] / metricSamples) : 0;

  // Validation
  if (validationPassed) {
    stats.validationPasses[providerName] = (stats.validationPasses[providerName] || 0) + 1;
  } else {
    stats.validationFailures[providerName] = (stats.validationFailures[providerName] || 0) + 1;
  }

  // Recalculate score
  stats.score[providerName] = calculateProviderScore(providerName, stats);

  saveStats(stats);
}

/**
 * Calculate dynamic score for a provider based on metrics
 */
function calculateProviderScore(providerName, stats) {
  const selections = stats.selections[providerName] || 0;

  // Not enough data yet
  if (selections < MIN_SELECTIONS_FOR_RANKING) {
    return null; // Not ranked yet
  }

  const successes = stats.successes[providerName] || 0;
  const avgDuration = stats.avgDuration[providerName] || 0;
  const validationPasses = stats.validationPasses[providerName] || 0;
  const validationFailures = stats.validationFailures[providerName] || 0;
  const lastSelected = stats.lastSelected[providerName] || 0;

  // 1. Success Rate (0-1)
  const successRate = selections > 0 ? successes / selections : 0;

  // 2. Avg Duration (normalized - lower is better, invert)
  // Use a baseline of 60s as "slow", anything faster gets higher score
  const durationScore = avgDuration > 0 ? Math.max(0, 1 - avgDuration / 60000) : 0.5;

  // 3. Validation Rate (0-1)
  const totalValidations = validationPasses + validationFailures;
  const validationRate = totalValidations > 0 ? validationPasses / totalValidations : 0.5;

  // 4. Volume (normalized - use log scale to prevent dominance)
  const volumeScore = Math.min(1, Math.log10(selections + 1) / 3); // Maxes at 1000 selections

  // 5. Recency (0-1 - more recent = higher)
  const now = Date.now();
  const ageMs = now - lastSelected;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - ageDays / 30); // Decay over 30 days

  // 6. Linear Issue Completion Rate (0-1)
  const linearCompleted = stats.linearCompleted[providerName] || 0;
  const linearFailed = stats.linearFailed[providerName] || 0;
  const linearTotal = linearCompleted + linearFailed;
  const linearCompletionRate = linearTotal > 0 ? linearCompleted / linearTotal : 0.5;

  // 7. High Priority (Complex) Issue Success Rate (0-1)
  const highSuccess = stats.linearHighPrioritySuccess[providerName] || 0;
  const highTotal = stats.linearHighPriorityTotal[providerName] || 0;
  const highPrioritySuccessRate = highTotal > 0 ? highSuccess / highTotal : 0.5;

  // 8. Medium Priority Issue Success Rate (0-1)
  const mediumSuccess = stats.linearMediumPrioritySuccess[providerName] || 0;
  const mediumTotal = stats.linearMediumPriorityTotal[providerName] || 0;
  const mediumPrioritySuccessRate = mediumTotal > 0 ? mediumSuccess / mediumTotal : 0.5;

  // 9. Low Priority (Simple) Issue Success Rate (0-1)
  const lowSuccess = stats.linearLowPrioritySuccess[providerName] || 0;
  const lowTotal = stats.linearLowPriorityTotal[providerName] || 0;
  const lowPrioritySuccessRate = lowTotal > 0 ? lowSuccess / lowTotal : 0.5;

  // 10. Large Issue (8+ points) Success Rate (0-1)
  const largeCompleted = stats.largeIssuesCompleted[providerName] || 0;
  const largeTotal = stats.largeIssuesTotal[providerName] || 0;
  const largeIssueSuccessRate = largeTotal > 0 ? largeCompleted / largeTotal : 0.5;

  // 11. Estimate Efficiency - ratio of completed estimate points to attempted
  const totalEst = stats.totalEstimatePoints[providerName] || 0;
  const completedEst = stats.completedEstimatePoints[providerName] || 0;
  const estimateEfficiency = totalEst > 0 ? completedEst / totalEst : 0.5;

  // 12. Estimate Throughput - log scale of total completed estimate points
  const estimateThroughput = Math.min(1, Math.log10(completedEst + 1) / 4); // Maxes at 10k points

  // Weighted combination
  const score =
    successRate * SCORE_WEIGHTS.successRate +
    durationScore * SCORE_WEIGHTS.avgDuration +
    validationRate * SCORE_WEIGHTS.validationRate +
    volumeScore * SCORE_WEIGHTS.volume +
    recencyScore * SCORE_WEIGHTS.recency +
    linearCompletionRate * SCORE_WEIGHTS.linearCompletionRate +
    highPrioritySuccessRate * SCORE_WEIGHTS.linearComplexitySuccess +
    mediumPrioritySuccessRate * SCORE_WEIGHTS.linearComplexitySuccess +
    lowPrioritySuccessRate * SCORE_WEIGHTS.linearSimpleSuccess +
    largeIssueSuccessRate * SCORE_WEIGHTS.estimateSuccessRate +
    estimateEfficiency * SCORE_WEIGHTS.estimateEfficiency +
    estimateThroughput * SCORE_WEIGHTS.estimateThroughput;

  return Math.round(score * 100) / 100; // 2 decimal places
}

/**
 * Get providers sorted by dynamic score (best first)
 */
export function getRankedProviders() {
  const stats = loadStats();
  const ranked = [];

  for (const name of Object.keys(stats.selections)) {
    const score = stats.score[name];
    if (score !== null && score !== undefined) {
      ranked.push({ name, score });
    }
  }

  // Sort by score descending
  ranked.sort((a, b) => b.score - a.score);

  // Add rank position
  return ranked.map((item, index) => ({ ...item, rank: index + 1 }));
}

export function getProviderStats() {
  const stats = loadStats();
  const result = {};
  for (const name of Object.keys(stats.selections)) {
    const selected = stats.selections[name] || 0;
    const success = stats.successes[name] || 0;
    const fail = stats.failures[name] || 0;
    const rate = selected > 0 ? ((success / selected) * 100).toFixed(1) : 0;

    // Calculate validation rate
    const validationPasses = stats.validationPasses[name] || 0;
    const validationFailures = stats.validationFailures[name] || 0;
    const totalValidations = validationPasses + validationFailures;
    const validationRate =
      totalValidations > 0 ? ((validationPasses / totalValidations) * 100).toFixed(1) + "%" : "N/A";

    // Calculate Linear completion rates
    const linearCompleted = stats.linearCompleted[name] || 0;
    const linearFailed = stats.linearFailed[name] || 0;
    const linearTotal = linearCompleted + linearFailed;
    const linearCompletionRate =
      linearTotal > 0 ? ((linearCompleted / linearTotal) * 100).toFixed(1) + "%" : "N/A";

    const highSuccess = stats.linearHighPrioritySuccess[name] || 0;
    const highTotal = stats.linearHighPriorityTotal[name] || 0;
    const highPriorityRate =
      highTotal > 0 ? ((highSuccess / highTotal) * 100).toFixed(1) + "%" : "N/A";

    const medSuccess = stats.linearMediumPrioritySuccess[name] || 0;
    const medTotal = stats.linearMediumPriorityTotal[name] || 0;
    const medPriorityRate = medTotal > 0 ? ((medSuccess / medTotal) * 100).toFixed(1) + "%" : "N/A";

    const lowSuccess = stats.linearLowPrioritySuccess[name] || 0;
    const lowTotal = stats.linearLowPriorityTotal[name] || 0;
    const lowPriorityRate = lowTotal > 0 ? ((lowSuccess / lowTotal) * 100).toFixed(1) + "%" : "N/A";

    // Estimate-based metrics
    const totalEst = stats.totalEstimatePoints[name] || 0;
    const completedEst = stats.completedEstimatePoints[name] || 0;
    const avgEst = stats.avgEstimatePoints[name] || 0;
    const estEfficiency = totalEst > 0 ? ((completedEst / totalEst) * 100).toFixed(1) + "%" : "N/A";

    const largeCompleted = stats.largeIssuesCompleted[name] || 0;
    const largeTotal = stats.largeIssuesTotal[name] || 0;
    const largeRate =
      largeTotal > 0 ? ((largeCompleted / largeTotal) * 100).toFixed(1) + "%" : "N/A";

    result[name] = {
      // Basic counts
      selections: selected,
      successes: success,
      failures: fail,
      successRate: `${rate}%`,

      // Timing
      avgDurationMs: stats.avgDuration[name] || 0,
      minDurationMs: stats.minDuration[name] || null,
      maxDurationMs: stats.maxDuration[name] || null,

      // Tokens
      avgInputTokens: stats.avgInputTokens[name] || 0,
      avgOutputTokens: stats.avgOutputTokens[name] || 0,
      totalInputTokens: stats.totalInputTokens[name] || 0,
      totalOutputTokens: stats.totalOutputTokens[name] || 0,

      // Validation
      validationPasses,
      validationFailures,
      validationRate,

      // Linear issue completion (by complexity)
      linearCompleted,
      linearFailed,
      linearCompletionRate,
      linearHighPrioritySuccess: highSuccess,
      linearHighPriorityTotal: highTotal,
      highPrioritySuccessRate: highPriorityRate,
      linearMediumPrioritySuccess: medSuccess,
      linearMediumPriorityTotal: medTotal,
      mediumPrioritySuccessRate: medPriorityRate,
      linearLowPrioritySuccess: lowSuccess,
      linearLowPriorityTotal: lowTotal,
      lowPrioritySuccessRate: lowPriorityRate,

      // Estimate-based metrics
      totalEstimatePoints: totalEst,
      completedEstimatePoints: completedEst,
      avgEstimatePoints: avgEst,
      estimateEfficiency: estEfficiency,
      largeIssuesCompleted: largeCompleted,
      largeIssuesTotal: largeTotal,
      largeIssueSuccessRate: largeRate,

      // Score
      score: stats.score[name] === null ? "pending" : stats.score[name], // null = not enough data

      // Timestamps
      lastSelected: stats.lastSelected[name]
        ? new Date(stats.lastSelected[name]).toISOString()
        : null,
      lastSuccess: stats.lastSuccess[name] ? new Date(stats.lastSuccess[name]).toISOString() : null,
      lastFailure: stats.lastFailure[name] ? new Date(stats.lastFailure[name]).toISOString() : null,
      firstUsed: stats.firstUsed[name] ? new Date(stats.firstUsed[name]).toISOString() : null,
    };
  }
  return result;
}

export function resetProviderStats() {
  saveStats(PROVIDER_STATS);
}

// Log stats summary (for debugging/monitoring)
export function logProviderStats() {
  const ranked = getRankedProviders();
  const stats = getProviderStats();

  console.log(`[credit-gate] 📊 Provider Rankings (dynamic scoring):`);
  if (ranked.length > 0) {
    for (const { rank, name, score } of ranked) {
      const data = stats[name];
      console.log(
        `[credit-gate]   #${rank} ${name}: score=${score}, ${data.selections} sel, ${data.successRate} success, ${data.avgDurationMs}ms avg`,
      );
    }
  } else {
    console.log(
      `[credit-gate]   (not enough data for ranking - need ${MIN_SELECTIONS_FOR_RANKING}+ selections)`,
    );
  }

  console.log(`[credit-gate] 📈 Provider Details:`);
  for (const [name, data] of Object.entries(stats).sort(
    (a, b) => b[1].selections - a[1].selections,
  )) {
    console.log(
      `[credit-gate]   ${name}: ${data.selections} sel, ${data.successes}✓ ${data.failures}✗, ${data.validationRate} valid, ${data.avgDurationMs}ms avg`,
    );
  }
}

// ---------------------------------------------------------------------------
// Provider enumeration (for health/monitoring endpoints)
// ---------------------------------------------------------------------------

/**
 * Get all providers that have valid credentials configured (no network calls).
 * Returns a list of provider summaries for health/monitoring endpoints.
 */
export function getConfiguredProviders(options = {}) {
  const { excludeNames = [] } = options;
  const excludeSet = new Set(excludeNames);
  const configured = [];

  for (const provider of PROVIDERS) {
    if (excludeSet.has(provider.name)) continue;

    let hasCredential = false;
    if (provider.envVar) {
      const val = process.env[provider.envVar];
      hasCredential = !!val && val !== "REPLACE" && val.length > 1;
      if (!hasCredential && typeof provider.loadToken === "function") {
        hasCredential = true;
      }
    } else if (provider.driver === "codex-sdk") {
      hasCredential = !!process.env.OPENAI_API_KEY;
    } else if (typeof provider.loadToken === "function") {
      hasCredential = true;
    } else {
      hasCredential = true;
    }

    if (hasCredential) {
      const type = provider.requiresSdk || provider.driver === "codex-sdk"
        ? "sdk"
        : provider.baseUrl?.includes("127.0.0.1") || provider.baseUrl?.includes("localhost")
          ? "local"
          : "api";
      configured.push({ name: provider.name, model: provider.model, type });
    }
  }

  return configured;
}

/**
 * Probe all configured providers to check live availability (makes network calls).
 * Runs probes in parallel for speed. SDK providers (codebuff, codex) are marked
 * without network probing since their probes are expensive.
 *
 * @returns {Promise<Array<{name, model, status, available, durationMs}>>}
 */
export async function probeAllProviders(options = {}) {
  const { excludeNames = [] } = options;
  const excludeSet = new Set(excludeNames);
  const startTime = Date.now();

  const probePromises = PROVIDERS.map(async (provider) => {
    if (excludeSet.has(provider.name)) {
      return { name: provider.name, model: provider.model, status: "excluded", available: false, durationMs: 0 };
    }

    const apiKey = await resolveProviderApiKey(provider);
    if (provider.envVar && !apiKey) {
      return { name: provider.name, model: provider.model, status: "no-key", available: false, durationMs: 0 };
    }

    if (provider.requiresSdk) {
      return { name: provider.name, model: provider.model, status: "sdk-configured", available: true, durationMs: 0 };
    }

    if (provider.driver === "codex-sdk") {
      const hasKey = !!process.env.OPENAI_API_KEY;
      return { name: provider.name, model: provider.model, status: hasKey ? "sdk-configured" : "no-key", available: hasKey, durationMs: 0 };
    }

    const probeStart = Date.now();
    try {
      const available = provider.probe
        ? await provider.probe(provider, apiKey)
        : await probeOpenAIModels(provider.baseUrl, provider.model, apiKey);
      return {
        name: provider.name,
        model: provider.model,
        status: available ? "available" : "unavailable",
        available,
        durationMs: Date.now() - probeStart,
      };
    } catch {
      return {
        name: provider.name,
        model: provider.model,
        status: "probe-error",
        available: false,
        durationMs: Date.now() - probeStart,
      };
    }
  });

  const settled = await Promise.allSettled(probePromises);
  const probeResults = settled.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { name: "unknown", model: "unknown", status: "error", available: false, durationMs: 0 },
  );

  const elapsed = Date.now() - startTime;
  const available = probeResults.filter((r) => r.available);
  const unavailable = probeResults.filter((r) => !r.available && r.status !== "excluded");
  console.log(`[credit-gate] Probed ${probeResults.length} providers in ${elapsed}ms`);
  console.log(`[credit-gate]   ✅ Available (${available.length}): ${available.map((r) => r.name).join(", ")}`);
  if (unavailable.length > 0) {
    console.log(`[credit-gate]   ❌ Unavailable (${unavailable.length}): ${unavailable.map((r) => `${r.name}(${r.status})`).join(", ")}`);
  }

  return probeResults;
}

// ---------------------------------------------------------------------------
// Main: select best available provider
// ---------------------------------------------------------------------------

function matchesAllowedNames(provider, allowedNames) {
  if (!allowedNames || allowedNames.size === 0) {
    return true;
  }
  return allowedNames.has(provider.name);
}

function matchesExcludedNames(provider, excludedNames) {
  if (!excludedNames || excludedNames.size === 0) {
    return false;
  }
  return excludedNames.has(provider.name);
}

const PREFERRED_PROVIDER_ORDER = ["codex"];

async function resolveProviderApiKey(provider) {
  let apiKey = provider.envVar ? process.env[provider.envVar] : null;
  if (!apiKey && provider.loadToken) {
    apiKey = await provider.loadToken();
  }
  return apiKey;
}

function toSelectedProvider(provider, apiKey) {
  return {
    name: provider.name,
    model: provider.model,
    baseUrl: provider.baseUrl,
    apiKey: apiKey || null,
    requiresSdk: provider.requiresSdk || false,
    driver: provider.driver || null,
    cwd: provider.requiresSdk ? PROJECT_ROOT : undefined,
    useMaxCompletionTokens: provider.useMaxCompletionTokens || false,
  };
}

async function tryProvider(provider) {
  const apiKey = await resolveProviderApiKey(provider);

  if (provider.envVar && !apiKey) {
    console.log(`[credit-gate] ${provider.name}: skipped (no ${provider.envVar})`);
    return null;
  }

  if (isRecentlyFailed(provider.name)) {
    console.log(`[credit-gate] ${provider.name}: skipped (recently failed)`);
    return null;
  }

  if (provider.requiresSdk) {
    console.log(`[credit-gate] ${provider.name}: using SDK ✅`);
    clearProviderFailure(provider.name);
    recordProviderSelection(provider.name);
    return toSelectedProvider(provider, apiKey);
  }

  console.log(`[credit-gate] ${provider.name}: probing...`);
  const available = provider.probe
    ? await provider.probe(provider, apiKey)
    : await probeOpenAIModels(provider.baseUrl, provider.model, apiKey);

  if (!available) {
    console.log(`[credit-gate] ${provider.name}: unavailable ❌`);
    return null;
  }

  console.log(`[credit-gate] ${provider.name}: available ✅`);
  clearProviderFailure(provider.name);
  recordProviderSelection(provider.name);
  return toSelectedProvider(provider, apiKey);
}

export async function selectProvider(options = {}) {
  ensureStateDir();
  const allowedNames =
    Array.isArray(options.allowedNames) && options.allowedNames.length > 0
      ? new Set(options.allowedNames)
      : null;
  const excludedNames =
    Array.isArray(options.excludeNames) && options.excludeNames.length > 0
      ? new Set(options.excludeNames)
      : null;

  for (const providerName of PREFERRED_PROVIDER_ORDER) {
    const provider = PROVIDERS.find((candidate) => candidate.name === providerName);
    if (
      !provider ||
      !matchesAllowedNames(provider, allowedNames) ||
      matchesExcludedNames(provider, excludedNames)
    ) {
      continue;
    }
    const selected = await tryProvider(provider);
    if (selected) {
      return selected;
    }
  }

  // First: try providers in dynamic ranking order if we have enough data
  const ranked = getRankedProviders();
  if (ranked.length > 0) {
    for (const { name } of ranked) {
      const provider = PROVIDERS.find((p) => p.name === name);
      if (
        !provider ||
        !matchesAllowedNames(provider, allowedNames) ||
        matchesExcludedNames(provider, excludedNames)
      ) {
        continue;
      }
      const selected = await tryProvider(provider);
      if (selected) {
        return selected;
      }
    }
  }

  // Fallback: use fixed PROVIDERS order for providers with insufficient data or none ranked
  for (const provider of PROVIDERS) {
    if (
      !matchesAllowedNames(provider, allowedNames) ||
      matchesExcludedNames(provider, excludedNames)
    ) {
      continue;
    }
    const selected = await tryProvider(provider);
    if (selected) {
      return selected;
    }
  }

  // Note: logProviderStats() can be called explicitly by callers for monitoring
  // Removed auto-logging to avoid ESM import side effects

  return null;
}
