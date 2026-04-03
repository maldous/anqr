#!/usr/bin/env node

/**
 * create-issue-template.mjs — Standardized template for Linear issue creation
 *
 * This template provides a standardized starting point for creating Linear issues.
 * Agents should copy this file, customize the placeholders, and use it as a base
 * for new issue creation scripts.
 */

import {
  createIssue,
  STATES,
  LABELS,
  validateIssueInput,
  formatValidationResult,
} from "./linear-client.mjs";
import { validateIssueInput as validateLocalIssueInput } from "./validate-issue.mjs";

/**
 * Standardized issue template
 * Customize the placeholders below for your specific issue
 */
const issueTemplate = {
  /**
   * TITLE: [Component/Category] Action Verb Description
   *
   * Format: [Component] Title describing the work
   * Examples:
   * - [QR Engine] Fix memory leak in rendering component
   * - [Discord Integration] Remove light bulb emoji from thinking output
   * - [Documentation] Update Linear issue creation workflow guide
   */
  title: "[Component] Issue title describing the work to be done",

  /**
   * DESCRIPTION: Standardized sections following the issue creation workflow
   *
   * Required sections:
   * - Problem: What is the problem? Be specific and concise.
   * - Root Cause: Why does this problem exist?
   * - Impact: Who/what is affected? How severe is it?
   * - Solution: What is the proposed solution?
   * - Acceptance Criteria: How will we know this is fixed?
   * - Evidence: Links to logs, screenshots, error messages, etc.
   * - References: Related issues, documentation, external resources
   */
  description: `## Problem

[Describe the problem clearly and concisely. Be specific about what's wrong.]

**Examples of what to include:**
- Error messages or unexpected behavior
- Performance issues or bottlenecks
- Missing functionality or features
- Inconsistent behavior or bugs
- Security vulnerabilities or concerns

**Bad example:**
"The code doesn't work"

**Good example:**
"The QR generation component crashes when processing large QR codes (>1000x1000 pixels), throwing a 'Maximum call stack size exceeded' error in the canvas rendering library."

---

## Root Cause

[Explain why this problem exists. What code/component is responsible?]

**Examples of what to include:**
- Code paths causing the issue
- Missing error handling
- Incorrect assumptions or logic
- External dependencies or API changes
- Configuration issues

**Bad example:**
"I don't know why this happens"

**Good example:**
"The QR rendering component uses a recursive algorithm for large QR codes that exceeds JavaScript's call stack limit. This was identified in the canvas rendering library's documentation as a known limitation for large canvas sizes."

---

## Impact

[Who/what is affected by this problem? How severe is it?]

**Severity levels:**
- **Critical**: System down, data loss, security breach
- **High**: Major functionality broken, significant performance degradation
- **Normal**: Minor functionality affected, some inconvenience
- **Low**: Cosmetic issues, minor improvements

**Examples of what to include:**
- Users affected (e.g., "All users generating QR codes")
- Systems affected (e.g., "Production QR generation pipeline")
- Frequency of occurrence (e.g., "100% of large QR code generation attempts")
- Workarounds available (e.g., "None available")

**Bad example:**
"It's bad"

**Good example:**
"Affects all users generating QR codes larger than 1000x1000 pixels in the web application. Causes complete system failure with no available workaround. Estimated 500+ users affected daily."

---

## Solution

[Propose a solution or approach to fix the problem]

**Examples of what to include:**
- Technical approach to fix the issue
- Alternative solutions considered
- Implementation strategy
- Rollback plan if needed
- Migration strategy for breaking changes

**Bad example:**
"Fix the code"

**Good example:**
"Replace the recursive algorithm with an iterative approach using a queue-based system. This will:
1. Eliminate stack overflow errors
2. Maintain the same visual output
3. Improve performance for large QR codes
4. Add proper error handling for edge cases

Alternative approaches considered:
- Using a different QR generation library (rejected due to compatibility issues)
- Increasing Node.js stack size (rejected as it's not a scalable solution)

Rollback plan: If issues are discovered, revert to the previous algorithm and implement a size limit warning."

---

## Acceptance Criteria

[Specific, testable criteria that must be met for this issue to be considered complete]

**Format:** Use checkboxes with specific, measurable criteria

**Examples:**
- [ ] Memory leak fixed in QR generation component
- [ ] Tests added to prevent regression
- [ ] Performance verified (target: <500ms for 2000x2000 QR codes)
- [ ] Documentation updated
- [ ] Peer review completed

**Bad example:**
- [ ] Fix the bug
- [ ] It should work

**Good example:**
- [ ] Replace recursive algorithm with iterative approach
- [ ] Add error handling for edge cases
- [ ] Add unit tests for large QR code generation
- [ ] Update performance benchmarks
- [ ] Verify no breaking changes to existing functionality
- [ ] Code review completed by @team-member

---

## Evidence

[Proof that the problem exists and that the solution works]

**Required for bugs:**
- Error logs and stack traces
- Screenshots or screen recordings
- Browser console output
- API response errors
- Performance metrics

**Required for features:**
- Mockups or design references
- User stories or requirements
- API documentation
- Related issue links

**Examples:**

**Error logs:**
\`\`\`
Error: Maximum call stack size exceeded
    at QRGenerator.render (qr-generator.js:456:12)
    at QRGenerator.generate (qr-generator.js:123:18)
\`\`\`

**Screenshots:**
![Screenshot showing the error in the web interface](https://example.com/screenshot.png)

**API errors:**
\`\`"
{
  "error": "Internal server error",
  "code": "STACK_OVERFLOW",
  "details": "Maximum call stack size exceeded"
}
\`\`\`

**Performance metrics:**
- Before: 5000ms average for 2000x2000 QR codes
- After: 450ms average for 2000x2000 QR codes

---

## References

[Related issues, documentation, external resources]

**Related issues:**
- ANQ-1234: Previous attempt to fix similar issue
- ANQ-5678: Related feature request
- PR #1234: Previous implementation attempt

**Documentation:**
- [QR Generation Documentation](https://docs.example.com/qr-generation)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Linear API Documentation](https://developers.linear.app/docs/graphql/working-with-the-graphql-api)

**External resources:**
- [Stack Overflow discussion on canvas size limits](https://stackoverflow.com/questions/1119501/maximum-size-of-canvas-html-element)
- [QR code generation best practices](https://www.qrcode.com/en/about/)

---

## Additional Context

[Any additional information that helps understand the problem or solution]

**Background:**
This issue was discovered while working on ANQ-1401 (Document agents instructions and create Linear issue workflow) when testing the new issue creation validation system.

**Dependencies:**
- QR generation component version 2.1.0
- Canvas library version 2.10.0
- Node.js version 18.x

**Testing strategy:**
1. Generate QR codes of various sizes (100x100 to 5000x5000)
2. Verify no stack overflow errors
3. Measure performance improvements
4. Test edge cases (minimum and maximum sizes)
5. Verify backward compatibility

**Success metrics:**
- Zero stack overflow errors for QR codes up to 5000x5000 pixels
- Performance improvement of at least 10x
- No breaking changes to existing functionality
- All existing tests continue to pass
`,

  /**
   * STATE: Use appropriate state for new issues
   *
   * Common starting states:
   * - STATES.backlog: Issue is in backlog, not yet prioritized
   * - STATES.todo: Issue is ready for work
   * - STATES.inProgress: Work has started (use sparingly for new issues)
   */
  stateId: STATES.todo,

  /**
   * LABELS: Use appropriate labels following the work type taxonomy
   *
   * Primary work types (from docs/program/04-taxonomy.md):
   * - LABELS.harness: AI pipeline and automation work
   * - LABELS.governance: Rules, policies, and decision frameworks
   * - LABELS.hygiene: Cleanup and maintenance
   * - LABELS.product: User-facing features
   * - LABELS.release: Version preparation and deployment
   * - LABELS.growth: Marketing and adoption
   * - LABELS.incident: Unexpected failures or outages
   * - LABELS.research: Exploratory work
   *
   * Common combinations:
   * - [LABELS.harness] - Pure harness/ops work
   * - [LABELS.harness, LABELS.hygiene] - Harness cleanup
   * - [LABELS.product, LABELS.release] - Product feature with release
   * - [LABELS.harness, LABELS.discord] - Discord-sourced issues
   */
  labelIds: [LABELS.harness],

  /**
   * PRIORITY: Set based on impact assessment
   *
   * Priority levels:
   * - 1 = Urgent (critical failures blocking work)
   * - 2 = High (important work with significant impact)
   * - 3 = Normal (standard priority work)
   * - 4 = Low (cosmetic or nice-to-have)
   * - 0 = None (default when unsure)
   *
   * Use the determinePriority() helper or follow this matrix:
   * - Critical impact → Priority 1 (Urgent)
   * - High impact → Priority 2 (High)
   * - Normal impact → Priority 3 (Normal)
   * - Low impact → Priority 4 (Low)
   */
  priority: 3, // Normal priority

  /**
   * ESTIMATE: Story points or hours for planning
   *
   * Estimation guidelines:
   * - 1 point: Very small, trivial task (<1 hour)
   * - 2 points: Small task (1-2 hours)
   * - 3 points: Medium task (2-4 hours)
   * - 5 points: Large task (1-2 days)
   * - 8 points: Very large task (2-3 days)
   * - 13+ points: Epic or complex work (>3 days)
   *
   * For bugs:
   * - Simple fix: 1-2 points
   * - Complex fix: 3-5 points
   * - Architectural change: 8+ points
   */
  estimate: 2, // Small task
};

