// Generated from ../../../../scripts/ops/integrations/linear/export-issues.mjs:67

import { listIssuesByState } from "../linear-client.mjs";
import { writeFile, mkdir } from "node:fs/promises";

import { DONE_DAYS_LOOKBACK } from "./done-days-lookback.mjs";
import { OPEN_STATES } from "./open-states.mjs";
import { OUTPUT_DIR } from "./output-dir.mjs";
import { OUTPUT_FILE } from "./output-file.mjs";
import { fetchRecentDoneIssues } from "./fetch-recent-done-issues.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
  try {
    logInfo("[export-issues] Starting Linear issue export...");

    // Fetch open issues
    logInfo("[export-issues] Fetching open issues...");
    const openIssues = await listIssuesByState(OPEN_STATES);
    logInfo(`[export-issues] Found ${openIssues.length} open issues`);

    // Fetch recent Done issues
    logInfo(`[export-issues] Fetching Done issues updated in last ${DONE_DAYS_LOOKBACK} days...`);
    const recentDone = await fetchRecentDoneIssues(DONE_DAYS_LOOKBACK);
    logInfo(`[export-issues] Found ${recentDone.length} recent Done issues`);

    // Combine and filter out Canceled
    const allIssues = [...openIssues, ...recentDone].filter(
      (issue) => issue.state.name !== "Canceled",
    );

    logInfo(`[export-issues] Total issues after filtering: ${allIssues.length}`);

    // Create output directory
    await mkdir(OUTPUT_DIR, { recursive: true });

    // Write JSON export
    await writeFile(OUTPUT_FILE, JSON.stringify(allIssues, null, 2));

    logInfo(`[export-issues] ✅ Export complete: ${OUTPUT_FILE}`);
    logInfo(`[export-issues] Exported ${allIssues.length} issues`);

    // Print state distribution
    const stateCounts = {};
    for (const issue of allIssues) {
      const state = issue.state.name;
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    }

    logInfo("\n[export-issues] State distribution:");
    for (const [state, count] of Object.entries(stateCounts).sort((a, b) => b[1] - a[1])) {
      logInfo(`  ${state}: ${count}`);
    }
  } catch (error) {
    logError(`[export-issues] ❌ Export failed: ${error.message}`);
    throw error;
  }
}
