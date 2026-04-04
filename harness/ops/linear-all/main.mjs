import { TEAM_ID } from "./team-id.mjs";
import { fetchPage } from "./fetch-page.mjs";
import { logInfo } from "./logger.mjs";

export async function main() {
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
