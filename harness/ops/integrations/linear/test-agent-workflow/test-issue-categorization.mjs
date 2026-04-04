import { workflowCreateLinearIssue } from "../agent-workflow-create-issue.mjs";

import { assertCondition } from "./assert-condition.mjs";
import { logTestResult } from "./log-test-result.mjs";

export async function testIssueCategorization() {
  console.log("\n🧪 Test Suite 2: Issue Categorization with Labels");
  console.log("=".repeat(50));

  try {
    // Test multiple label combinations
    const labelTests = [
      { labels: ["harness"], name: "Harness-only labeling" },
      { labels: ["harness", "bug"], name: "Harness with bug classification" },
      { labels: ["documentation", "governance"], name: "Documentation and governance work" },
      { labels: ["product", "feature"], name: "Product feature work" },
    ];

    for (const test of labelTests) {
      const issue = await workflowCreateLinearIssue({
        title: `Test: Label categorization - ${test.name}`,
        description: `This issue tests ${test.name} with proper label categorization.`,
        priority: 3,
        labels: test.labels,
        stateId: "backlog",
      });

      await assertCondition(
        "Labels applied correctly",
        issue.labels && issue.labels.nodes.length >= test.labels.length,
        `Issue should have at least ${test.labels.length} labels applied`,
      );

      // Verify specific labels are present
      for (const labelName of test.labels) {
        const labelPresent = issue.labels.nodes.some((l) => l.name === labelName);
        await assertCondition(
          `Label "${labelName}" present in issue`,
          labelPresent,
          `Label "${labelName}" should be present in issue labels`,
        );
      }

      logTestResult(
        `Label test: ${test.name}`,
        true,
        `Issue ${issue.identifier} has correct labels: ${test.labels.join(", ")}`,
      );
    }

    return true;
  } catch (error) {
    console.error("❌ Issue categorization failed:", error.message);
    logTestResult("Issue categorization", false, error.message);
    throw error;
  }
}
