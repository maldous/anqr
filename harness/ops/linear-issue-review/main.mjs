import { CLOSE_AS_CANCELED } from "./close-as-canceled.mjs";
import { CLOSE_AS_DONE } from "./close-as-done.mjs";
import { SCOPE_UPDATES } from "./scope-updates.mjs";
import { STATES } from "./states.mjs";
import { addComment } from "./add-comment.mjs";
import { dryRun } from "./dry-run.mjs";
import { listAllOpen } from "./list-all-open.mjs";
import { stats } from "./stats.mjs";
import { updateIssue } from "./update-issue.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function main() {
  logInfo(`\n=== Linear Issue Review ${dryRun ? "(DRY RUN)" : ""} ===\n`);

  const issues = await listAllOpen();
  logInfo(`Found ${issues.length} open issues\n`);

  const issueMap = new Map(issues.map((i) => [i.identifier, i]));

  // 1. Close completed issues as Done
  logInfo("--- CLOSING COMPLETED ISSUES (Done) ---\n");
  for (const [identifier, evidence] of Object.entries(CLOSE_AS_DONE)) {
    const issue = issueMap.get(identifier);
    if (!issue) {
      logWarn(`  ⚠️  ${identifier}: not found in open issues (may already be closed)`);
      stats.skipped++;
      continue;
    }
    const comment = `✅ **Closed by architecture review**\n\n${evidence}\n\n---\n*Closed by linear-issue-review.mjs — all issues reviewed against current hexagonal architecture with strict contracts.*`;
    if (dryRun) {
      logInfo(`  🔲 ${identifier}: ${issue.title}`);
      logInfo(`     → Would mark Done + comment: ${evidence.substring(0, 80)}...`);
    } else {
      try {
        await addComment(issue.id, comment);
        await updateIssue(issue.id, { stateId: STATES.done });
        logInfo(`  ✅ ${identifier}: ${issue.title} → Done`);
      } catch (err) {
        logError(`  ❌ ${identifier}: ${err.message}`);
        stats.errors++;
        continue;
      }
    }
    stats.done++;
  }

  // 2. Cancel stale issues
  logInfo("\n--- CANCELING STALE ISSUES ---\n");
  for (const [identifier, reason] of Object.entries(CLOSE_AS_CANCELED)) {
    const issue = issueMap.get(identifier);
    if (!issue) {
      logWarn(`  ⚠️  ${identifier}: not found`);
      stats.skipped++;
      continue;
    }
    const comment = `🚫 **Canceled by architecture review**\n\n${reason}\n\n---\n*Canceled by linear-issue-review.mjs*`;
    if (dryRun) {
      logInfo(`  🔲 ${identifier}: ${issue.title}`);
      logInfo(`     → Would cancel: ${reason.substring(0, 80)}...`);
    } else {
      try {
        await addComment(issue.id, comment);
        await updateIssue(issue.id, { stateId: STATES.canceled });
        logInfo(`  🚫 ${identifier}: ${issue.title} → Canceled`);
      } catch (err) {
        logError(`  ❌ ${identifier}: ${err.message}`);
        stats.errors++;
        continue;
      }
    }
    stats.canceled++;
  }

  // 3. Update issues with scope corrections
  logInfo("\n--- UPDATING ISSUE SCOPE ---\n");
  for (const [identifier, update] of Object.entries(SCOPE_UPDATES)) {
    const issue = issueMap.get(identifier);
    if (!issue) {
      logWarn(`  ⚠️  ${identifier}: not found`);
      stats.skipped++;
      continue;
    }
    if (dryRun) {
      logInfo(`  🔲 ${identifier}: ${issue.title}`);
      logInfo(`     → Would add scope review comment`);
    } else {
      try {
        await addComment(issue.id, update.comment + "\n\n---\n*Added by linear-issue-review.mjs*");
        logInfo(`  📝 ${identifier}: ${issue.title} → Updated`);
      } catch (err) {
        logError(`  ❌ ${identifier}: ${err.message}`);
        stats.errors++;
        continue;
      }
    }
    stats.updated++;
  }

  // Summary
  logInfo("\n=== SUMMARY ===\n");
  logInfo(`  Done:     ${stats.done}`);
  logInfo(`  Canceled: ${stats.canceled}`);
  logInfo(`  Updated:  ${stats.updated}`);
  logInfo(`  Skipped:  ${stats.skipped}`);
  logInfo(`  Errors:   ${stats.errors}`);
  logInfo(
    `  Valid (no changes): ${issues.length - stats.done - stats.canceled - stats.updated - stats.skipped}`,
  );
  logInfo(`\n  Total open issues processed: ${issues.length}`);
  if (dryRun) logWarn("\n  ⚠️  DRY RUN — no changes were made\n");
}
