/**
 * Mandatory evidence field definitions for evidence-gated closure.
 *
 * Completeness levels are cumulative: each level includes all checks
 * from lower levels plus its own. The closure gate validates at
 * "standard" level by default; operator override requires "minimal".
 *
 * See PLAN-workstream-G.md Phase 0 for the rationale behind each field.
 */

export const EVIDENCE_LEVELS = ["minimal", "standard", "full", "enriched"];

/**
 * Per-level field checks. Each level's checks are additive to all
 * lower levels. Rules:
 * - "truthy"  — value must be non-null, non-undefined, non-empty
 * - "boolean" — value must be exactly true or false
 * - "equals"  — value must === check.value
 */
export const LEVEL_CHECKS = {
  minimal: [
    { path: "correlationId", rule: "truthy" },
    { path: "execution.success", rule: "boolean" },
    { path: "execution.completedAt", rule: "truthy" },
    { path: "integration.success", rule: "equals", value: true },
    { path: "integration.mainSha", rule: "truthy" },
  ],
  standard: [
    { path: "ingress.source", rule: "truthy" },
    { path: "ingress.issueIdentifier", rule: "truthy" },
    { path: "push.success", rule: "equals", value: true },
    { path: "push.branch", rule: "truthy" },
  ],
  full: [
    { path: "providerRouting", rule: "truthy" },
    { path: "providerSelection", rule: "truthy" },
  ],
  enriched: [],
};

/**
 * Conditional checks applied at standard+ level. These are only
 * evaluated when the condition is met (e.g., validation fields are
 * only required when execution succeeded and code was pushed).
 */
export const CONDITIONAL_CHECKS = [
  {
    path: "validation.passed",
    rule: "boolean",
    condition: "execution_success_with_push",
  },
  {
    path: "validation.typecheckPassed",
    rule: "boolean",
    condition: "validation_ran",
  },
  {
    path: "validation.testsPassed",
    rule: "boolean",
    condition: "validation_ran",
  },
];

/** Maximum evidence collection retries before auto-override. */
export const MAX_EVIDENCE_RETRIES = 3;
