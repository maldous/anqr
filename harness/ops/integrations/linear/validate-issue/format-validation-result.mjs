// Generated from ../../../../scripts/ops/integrations/linear/validate-issue.mjs:176

export function formatValidationResult(result) {
  let output = "";

  if (result.valid) {
    output += "✅ Issue validation PASSED\n";
    output += `📊 Validation Score: ${result.score}/100\n`;
  } else {
    output += "❌ Issue validation FAILED\n";
    output += `📊 Validation Score: ${result.score}/100\n`;
  }

  if (result.errors.length > 0) {
    output += "\n🚨 Errors (must fix):\n";
    result.errors.forEach((error) => {
      output += `  ${error}\n`;
    });
  }

  if (result.warnings.length > 0) {
    output += "\n⚠️  Warnings (recommended improvements):\n";
    result.warnings.forEach((warning) => {
      output += `  ${warning}\n`;
    });
  }

  if (result.recommendations.length > 0) {
    output += "\n💡 Recommendations:\n";
    result.recommendations.forEach((recommendation) => {
      output += `  ${recommendation}\n`;
    });
  }

  return output;
}
