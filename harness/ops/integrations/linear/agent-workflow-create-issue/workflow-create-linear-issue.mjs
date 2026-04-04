import { args } from "./args.mjs";
import { createLinearIssueWorkflow } from "./create-linear-issue-workflow.mjs";

export async function workflowCreateLinearIssue(params) {
  try {
    // Override args with provided params
    const originalArgs = { ...args };

    // Simulate command line arguments
    const simulatedArgs = {
      values: {
        title: params.title,
        description: params.description,
        priority: params.priority?.toString() || "3",
        labels: params.labels?.join(",") || "harness",
        stateId: params.stateId || "backlog",
        help: false,
      },
    };

    // Temporarily override args
    Object.assign(args, simulatedArgs);

    const result = await createLinearIssueWorkflow();

    // Restore original args
    Object.assign(args, originalArgs);

    return result;
  } catch (error) {
    console.error("❌ Workflow error:", error.message);
    throw error;
  }
}
