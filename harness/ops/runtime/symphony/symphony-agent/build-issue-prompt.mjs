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
    "### Design Rules — read before planning",
    "",
    "**AST Density (mandatory):** Every `.ts`, `.tsx`, and `.mjs` file must contain at most ONE top-level declaration (function, class, interface, type, enum, or exported const/let). This is an architectural constraint enforced by the preflight gate — violations BLOCK your commit.",
    "",
    "- Before adding a new declaration, check if the target file already has one. If yes, create a new file instead.",
    "- Type-only files (containing only `interface`/`type` declarations) are exempt.",
    "- **No exceptions for small constants.** Even a small `const` at the top level counts as a declaration. Extract it into its own file if the file already has another declaration.",
    "- Run `run_ast_density` FIRST after making changes — before `run_typecheck` — because density fixes often restructure files.",
    "",
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
    "4. **Plan your changes respecting the Design Rules above** — for each file you'll touch, count its current top-level declarations and decide whether you need new files",
    "5. Make the minimal necessary changes using write_file, patch_file, or delete_file",
    "6. Run run_ast_density FIRST to verify no file exceeds 1 top-level declaration",
    "7. If there are density violations, fix them by splitting into separate files, then re-run run_ast_density",
    "8. Run run_typecheck to verify there are no type errors",
    "9. If there are type errors, fix them and run run_typecheck again",
    "10. Run run_lint to verify there are no lint errors or warnings",
    "11. If there are lint errors or warnings, fix them and run run_lint again",
    "12. Run run_tests to verify the unit test suite passes",
    "13. If there are test failures, fix them before proceeding",
    "14. Call task_complete with a summary of how you achieved the goal",
    "",
    "Keep changes minimal. Focus on achieving the goal with the least amount of modification.",
    "IMPORTANT: Always run run_ast_density, run_typecheck, run_lint, AND run_tests before calling task_complete. Fix all errors and warnings first.",
    "IMPORTANT: Run run_ast_density BEFORE run_typecheck — density violations often require file restructuring.",
    "IMPORTANT: For multi-phase issues, verify previous phase completion BEFORE starting new work to avoid building on failed foundations.",
  );

  return lines.join("\n");
}
