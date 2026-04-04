// Generated from ../../../../scripts/ops/integrations/linear/test-agent-workflow.mjs:348

import { workflowCreateLinearIssue } from "../agent-workflow-create-issue.mjs";

import { logTestResult } from "./log-test-result.mjs";

export async function testErrorHandling() {
  console.log("\n🧪 Test Suite 6: Error Handling and Input Validation");
  console.log("=".repeat(50));

  try {
    // Test 1: Missing required parameter (title)
    try {
      await workflowCreateLinearIssue({
        description: "This should fail because title is missing",
        priority: 3,
      });
      throw new Error("Should have failed with missing title");
    } catch (error) {
      if (error.message.includes("title is required")) {
        logTestResult(
          "Missing title parameter validation",
          true,
          "Correctly rejects missing required parameter",
        );
      } else {
        throw error;
      }
    }

    // Test 2: Invalid state ID
    try {
      await workflowCreateLinearIssue({
        title: "Test: Invalid state ID handling",
        description: "This should fail because stateId is invalid",
        stateId: "invalid-state",
      });
      throw new Error("Should have failed with invalid state");
    } catch (error) {
      if (error.message.includes("Invalid stateId")) {
        logTestResult("Invalid state ID rejection", true, "Correctly rejects invalid state IDs");
      } else {
        throw error;
      }
    }

    // Test 3: Invalid labels
    try {
      await workflowCreateLinearIssue({
        title: "Test: Invalid label handling",
        description: "This should fail because labels are invalid",
        labels: ["invalid-label-1", "invalid-label-2"],
      });
      throw new Error("Should have failed with invalid labels");
    } catch (error) {
      if (error.message.includes("Invalid labels")) {
        logTestResult("Invalid label rejection", true, "Correctly rejects invalid labels");
      } else {
        throw error;
      }
    }

    // Test 4: Invalid priority
    try {
      await workflowCreateLinearIssue({
        title: "Test: Invalid priority handling",
        description: "This should fail because priority is out of range",
        priority: 99,
      });
      throw new Error("Should have failed with invalid priority");
    } catch (error) {
      if (error.message.includes("Priority must be")) {
        logTestResult(
          "Invalid priority rejection",
          true,
          "Correctly rejects invalid priority levels",
        );
      } else {
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Error handling test failed:", error.message);
    logTestResult("Error handling", false, error.message);
    throw error;
  }
}
