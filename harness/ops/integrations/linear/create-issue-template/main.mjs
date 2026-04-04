import { createIssue, STATES, LABELS } from "../linear-client.mjs";

import { customizeIssue } from "./customize-issue.mjs";
import { issueTemplate } from "./issue-template.mjs";
import { validateIssue } from "./validate-issue.mjs";

export async function main() {
  console.log("📋 Linear Issue Creation Template\n");
  console.log("This template helps create standardized, high-quality Linear issues.\n");

  try {
    // Customize the template for your specific issue
    const customizedIssue = customizeIssue(issueTemplate);

    console.log("🎯 Customized Issue Preview:");
    console.log("Title:", customizedIssue.title);
    console.log(
      "State:",
      Object.entries(STATES).find(([_, id]) => id === customizedIssue.stateId)?.[0],
    );
    console.log(
      "Labels:",
      customizedIssue.labelIds
        .map((id) => Object.entries(LABELS).find(([_, labelId]) => labelId === id)?.[0])
        .join(", "),
    );
    console.log("Priority:", customizedIssue.priority);
    console.log("Estimate:", customizedIssue.estimate, "points\n");

    // Validate before creation
    await validateIssue(customizedIssue);

    // Create the issue
    console.log("🚀 Creating Linear issue...\n");

    const issue = await createIssue(customizedIssue);

    console.log("✅ Issue created successfully!\n");
    console.log("Issue Details:");
    console.log(`  Identifier: ${issue.identifier}`);
    console.log(`  Title: ${issue.title}`);
    console.log(`  State: ${issue.state.name}`);
    console.log(`  Priority: P${issue.priority}`);
    console.log(`  Estimate: ${issue.estimate} points`);
    console.log(`  Labels: ${issue.labels.nodes.map((l) => l.name).join(", ")}`);
    console.log(`  Created: ${new Date().toISOString()}`);

    console.log(`\n🔗 Linear URL: https://linear.app/anqr/issue/${issue.identifier}`);

    console.log("\n📝 Next steps:");
    console.log("  1. Review the issue in Linear");
    console.log("  2. Update state as work progresses (inProgress → inReview → done)");
    console.log("  3. Add comments with progress updates");
    console.log("  4. Link related issues using Linear's linking feature");
    console.log("  5. Mark as Done when all acceptance criteria are met");
  } catch (error) {
    console.error("❌ Failed to create issue:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    process.exit(1);
  }
}
