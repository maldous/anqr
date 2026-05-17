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
    for (const error of result.errors) {
      output += `  ${error}\n`;
    }
  }

  if (result.warnings.length > 0) {
    output += "\n⚠️  Warnings (recommended improvements):\n";
    for (const warning of result.warnings) {
      output += `  ${warning}\n`;
    }
  }

  if (result.recommendations.length > 0) {
    output += "\n💡 Recommendations:\n";
    for (const recommendation of result.recommendations) {
      output += `  ${recommendation}\n`;
    }
  }

  return output;
}
