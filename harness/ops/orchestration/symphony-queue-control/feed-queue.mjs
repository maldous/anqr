import { TARGET_MIN } from "../../symphony-config.mjs";
import { isDiscordSourced, markDiscordSource } from "../../core/discord-source.mjs";
import { updateIssue, STATES } from "../../linear-client.mjs";
import { recordTransition } from "../../symphony-state.mjs";

import { getQueueSnapshot } from "./get-queue-snapshot.mjs";
import { logAction } from "./log-action.mjs";

export async function feedQueue(snap = null, dryRun = false) {
  const live = snap || (await getQueueSnapshot());
  // CRITICAL: Feed based on Todo (runnable) count, not In Progress
  // Runners pick from Todo only, so that's what matters for keeping runners busy
  const deficit = TARGET_MIN - live.readyDepth;
  if (deficit <= 0) {
    logAction(
      "info",
      `Ready depth ${live.readyDepth} >= target_min ${TARGET_MIN} — no feeding needed`,
    );
    return;
  }

  const candidates = [...live.backlog.automatable].sort(
    (a, b) => (a.priority ?? 99) - (b.priority ?? 99),
  );
  const toFeed = candidates.slice(0, deficit);
  if (toFeed.length === 0) {
    logAction("info", "No feed-eligible backlog issues");
    return;
  }

  for (const issue of toFeed) {
    if (dryRun) {
      const fromDiscord = isDiscordSourced(issue);
      logAction(
        "feed",
        `[DRY RUN] Would promote ${issue.identifier} to Todo: ${issue.title}${fromDiscord ? " (Discord)" : ""}`,
      );
      continue;
    }
    await updateIssue(issue.id, { stateId: STATES.todo });

    // Mark the source in symphony-state if this is a Discord-created issue
    const fromDiscord = isDiscordSourced(issue);
    if (fromDiscord) {
      markDiscordSource(issue.identifier);
    }

    recordTransition(issue.identifier, {
      actor: "queue-control",
      reason: "feed",
      from: "Backlog",
      to: "Todo",
    });
    logAction(
      "feed",
      `Promoted ${issue.identifier} to Todo: ${issue.title}${fromDiscord ? " (Discord)" : ""}`,
    );
  }
}
