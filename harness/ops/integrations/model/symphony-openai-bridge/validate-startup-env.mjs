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
 * Checks:
 * 1. At least one provider token is set (bridge can serve requests)
 * 2. ANQR_WORKTREE_ID is set for worktree bridges
 * 3. SYMPHONY_BRIDGE_PORT is set (explicit port assignment)
 *
 * Logs warnings/errors for missing variables but does not throw — the bridge
 * can still start, but operators should investigate.
 *
 * @returns {{ valid: boolean, warnings: string[] }}
 */
export function validateStartupEnv() {
  const warnings = [];

  // Check 1: At least one provider token
  const hasProvider = PROVIDER_TOKEN_VARS.some((v) => !!process.env[v]);
  if (!hasProvider) {
    const msg =
      "No provider tokens found in environment — bridge cannot serve requests. " +
      `Checked: ${PROVIDER_TOKEN_VARS.join(", ")}`;
    logError(`[startup-env] ${msg}`);
    warnings.push(msg);
  } else {
    const present = PROVIDER_TOKEN_VARS.filter((v) => !!process.env[v]);
    logInfo(`[startup-env] Provider tokens: ${present.join(", ")}`);
  }

  // Check 2: ANQR_WORKTREE_ID for worktree/executor bridges
  if (IS_WORKTREE_BRIDGE && !process.env.ANQR_WORKTREE_ID) {
    const msg = "IS_WORKTREE_BRIDGE=true but ANQR_WORKTREE_ID is not set";
    logWarn(`[startup-env] ${msg}`);
    warnings.push(msg);
  }

  // Check 3: Explicit port assignment
  if (!process.env.SYMPHONY_BRIDGE_PORT) {
    const msg =
      "SYMPHONY_BRIDGE_PORT not set — using default 4319. " +
      "Set explicitly in systemd unit for production.";
    logWarn(`[startup-env] ${msg}`);
    warnings.push(msg);
  }

  // Check 4: BRIDGE_MODE is explicitly set (not auto-derived)
  if (!process.env.BRIDGE_MODE) {
    const msg =
      `BRIDGE_MODE not set explicitly — auto-derived as "${BRIDGE_MODE}". ` +
      "Set BRIDGE_MODE in systemd unit for production.";
    logWarn(`[startup-env] ${msg}`);
    warnings.push(msg);
  }

  const valid = warnings.length === 0;
  if (valid) {
    logInfo(
      `[startup-env] All startup environment checks passed ` +
        `(port=${process.env.SYMPHONY_BRIDGE_PORT}, mode=${BRIDGE_MODE})`,
    );
  }

  return { valid, warnings };
}
