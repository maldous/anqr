export function formatValidationFeedback(validation) {
  const lines = [
    "⚠️ VALIDATION FAILED — your changes did not pass the validation pipeline. Fix the errors below.",
    "",
  ];
  for (const r of validation.results) {
    if (!r.pass) {
      lines.push(`### ${r.check}`, "```", String(r.detail || "").slice(0, 1500), "```", "");
    }
  }
  lines.push(
    "Fix ONLY the errors listed above.",
    "Run run_typecheck, run_lint, run_cspell, run_ast_density, and run_tests after your last code change.",
    "Then call task_complete when all checks pass.",
  );
  return lines.join("\n");
}
