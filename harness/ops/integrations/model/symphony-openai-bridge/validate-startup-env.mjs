import { BRIDGE_MODE } from "./bridge-mode.mjs";
import { IS_WORKTREE_BRIDGE } from "./is-worktree-bridge.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

/**
 * Minimum required provider tokens — at least one must be set for the bridge
 * to have any chance of serving requests.
 */
const PROVIDER_TOKEN_VARS = [
  "GROQ_TOKEN",
  "GEMINI_TOKEN",
  "OPENROUTER_TOKEN",
  "MISTRAL_TOKEN",
  "CEREBRAS_TOKEN",
  "CODEBUFF_API_KEY",
];

/**
 * Validate critical startup environment variables.
 *
 * Fail-closed enforcement:
 * - CRITICAL: zero provider tokens → THROW (bridge cannot serve any requests)
 * - CRITICAL (worktree mode): missing ANQR_WORKTREE_ID → THROW (no worktree identity)
 * - CRITICAL (worktree mode): missing SYMPHONY_BRIDGE_PORT → THROW (port collision risk)
 * - CRITICAL (worktree mode): missing BRIDGE_MODE → THROW (must be explicit for executors)
 * - Advisory (control-plane mode): missing port, mode → log warning
 *
 * Accepts optional param overrides for testability. When called without
 * arguments, uses the module-level constants resolved from env/filesystem.
 *
 * @param {object} [overrides]
 * @param {string} [overrides.bridgeMode]
 * @param {boolean} [overrides.isWorktreeBridge]
 * @param {Record<string, string|undefined>} [overrides.env]
 * @returns {{ valid: boolean, warnings: string[] }}
 * @throws {Error} When critical env is missing (fail-closed)
 */
export function validateStartupEnv({
  bridgeMode = BRIDGE_MODE,
  isWorktreeBridge = IS_WORKTREE_BRIDGE,
  env = process.env,
} = {}) {
  const warnings = [];

  // CRITICAL: At least one provider token must be present.
  // Without any provider tokens, the bridge cannot serve a single request.
  // This is a fatal misconfiguration — fail-closed.
  const hasProvider = PROVIDER_TOKEN_VARS.some((v) => !!env[v]);
  if (!hasProvider) {
    const msg =
      "FATAL: No provider tokens found in environment — bridge cannot serve any requests. " +
      `Checked: ${PROVIDER_TOKEN_VARS.join(", ")}. Bridge startup refused.`;
    logError(`[startup-env] ${msg}`);
    throw new Error(msg);
  } else {
    const present = PROVIDER_TOKEN_VARS.filter((v) => !!env[v]);
    logInfo(`[startup-env] Provider tokens: ${present.join(", ")}`);
  }

  // Check 2: ANQR_WORKTREE_ID for worktree/executor bridges.
  // In worktree mode, this is CRITICAL — the executor has no identity without it.
  // In control-plane mode, this is advisory.
  if (isWorktreeBridge && !env.ANQR_WORKTREE_ID) {
    const msg =
      "FATAL: IS_WORKTREE_BRIDGE=true but ANQR_WORKTREE_ID is not set — " +
      "worktree executor has no identity. Bridge startup refused.";
    logError(`[startup-env] ${msg}`);
    throw new Error(msg);
  }

  // Check 3: Explicit port assignment.
  // In worktree mode, this is CRITICAL — default port risks collisions with other executors.
  // In control-plane mode, this is advisory.
  if (!env.SYMPHONY_BRIDGE_PORT) {
    if (isWorktreeBridge) {
      const msg =
        "FATAL: SYMPHONY_BRIDGE_PORT not set in worktree mode — " +
        "default port 4319 risks collision with other executors. Bridge startup refused.";
      logError(`[startup-env] ${msg}`);
      throw new Error(msg);
    }
    const msg =
      "SYMPHONY_BRIDGE_PORT not set — using default 4319. " +
      "Set explicitly in systemd unit for production.";
    logWarn(`[startup-env] ${msg}`);
    warnings.push(msg);
  }

  // Check 4: BRIDGE_MODE is explicitly set (not auto-derived).
  // In worktree mode, this is CRITICAL — auto-derivation may be incorrect.
  // In control-plane mode, this is advisory.
  if (!env.BRIDGE_MODE) {
    if (isWorktreeBridge) {
      const msg =
        "FATAL: BRIDGE_MODE not set explicitly in worktree mode — " +
        `auto-derived as "${bridgeMode}", but executors must set BRIDGE_MODE explicitly. ` +
        "Bridge startup refused.";
      logError(`[startup-env] ${msg}`);
      throw new Error(msg);
    }
    const msg =
      `BRIDGE_MODE not set explicitly — auto-derived as "${bridgeMode}". ` +
      "Set BRIDGE_MODE in systemd unit for production.";
    logWarn(`[startup-env] ${msg}`);
    warnings.push(msg);
  }

  const valid = warnings.length === 0;
  if (valid) {
    logInfo(
      `[startup-env] All startup environment checks passed ` +
        `(port=${env.SYMPHONY_BRIDGE_PORT}, mode=${bridgeMode})`,
    );
  }

  return { valid, warnings };
}
