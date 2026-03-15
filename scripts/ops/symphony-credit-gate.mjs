#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * symphony-credit-gate.mjs — Provider cascade for Symphony agent
 *
 * Ports the credit-gate concept from master's codex-credit-gate.sh into JS.
 * Probes providers in priority order, skips recently-failed providers,
 * and returns the first available provider configuration.
 *
 * Currently Ollama-local only. Adding cloud providers is a matter of
 * appending entries to the PROVIDERS array with probe functions and
 * environment variable checks for API keys.
 *
 * Legacy lessons encoded:
 *   - Always probe before selecting (lightweight /v1/models check)
 *   - Track failures with a time window (skip broken providers for 360s)
 *   - Ollama must be the default, not an afterthought
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

// ---------------------------------------------------------------------------
// Provider definitions
// ---------------------------------------------------------------------------

const PROVIDERS = [
  {
    name: 'ollama-local',
    model: RUNNER_OLLAMA_MODEL,
    baseUrl: RUNNER_OLLAMA_BASE_URL,
    probe: probeOllama,
  },
  // Future: cloud providers via LiteLLM proxy
  // {
  //   name: 'groq',
  //   model: 'groq-llama-70b',
  //   baseUrl: 'http://localhost:4011/v1',
  //   probe: () => probeLiteLLM('groq-llama-70b'),
  //   requiresEnv: 'GROQ_API_KEY',
  // },
];

// ---------------------------------------------------------------------------
// Provider probes
// ---------------------------------------------------------------------------

async function probeOllama() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  try {
    const res = await fetch(`${RUNNER_OLLAMA_BASE_URL.replace('/v1', '')}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return false;
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    return models.includes(RUNNER_OLLAMA_MODEL);
  } catch {
    clearTimeout(timer);
    return false;
  }
}

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
    if (provider.requiresEnv && !process.env[provider.requiresEnv]) {
      console.log(`[credit-gate] ${provider.name}: skipped (no ${provider.requiresEnv})`);
      continue;
    }

    if (isRecentlyFailed(provider.name)) {
      console.log(`[credit-gate] ${provider.name}: skipped (recently failed)`);
      continue;
    }

    console.log(`[credit-gate] ${provider.name}: probing...`);
    const available = await provider.probe();

    if (available) {
      console.log(`[credit-gate] ${provider.name}: available ✅`);
      clearProviderFailure(provider.name);
      return {
        name: provider.name,
        model: provider.model,
        baseUrl: provider.baseUrl,
      };
    }

    console.log(`[credit-gate] ${provider.name}: unavailable ❌`);
  }

  return null;
}
