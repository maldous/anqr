# ANQ-369 Migration Log — Archived Issue Review

Date: 2026-03-16
Executor: Symphony Phase 7

## Rubric

Each legacy backlog issue was classified as one of:

- **Archive permanently** — no longer relevant or superseded by Phase 1–6 work
- **Ollama-sized** — 1–2 files, 1–3 criteria, <5min; keep in Backlog with `Improvement` label
- **[HUMAN]** — requires manual/external action; title prefixed with `[HUMAN]`
- **Defer** — keep in Backlog until product logic or infrastructure exists on main

## Summary

| Classification      | Count  | Action taken                          |
| ------------------- | ------ | ------------------------------------- |
| Archive permanently | 11     | → Canceled state                      |
| Ollama-sized (keep) | 7      | Kept in Backlog + `Improvement` label |
| [HUMAN]             | 25     | Title prefixed with `[HUMAN]`         |
| Defer               | 20     | Kept in Backlog as-is                 |
| Keep as-is          | 2      | No change (ANQ-364 parent, ANQ-369)   |
| **Total reviewed**  | **65** |                                       |

---

## Archive Permanently (11)

### Empty P0 category buckets (no description, not actionable)

| Issue   | Title                                 |
| ------- | ------------------------------------- |
| ANQ-298 | Standards                             |
| ANQ-299 | Launch Readiness                      |
| ANQ-300 | Harness Reliability                   |
| ANQ-301 | Observability                         |
| ANQ-302 | Ads / Analytics                       |
| ANQ-303 | Release Readiness                     |
| ANQ-304 | Mobile Distribution                   |
| ANQ-305 | Self-Care and Corrective-Healing Work |

### Superseded by Symphony Phase 1–6

| Issue   | Title                              | Superseded by                                          |
| ------- | ---------------------------------- | ------------------------------------------------------ |
| ANQ-320 | Linear guardian orchestration      | Phase 4 linear-guardian.mjs                            |
| ANQ-348 | Escalation and notification system | Phase 6 notify.mjs + guardian escalation               |
| ANQ-350 | Automated issue hygiene            | Phase 4 guardian label hygiene + Phase 5 queue control |

---

## Ollama-Sized (6)

Small, deterministic, well-scoped work suitable for local Ollama execution.

| Issue   | Title                                           | Scope     | Why Ollama-sized                     |
| ------- | ----------------------------------------------- | --------- | ------------------------------------ |
| ANQ-308 | Naming convention enforcement                   | 1 file    | Add harness check rule               |
| ANQ-352 | CanvasFactory dependency inversion              | 3–4 files | 4 specific import violations         |
| ANQ-355 | Resolve remaining cross-layer import violations | 3 files   | 4 specific import fixes              |
| ANQ-357 | Dissolve src/lib/ shims into target layers      | 6 files   | Small, clear disposition table       |
| ANQ-360 | Relocate search-context from app/ to features/  | 1 file    | Highest ROI — fixes 42/45 warnings   |
| ANQ-359 | Dissolve src/types/ and src/data/ generic sinks | 16 files  | Clear disposition table, small sinks |
| ANQ-362 | Establish unit test colocation baseline         | 2–3 files | Add 2–3 colocated spec files         |

---

## [HUMAN] (25)

Issues requiring external services, accounts, physical devices, or human decisions.
Title prefixed with `[HUMAN]` to exclude from automation queue.

### Analytics / Ads (6)

| Issue   | Title                            | Reason                        |
| ------- | -------------------------------- | ----------------------------- |
| ANQ-328 | GA4 event catalog implementation | Requires GA4 account setup    |
| ANQ-329 | UX funnel instrumentation        | Requires analytics decisions  |
| ANQ-330 | AdSense web placements           | Requires AdSense account      |
| ANQ-331 | AdMob mobile integration         | Requires AdMob account        |
| ANQ-332 | SEO and attribution tracking     | Requires GSC/Bing accounts    |
| ANQ-333 | Revenue measurement              | Requires multiple ad accounts |

### CI / Release (5)

