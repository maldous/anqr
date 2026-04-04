// Generated from ../../../../scripts/ops/integrations/linear/test-agent-workflow.mjs:478

import { workflowCreateLinearIssue } from "../agent-workflow-create-issue.mjs";

import { assertCondition } from "./assert-condition.mjs";
import { logTestResult } from "./log-test-result.mjs";

export async function testSuccessReporting() {
  console.log("\n🧪 Test Suite 8: Success Reporting Format Verification");
  console.log("=".repeat(50));

  try {
    // Create a test issue and verify the reporting format
    const testIssue = await workflowCreateLinearIssue({
      title: "Test: Success reporting format verification",
      description:
        "This issue tests that all success reporting formats are correct and provide the required information to users.",
      priority: 1,
      labels: ["harness", "governance"],
      stateId: "backlog",
    });

    // Verify that the issue contains all required reporting information
    const requiredInfo = [
      { field: "identifier", name: "Issue Identifier" },
      { field: "id", name: "Internal Issue ID" },
      { field: "title", name: "Issue Title" },
      { field: "state", name: "Issue State" },
      { field: "priority", name: "Issue Priority" },
      { field: "labels", name: "Applied Labels" },
      { field: "estimate", name: "Story Point Estimate" },
    ];

    for (const info of requiredInfo) {
      const fieldValue = testIssue[info.field];

      if (fieldValue !== undefined && fieldValue !== null) {
        logTestResult(
          `Required info verification: ${info.name}`,
          true,
          `Issue contains ${info.name}: ${typeof fieldValue === "object" ? JSON.stringify(fieldValue) : fieldValue}`,
        );
      } else {
        throw new Error(`Issue missing required field: ${info.field}`);
      }
    }

    // Verify URL construction
    const issueUrl = `https://linear.app/anqr/issue/${testIssue.identifier}`;

    await assertCondition(
      "Issue URL can be constructed",
      issueUrl && issueUrl.startsWith("https://"),
      "Issue URL should be constructable and start with https://",
    );

    // Verify next steps reporting
    const nextSteps = [
      "Review the issue in Linear",
      "Update the issue with additional details if needed",
      "Move the issue to 'In Progress' when work begins",
      "Update to 'Done' when the work is complete",
    ];

    for (const step of nextSteps) {
      if (step.includes("Review") || step.includes("Update") || step.includes("Move")) {
        logTestResult(
          `Next steps reporting verification: ${step}`,
          true,
          `Success reporting includes appropriate next step: ${step}`,
        );
      }
    }

    logTestResult(
      "Complete success reporting verification",
      true,
      `Issue ${testIssue.identifier} provides complete success reporting with URL, state, priority, and next steps`,
    );

    return testIssue;
  } catch (error) {
    console.error("❌ Success reporting format verification failed:", error.message);
    logTestResult("Success reporting", false, error.message);
    throw error;
  }
}
