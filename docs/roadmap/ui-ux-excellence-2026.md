# ANQR UI/UX Excellence Roadmap (2026)

## Objective
Maximize growth and revenue while preserving trust, clarity, retention, and product quality across web, mobile web, and app surfaces.

## North-star metrics
- Activation rate (install/open -> first successful QR action): +20% in 2 quarters.
- D30 retention: +12% in 2 quarters.
- ARPDAU: +10% with no increase in complaint rate and no retention drop.
- Crash-free sessions: >= 99.8%.
- Core Web Vitals pass rate (mobile): >= 90% URL coverage.
- Accessibility conformance: WCAG 2.2 AA on key flows.

## Prioritized roadmap
| Priority | Workstream | Outcome metric | Time horizon |
|---|---|---|---|
| P0 | New-user onboarding and first-run flow | Activation +20%, onboarding drop-off -25% | 0-6 weeks |
| P0 | Revenue UX guardrails and ad/load strategy | ARPDAU +10%, no D30 regression, complaints flat/down | 0-6 weeks |
| P1 | Design system modernization (color, typography, spacing, motion) | UI consistency score +30%, task success +10% | 6-12 weeks |
| P1 | Accessibility and reliability UX hardening | WCAG AA pass on key flows, crash-free >= 99.8% | 6-12 weeks |
| P2 | i18n/localization and RTL quality | Non-English activation +15%, locale-specific support tickets -20% | 12-18 weeks |
| P2 | Experimentation and measurement framework | 2+ validated UX experiments per sprint | 12-18 weeks |

## Recommendations, rationale, risk, and validation
### 1) Redesign first-run onboarding for immediate value (P0)
- Recommendation: Compress onboarding to 3 contextual steps, defer permissions to point-of-need, and add a guided first successful scan/generate task.
- Rationale: Early value realization is the strongest predictor of activation and week-1 retention.
- Risks: Oversimplification can hide advanced features and increase second-session confusion.
- Validation plan: A/B test current vs. guided flow, track completion, time-to-first-success, and D7 retention by cohort.

### 2) Implement revenue guardrails before monetization changes (P0)
- Recommendation: Define hard UX budgets for ad frequency, interruption timing, and paywall trigger contexts; reject any variant that degrades D7/D30 or trust signals.
- Rationale: Revenue growth is sustainable only when friction is bounded and perceived fairness remains high.
- Risks: Over-conservative limits can suppress short-term revenue.
- Validation plan: Multi-armed test of ad/load variants with guardrail metrics (retention, uninstall rate, support complaints, session depth).

### 3) Establish a modern visual language system (P1)
- Recommendation: Ship tokenized color, typography, spacing, and motion primitives with cross-platform parity and a documented component usage model.
- Rationale: Consistent visual hierarchy reduces cognitive load and implementation drift.
- Risks: Migration churn and temporary velocity reduction during adoption.
- Validation plan: Track component adoption, UI inconsistency defects, and moderated usability task success.

### 4) Fix accessibility/performance/reliability UX as one quality program (P1)
- Recommendation: Prioritize keyboard/screen-reader support, tap-target and contrast fixes, startup latency reduction, and error-state resilience patterns.
- Rationale: Quality failures are trust failures and directly harm conversion/retention.
- Risks: Engineering bandwidth contention with feature delivery.
- Validation plan: Release gates for Lighthouse + axe + crash-free thresholds; monitor conversion deltas by performance percentile.

### 5) Upgrade localization quality for multilingual growth (P2)
- Recommendation: Add locale QA matrix (copy expansion, truncation, pluralization, date/number formats, RTL mirroring) and locale ownership.
- Rationale: Translation-only approaches miss layout and cultural-context failures that suppress adoption.
- Risks: Increased QA overhead and longer release lead time.
- Validation plan: Track locale funnel metrics, task success by locale, and locale-tagged support incidents.

### 6) Operationalize UX experimentation (P2)
- Recommendation: Create a standard experiment spec template with hypothesis, target metric, guardrails, sample-size rule, and kill criteria.
- Rationale: Structured experimentation improves decision quality and avoids opinion-driven UX drift.
- Risks: Instrumentation gaps can produce invalid conclusions.
- Validation plan: Weekly experiment review with decision log, confidence levels, and mandatory follow-up actions.

## Follow-up implementation issues (atomic)
- Onboarding funnel redesign and event instrumentation.
- Monetization UX policy enforcement and guardrail telemetry.
- Design token system and component migration plan.
- Accessibility/performance reliability gate integration in CI.
- Localization QA matrix and RTL remediation.
- Experiment framework implementation and dashboarding.
