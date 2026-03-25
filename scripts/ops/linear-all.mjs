#!/usr/bin/env node

/**
 * linear-all.mjs — Fetch all backlog issues from Linear with pagination
 *
 * Usage:
 *   LINEAR_API_KEY=your_key LINEAR_TEAM_ID=your_team_id node scripts/ops/linear-all.mjs
 *
 * Or with default team from linear-client.mjs:
 *   LINEAR_API_KEY=your_key node scripts/ops/linear-all.mjs
 */

import { fileURLToPath } from "node:url";
import { createLogger } from "./lib/logger.mjs";

const { logInfo, logError } = createLogger("linear-all");

const API_KEY = process.env.LINEAR_API_KEY;
const TEAM_ID = process.env.LINEAR_TEAM_ID || "01534c1e-4041-474d-a81e-24f917f33912";

if (!API_KEY) {
  logError("Error: LINEAR_API_KEY environment variable is required");
  logError("Usage: LINEAR_API_KEY=your_key node scripts/ops/linear-all.mjs");
  process.exit(1);
}

const query = `
query BacklogCount($after: String) {
  issues(
    first: 250
    after: $after
    filter: {
      state: { type: { eq: "backlog" } }
    }
  ) {
    nodes {
      id
      identifier
      team { name }
      project { name }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`;

async function fetchPage(after = null) {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_KEY,
    },
    body: JSON.stringify({
      query,
      variables: { teamId: TEAM_ID, after },
    }),
  });

  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data.issues;
}

async function main() {
  let after = null;
  const all = [];
  let pageNum = 0;

  logInfo(`Fetching backlog issues for team: ${TEAM_ID}\n`);

  while (true) {
    const page = await fetchPage(after);
    all.push(...page.nodes);
    pageNum++;

    logInfo(`Page ${pageNum}: +${page.nodes.length} issues (total: ${all.length})`);

    if (!page.pageInfo.hasNextPage) break;
    after = page.pageInfo.endCursor;
  }

  logInfo(`\n=== Total backlog issues: ${all.length} ===\n`);

  // Summary by project
  const byProject = {};
  for (const issue of all) {
    const project = issue.project?.name || "No Project";
    byProject[project] = (byProject[project] || 0) + 1;
  }

  logInfo("By project:");
  for (const [project, count] of Object.entries(byProject).sort((a, b) => b[1] - a[1])) {
    logInfo(`  ${project}: ${count}`);
  }

  // Save full data
  const { writeFileSync } = await import("node:fs");
  writeFileSync("/tmp/linear-all-backlog.json", JSON.stringify(all, null, 2));
  logInfo("\nSaved to /tmp/linear-all-backlog.json");
}

// Run main if executed directly
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  await main().catch((err) => {
    logError(err);
    process.exit(1);
  });
}
