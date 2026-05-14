export function buildIssuePrompt(issue) {
  const lines = [`## Goal: ${issue.identifier} — ${issue.title}`, ""];

  if (issue.description) {
    lines.push("### Goal Description", "", issue.description, "");
  }

  const aiHints = (issue.comments?.nodes || [])
    .filter((c) => c.body.includes("AI Hint:") || c.body.includes("AI hint:"))
    .map((c) => c.body);
  if (aiHints.length > 0) {
    lines.push("### AI Hints", "", ...aiHints, "");
  }

  lines.push(
    "### Your Goal",
    "",
    "Your goal is to achieve the outcome described above. To accomplish this goal, you should:",
    "",
    "1. Create appropriate subtasks (using subgoal tools if available) to break down the goal into achievable steps",
    "2. **CRITICAL: If this is a multi-phase issue, FIRST verify that all previous phases completed successfully.**",
    "   - Check for comments indicating previous phase failures (provider errors, model errors, timeouts)",
    "   - If a previous phase failed, DO NOT proceed to the next phase",
    "   - Instead, complete the failed phase first before moving forward",
    "   - This prevents building on incomplete or failed work",
    "3. Read relevant files to understand the current state",
    "4. Plan your changes to achieve the goal",
    "5. Make the minimal necessary changes using write_file, patch_file, or delete_file",
    "6. Run run_typecheck to verify there are no type errors",
    "7. If there are type errors, fix them and run run_typecheck again",
    "8. Run run_lint to verify there are no lint errors or warnings",
    "9. If there are lint errors or warnings, fix them and run run_lint again",
    "10. Run run_ast_density to verify no file has more than 1 top-level declaration",
    "11. Run run_tests to verify the unit test suite passes",
    "12. If there are density violations or test failures, fix them before proceeding",
    "13. Call task_complete with a summary of how you achieved the goal",
    "",
    "Keep changes minimal. Focus on achieving the goal with the least amount of modification.",
    "IMPORTANT: Always run run_typecheck, run_lint, run_ast_density, AND run_tests before calling task_complete. Fix all errors and warnings first.",
    "IMPORTANT: For multi-phase issues, verify previous phase completion BEFORE starting new work to avoid building on failed foundations.",
  );

  return lines.join("\n");
}
