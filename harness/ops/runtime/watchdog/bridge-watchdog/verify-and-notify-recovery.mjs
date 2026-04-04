// Generated from ../../../../scripts/ops/runtime/watchdog/bridge-watchdog.mjs:343

import { sendDiscordEmbed } from "../../../integrations/notifications/openclaw-discord.mjs";

import { WORKTREE_ID } from "./worktree-id.mjs";
import { getServiceStatus } from "./get-service-status.mjs";
import { logError } from "./logger.mjs";

export async function verifyAndNotifyRecovery(serviceName, shortName) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const recoveryStatus = getServiceStatus(serviceName);
  if (recoveryStatus === "active") {
    try {
      await sendDiscordEmbed({
        title: `🎉 Recovery Successful | ${WORKTREE_ID}`,
        description: `${shortName.toUpperCase()} bridge is now healthy after rollback`,
        color: 0x00ff00, // Green
        fields: [
          { name: "Worktree", value: WORKTREE_ID, inline: true },
          { name: "Service", value: serviceName, inline: true },
          { name: "Status", value: "Active", inline: true },
        ],
      });
    } catch (err) {
      logError(`[watchdog] ⚠️ Failed to send recovery notification: ${err.message}`);
    }
  }
}
