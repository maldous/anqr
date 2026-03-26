#!/usr/bin/env node

/**
 * symphony-session-state.mjs — Session-aware provider stickiness and adaptive rotation
 *
 * Implements intelligent provider selection that:
 * - Sticks with paid providers (codex, codebuff paid mode) until exhausted
 * - Rotates free providers after N turns to build credit-gate heuristics
 * - Automatically detects codebuff paid vs free mode
 * - Self-tunes rotation parameters based on observed performance
 * - Periodically samples all providers to keep scoring fresh
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo } = createLogger();

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "../../../..");
const STATE_DIR = resolve(PROJECT_ROOT, "reports", "symphony");
const SESSION_STATE_FILE = resolve(STATE_DIR, "session-state.json");
const ADAPTIVE_PARAMS_FILE = resolve(STATE_DIR, "adaptive-params.json");

// Provider tiers for stickiness policy
const TIER_PAID = "paid";
const TIER_FREE = "free-cloud";
const TIER_LOCAL = "local-safety-net";

// Session state TTL (1 hour idle)
const SESSION_TTL_MS = 60 * 60 * 1000;

// Adaptive parameters with self-tuning
const DEFAULT_ADAPTIVE_PARAMS = {
  freeTurnLimit: {
    base: 10, // Default turns before rotating free providers
    perProvider: {}, // Provider-specific overrides (auto-tuned)
    min: 3,
    max: 25,
  },
  evalCycle: {
    requestThreshold: 200, // Sample new provider every N requests
    timeThreshold: 1 * 60 * 60 * 1000, // Or every 1 hour (changed from 6 hours per user request)
    lastEval: Date.now(),
    counter: 0,
  },
  samplingRate: {
    base: 50, // Every 50 requests, force-sample an underused provider
    counter: 0,
  },
  lastTuningAt: Date.now(),
  tuningInterval: 50, // Re-tune parameters every 50 requests
};

// ---------------------------------------------------------------------------
// State persistence
// ---------------------------------------------------------------------------

function ensureStateDir() {
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
  }
}

function loadSessionState() {
  try {
    if (existsSync(SESSION_STATE_FILE)) {
      return JSON.parse(readFileSync(SESSION_STATE_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

function saveSessionState(state) {
  ensureStateDir();
  writeFileSync(SESSION_STATE_FILE, JSON.stringify(state, null, 2));
}

function loadAdaptiveParams() {
  try {
    if (existsSync(ADAPTIVE_PARAMS_FILE)) {
      const saved = JSON.parse(readFileSync(ADAPTIVE_PARAMS_FILE, "utf-8"));
      return { ...DEFAULT_ADAPTIVE_PARAMS, ...saved };
    }
  } catch {}
  return { ...DEFAULT_ADAPTIVE_PARAMS };
}

function saveAdaptiveParams(params) {
  ensureStateDir();
  writeFileSync(ADAPTIVE_PARAMS_FILE, JSON.stringify(params, null, 2));
}

// ---------------------------------------------------------------------------
// Session provider tracking
// ---------------------------------------------------------------------------

/**
 * Get session-specific provider state
 * @param {string} sessionId - OpenClaw session ID (from X-OpenClaw-Session header)
 * @returns {object|null} - { provider, mode, turnCount, lastUsed, tier }
 */
export function getSessionProvider(sessionId) {
  if (!sessionId) return null;

  const state = loadSessionState();
  const session = state[sessionId];

  if (!session) return null;

  // Check TTL
  const age = Date.now() - session.lastUsed;
  if (age > SESSION_TTL_MS) {
    delete state[sessionId];
    saveSessionState(state);
    return null;
  }

  return session;
}

/**
 * Update session provider state
 * @param {string} sessionId - OpenClaw session ID
 * @param {object} provider - { name, mode, tier }
 */
export function updateSessionProvider(sessionId, provider) {
  if (!sessionId) return;

  const state = loadSessionState();
  const existing = state[sessionId];

  if (existing && existing.provider === provider.name) {
    // Same provider - increment turn count
    existing.turnCount++;
    existing.lastUsed = Date.now();
    existing.mode = provider.mode || existing.mode;
  } else {
    // New provider - reset turn count
    state[sessionId] = {
      provider: provider.name,
      mode: provider.mode || "unknown",
      tier: provider.tier || TIER_FREE,
      turnCount: 1,
      lastUsed: Date.now(),
    };
  }

  saveSessionState(state);
}

/**
 * Clear session provider (force reselection)
 * @param {string} sessionId - OpenClaw session ID
 */
export function clearSessionProvider(sessionId) {
  if (!sessionId) return;

  const state = loadSessionState();
  delete state[sessionId];
  saveSessionState(state);
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions() {
  const state = loadSessionState();
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, session] of Object.entries(state)) {
    const age = now - session.lastUsed;
    if (age > SESSION_TTL_MS) {
      delete state[sessionId];
      cleaned++;
    }
  }

  if (cleaned > 0) {
    saveSessionState(state);
    logInfo(`[session-state] 🧹 Cleaned up ${cleaned} expired sessions`);
  }

  return cleaned;
}

// ---------------------------------------------------------------------------
// Codebuff mode detection
// ---------------------------------------------------------------------------

/**
 * Detect codebuff mode from response headers or error messages
 * @param {object} response - HTTP response or error object
 * @returns {string|null} - "paid" | "free" | null
 */
