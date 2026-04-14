import { sendDiscordEmbed } from "../../../integrations/notifications/openclaw-discord.mjs";
import { transitionWorktree } from "../../../symphony-state.mjs";

import { WATCHDOG_ROLLBACK } from "./watchdog-rollback.mjs";
import { WATCHDOG_TIMEOUT_MS } from "./watchdog-timeout-ms.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";
import { exec } from "./exec.mjs";
import { log } from "./log.mjs";

export async function quarantineWorktree() {
  if (!WATCHDOG_ROLLBACK) {
    log(`⚠️ Watchdog quarantine disabled (WATCHDOG_ROLLBACK=false)`);
    return false;
  }

  const currentCommit = exec("git rev-parse HEAD") || "unknown";

  log(``);
  log(`╔═══════════════════════════════════════════════════════════════════════╗`);
  log(`║                                                                       ║`);
  log(`║   🚨 🚨 🚨  WATCHDOG QUARANTINE TRIGGERED  🚨 🚨 🚨                  ║`);
  log(`║                                                                       ║`);
  log(`╚═══════════════════════════════════════════════════════════════════════╝`);
  log(``);
  log(`   Reason: Bridge failed to become healthy within timeout`);
  log(`   Current commit: ${currentCommit.slice(0, 7)}`);
  log(`   Action: Quarantine worktree for recovery service`);
  log(``);
  log(`═══════════════════════════════════════════════════════════════════════`);
  log(``);

  await sendDiscordEmbed({
    title: `🚨 WATCHDOG QUARANTINE | ${WORKTREE_ID}`,
    description: `Bridge failed to become healthy after restart.\n\nQuarantining worktree for recovery service.`,
    color: 0xff0000,
    fields: [
      { name: "Worktree", value: WORKTREE_ID, inline: true },
      { name: "Commit", value: currentCommit.slice(0, 7), inline: true },
      { name: "Timeout", value: `${WATCHDOG_TIMEOUT_MS}ms`, inline: true },
    ],
    threadName: "ANQR",
  }).catch((err) => log(`⚠️ Failed to send Discord notification: ${err.message}`));

  transitionWorktree(WORKTREE_ID, "quarantined", {
    reason: "watchdog_bridge_unhealthy",
    lastError: `commit: ${currentCommit.slice(0, 7)}, timeout: ${WATCHDOG_TIMEOUT_MS}ms`,
    quarantinedAt: new Date().toISOString(),
  });

  log(`✅ Worktree ${WORKTREE_ID} quarantined — recovery service will handle repair.`);
  return true;
}
