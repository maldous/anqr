#!/usr/bin/env node

/**
 * symphony-provider-health.mjs — Provider health state tracking and timeout management
 *
 * Tracks provider health states and manages timeout configuration for local vs hosted models.
 *
 * Health States:
 *   - healthy: Provider is functioning normally
 *   - degraded: Provider is experiencing issues but still usable
 *   - cooling-down: Provider recently failed, in cooldown period
 *   - disabled: Provider manually disabled
 *   - blocked: Provider blocked from use (e.g., routing loop prevention)
 *   - unknown: Provider state not yet determined
 *
 * Timeout Configuration:
 *   - Local models: 60s (longer timeout for local inference)
 *   - Hosted models: 30s (faster timeout for cloud APIs)
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logWarn } = createLogger();

// Health states
export const HEALTH_STATES = {
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  COOLING_DOWN: "cooling-down",
  DISABLED: "disabled",
  BLOCKED: "blocked",
  UNKNOWN: "unknown",
};

// Timeout configuration (in milliseconds)
export const PROVIDER_TIMEOUTS = {
  LOCAL: 60_000, // 60 seconds for local models
  HOSTED: 30_000, // 30 seconds for hosted models
};

// Local provider patterns
const LOCAL_PROVIDER_PATTERNS = [
  /^ollama/i,
  /^localhost/i,
  /127\.0\.0\.1/,
  /^local-/i,
];

// State file
const PROJECT_ROOT = resolve(process.cwd());
const STATE_DIR = resolve(PROJECT_ROOT, "reports", "symphony");
const HEALTH_STATE_FILE = resolve(STATE_DIR, "provider-health.json");

/**
 * Determine if a provider is local based on name or base URL
 */
export function isLocalProvider(providerName, baseUrl = "") {
  return LOCAL_PROVIDER_PATTERNS.some(
    (pattern) => pattern.test(providerName) || pattern.test(baseUrl)
  );
}

/**
 * Get timeout for a provider based on whether it's local or hosted
 */
export function getProviderTimeout(providerName, baseUrl = "") {
  return isLocalProvider(providerName, baseUrl)
    ? PROVIDER_TIMEOUTS.LOCAL
    : PROVIDER_TIMEOUTS.HOSTED;
}

/**
 * Load health state from file
 */
function loadHealthState() {
  try {
    if (existsSync(HEALTH_STATE_FILE)) {
      return JSON.parse(readFileSync(HEALTH_STATE_FILE, "utf-8"));
    }
  } catch (err) {
    logWarn(`Failed to load health state: ${err.message}`);
  }
  return {};
}

/**
 * Save health state to file
 */
function saveHealthState(state) {
  try {
    writeFileSync(HEALTH_STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    logWarn(`Failed to save health state: ${err.message}`);
  }
}

/**
 * Get health state for a provider
 */
export function getProviderHealthState(providerName) {
  const state = loadHealthState();
  return state[providerName] || {
    state: HEALTH_STATES.UNKNOWN,
    lastUpdated: null,
    consecutiveFailures: 0,
    consecutiveSuccesses: 0,
  };
}

/**
 * Set health state for a provider
 */
export function setProviderHealthState(providerName, healthState, metadata = {}) {
  const state = loadHealthState();
  state[providerName] = {
    state: healthState,
    lastUpdated: Date.now(),
    ...metadata,
  };
  saveHealthState(state);
  logInfo(`Provider health: ${providerName} → ${healthState}`);
}

/**
 * Record provider success and update health state
 */
export function recordProviderHealthSuccess(providerName) {
  const current = getProviderHealthState(providerName);
  const consecutiveSuccesses = (current.consecutiveSuccesses || 0) + 1;
  const consecutiveFailures = 0;

  // Transition to healthy after 2 consecutive successes
  const newState =
    consecutiveSuccesses >= 2 ? HEALTH_STATES.HEALTHY : current.state;

  setProviderHealthState(providerName, newState, {
    consecutiveSuccesses,
    consecutiveFailures,
    lastSuccess: Date.now(),
  });
}

/**
 * Record provider failure and update health state
 */
export function recordProviderHealthFailure(providerName, errorType = "unknown") {
  const current = getProviderHealthState(providerName);
  const consecutiveFailures = (current.consecutiveFailures || 0) + 1;
  const consecutiveSuccesses = 0;

  let newState = current.state;

  // State transitions based on consecutive failures
  if (consecutiveFailures >= 3) {
    newState = HEALTH_STATES.COOLING_DOWN;
  } else if (consecutiveFailures >= 1) {
    newState = HEALTH_STATES.DEGRADED;
  }

  setProviderHealthState(providerName, newState, {
    consecutiveSuccesses,
    consecutiveFailures,
    lastFailure: Date.now(),
    lastErrorType: errorType,
  });
}

/**
 * Get all providers with their health states
 */
export function getAllProviderHealthStates() {
  return loadHealthState();
}

/**
 * Check if provider should be retried based on health state
 */
export function shouldRetryProvider(providerName, cooldownMs = 360_000) {
  const health = getProviderHealthState(providerName);

  // Never retry disabled or blocked providers
  if (
    health.state === HEALTH_STATES.DISABLED ||
    health.state === HEALTH_STATES.BLOCKED
  ) {
    return false;
  }

  // Check cooldown period for cooling-down state
  if (health.state === HEALTH_STATES.COOLING_DOWN) {
    const timeSinceFailure = Date.now() - (health.lastFailure || 0);
    return timeSinceFailure >= cooldownMs;
  }

  // Always retry healthy, degraded, or unknown providers
  return true;
}

/**
 * Reset provider to healthy state (for testing or manual intervention)
 */
export function resetProviderHealth(providerName) {
  setProviderHealthState(providerName, HEALTH_STATES.HEALTHY, {
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    lastUpdated: Date.now(),
  });
}

/**
 * Return to preferred provider when it becomes healthy again
 */
export function checkPreferredProviderHealth(preferredProviders = []) {
  const healthStates = loadHealthState();
  
  for (const providerName of preferredProviders) {
    const health = healthStates[providerName];
    if (!health) continue;

    // Check if preferred provider is now healthy and past cooldown
    if (health.state === HEALTH_STATES.HEALTHY) {
      logInfo(`Preferred provider ${providerName} is healthy - can be used again`);
      return providerName;
    }

    // Check if cooling-down period has expired
    if (health.state === HEALTH_STATES.COOLING_DOWN) {
      const timeSinceFailure = Date.now() - (health.lastFailure || 0);
      const cooldownMs = isLocalProvider(providerName) ? 120_000 : 360_000;
      
      if (timeSinceFailure >= cooldownMs) {
        // Reset to unknown so it can be re-probed
        setProviderHealthState(providerName, HEALTH_STATES.UNKNOWN, {
          consecutiveSuccesses: 0,
          consecutiveFailures: 0,
        });
        logInfo(`Preferred provider ${providerName} cooldown expired - ready for retry`);
        return providerName;
      }
    }
  }

  return null;
}