| Issue   | Title                             | Reason                            |
| ------- | --------------------------------- | --------------------------------- |
| ANQ-334 | Unified release ID system         | Requires CI pipeline setup        |
| ANQ-335 | CI/CD promotion pipeline          | Requires CI service, manual gates |
| ANQ-336 | Sourcemap and symbol upload in CI | Requires Sentry + CI pipeline     |
| ANQ-337 | Release gate checklist automation | Requires CI pipeline first        |
| ANQ-338 | Environment standardization       | Requires multiple environments    |

### Mobile / Store (6)

| Issue   | Title                          | Reason                           |
| ------- | ------------------------------ | -------------------------------- |
| ANQ-339 | Android build pipeline         | Requires Play Console, signing   |
| ANQ-340 | iOS build pipeline             | Requires Apple Developer account |
| ANQ-341 | Mobile signing key management  | Requires key generation, storage |
| ANQ-342 | Mobile E2E testing             | Requires Appium, real devices    |
| ANQ-343 | App store submission readiness | Requires store metadata, review  |
| ANQ-344 | Mobile performance validation  | Requires real device testing     |

### External Services (3)

| Issue   | Title                                  | Reason                       |
| ------- | -------------------------------------- | ---------------------------- |
| ANQ-316 | SLO verification                       | Requires monitoring tools    |
| ANQ-323 | Sentry integration across all runtimes | Requires Sentry account, DSN |
| ANQ-324 | Uptime monitoring setup                | Requires UptimeRobot account |

### Human Judgment / Physical Testing (5)

| Issue   | Title                                 | Reason                            |
| ------- | ------------------------------------- | --------------------------------- |
| ANQ-310 | Security and redaction audit          | Requires manual security review   |
| ANQ-311 | Cross-platform QR parity verification | Requires manual device testing    |
| ANQ-312 | QR scan reliability validation        | Requires physical device scanning |
| ANQ-314 | Critical user journey validation      | Requires E2E test framework       |
| ANQ-315 | Launch blocker tracker                | Product management decision       |

---

## Defer (21)

Issues kept in Backlog until infrastructure or product logic exists.

### Large migrations (too broad for Ollama)

| Issue   | Title                               | File count |
| ------- | ----------------------------------- | ---------- |
| ANQ-351 | Decompose src/store/                | 82 files   |
| ANQ-353 | Resolve src/i18n/ layer placement   | 809 files  |
| ANQ-354 | Dissolve src/modules/               | 542 files  |
| ANQ-356 | Dissolve src/hooks/ orphans         | 124 files  |
| ANQ-358 | Dissolve src/components/ shim layer | 46 files   |
| ANQ-363 | Migrate .type.ts → .types.ts        | 46 files   |

### Needs infrastructure that doesn't exist yet

| Issue   | Title                                        | Dependency                  |
| ------- | -------------------------------------------- | --------------------------- |
| ANQ-309 | Test ID convention rollout                   | Test infrastructure         |
| ANQ-313 | Performance budget compliance                | Lighthouse CI setup         |
| ANQ-317 | Retry and failover pipeline                  | Multi-provider routing      |
| ANQ-318 | Watchdog monitoring system                   | Multi-service monitoring    |
| ANQ-319 | Model routing and provider fallback          | Hosted model access         |
| ANQ-321 | Pipeline task latency monitoring             | Running pipeline            |
| ANQ-322 | TelemetryContext envelope implementation     | Sentry/OTel setup           |
| ANQ-325 | Correlation ID and trace context propagation | Telemetry infrastructure    |
| ANQ-326 | Structured logging with redaction            | Broad scope across runtimes |
| ANQ-327 | Automated weekly reporting                   | Metrics data collection     |

### Needs running autonomous system

| Issue   | Title                                | Dependency                   |
| ------- | ------------------------------------ | ---------------------------- |
| ANQ-345 | Self-healing automation              | Multi-provider + pipeline    |
| ANQ-346 | Self-improving proposal system       | Pipeline data                |
| ANQ-347 | Guardrail enforcement                | Cost tracking infrastructure |
| ANQ-349 | Incident auto-creation with evidence | Monitoring pipeline          |

---

## Notes

- The 25 [HUMAN] count matches the legacy status summary estimate
- No bulk import of legacy noise was performed
- All Ollama-sized issues have clear, narrow scope (1–6 files each)
- Deferred issues can be decomposed into Ollama-sized children when their dependencies are met
- ANQ-364 (Symphony parent tracker) remains in Todo as the umbrella issue
