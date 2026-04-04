// Generated from ../../../../scripts/ops/integrations/linear/validate-issue.mjs:322

import { formatValidationResult } from "./format-validation-result.mjs";
import { validateIssueInput } from "./validate-issue-input.mjs";

export async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: node validate-issue.mjs <issue-json-file>");
    console.log("Example: node validate-issue.mjs issue-input.json");
    process.exit(1);
  }

  try {
    const issueInput = JSON.parse(args[0]);
    const result = validateIssueInput(issueInput);

    console.log(formatValidationResult(result));

    if (!result.valid) {
      console.error("\n❌ Validation failed. Please fix errors before creating the issue.");
      process.exit(1);
    }

    console.log("\n✅ Issue validation passed! Ready for creation.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during validation:", error.message);
    process.exit(1);
  }
}
