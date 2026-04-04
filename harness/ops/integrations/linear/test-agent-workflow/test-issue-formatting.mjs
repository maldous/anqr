// Generated from ../../../../harness/ops/integrations/linear/test-agent-workflow.mjs:159

import { workflowCreateLinearIssue } from "../agent-workflow-create-issue.mjs";

import { assertCondition } from "./assert-condition.mjs";
import { logTestResult } from "./log-test-result.mjs";

export async function testIssueFormatting() {
  console.log("\n🧪 Test Suite 3: Issue Formatting with Title and Description");
  console.log("=".repeat(50));

  try {
    // Test with complete description
    const completeIssue = await workflowCreateLinearIssue({
      title: "Test: Complete issue with full description and acceptance criteria",
      description: `## Summary

This issue tests complete formatting with detailed description, scope class, required context, touched paths, constraints, verification commands, expected evidence format, and escalation rules.

## Scope Class

docs-harness / current-platform / launch-convergence / operational-external

## Required Context
- README.md
- AGENTS.md
- docs/README.md
- relevant issue context

## Touched Paths
- harness/ops/integrations/linear/test-agent-workflow.mjs
- harness/ops/integrations/linear/agent-workflow-create-issue.mjs

## Constraints
- Must use existing Linear client tools
- Must follow best practices for categorization
- Must use proper priority levels
- Must assign to correct team and state

## Verification
\`\`\`bash
node harness/ops/integrations/linear/test-agent-workflow.mjs
\`\`\`

## Expected Evidence
- Summary of what changed
- Scope class documentation
- Touched paths list
- Decisions made documentation
- Commands run with pass/fail results
- Changed files list
- Commit hash
- Issue comment text
- Artifacts attached/linked
- Risk / rollback note
- Follow-up work documentation

## Escalate If
- Paid spend is required
- Production auth changes are needed
- Store submissions are required
- Signing material handling is required
- Org-level security/admin changes are required
- Privacy/compliance posture changes are required
- Changing the default anonymous MCP posture
- Adding mobile to the launch claim without proof`,
      priority: 3,
      labels: ["harness", "documentation"],
      stateId: "backlog",
    });

    await assertCondition(
      "Issue title is preserved",
      completeIssue.title === "Test: Complete issue with full description and acceptance criteria",
      "Issue title should be preserved exactly",
    );

    await assertCondition(
      "Issue description contains expected content",
      completeIssue.description && completeIssue.description.includes("## Summary"),
      "Issue description should contain the expected formatted content",
    );

    await assertCondition(
      "Issue has proper structure",
      completeIssue.description &&
        completeIssue.description.includes("Scope Class") &&
        completeIssue.description.includes("Touched Paths") &&
        completeIssue.description.includes("Verification"),
      "Issue description should have proper structure with all required sections",
    );

    logTestResult(
      "Complete issue formatting",
      true,
      `Issue ${completeIssue.identifier} has properly formatted title and description`,
    );

    return completeIssue;
  } catch (error) {
    console.error("❌ Issue formatting failed:", error.message);
    logTestResult("Issue formatting", false, error.message);
    throw error;
  }
}
