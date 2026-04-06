// Test output decomposed into print-test-results.mjs and print-completion-summary.mjs.

import { getCurrentStatus, runAgentWorkflowTests } from "./index.mjs";
import { printTestResults } from "./print-test-results.mjs";
import { printCompletionSummary } from "./print-completion-summary.mjs";

await (async function main() {
  console.log("🚀 ANQR Agent Workflow Test Suite");
  console.log("=".repeat(70));
  console.log("📋 Goal: Verify agents can read instructions and create Linear issues");
  console.log("🎯 Acceptance Criteria:");
  console.log("   - Linear issue is created successfully using provided tools");
  console.log("   - Issue has appropriate title and description");
  console.log("   - Issue is properly categorized with labels");
  console.log("   - Issue is assigned to correct team and state");
  console.log("   - Issue URL is returned and displayed");
  console.log("=".repeat(70));

  // Display current system status
  await getCurrentStatus();

  console.log("\n🚀 Starting comprehensive test suite...\n");

  // Run the main test execution function
  const testResults = await runAgentWorkflowTests();

  printTestResults(testResults);
  printCompletionSummary(testResults);

  // Exit with appropriate status
  process.exit(testResults.success ? 0 : 1);
})();