/**
 * Customize the issue for your specific scenario
 */
function customizeIssue(baseTemplate) {
  // Example customization - replace with your actual values
  const customized = { ...baseTemplate };

  // Customize title based on your issue
  customized.title = "[QR Engine] Fix memory leak in QR generation component";

  // Customize description sections with your specific details
  customized.description = customized.description
    .replace(
      "[Describe the problem clearly and concisely.]",
      "The QR generation component has a memory leak that causes increasing memory usage over time, eventually leading to out-of-memory errors in production.",
    )
    .replace(
      "[Explain why this problem exists.]",
      "The memory leak is caused by unclosed file handles in the canvas rendering library used for QR code generation. Each QR code generation leaves file handles open, accumulating over time.",
    )
    .replace(
      "[Who/what is affected by this problem?]",
      "Affects all users generating QR codes in the web application. Causes production outages when memory usage exceeds available resources.",
    )
    .replace(
      "[Propose a solution or approach to fix the problem]",
      "Implement proper cleanup handlers in the QR generation component to close file handles after each QR code generation. Add memory leak detection and automated cleanup processes.",
    );

  // Customize acceptance criteria
  customized.description = customized.description.replace(
    "- [ ]",
    `- [ ] Fix memory leak in QR generation component
- [ ] Add memory leak detection tests
- [ ] Update performance benchmarks
- [ ] Verify no breaking changes to existing functionality
- [ ] Code review completed by @team-member`,
  );

  // Customize evidence section
  customized.description = customized.description.replace(
    "**Error logs:**",
    `**Error logs:**
\`\`\`
Error: Process out of memory
    at QRGenerator.render (qr-generator.js:456:12)
    at QRGenerator.generate (qr-generator.js:123:18)
    at server.js:1234:23
\`\`\`

**Memory usage graph:**
![Memory usage increasing over time](https://example.com/memory-graph.png)`,
  );

  // Customize references
  customized.description = customized.description.replace(
    "**Related issues:**",
    `**Related issues:**
- ANQ-1401: Document agents instructions and create Linear issue workflow
- ANQ-1397: Previous memory leak investigation

**Documentation:**
- [QR Generation Architecture](https://docs.example.com/qr-architecture)
- [Memory Management Best Practices](https://docs.example.com/memory-management)`,
  );

  return customized;
}

