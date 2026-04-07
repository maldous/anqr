import { sendDiscordEmbed } from "../../../integrations/notifications/openclaw-discord.mjs";

import { TRIGGER_RATE_ALERT_COOLDOWN_MS } from "./trigger-rate-alert-cooldown-ms.mjs";
import { TRIGGER_RATE_THRESHOLD } from "./trigger-rate-threshold.mjs";
import { TRIGGER_RATE_WINDOW_MS } from "./trigger-rate-window-ms.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";
import { lastTriggerRateAlert, setLastTriggerRateAlert } from "./last-trigger-rate-alert.mjs";
import { updateMemory } from "./update-memory.mjs";
import { watchdogTriggerHistory } from "./watchdog-trigger-history.mjs";
import { logError } from "./logger.mjs";

export async function trackWatchdogTrigger(serviceName, reason) {
  const now = Date.now();

  // Add current trigger to history
  watchdogTriggerHistory.push({ timestamp: now, service: serviceName, reason });

  // Filter to only recent triggers within the window
  const recentTriggers = watchdogTriggerHistory.filter(
    (trigger) => now - trigger.timestamp < TRIGGER_RATE_WINDOW_MS,
  );

  // Update history to only keep recent triggers
  watchdogTriggerHistory.length = 0;
  watchdogTriggerHistory.push(...recentTriggers);

  // Check if threshold exceeded
  if (recentTriggers.length > TRIGGER_RATE_THRESHOLD) {
    // Check cooldown to avoid alert spam
    const timeSinceLastAlert = now - lastTriggerRateAlert;
    if (timeSinceLastAlert >= TRIGGER_RATE_ALERT_COOLDOWN_MS) {
      setLastTriggerRateAlert(now);

      // Send critical alert
      const triggerSummary = recentTriggers
        .slice(-5)
        .map((t) => `• ${t.service}: ${t.reason}`)
        .join("\n");

      try {
        await sendDiscordEmbed({
          title: `🚨 WATCHDOG HIGH TRIGGER RATE | ${WORKTREE_ID}`,
          description: `**CRITICAL: Watchdog triggered ${recentTriggers.length} times in the last hour**\n\nThis indicates systemic instability requiring immediate investigation.`,
          color: 0xff0000, // Red
          fields: [
            { name: "Worktree", value: WORKTREE_ID, inline: true },
            {
              name: "Trigger Count",
              value: `${recentTriggers.length} (threshold: ${TRIGGER_RATE_THRESHOLD})`,
              inline: true,
            },
            { name: "Time Window", value: "Last 60 minutes", inline: true },
            { name: "Recent Triggers", value: triggerSummary, inline: false },
          ],
          footer: "⚠️ Manual investigation required - possible configuration or code issues",
          threadName: "Watchdog",
        });
      } catch (err) {
        logError(`[watchdog] ⚠️ Failed to send trigger rate alert: ${err.message}`);
      }

      await updateMemory(
        `CRITICAL: Watchdog triggered ${recentTriggers.length} times in 1 hour - systemic instability detected`,
      );

      logError(
        `[watchdog] 🚨 CRITICAL: Watchdog trigger rate exceeded threshold (${recentTriggers.length} > ${TRIGGER_RATE_THRESHOLD} in 1 hour)`,
      );
    }
  }
}
