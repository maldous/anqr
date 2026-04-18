// Decomposed into focused startup modules — this file orchestrates the sequence.

import {
  BRIDGE_ROOT,
  CONTROL_REPO_ROOT,
  IS_WORKTREE_BRIDGE,
  PORT,
  VALID_TOKENS,
  server,
} from "./index.mjs";

import { logDebug, logInfo, logWarn } from "./logger.mjs";
import { setupProcessHandlers } from "./setup-process-handlers.mjs";
import { runRetrievalWarmup } from "./startup-retrieval-warmup.mjs";
import { logStartupBanner } from "./startup-banner.mjs";
import { runStartupSelfTests } from "./startup-self-test.mjs";
import { sendStartupDiscordNotification } from "./startup-discord-notify.mjs";
import { initializeProbes } from "./startup-probe-init.mjs";
import { verifyContext7Health } from "./startup-context7-verify.mjs";
import { installConsoleOutputGuard } from "./install-console-output-guard.mjs";
import { logStartupContextCaps } from "./log-startup-context-caps.mjs";
import { migrateLegacyState } from "../../../core/symphony-shared-state/migrate-legacy-state.mjs";

if (VALID_TOKENS.size > 1) {
  logDebug(`Auth: accepting ${VALID_TOKENS.size} tokens`);
}

setupProcessHandlers();
installConsoleOutputGuard();

server.timeout = 0;

server.keepAliveTimeout = 0;

server.listen(PORT, "127.0.0.1", async () => {
  logInfo(`Bridge root: ${BRIDGE_ROOT}`);
  if (IS_WORKTREE_BRIDGE) {
    logInfo(`Worktree bridge isolation active: repo paths remap into ${BRIDGE_ROOT}`);
    logInfo(`Control-plane checkout detected at: ${CONTROL_REPO_ROOT}`);
  }

  const warmupResult = await runRetrievalWarmup();
  await logStartupBanner(warmupResult);

  // E Phase 4: Advisory config preflight at bridge startup.
  // Logs warnings for config drift but does NOT block the bridge — validateStartupEnv
  // (in server.mjs) already catches fatal env misconfigurations. Config surface drift
  // is an operational concern worth logging, not worth killing the bridge.
  try {
    const { enforceConfigPreflight } =
      await import("../../../harness-doctor/enforce-config-preflight.mjs");
    await enforceConfigPreflight();
    logInfo("[startup] ✅ Config preflight passed");
  } catch (err) {
    logWarn(`[startup] ⚠️ Config preflight advisory: ${err.message}`);
  }

  // Migrate legacy worktree-local state to shared bridge state directory.
  // This is idempotent and safe to call on every startup.
  migrateLegacyState();

  await runStartupSelfTests();
  await sendStartupDiscordNotification();
  initializeProbes();
  logStartupContextCaps();
  verifyContext7Health();

  // Discord monitoring removed - OpenClaw handles Discord interaction directly
  // The OpenClaw Gateway (port 18789) and Discord Router (port 18790) handle Discord commands

  // NOTE: Runner timer management removed from bridge startup.
  // Bridge startup must NOT have side effects on runner timers.
  // Use symphony-control.mjs --start/--stop to manage runners independently.
  // See: External review finding F3 — starting a worktree bridge was
  // re-enabling runner timers, including wrong-scope runners.
  logInfo(`ℹ️  Runner timers are managed separately via symphony-control.mjs`);
});
