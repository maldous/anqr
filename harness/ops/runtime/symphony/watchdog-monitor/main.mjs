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
import { quarantineWorktree } from "./quarantine-worktree.mjs";
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

    // Restart failed bridges first (most failures are transient, not commit-related)
    if (!results.symphony && checkSymphony) {
      restartBridge("Symphony");
    }
    if (!results.codebuff && checkCodebuff) {
      restartBridge("Codebuff");
    }

    log(`⏳ Waiting 10s for bridges to restart...`);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Re-check health after restart
    const afterRestart = {
      symphony: checkSymphony ? await checkBridgeHealth(SYMPHONY_PORT, "Symphony") : true,
      codebuff: checkCodebuff ? await checkBridgeHealth(CODEBUFF_PORT, "Codebuff") : true,
    };

    if (afterRestart.symphony && afterRestart.codebuff) {
      log(``);
      log(`╔═══════════════════════════════════════════════════════════════════════╗`);
      log(`║                                                                       ║`);
      log(`║   ✅ ✅ ✅  WATCHDOG RECOVERY SUCCESSFUL  ✅ ✅ ✅                    ║`);
      log(`║                                                                       ║`);
      log(`╚═══════════════════════════════════════════════════════════════════════╝`);
      log(``);
      log(`   All bridges are now healthy after restart`);
      log(`   System is operational`);
      log(``);

      await sendDiscordEmbed({
        title: `🎉 WATCHDOG RECOVERY COMPLETE | ${WORKTREE_ID}`,
        description: `All bridges are healthy after automatic restart.\n\nSystem is operational.`,
        color: 0x00ff00,
        fields: [
          { name: "Worktree", value: WORKTREE_ID, inline: true },
          { name: "Symphony Bridge", value: "✅ Healthy", inline: true },
          { name: "Codebuff Bridge", value: "✅ Healthy", inline: true },
        ],
        threadName: "ANQR",
      }).catch((err) => log(`⚠️ Failed to send Discord notification: ${err.message}`));

      process.exit(0);
    } else {
      // Restart alone didn't fix it — quarantine worktree for recovery service
      const quarantined = await quarantineWorktree();

      if (!quarantined) {
        log(`❌ Quarantine disabled — manual intervention required`);
      }

      log(``);
      log(`╔═══════════════════════════════════════════════════════════════════════╗`);
      log(`║                                                                       ║`);
      log(`║   🚧 🚧 🚧  WORKTREE QUARANTINED  🚧 🚧 🚧                          ║`);
      log(`║                                                                       ║`);
      log(`╚═══════════════════════════════════════════════════════════════════════╝`);
      log(``);
      log(`   Restart did not fix the issue`);
      log(`   Worktree quarantined for recovery service`);
      log(`   Symphony: ${afterRestart.symphony ? "✅ Healthy" : "❌ Failed"}`);
      log(`   Codebuff: ${afterRestart.codebuff ? "✅ Healthy" : "❌ Failed"}`);
      log(``);

      await sendDiscordEmbed({
        title: `🚧 WORKTREE QUARANTINED | ${WORKTREE_ID}`,
        description: `Bridge restart did not fix the issue.\n\nWorktree quarantined — recovery service will handle repair.`,
        color: 0xff9900,
        fields: [
          { name: "Worktree", value: WORKTREE_ID, inline: true },
          {
            name: "Symphony Bridge",
            value: afterRestart.symphony ? "✅ Healthy" : "❌ Failed",
            inline: true,
          },
          {
            name: "Codebuff Bridge",
            value: afterRestart.codebuff ? "✅ Healthy" : "❌ Failed",
            inline: true,
          },
        ],
        threadName: "ANQR",
      }).catch((err) => log(`⚠️ Failed to send Discord notification: ${err.message}`));

      process.exit(1);
    }
  }
}
