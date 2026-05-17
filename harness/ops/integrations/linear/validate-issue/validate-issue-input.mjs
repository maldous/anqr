import { STATES, LABELS } from "../linear-client.mjs";

import { calculateValidationScore } from "./calculate-validation-score.mjs";

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

    for (const pattern of duplicatePatterns) {
      if (pattern.test(input.description)) {
        warnings.push(
          `⚠️  Description contains template placeholders matching pattern: ${pattern}`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    recommendations,
    score: calculateValidationScore(errors, warnings),
  };
}
