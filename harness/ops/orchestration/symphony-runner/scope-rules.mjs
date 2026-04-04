// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:437

export const SCOPE_RULES = [
  { pattern: /^src\/domain\//, scope: "domain" },
  { pattern: /^src\/platform\//, scope: "platform" },
  { pattern: /^src\/(ui|components)\//, scope: "ui" },
  { pattern: /^src\/features\//, scope: "application" },
  { pattern: /^src\/infra\/(logging|monitoring|sentry)/, scope: "observability" },
  { pattern: /^scripts\/ops\//, scope: "harness" },
  { pattern: /^docs\//, scope: "docs" },
  { pattern: /^\.github\/|^ci\//, scope: "ci" },
];
