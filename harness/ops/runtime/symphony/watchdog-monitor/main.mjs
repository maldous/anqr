import { sendDiscordEmbed } from "../../../integrations/notifications/openclaw-discord.mjs";

import { CODEBUFF_PORT } from "./codebuff-port.mjs";
import { SYMPHONY_PORT } from "./symphony-port.mjs";
import { WATCHDOG_ENABLED } from "./watchdog-enabled.mjs";
import { WATCHDOG_TIMEOUT_MS } from "./watchdog-timeout-ms.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";
import { bridgeArg } from "./bridge-arg.mjs";
import { checkBridgeHealth } from "./check-bridge-health.mjs";
import { log } from "./log.mjs";
import { restartBridge } from "./restart-bridge.mjs";
import { rollbackGit } from "./rollback-git.mjs";
import { waitForBridge } from "./wait-for-bridge.mjs";

export async function main() {
  if (!WATCHDOG_ENABLED) {
    log(`⚠️ Watchdog disabled (WATCHDOG_ENABLED=false)`);
    process.exit(0);
  }

  log(`🔍 Starting bridge health monitoring (timeout: ${WATCHDOG_TIMEOUT_MS}ms)...`);

  const checkSymphony = bridgeArg === "both" || bridgeArg === "symphony";
  const checkCodebuff = bridgeArg === "both" || bridgeArg === "codebuff";

  const results = {
    symphony: checkSymphony
      ? await waitForBridge(SYMPHONY_PORT, "Symphony", WATCHDOG_TIMEOUT_MS)
      : true,
    codebuff: checkCodebuff
      ? await waitForBridge(CODEBUFF_PORT, "Codebuff", WATCHDOG_TIMEOUT_MS)
      : true,
  };

  const allHealthy = results.symphony && results.codebuff;

  if (allHealthy) {
    log(`✅ All monitored bridges are healthy`);
    process.exit(0);
  } else {
    log(`❌ One or more bridges failed health checks`);
    log(`   Symphony: ${results.symphony ? "✅" : "❌"}`);
    log(`   Codebuff: ${results.codebuff ? "✅" : "❌"}`);

    // Attempt rollback
    const rolledBack = await rollbackGit();

    if (!rolledBack) {
      log(`❌ Rollback failed - manual intervention required`);
      process.exit(1);
    }

    // Restart failed bridges after rollback
    if (!results.symphony && checkSymphony) {
      restartBridge("Symphony");
    }
    if (!results.codebuff && checkCodebuff) {
      restartBridge("Codebuff");
    }

    // Wait 10 seconds for bridges to start after rollback
    log(`⏳ Waiting 10s for bridges to restart after rollback...`);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Re-check health
    const afterRollback = {
      symphony: checkSymphony ? await checkBridgeHealth(SYMPHONY_PORT, "Symphony") : true,
      codebuff: checkCodebuff ? await checkBridgeHealth(CODEBUFF_PORT, "Codebuff") : true,
    };

    if (afterRollback.symphony && afterRollback.codebuff) {
      log(``);
      log(`╔═══════════════════════════════════════════════════════════════════════╗`);
      log(`║                                                                       ║`);
      log(`║   ✅ ✅ ✅  WATCHDOG RECOVERY SUCCESSFUL  ✅ ✅ ✅                    ║`);
      log(`║                                                                       ║`);
      log(`╚═══════════════════════════════════════════════════════════════════════╝`);
      log(``);
      log(`   All bridges are now healthy after rollback`);
      log(`   System is operational`);
      log(``);

      // Send final success notification to Discord
      await sendDiscordEmbed({
        title: `🎉 WATCHDOG RECOVERY COMPLETE | ${WORKTREE_ID}`,
        description: `All bridges are healthy after automatic rollback.\n\nSystem is operational.`,
        color: 0x00ff00, // Green
        fields: [
          { name: "Worktree", value: WORKTREE_ID, inline: true },
          { name: "Symphony Bridge", value: "✅ Healthy", inline: true },
          { name: "Codebuff Bridge", value: "✅ Healthy", inline: true },
        ],
      }).catch((err) => log(`⚠️ Failed to send Discord notification: ${err.message}`));

      process.exit(0);
    } else {
      log(``);
      log(`╔═══════════════════════════════════════════════════════════════════════╗`);
      log(`║                                                                       ║`);
      log(`║   ❌ ❌ ❌  WATCHDOG RECOVERY FAILED  ❌ ❌ ❌                        ║`);
      log(`║                                                                       ║`);
      log(`╚═══════════════════════════════════════════════════════════════════════╝`);
      log(``);
      log(`   Rollback did not fix the issue`);
      log(`   MANUAL INTERVENTION REQUIRED`);
      log(`   Symphony: ${afterRollback.symphony ? "✅ Healthy" : "❌ Failed"}`);
      log(`   Codebuff: ${afterRollback.codebuff ? "✅ Healthy" : "❌ Failed"}`);
      log(``);

      // Send critical failure notification to Discord
      await sendDiscordEmbed({
        title: `🚨 WATCHDOG RECOVERY FAILED | ${WORKTREE_ID}`,
        description: `Automatic rollback did not fix the issue.\n\n**ACTION NEEDED**: Manual investigation required!`,
        color: 0xff0000, // Red
        fields: [
          { name: "Worktree", value: WORKTREE_ID, inline: true },
          {
            name: "Symphony Bridge",
            value: afterRollback.symphony ? "✅ Healthy" : "❌ Failed",
            inline: true,
          },
          {
            name: "Codebuff Bridge",
            value: afterRollback.codebuff ? "✅ Healthy" : "❌ Failed",
            inline: true,
          },
        ],
      }).catch((err) => log(`⚠️ Failed to send Discord notification: ${err.message}`));

      process.exit(1);
    }
  }
}
