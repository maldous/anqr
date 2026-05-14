export function formatValidationFeedback(validation) {
  const lines = [
    "⚠️ VALIDATION FAILED — your changes did not pass the validation pipeline. Fix the errors below.",
    "",
  ];
  for (const r of validation.results) {
    if (!r.pass) {
      lines.push(`### ${r.check}`, "```", String(r.detail || "").slice(0, 1500), "```", "");
      if (r.check === "ast-density") {
        lines.push(
          "**How to fix AST density violations:**",
          "",
          "Each file must have at most 1 top-level declaration (function, class, interface, type, enum, or exported const/let). To fix:",
          "1. Identify the file with violations (shown above).",
          "2. Create a new file for each extra declaration in the same directory.",
          "3. Move the extra declarations into their own files.",
          "4. Update imports in other files to point to the new files.",
          "5. Run `run_ast_density` again to verify.",
          "",
          "Example: If `src/foo.ts` has `export function get()` AND `export function post()`, create `src/get.ts` and `src/post.ts`, move each function, and update callers.",
          "",
        );
      }
    }
  }
  lines.push(
    "Fix ONLY the errors listed above.",
    "Run run_ast_density, run_typecheck, run_lint, and run_tests after your last code change.",
    "Then call task_complete when all checks pass.",
  );
  return lines.join("\n");
}