/**
 * Validate the customized issue before creation
 */
async function validateIssue(issueInput) {
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

/**
 * Main function - customize and create the issue
 */
async function main() {
  console.log("📋 Linear Issue Creation Template\n");
  console.log("This template helps create standardized, high-quality Linear issues.\n");

  try {
    // Customize the template for your specific issue
    const customizedIssue = customizeIssue(issueTemplate);

    console.log("🎯 Customized Issue Preview:");
    console.log("Title:", customizedIssue.title);
    console.log(
      "State:",
      Object.entries(STATES).find(([_, id]) => id === customizedIssue.stateId)?.[0],
    );
    console.log(
      "Labels:",
      customizedIssue.labelIds
        .map((id) => Object.entries(LABELS).find(([_, labelId]) => labelId === id)?.[0])
        .join(", "),
    );
    console.log("Priority:", customizedIssue.priority);
    console.log("Estimate:", customizedIssue.estimate, "points\n");

    // Validate before creation
    await validateIssue(customizedIssue);

    // Create the issue
    console.log("🚀 Creating Linear issue...\n");

    const issue = await createIssue(customizedIssue);

    console.log("✅ Issue created successfully!\n");
    console.log("Issue Details:");
    console.log(`  Identifier: ${issue.identifier}`);
    console.log(`  Title: ${issue.title}`);
    console.log(`  State: ${issue.state.name}`);
    console.log(`  Priority: P${issue.priority}`);
    console.log(`  Estimate: ${issue.estimate} points`);
    console.log(`  Labels: ${issue.labels.nodes.map((l) => l.name).join(", ")}`);
    console.log(`  Created: ${new Date().toISOString()}`);

    console.log(`\n🔗 Linear URL: https://linear.app/anqr/issue/${issue.identifier}`);

    console.log("\n📝 Next steps:");
    console.log("  1. Review the issue in Linear");
    console.log("  2. Update state as work progresses (inProgress → inReview → done)");
    console.log("  3. Add comments with progress updates");
    console.log("  4. Link related issues using Linear's linking feature");
    console.log("  5. Mark as Done when all acceptance criteria are met");
  } catch (error) {
    console.error("❌ Failed to create issue:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    process.exit(1);
  }
}

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}

export { issueTemplate, customizeIssue, validateIssue, main };

export default {
  issueTemplate,
  customizeIssue,
  validateIssue,
  main,
};
