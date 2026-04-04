import { workflowCreateLinearIssue } from "../agent-workflow-create-issue.mjs";

import { assertCondition } from "./assert-condition.mjs";
import { logTestResult } from "./log-test-result.mjs";

export async function testPriorityHandling() {
  console.log("\n🧪 Test Suite 4: Priority Handling Verification");
  console.log("=".repeat(50));

  try {
    // Test all priority levels
    const priorityNames = ["None", "Urgent", "High", "Normal", "Low"];

    for (let priority = 0; priority <= 4; priority++) {
      const issue = await workflowCreateLinearIssue({
        title: `Test: Priority level ${priority} (${priorityNames[priority]})`,
        description: `This issue tests priority level ${priority} which represents ${priorityNames[priority]}.`,
        priority: priority,
        labels: ["harness"],
        stateId: "backlog",
      });

      await assertCondition(
        `Priority ${priority} preserved correctly`,
        issue.priority === priority,
        `Issue priority should be preserved as ${priority}`,
      );

      await assertCondition(
        `Priority name matches`,
        issue.priority === priority,
        `Priority level should be ${priorityNames[priority]}`,
      );

      logTestResult(
        `Priority level ${priority} test`,
        true,
        `Issue ${issue.identifier} created with priority ${priority} (${priorityNames[priority]})`,
      );
    }

    return true;
  } catch (error) {
    console.error("❌ Priority handling failed:", error.message);
    logTestResult("Priority handling", false, error.message);
    throw error;
  }
}
