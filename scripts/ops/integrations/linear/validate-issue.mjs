#!/usr/bin/env node

/**
 * validate-issue.mjs — Linear issue validation helper
 *
 * Validates issue content, categorization, and formatting before creation
 * to ensure high-quality, consistent Linear issues.
 */

import { STATES, LABELS } from "./linear-client.mjs";

/**
 * Validate issue input before creation
 * @param {Object} input - Issue creation input
 * @param {string} input.title - Issue title
 * @param {string} input.description - Issue description
 * @param {string} input.stateId - State ID
 * @param {Array<string>} input.labelIds - Array of label IDs
 * @param {number} [input.priority] - Priority (0-4)
 * @param {number} [input.estimate] - Estimate in points
 * @returns {Object} Validation result with errors and warnings
 */
export function validateIssueInput(input) {
  const errors = [];
  const warnings = [];
  const recommendations = [];

  // Validate title
  if (!input.title || input.title.trim().length === 0) {
    errors.push("❌ Title is required and cannot be empty");
  } else {
    if (input.title.length > 200) {
      errors.push("❌ Title cannot exceed 200 characters");
    }

    if (input.title.includes("TODO") || input.title.includes("FIXME")) {
      warnings.push("⚠️  Title contains placeholder text (TODO/FIXME)");
    }

    if (input.title.startsWith("[") && !input.title.includes("]")) {
      recommendations.push("💡 Consider adding closing bracket to title format: [Component] Title");
    }
  }

  // Validate description
  if (!input.description || input.description.trim().length === 0) {
    errors.push("❌ Description is required and cannot be empty");
  } else {
    if (input.description.trim().length < 50) {
      warnings.push("⚠️  Description should be at least 50 characters for clarity");
    }

    if (input.description.includes("PLACEHOLDER")) {
      warnings.push("⚠️  Description contains placeholder text");
    }

    // Check for required sections
    const requiredSections = [
      "## Problem",
      "## Root Cause",
      "## Impact",
      "## Solution",
      "## Acceptance Criteria",
    ];

    const missingSections = requiredSections.filter(
      (section) => !input.description.includes(section),
    );

    if (missingSections.length > 0) {
      warnings.push(`⚠️  Description missing sections: ${missingSections.join(", ")}`);
    }
  }

  // Validate state
  if (!input.stateId) {
    errors.push("❌ State ID is required");
  } else if (!Object.values(STATES).includes(input.stateId)) {
    errors.push("❌ Invalid state ID. Use STATES constants from linear-client.mjs");
  }

  // Validate labels
  if (!input.labelIds || input.labelIds.length === 0) {
    errors.push("❌ At least one label is required");
  } else {
    const validLabels = Object.values(LABELS);
    const invalidLabels = input.labelIds.filter((label) => !validLabels.includes(label));

    if (invalidLabels.length > 0) {
      errors.push(`❌ Invalid label IDs: ${invalidLabels.join(", ")}`);
    }

    // Validate label combinations
    const validCombinations = [
      [LABELS.harness],
      [LABELS.governance],
      [LABELS.hygiene],
      [LABELS.product],
      [LABELS.release],
      [LABELS.growth],
      [LABELS.incident],
      [LABELS.research],
      [LABELS.harness, LABELS.hygiene],
      [LABELS.harness, LABELS.discord],
      [LABELS.product, LABELS.release],
    ];

    const isValidCombination = validCombinations.some((combo) =>
      combo.every((label) => input.labelIds.includes(label)),
    );

    if (!isValidCombination) {
      warnings.push(
        "⚠️  Label combination may not be optimal. Consider standard work type labels.",
      );
    }
  }

  // Validate priority
  if (input.priority !== undefined && (input.priority < 0 || input.priority > 4)) {
    errors.push("❌ Priority must be between 0 (none) and 4 (low)");
  }

  // Validate estimate
  if (input.estimate !== undefined && (input.estimate < 1 || input.estimate > 20)) {
    warnings.push("⚠️  Estimate should be between 1 and 20 story points");
  }

  // Check for duplicate content patterns
  if (input.description) {
    const duplicatePatterns = [
      /TODO/g,
      /FIXME/g,
      /PLACEHOLDER/g,
      /\{\{[^}]+\}\}/g, // Template placeholders
    ];

    duplicatePatterns.forEach((pattern) => {
      if (pattern.test(input.description)) {
        warnings.push(
          `⚠️  Description contains template placeholders matching pattern: ${pattern}`,
        );
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    recommendations,
    score: calculateValidationScore(errors, warnings),
  };
}

/**
 * Calculate validation score (0-100)
 * @param {Array} errors - Array of error messages
 * @param {Array} warnings - Array of warning messages
 * @returns {number} Validation score
 */
function calculateValidationScore(errors, warnings) {
  const errorPenalty = errors.length * 20;
  const warningPenalty = warnings.length * 5;
  const maxScore = 100;

  const score = Math.max(0, maxScore - errorPenalty - warningPenalty);
  return Math.round(score * 100) / 100; // Round to 2 decimal places
}

/**
 * Format validation result for display
 * @param {Object} result - Validation result
 * @returns {string} Formatted output
 */
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

/**
 * Get issue quality checklist
 * @param {Object} input - Issue input
 * @returns {Array<string>} Checklist items
 */
export function getIssueQualityChecklist(input) {
  return [
    `✅ Title is clear and descriptive (${input.title?.length || 0}/200 chars)`,
    `✅ Description includes Problem section`,
    `✅ Description includes Root Cause section`,
    `✅ Description includes Impact section`,
    `✅ Description includes Solution section`,
    `✅ Description includes Acceptance Criteria section`,
    `✅ At least one label is set`,
    `✅ Valid label combination`,
    `✅ State ID is valid`,
    `✅ Priority is appropriate`,
    `✅ Estimate is provided`,
    `✅ No placeholder text (TODO/FIXME/PLACEHOLDER)`,
    `✅ Description is at least 50 characters`,
  ];
}

/**
 * Validate issue categorization
 * @param {Array<string>} labelIds - Array of label IDs
 * @returns {Object} Categorization validation result
 */
export function validateCategorization(labelIds) {
  const validCombinations = [
    [LABELS.harness],
    [LABELS.governance],
    [LABELS.hygiene],
    [LABELS.product],
    [LABELS.release],
    [LABELS.growth],
    [LABELS.incident],
    [LABELS.research],
    [LABELS.harness, LABELS.hygiene],
    [LABELS.harness, LABELS.discord],
    [LABELS.product, LABELS.release],
    [LABELS.harness, LABELS.product],
  ];

  const isValid = validCombinations.some((combo) =>
    combo.every((label) => labelIds.includes(label)),
  );

  return {
    valid: isValid,
    validCombinations,
    recommendedLabels: getRecommendedLabels(labelIds),
  };
}

/**
 * Get recommended labels based on content analysis
 * @param {Array<string>} currentLabels - Current label IDs
 * @returns {Array<string>} Recommended label IDs
 */
function getRecommendedLabels(currentLabels) {
  const recommendations = [];

  // If no labels, recommend harness as default
  if (!currentLabels || currentLabels.length === 0) {
    recommendations.push(LABELS.harness);
  }

  // If only harness, consider adding secondary label
  if (currentLabels.includes(LABELS.harness) && currentLabels.length === 1) {
    recommendations.push(LABELS.hygiene); // Common combination
  }

  return [...new Set([...(currentLabels || []), ...recommendations])];
}

/**
 * Priority matrix helper
 * @param {string} impactLevel - Impact level (critical, high, normal, low)
 * @returns {number} Priority value (1=urgent, 2=high, 3=normal, 4=low, 0=none)
 */
export function determinePriority(impactLevel) {
  const impact = impactLevel?.toLowerCase();

  switch (impact) {
    case "critical":
    case "urgent":
      return 1; // Urgent
    case "high":
      return 2; // High
    case "normal":
      return 3; // Normal
    case "low":
      return 4; // Low
    default:
      return 3; // Default to normal
  }
}

// Export constants for external use
const PRIORITY_LEVELS = {
  URGENT: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
  NONE: 0,
};

export { PRIORITY_LEVELS };

// Main function for CLI usage
async function main() {
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

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}

export default {
  validateIssueInput,
  formatValidationResult,
  getIssueQualityChecklist,
  validateCategorization,
  determinePriority,
  PRIORITY_LEVELS,
};