export function detectCodebuffMode(response) {
  // Check X-Codebuff-Mode header (to be added to codebuff-bridge)
  if (response?.headers?.["x-codebuff-mode"]) {
    return response.headers["x-codebuff-mode"];
  }

  // Detect from error messages
  if (response?.error || response?.message) {
    const errStr = String(response.error || response.message).toLowerCase();
    if (errStr.includes("free mode") || errStr.includes("free credits")) {
      return "free";
    }
    if (errStr.includes("paid mode") || errStr.includes("out of credits")) {
      return "paid"; // Was paid, now exhausted
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Adaptive parameter tuning
// ---------------------------------------------------------------------------

/**
 * Self-tune rotation parameters based on provider performance
 * @param {object} providerStats - Credit-gate provider statistics
 */
export function tuneAdaptiveParams(providerStats) {
  const params = loadAdaptiveParams();
  const now = Date.now();

  // Only tune every N requests
  params.samplingRate.counter++;
  if (params.samplingRate.counter < params.lastTuningAt + params.tuningInterval) {
    return params;
  }

  logInfo(`[session-state] 🎯 Self-tuning adaptive parameters...`);

  let tuned = 0;

  for (const [providerName, stats] of Object.entries(providerStats)) {
    const tier = stats.tier || TIER_FREE;
    if (tier === TIER_PAID || tier === TIER_LOCAL) continue; // Don't tune paid or local

    const selections = stats.selections || 0;
    if (selections < 10) continue; // Not enough data

    const successRate = parseFloat(stats.successRate) / 100 || 0;
    const linearRate = parseFloat(stats.linearCompletionRate) / 100 || 0.5;

    const currentLimit =
      params.freeTurnLimit.perProvider[providerName] || params.freeTurnLimit.base;

    // If provider is performing well (>80% success), increase turn limit
    if (successRate > 0.8 && linearRate > 0.7) {
      const newLimit = Math.min(Math.round(currentLimit * 1.2), params.freeTurnLimit.max);
      if (newLimit !== currentLimit) {
        params.freeTurnLimit.perProvider[providerName] = newLimit;
        logInfo(
          `[session-state]   ⬆️ ${providerName}: ${currentLimit} → ${newLimit} turns (high success)`,
        );
        tuned++;
      }
    }

    // If provider is underperforming (<60% success), decrease turn limit
    if (successRate < 0.6 || linearRate < 0.4) {
      const newLimit = Math.max(Math.round(currentLimit * 0.8), params.freeTurnLimit.min);
      if (newLimit !== currentLimit) {
        params.freeTurnLimit.perProvider[providerName] = newLimit;
        logInfo(
          `[session-state]   ⬇️ ${providerName}: ${currentLimit} → ${newLimit} turns (low success)`,
        );
        tuned++;
      }
    }
  }

  params.lastTuningAt = now;
  saveAdaptiveParams(params);

  if (tuned > 0) {
    logInfo(`[session-state] ✅ Tuned ${tuned} provider turn limits`);
  } else {
    logInfo(`[session-state] ✅ No tuning needed (all providers stable)`);
  }

  return params;
}

/**
 * Get turn limit for a specific provider
 * @param {string} providerName - Provider name
 * @returns {number} - Turn limit before rotation
 */
export function getProviderTurnLimit(providerName) {
  const params = loadAdaptiveParams();
  return params.freeTurnLimit.perProvider[providerName] || params.freeTurnLimit.base;
}

/**
 * Check if it's time for a periodic evaluation cycle
 * @returns {boolean}
 */
export function shouldTriggerEvalCycle() {
  const params = loadAdaptiveParams();
  const now = Date.now();

  params.evalCycle.counter++;

  const timeSinceLastEval = now - params.evalCycle.lastEval;
  const shouldEval =
    params.evalCycle.counter >= params.evalCycle.requestThreshold ||
    timeSinceLastEval >= params.evalCycle.timeThreshold;

  if (shouldEval) {
    params.evalCycle.counter = 0;
    params.evalCycle.lastEval = now;
    saveAdaptiveParams(params);
    logInfo(
      `[session-state] 🔄 Triggering periodic evaluation cycle (all providers will be sampled)`,
    );
  }

  return shouldEval;
}

/**
 * Get the next provider to force-sample during evaluation cycle
 * Returns null if no evaluation needed
 * @param {Array<string>} allProviderNames - All available provider names
 * @param {object} providerStats - Current provider statistics (plain object, not Map)
 * @returns {string|null}
 */
export function getEvaluationSampleProvider(allProviderNames, providerStats) {
  if (!shouldTriggerEvalCycle()) {
    return null;
  }

  // Find providers that haven't been selected recently or at all
  const providerScores = allProviderNames.map((name) => {
    const stats = providerStats[name] || { selections: 0, lastUsed: 0 };
    const timeSinceUsed = Date.now() - (stats.lastUsed || 0);
    const selectionsCount = stats.selections || 0;

    // Score: prefer providers with fewer selections and longer time since use
    return {
      name,
      score: timeSinceUsed / 1000 - selectionsCount * 1000,
    };
  });

  // Sort by score (highest = most underused)
  providerScores.sort((a, b) => b.score - a.score);

  const selected = providerScores[0]?.name;
  if (selected) {
    logInfo(
      `[session-state] 🎯 Evaluation cycle: forcing sample of underused provider "${selected}"`,
    );
  }

  return selected;
}

/**
 * Get adaptive parameters (for debugging/monitoring)
 */
export function getAdaptiveParams() {
  return loadAdaptiveParams();
}

/**
 * Reset adaptive parameters to defaults
 */
export function resetAdaptiveParams() {
  saveAdaptiveParams({ ...DEFAULT_ADAPTIVE_PARAMS });
  logInfo(`[session-state] 🔄 Reset adaptive parameters to defaults`);
}
