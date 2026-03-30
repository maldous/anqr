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
 *
 * CONTEXT COHERENCE (2026-03-27):
 * This module tracks provider selection (which provider, turn count, tier) but does NOT
 * track the actual message history. The system relies on OpenClaw maintaining conversation
 * state. When switching providers mid-conversation (due to rotation, failure, or evaluation),
 * there is NO server-side verification that:
 *   1. The context sent by OpenClaw is complete and coherent
 *   2. The context hasn't been corrupted during transmission
 *   3. The truncated context (for providers with smaller windows) maintains coherence
 *
 * FIXED (2026-03-27 ANQ-1021): Server-side message history storage with hash verification.
 * - Store full message array in session state (persisted to disk)
 * - Compute message hash for integrity verification
 * - getSessionMessages() retrieves stored copy as source of truth
 * - verifySessionMessages() validates OpenClaw-provided context matches stored state
 * - setSessionMessages() updates stored messages on each turn
 * - clearSessionMessages() cleanup on session clear
 *
 * See: symphony-bridge-truncation.mjs (enhanced coherence validation)
 *      symphony-openai-bridge.mjs (integrates stored messages and verification)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../../lib/logger.mjs";
import { createHash } from "node:crypto";

const { logInfo, logWarn, logError, logDebug } = createLogger();

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
      // SONAR S7784: Use structuredClone instead of JSON.parse(JSON.stringify(...))
      const saved = JSON.parse(readFileSync(ADAPTIVE_PARAMS_FILE, "utf-8"));
      return structuredClone({ ...DEFAULT_ADAPTIVE_PARAMS, ...saved });
    }
  } catch {}
  return structuredClone(DEFAULT_ADAPTIVE_PARAMS);
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
    // Preserve messages and messageHash (if present)
  } else {
    // New provider - reset turn count but preserve existing messages if any
    state[sessionId] = {
      provider: provider.name,
      mode: provider.mode || "unknown",
      tier: provider.tier || TIER_FREE,
      turnCount: 1,
      lastUsed: Date.now(),
      // Preserve messages if switching provider within same session (conversation continuity)
      messages: existing?.messages,
      messageHash: existing?.messageHash,
    };
  }

  saveSessionState(state);
}

/**
 * Clear session provider (force reselection)
 * Preserves message history while resetting provider-specific fields.
 * @param {string} sessionId - OpenClaw session ID
 */
