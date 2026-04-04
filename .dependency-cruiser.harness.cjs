/**
 * Dependency Cruiser configuration for Harness layer (harness/ops/*)
 *
 * Enforces hexagonal architecture boundaries within the harness:
 * - core: foundational utilities (config, logging)
 * - integrations: external service adapters (model, notifications)
 * - orchestration: workflow orchestration
 * - runtime: execution engines (symphony)
 * - reporting: evidence and diagnostics
 *
 * Cross-layer dependencies allowed:
 * - Any layer may import from core
 * - integrations may be imported by runtime/orchestration/reporting
 * - runtime may import from orchestration
 *
 * Forbidden:
 * - Backward dependencies (runtime -> integrations is ok, but integrations -> runtime is not)
 * - Cross-layer violations
 */

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "harness-not-to-unresolvable",
      severity: "error",
      comment: "All imports in harness must resolve cleanly.",
      from: { path: "^harness/ops/" },
      to: { couldNotResolve: true },
    },
    {
      name: "no-circular-in-harness",
      severity: "error",
      comment:
        "Circular dependencies in harness lead to hard-to-reason-about code. " +
        "The node_modules exclusion in pathNot prevents false positives from " +
        "third-party internal cycles. This is simpler than the main config's " +
        "viaOnly approach because harness code is not bundled, so there are no " +
        "dist/assets chunks to worry about — only node_modules needs filtering.",
      from: { path: "^harness/ops/" },
      to: { circular: true, pathNot: "^node_modules/" },
    },
    // Core layer - integrations should not import from orchestration or runtime
    {
      name: "integrations-no-orchestration-imports",
      severity: "error",
      comment: "Integrations layer must not import orchestration (inversion of control).",
      from: { path: "^harness/ops/integrations/" },
      to: { path: "^harness/ops/orchestration/" },
    },
    {
      name: "integrations-no-runtime-imports",
      severity: "error",
      comment: "Integrations layer must not import runtime engines directly.",
      from: { path: "^harness/ops/integrations/" },
      to: { path: "^harness/ops/runtime/" },
    },
    // Orchestration should not import from runtime
    {
      name: "orchestration-no-runtime-imports",
      severity: "error",
      comment: "Orchestration must not import runtime engines (runtime is the execution target).",
      from: { path: "^harness/ops/orchestration/" },
      to: { path: "^harness/ops/runtime/" },
    },
    // Reporting should not import orchestration
    {
      name: "reporting-no-orchestration-imports",
      severity: "error",
      comment: "Reporting layer must not import orchestration workflows.",
      from: { path: "^harness/ops/reporting/" },
      to: { path: "^harness/ops/orchestration/" },
    },
    // Runtime should not import reporting (runtime is the innermost layer)
    {
      name: "runtime-no-reporting-imports",
      severity: "error",
      comment: "Runtime engines must not import reporting (reporting observes runtime).",
      from: { path: "^harness/ops/runtime/" },
      to: { path: "^harness/ops/reporting/" },
    },
    {
      name: "runtime-no-orchestration-imports",
      severity: "warn",
      comment:
        "Runtime engines should not depend on orchestration (prefer orchestration calling runtime).",
      from: { path: "^harness/ops/runtime/" },
      to: { path: "^harness/ops/orchestration/" },
    },
  ],
  options: {
    includeOnly: {
      path: ["^harness/ops/"],
    },
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.harness.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
