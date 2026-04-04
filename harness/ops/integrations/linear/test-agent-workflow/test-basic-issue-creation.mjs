// Generated from ../../../../scripts/ops/integrations/linear/test-agent-workflow.mjs:60

import { workflowCreateLinearIssue } from "../agent-workflow-create-issue.mjs";

import { assertCondition } from "./assert-condition.mjs";
import { logTestResult } from "./log-test-result.mjs";

export async function testBasicIssueCreation() {
  console.log("\n🧪 Test Suite 1: Basic Issue Creation");
  console.log("=".repeat(50));

  try {
    const issue = await workflowCreateLinearIssue({
      title: "Test: Basic issue creation workflow",
      description:
        "This test verifies that the basic workflow can create Linear issues successfully.",
      priority: 3,
      labels: ["harness"],
      stateId: "backlog",
    });

    await assertCondition(
      "Issue created successfully",
      issue && issue.id,
      "Issue object should contain an id",
    );

    await assertCondition(
      "Issue has correct identifier format",
      issue.identifier && /^ANQ-\d{4}$/.test(issue.identifier),
      "Issue identifier should match ANQ-#### format",
    );

    await assertCondition(
      "Issue URL can be constructed",
      issue.identifier && `https://linear.app/anqr/issue/${issue.identifier}`,
      "Issue URL should be constructable from identifier",
    );

    logTestResult("Basic workflow verification", true, `Issue created: ${issue.identifier}`);

    console.log(`🔗 Issue URL: https://linear.app/anqr/issue/${issue.identifier}`);

    return issue;
  } catch (error) {
    console.error("❌ Basic issue creation failed:", error.message);
    logTestResult("Basic issue creation", false, error.message);
    throw error;
  }
}
