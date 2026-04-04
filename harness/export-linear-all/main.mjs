import { writeFile } from "node:fs/promises";

import { fetchAllIssues } from "./fetch-all-issues.mjs";

export async function main() {
  console.log("[export-linear-all] Fetching all Linear issues...");

  const allIssues = await fetchAllIssues();
  console.log(`[export-linear-all] Found ${allIssues.length} total issues`);

  // Transform to desired format with last comment
  const transformed = allIssues.map((issue) => {
    const comments = issue.comments?.nodes || [];
    const lastComment = comments.length > 0 ? comments[comments.length - 1] : null;

    return {
      issueNumber: issue.identifier,
      title: issue.title,
      description: issue.description || "",
      state: issue.state.name,
      lastComment: lastComment
        ? {
            body: lastComment.body,
            createdAt: lastComment.createdAt,
            updatedAt: lastComment.updatedAt,
          }
        : null,
      priority: issue.priority,
      labels: (issue.labels?.nodes || []).map((l) => l.name),
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    };
  });

  // Write JSON export
  await writeFile("linear.json", JSON.stringify(transformed, null, 2));

  console.log(`[export-linear-all] ✅ Export complete: linear.json`);
  console.log(`[export-linear-all] Exported ${transformed.length} issues`);

  // Print state distribution
  const stateCounts = {};
  for (const issue of transformed) {
    const state = issue.state;
    stateCounts[state] = (stateCounts[state] || 0) + 1;
  }

  console.log("\n[export-linear-all] State distribution:");
  for (const [state, count] of Object.entries(stateCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${state}: ${count}`);
  }

  // Count issues with/without comments
  const withComments = transformed.filter((i) => i.lastComment !== null).length;
  console.log(`\n[export-linear-all] Issues with comments: ${withComments}`);
  console.log(`[export-linear-all] Issues without comments: ${transformed.length - withComments}`);
}
