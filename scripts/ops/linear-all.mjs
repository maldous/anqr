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

const API_KEY = process.env.LINEAR_API_KEY;
const TEAM_ID = process.env.LINEAR_TEAM_ID || "01534c1e-4041-474d-a81e-24f917f33912";

if (!API_KEY) {
  console.error("Error: LINEAR_API_KEY environment variable is required");
  console.error("Usage: LINEAR_API_KEY=your_key node scripts/ops/linear-all.mjs");
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

  console.log(`Fetching backlog issues for team: ${TEAM_ID}\n`);

  while (true) {
    const page = await fetchPage(after);
    all.push(...page.nodes);
    pageNum++;

    console.log(`Page ${pageNum}: +${page.nodes.length} issues (total: ${all.length})`);

    if (!page.pageInfo.hasNextPage) break;
    after = page.pageInfo.endCursor;
  }

  console.log(`\n=== Total backlog issues: ${all.length} ===\n`);

  // Summary by project
  const byProject = {};
  for (const issue of all) {
    const project = issue.project?.name || "No Project";
    byProject[project] = (byProject[project] || 0) + 1;
  }

  console.log("By project:");
  for (const [project, count] of Object.entries(byProject).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${project}: ${count}`);
  }

  // Save full data
  const { writeFileSync } = await import("node:fs");
  writeFileSync("/tmp/linear-all-backlog.json", JSON.stringify(all, null, 2));
  console.log("\nSaved to /tmp/linear-all-backlog.json");
}

// Run main if executed directly
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  await main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
