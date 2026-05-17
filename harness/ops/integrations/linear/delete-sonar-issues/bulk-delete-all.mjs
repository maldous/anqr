#!/usr/bin/env node
/**
 * Bulk delete ALL Linear issues in the ANQR team.
 * This is destructive but reversible via Linear trash within 30 days.
 * Run after ensuring all services are stopped.
 */
import { listIssuesByState } from "../linear-client/list-issues-by-state.mjs";
import { deleteIssue } from "./delete-issue.mjs";

const STATES = ["Todo", "In Progress", "In Review", "Backlog", "Blocked", "Human Review"];

async function main() {
  console.log(`Fetching issues in states: ${STATES.join(", ")}...`);

  // Fetch all issues from all open states
  const allIssues = [];
  for (const state of STATES) {
    const issues = await listIssuesByState([state]);
    allIssues.push(...issues);
    console.log(`  ${state}: ${issues.length} issues`);
  }

  console.log(`\nTotal issues to delete: ${allIssues.length}`);
  if (allIssues.length === 0) {
    console.log("No issues to delete. Done.");
    return;
  }

  // Delete in batches, pausing to avoid rate limits
  const BATCH_SIZE = 5;
  const BATCH_DELAY_MS = 1000;
  let deleted = 0;
  let errors = 0;

  for (let i = 0; i < allIssues.length; i += BATCH_SIZE) {
    const batch = allIssues.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((issue) => deleteIssue(issue.id)),
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === "fulfilled") {
        deleted++;
        process.stdout.write(`\r  Deleted ${deleted}/${allIssues.length}: ${batch[j].identifier}`);
      } else {
        errors++;
        console.error(`\n  ERROR deleting ${batch[j].identifier}: ${result.reason.message}`);
      }
    }

    if (i + BATCH_SIZE < allIssues.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  console.log(`\n\nDone. Deleted: ${deleted}, Errors: ${errors}`);

  // Verify no issues remain
  const remaining = [];
  for (const state of STATES) {
    const issues = await listIssuesByState([state]);
    remaining.push(...issues);
  }
  console.log(`Remaining issues: ${remaining.length}`);
  if (remaining.length > 0) {
    console.log("Remaining:", remaining.map((i) => i.identifier).join(", "));
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
