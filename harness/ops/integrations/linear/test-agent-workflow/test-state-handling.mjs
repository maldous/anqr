// Generated from ../../../../scripts/ops/integrations/linear/test-agent-workflow.mjs:304

import { workflowCreateLinearIssue } from "../agent-workflow-create-issue.mjs";

import { assertCondition } from "./assert-condition.mjs";
import { logTestResult } from "./log-test-result.mjs";

export async function testStateHandling() {
  console.log("\n🧪 Test Suite 5: State Handling Verification");
  console.log("=".repeat(50));

  try {
    // Test different states
    const stateTests = [
      { stateId: "backlog", name: "Backlog state for new issues" },
      { stateId: "todo", name: "Todo state for ready-to-work issues" },
      { stateId: "inProgress", name: "In Progress state for active work" },
    ];

    for (const test of stateTests) {
      const issue = await workflowCreateLinearIssue({
        title: `Test: State handling - ${test.name}`,
        description: `This issue tests state handling where the issue should be in ${test.stateId} state.`,
        priority: 3,
        labels: ["harness"],
        stateId: test.stateId,
      });

      await assertCondition(
        "State ID is preserved",
        issue.state &&
          issue.state.name === test.stateId.charAt(0).toUpperCase() + test.stateId.slice(1),
        `Issue should be in state: ${test.stateId}`,
      );

      logTestResult(
        `State handling test: ${test.name}`,
        true,
        `Issue ${issue.identifier} created with state ${test.stateId}`,
      );
    }

    return true;
  } catch (error) {
    console.error("❌ State handling failed:", error.message);
    logTestResult("State handling", false, error.message);
    throw error;
  }
}