export function clearSessionProvider(sessionId) {
  if (!sessionId) return;

  const state = loadSessionState();
  const session = state[sessionId];
  if (session) {
    // Preserve messages and messageHash, clear provider and turn state
    const { messages, messageHash } = session;
    state[sessionId] = {
      messages,
      messageHash,
      lastUsed: Date.now(),
    };
    saveSessionState(state);
    logDebug(`[session-state] Cleared provider sticky for session ${sessionId.slice(0, 8)}..., preserved ${messages?.length || 0} messages`);
  }
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
// Server-side message history storage (ANQ-1021)
// ---------------------------------------------------------------------------

/**
 * Compute a hash of the message array for integrity verification.
 * Returns a SHA-256 hash string prefixed with 'sha256:'.
 * @param {Array} messages - Message array to hash
 * @returns {string} - Hash string
 */
function hashMessages(messages) {
  try {
    const json = JSON.stringify(messages);
    const hash = createHash("sha256").update(json).digest("hex");
    return `sha256:${hash}`;
  } catch (err) {
    logError(`[session-state] Failed to hash messages: ${err.message}`);
    return null;
  }
}

/**
 * Store full message history in session state for server-side truth.
 * @param {string} sessionId - OpenClaw session ID
 * @param {Array} messages - Full message array to store
 */
export function setSessionMessages(sessionId, messages) {
  if (!sessionId) return;

  const state = loadSessionState();
  const session = state[sessionId];
  if (!session) {
    logWarn(`[session-state] setSessionMessages: session ${sessionId} not found`);
    return;
  }

  // Store a deep copy to avoid external mutation
  const messagesCopy = JSON.parse(JSON.stringify(messages));
  session.messages = messagesCopy;
  session.messageHash = hashMessages(messagesCopy);
  session.lastUsed = Date.now(); // Update timestamp

  saveSessionState(state);
  logDebug(`[session-state] Stored ${messagesCopy.length} messages for session ${sessionId.slice(0, 8)}...`);
}

/**
 * Retrieve stored message history for a session.
 * Returns the stored messages (deep copy) or null if none found.
 * @param {string} sessionId - OpenClaw session ID
 * @returns {Array|null}
 */
export function getSessionMessages(sessionId) {
  if (!sessionId) return null;

  const state = loadSessionState();
  const session = state[sessionId];
  if (!session || !session.messages) {
    return null;
  }

  // Return a deep copy to prevent external mutation
  return JSON.parse(JSON.stringify(session.messages));
}

/**
 * Verify that provided messages match the stored messages (via hash).
 * Returns true if they match, false if mismatch or no stored messages.
 * @param {string} sessionId - OpenClaw session ID
 * @param {Array} providedMessages - Messages from OpenClaw to verify
 * @returns {boolean}
 */
export function verifySessionMessages(sessionId, providedMessages) {
  if (!sessionId) return false;

  const state = loadSessionState();
  const session = state[sessionId];
  if (!session || !session.messageHash) {
    return false;
  }

  const providedHash = hashMessages(providedMessages);
  if (!providedHash) return false;

  const matches = session.messageHash === providedHash;
  if (!matches) {
    logWarn(
      `[session-state] Message hash mismatch for session ${sessionId.slice(0, 8)}... - stored=${session.messageHash}, provided=${providedHash}`,
    );
  }
  return matches;
}

/**
 * Clear stored messages for a session (called on session clear).
 * @param {string} sessionId - OpenClaw session ID
 */
export function clearSessionMessages(sessionId) {
  if (!sessionId) return;

  const state = loadSessionState();
  const session = state[sessionId];
  if (session) {
    delete session.messages;
    delete session.messageHash;
    saveSessionState(state);
    logDebug(`[session-state] Cleared stored messages for session ${sessionId.slice(0, 8)}...`);
  }
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

    const successRate = Number.parseFloat(stats.successRate) / 100 || 0;
    const linearRate = Number.parseFloat(stats.linearCompletionRate) / 100 || 0.5;

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
  const params = getAdaptiveParams();
  return params.freeTurnLimit.perProvider[providerName] || params.freeTurnLimit.base;
}

/**
 * Check if it's time for a periodic evaluation cycle
 * @returns {boolean}
 */
export function shouldTriggerEvalCycle() {
  const params = getAdaptiveParams();
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
  } else {
    // Save incremented counter even if not triggering
    saveAdaptiveParams(params);
  }

  return shouldEval;
}

/**
 * Get the next provider to force-sample during evaluation cycle
 * Returns null if no evaluation needed, undefined if empty provider list
 * @param {Array<string>} allProviderNames - All available provider names
 * @param {object} providerStats - Current provider statistics (plain object, not Map)
 * @returns {string|null|undefined}
 */
export function getEvaluationSampleProvider(allProviderNames, providerStats) {
  // Check if evaluation cycle should trigger (peek without incrementing)
  const params = getAdaptiveParams();
  const now = Date.now();
  const timeSinceLastEval = now - params.evalCycle.lastEval;
  const shouldEval =
    params.evalCycle.counter >= params.evalCycle.requestThreshold ||
    timeSinceLastEval >= params.evalCycle.timeThreshold;

  if (!shouldEval) {
    return null;
  }

  // Reset the cycle since we're consuming it
  params.evalCycle.counter = 0;
  params.evalCycle.lastEval = now;
  saveAdaptiveParams(params);
  logInfo(
    `[session-state] 🔄 Triggering periodic evaluation cycle (all providers will be sampled)`,
  );

  // Handle empty provider list
  if (!allProviderNames || allProviderNames.length === 0) {
    return undefined;
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

// Shared params cache to handle in-memory modifications
let paramsCache = null;

/**
 * Get adaptive parameters (for debugging/monitoring)
 * Returns a reference to the cached params for in-memory modifications
 */
export function getAdaptiveParams() {
  if (!paramsCache) {
    paramsCache = loadAdaptiveParams();
  }
  return paramsCache;
}

/**
 * Reset adaptive parameters to defaults
 */
export function resetAdaptiveParams() {
  paramsCache = structuredClone(DEFAULT_ADAPTIVE_PARAMS);
  saveAdaptiveParams(paramsCache);
  logInfo(`[session-state] 🔄 Reset adaptive parameters to defaults`);
}
