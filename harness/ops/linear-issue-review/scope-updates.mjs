// Generated from ../../harness/ops/linear-issue-review.mjs:158

export const SCOPE_UPDATES = {
  "ANQ-376": {
    comment:
      "**Scope review (architecture alignment):** Verify against current symphony-runner.mjs — runner already uses 2-min timer with queue feeding. Update acceptance criteria to match current runner behavior and identify any remaining gap.",
  },
  "ANQ-673": {
    comment:
      "**Scope review (observability enhancement):** The codebuff-openai-bridge should provide more detailed logging for request lifecycle and subgoal handling. Implementation: log subgoal details when detected, include issue context in logs, and ensure continuation signals are clearly visible. Improves observability for runner operations.",
  },
  "ANQ-362": {
    comment:
      "**Scope review (architecture alignment):** Updated target paths — colocated tests should be in `packages/domain/*/src/` and `packages/application/*/src/`, not the old `src/domain/` paths. Still 0 colocated .spec.ts files exist. vitest config exists at repo root.",
  },
  "ANQ-350": {
    comment:
      "**Scope review (architecture alignment):** linear-guardian.mjs now handles queue hygiene and stale escalation. Remaining scope: excessive failure comment cleanup, outdated metadata pruning, systemic failure pattern detection.",
  },
  "ANQ-349": {
    comment:
      "**Scope review (architecture alignment):** Label should be `harness` not `release`. Guardian already auto-creates issues for harness failures. Remaining scope: build/deployment failure auto-creation, monitoring alert integration, evidence attachment.",
  },
  "ANQ-348": {
    comment:
      "**Scope review (architecture alignment):** notify.mjs and email infrastructure exist. Guardian does stale escalation. Remaining scope: retry-limit alerts, persistent-failure escalation, pipeline-broken detection, latency alerts.",
  },
  "ANQ-347": {
    comment:
      "**Scope review (architecture alignment):** Credit gate blocks unauthorized cost. Guardian enforces queue limits. Remaining scope: unsafe deployment blocking, repeated-failure task blocking, policy violation logging and notification.",
  },
  "ANQ-345": {
    comment:
      "**Scope review (architecture alignment):** Credit gate has provider failover. Runner has timeout handling. Remaining scope: exponential backoff on task retry, auto-rollback on crash spike, failed service restart automation.",
  },
  "ANQ-323": {
    comment:
      "**Scope review (1.0 launch truth alignment):** 1.0 scope is web + netlify only. Narrow Sentry integration to: web, netlify functions, local-harness. Defer Android, iOS integration until mobile enters launch claim. Keep unified release ID and sourcemap requirements.",
  },
  "ANQ-322": {
    comment:
      "**Scope review (1.0 launch truth alignment):** Narrow runtime list for 1.0 to: web, netlify (not api/android/ios/worker). Keep: serviceName, serviceVersion, release, environment, traceId, spanId, sessionId, feature.",
  },
  "ANQ-321": {
    comment:
      "**Scope review (architecture alignment):** This is harness work, not governance. Label should be `harness`. Metrics targets still valid.",
  },
  "ANQ-318": {
    comment:
      "**Scope review (architecture alignment):** Runner has 120-min timeout. Guardian has stale-session detection. Remaining scope: sub-2-min failure detection, automatic recovery orchestration, dead service detection, retry queue overflow handling.",
  },
  "ANQ-317": {
    comment:
      "**Scope review (architecture alignment):** Runner already retries via credit gate provider cascade. Guardian escalates stale sessions. Remaining scope: explicit max-3-retry with exponential backoff per issue, retry queue depth monitoring, guardian critical-threshold intervention.",
  },
  "ANQ-315": {
    comment:
      "**Scope review (1.0 launch truth alignment):** Remove 'app store submission readiness (Android APK verified, iOS TestFlight accepted)' — not in 1.0 scope. 1.0 launch blockers are: web stability, netlify API stability, Sentry error rate, CI pipeline, monitoring, codebase maintainability gates.",
  },
  "ANQ-313": {
    comment:
      "**Scope review (1.0 launch truth alignment):** Remove 'Mobile memory ≤200MB' — mobile not in 1.0 scope. Keep web performance budgets: initial load, UI response, QR generation times. Add netlify function response time budget.",
  },
  "ANQ-311": {
    comment:
      "**Scope review (1.0 launch truth alignment):** Narrow from 'Web, Android, iOS, and API' to 'Web + Netlify API' for 1.0. Mobile parity deferred until mobile enters launch claim. Evidence: web and netlify API generate identical QR output.",
  },
  "ANQ-310": {
    comment:
      "**Scope review (1.0 launch truth alignment):** Scope to 1.0 surfaces: web, netlify, local-harness, git, CI. Defer Apple/AdMob credential review until mobile enters scope. Keep: secret scan, CI secret review, systemd/unit review, Netlify/Cloudflare review, Google/Sentry/GA credential review.",
  },
  "ANQ-306": {
    comment:
      "**Scope review (architecture alignment):** Update reference from 'tools/harness/*' to 'harness/ops/*'. Current enforcement: .dependency-cruiser.cjs active, .dependency-cruiser.architecture.cjs active, .dependency-cruiser.contracts.cjs active, eslint-plugin-boundaries active. Architecture now enforced at packages/ level, not src/ layers.",
  },
  "ANQ-302": {
    comment:
      "**Scope review (1.0 launch truth alignment):** Web ads/analytics IS in 1.0 scope (packages/analytics/ exists). Only mobile ads deferred. Update description to clarify: web ads/analytics in scope, mobile ads NOT IN 1.0 SCOPE.",
  },
};
