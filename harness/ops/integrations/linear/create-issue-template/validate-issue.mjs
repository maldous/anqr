import { validateIssueInput, formatValidationResult } from "../linear-client.mjs";
import { validateIssueInput as validateLocalIssueInput } from "../validate-issue.mjs";

export async function validateIssue(issueInput) {
  console.log("🔍 Validating issue before creation...\n");

  // Validate using both validation systems
  const validation1 = validateIssueInput(issueInput);
  const validation2 = validateLocalIssueInput(issueInput);

  const combinedValidation = {
    valid: validation1.valid && validation2.valid,
    errors: [...validation1.errors, ...validation2.errors],
    warnings: [...validation1.warnings, ...validation2.warnings],
    recommendations: [...validation1.recommendations, ...validation2.recommendations],
    score: Math.min(validation1.score, validation2.score),
  };

  console.log(formatValidationResult(combinedValidation));

  if (!combinedValidation.valid) {
    console.error("\n❌ Validation failed. Please fix errors before creating the issue.");
    process.exit(1);
  }

  if (combinedValidation.score < 80) {
    console.warn(
      "\n⚠️  Warning: Issue quality score is below 80. Consider improving before creation.",
    );
  }

  return combinedValidation;
}
