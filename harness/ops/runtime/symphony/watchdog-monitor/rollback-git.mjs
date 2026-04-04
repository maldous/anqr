// Generated from ../../../../scripts/ops/runtime/symphony/watchdog-monitor.mjs:92

import { sendDiscordEmbed } from "../../../integrations/notifications/openclaw-discord.mjs";
import { writeFileSync } from "node:fs";

import { WATCHDOG_ROLLBACK } from "./watchdog-rollback.mjs";
import { WATCHDOG_TIMEOUT_MS } from "./watchdog-timeout-ms.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";
import { exec } from "./exec.mjs";
import { log } from "./log.mjs";

export async function rollbackGit() {
  if (!WATCHDOG_ROLLBACK) {
    log(`⚠️ Git rollback disabled (WATCHDOG_ROLLBACK=false)`);
    return false;
  }

  const currentCommit = exec("git rev-parse HEAD");
  const previousCommit = exec("git rev-parse HEAD~1");

  if (!currentCommit || !previousCommit) {
    log(`❌ Failed to get commit hashes - cannot rollback`);
    return false;
  }

  // VERY OBVIOUS ROLLBACK BANNER
  log(``);
  log(`╔═══════════════════════════════════════════════════════════════════════╗`);
  log(`║                                                                       ║`);
  log(`║   🚨 🚨 🚨  WATCHDOG AUTOMATIC ROLLBACK TRIGGERED  🚨 🚨 🚨          ║`);
  log(`║                                                                       ║`);
  log(`╚═══════════════════════════════════════════════════════════════════════╝`);
  log(``);
  log(`   Reason: Bridge failed to become healthy within timeout`);
  log(`   Current commit: ${currentCommit.slice(0, 7)} (FAILED)`);
  log(`   Rolling back to: ${previousCommit.slice(0, 7)} (PREVIOUS)`);
  log(``);
  log(`═══════════════════════════════════════════════════════════════════════`);
  log(``);

  // Send Discord notification about rollback
  sendDiscordEmbed({
    title: `🚨 WATCHDOG ROLLBACK | ${WORKTREE_ID}`,
    description: `Bridge failed to become healthy after restart.\n\nRolling back to previous commit...`,
    color: 0xff0000, // Red
    fields: [
      { name: "Worktree", value: WORKTREE_ID, inline: true },
      { name: "Failed Commit", value: currentCommit.slice(0, 7), inline: true },
      { name: "Rolling Back To", value: previousCommit.slice(0, 7), inline: true },
      { name: "Timeout", value: `${WATCHDOG_TIMEOUT_MS}ms`, inline: true },
    ],
  }).catch((err) => log(`⚠️ Failed to send Discord notification: ${err.message}`));

  // Hard reset to previous commit
  const resetResult = exec("git reset --hard HEAD~1");
  if (!resetResult) {
    log(`❌ Git reset failed`);
    return false;
  }

  const newHead = exec("git rev-parse HEAD");
  if (newHead === previousCommit) {
    log(``);
    log(`✅ ROLLBACK SUCCESSFUL`);
    log(`   HEAD is now at: ${newHead.slice(0, 7)}`);
    log(``);

    // Send Discord success notification
    sendDiscordEmbed({
      title: `✅ Watchdog Rollback Success | ${WORKTREE_ID}`,
      description: `Successfully rolled back to previous commit.\n\nBridge services will be restarted.`,
      color: 0x00ff00, // Green
      fields: [
        { name: "Worktree", value: WORKTREE_ID, inline: true },
        { name: "Reverted Commit", value: currentCommit.slice(0, 7), inline: true },
        { name: "Current Commit", value: newHead.slice(0, 7), inline: true },
      ],
    }).catch((err) => log(`⚠️ Failed to send Discord notification: ${err.message}`));

    // Update MEMORY.md with very obvious rollback notice
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const rollbackBanner = `

═══════════════════════════════════════════════════════════════════════════════
🚨 🚨 🚨  WATCHDOG AUTOMATIC ROLLBACK OCCURRED  🚨 🚨 🚨
═══════════════════════════════════════════════════════════════════════════════

### ${timestamp} - WATCHDOG ROLLBACK: ${currentCommit.slice(0, 7)} → ${newHead.slice(0, 7)}

**REASON**: Bridge health check failed after restart (timeout: ${WATCHDOG_TIMEOUT_MS}ms)

**ACTION TAKEN**:
- Git reset --hard to previous commit (${newHead.slice(0, 7)})
- Bridge services restarted with previous code
- System automatically recovered

**FAILED COMMIT**: ${currentCommit.slice(0, 7)} (reverted)
**CURRENT COMMIT**: ${newHead.slice(0, 7)} (restored)

⚠️ **IMPORTANT**: Review the failed commit to identify what broke the bridge startup!

═══════════════════════════════════════════════════════════════════════════════

`;
      writeFileSync("MEMORY.md", rollbackBanner, { flag: "a" });
      log(`📝 Updated MEMORY.md with rollback notice`);
    } catch (err) {
      log(`⚠️ Failed to update MEMORY.md: ${err.message}`);
    }

    return true;
  } else {
    log(
      `❌ Rollback verification failed: HEAD is ${newHead.slice(0, 7)}, expected ${previousCommit.slice(0, 7)}`,
    );
    return false;
  }
}
