#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * symphony-credit-gate.mjs — Provider cascade for Symphony agent
 *
 * Probes providers in priority order (matching legacy codex-credit-gate.sh),
 * skips recently-failed providers, and returns the first available provider.
 *
 * Cascade order (best-to-worst):
 *   1. Codex (OpenAI)  — cloud, gpt-5.4 (when credits available)
 *   2. Groq            — free cloud, fast, llama-3.3-70b-versatile
 *   3. Mistral         — free experimental tier, devstral-small-2507
 *   4. Gemini          — free cloud tier, gemini-2.5-flash
 *   5. Gemini Lite     — separate quota, gemini-2.5-flash-lite
 *   6. OpenRouter FREE — free :free models, llama-3.3-70b-instruct
 *   7. SambaNova       — free cloud, 20 req/day, llama-3.3-70b
 *   8. Cerebras        — free cloud, 1M tok/day, 8K context, llama3.1-8b
 *   9. GitHub Models   — free, gpt-4.1-mini
 *  10. Ollama local    — local fallback, qwen3.5:35b-a3b-32t
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

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  RUNNER_OLLAMA_MODEL,
  RUNNER_OLLAMA_BASE_URL,
  RUNNER_PROVIDER_FAILURE_WINDOW_SECS,
} from './symphony-config.mjs';

const uid = process.getuid?.() ?? 1000;
const STATE_DIR = `/run/user/${uid}/symphony-runner`;
const FAILURE_STATE_FILE = resolve(STATE_DIR, 'provider-failures.json');

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
    headers: { 'Authorization': `Bearer ${apiKey}` },
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
  const res = await probeWithTimeout('https://models.github.ai/catalog/models', {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${apiKey}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res || !res.ok) return false;
  const text = await res.text();
  return text.includes(model);
}

async function probeOllama() {
  const res = await probeWithTimeout(
    `${RUNNER_OLLAMA_BASE_URL.replace('/v1', '')}/api/tags`,
  );
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
    name: 'codex',
    model: 'gpt-5.4',
    baseUrl: 'https://api.openai.com/v1',
    envVar: 'OPENAI_API_KEY',
    useMaxCompletionTokens: true,
    probe(apiKey) { return probeOpenAIModels(this.baseUrl, this.model, apiKey); },
  },
  {
    name: 'groq',
    model: 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
    envVar: 'GROQ_TOKEN',
    probe(apiKey) { return probeOpenAIModels(this.baseUrl, this.model, apiKey); },
  },
  {
    name: 'mistral',
    model: 'devstral-small-2507',
    baseUrl: 'https://api.mistral.ai/v1',
    envVar: 'MISTRAL_TOKEN',
    probe(apiKey) { return probeOpenAIModels(this.baseUrl, this.model, apiKey); },
  },
  {
    name: 'gemini',
    model: 'gemini-2.5-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    envVar: 'GEMINI_TOKEN',
    probe(apiKey) { return probeGeminiModels(apiKey, this.model); },
  },
  {
    name: 'gemini-lite',
    model: 'gemini-2.5-flash-lite',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    envVar: 'GEMINI_TOKEN',
    probe(apiKey) { return probeGeminiModels(apiKey, this.model); },
  },
  {
    name: 'openrouter-free',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    baseUrl: 'https://openrouter.ai/api/v1',
    envVar: 'OPENROUTER_TOKEN',
    probe(apiKey) { return probeOpenAIModels(this.baseUrl, this.model, apiKey); },
  },
  {
    name: 'sambanova',
    model: 'Meta-Llama-3.3-70B-Instruct',
    baseUrl: 'https://api.sambanova.ai/v1',
    envVar: 'SAMBANOVA_TOKEN',
    probe(apiKey) { return probeOpenAIModels(this.baseUrl, this.model, apiKey); },
  },
  {
    name: 'cerebras',
    model: 'llama3.1-8b',
    baseUrl: 'https://api.cerebras.ai/v1',
    envVar: 'CEREBRAS_TOKEN',
    probe(apiKey) { return probeOpenAIModels(this.baseUrl, this.model, apiKey); },
  },
  {
    name: 'github-models',
    model: 'gpt-4.1-mini',
    baseUrl: 'https://models.github.ai/inference/v1',
    envVar: 'GITHUB_MODELS_TOKEN',
    probe(apiKey) { return probeGitHubModels(apiKey, this.model); },
  },
  {
    name: 'ollama-local',
    model: RUNNER_OLLAMA_MODEL,
    baseUrl: RUNNER_OLLAMA_BASE_URL,
    envVar: null,
    probe() { return probeOllama(); },
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
    return JSON.parse(readFileSync(FAILURE_STATE_FILE, 'utf-8'));
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
    const apiKey = provider.envVar ? process.env[provider.envVar] : null;

    if (provider.envVar && !apiKey) {
      console.log(`[credit-gate] ${provider.name}: skipped (no ${provider.envVar})`);
      continue;
    }

    if (isRecentlyFailed(provider.name)) {
      console.log(`[credit-gate] ${provider.name}: skipped (recently failed)`);
      continue;
    }

    console.log(`[credit-gate] ${provider.name}: probing...`);
    const available = await provider.probe(apiKey);

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
