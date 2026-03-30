#!/usr/bin/env node

/**
 * export-issues.mjs — Export Linear issues to JSON for RAG indexing
 * 
 * Exports:
 * - All open issues (Backlog, Todo, In Progress, In Review, Blocked, Human Review)
 * - Done issues updated within last 90 days
 * - Excludes Canceled issues
 * 
 * Output: reports/linear-export/issues-latest.json
 */

import { writeFile, mkdir } from "node:fs/promises";
import { listIssuesByState, query, TEAM_ID } from "./linear-client.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logError } = createLogger();

const OPEN_STATES = ["Backlog", "Todo", "In Progress", "In Review", "Blocked", "Human Review"];
const DONE_DAYS_LOOKBACK = 90;
const OUTPUT_DIR = "reports/linear-export";
const OUTPUT_FILE = `${OUTPUT_DIR}/issues-latest.json`;

/**
 * Fetch Done issues updated within the last N days
 */
async function fetchRecentDoneIssues(days) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffISO = cutoffDate.toISOString();

  const allNodes = [];
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    const result = await query(
      `query($filter: IssueFilter!, $after: String) {
        issues(filter: $filter, first: 50, after: $after) {
          nodes {
            id identifier title description priority
            state { name }
            labels { nodes { id name } }
            createdAt updatedAt
          }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      {
        filter: {
          team: { id: { eq: TEAM_ID } },
          state: { name: { eq: "Done" } },
          updatedAt: { gte: cutoffISO },
        },
        after: cursor,
      },
    );
    allNodes.push(...result.issues.nodes);
    hasMore = result.issues.pageInfo.hasNextPage;
    cursor = result.issues.pageInfo.endCursor;
  }

  return allNodes;
}

async function main() {
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

await main();
