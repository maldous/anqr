// Generated from ../../../../scripts/ops/integrations/linear/test-agent-workflow.mjs:433

import { assertCondition } from "./assert-condition.mjs";
import { logTestResult } from "./log-test-result.mjs";

export async function testProgrammaticUsage() {
  console.log("\n🧪 Test Suite 7: Programmatic Usage Verification");
  console.log("=".repeat(50));

  try {
    // Verify that the workflow function can be imported and used
    const workflowModule = await import("../agent-workflow-create-issue.mjs");

    await assertCondition(
      "Workflow module can be imported",
      workflowModule && workflowModule.workflowCreateLinearIssue,
      "Workflow module should export workflowCreateLinearIssue function",
    );

    // Test programmatic usage
    const programmaticIssue = await workflowModule.workflowCreateLinearIssue({
      title: "Test: Programmatic issue creation via import",
      description:
        "This test verifies that issues can be created programmatically using imported workflow functions.",
      priority: 2,
      labels: ["harness", "testing"],
      stateId: "todo",
    });

    await assertCondition(
      "Programmatic usage creates valid issues",
      programmaticIssue && programmaticIssue.id,
      "Programmatic usage should create valid issues with proper IDs",
    );

    logTestResult(
      "Programmatic usage verification",
      true,
      `Issue created via import: ${programmaticIssue.identifier}`,
    );

    return programmaticIssue;
  } catch (error) {
    console.error("❌ Programmatic usage test failed:", error.message);
    logTestResult("Programmatic usage", false, error.message);
    throw error;
  }
}
