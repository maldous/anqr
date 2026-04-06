import { STATES, LABELS } from "../linear-client.mjs";

export const issueTemplate = {
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
- Previous attempt to fix similar issue
- Related feature request
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
This issue was discovered while testing the current issue creation validation workflow.

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
