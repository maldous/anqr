# Autonomous Best Practice Harness (FACE-BPH)

Fully Autonomous Corrective Evolving Best Practice Harness Engineering framework.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  TIER 3: AI-DRIVEN CORRECTION                           │
│  Sentinel reviews reports → creates PARENT/CHILD issues │
│  WORKFLOW.md + linear_graphql tool                       │
└──────────────────────┬──────────────────────────────────┘
                       │ reads reports/harness/latest.json
┌──────────────────────┴──────────────────────────────────┐
│  TIER 2: SCHEDULED AUTOMATION                           │
│  Guardian (15m) · Continuous (1h) · Nightly (02:30)     │
│  nightly-ops-pass.mjs runs harness-report.mjs           │
└──────────────────────┬──────────────────────────────────┘
                       │ executes
┌──────────────────────┴──────────────────────────────────┐
│  TIER 1: LOCAL DETERMINISTIC CHECKS                     │
│  scripts/ops/harness-report.mjs                         │
│  make harness · make harness:quick · make harness:cont  │
│  22 check domains → unified JSON report                 │
└─────────────────────────────────────────────────────────┘
```

## Profiles

| Profile | Checks | Duration | When |
| --- | --- | --- | --- |
| `quick` | 4 (typecheck, lint, lockfile, git) | ~30s | Local dev, pre-commit |
| `continuous` | 8 (quick + services, sentry, i18n, required) | ~3min | Hourly ops pass |
| `full` | 22 (all domains) | ~15min | Nightly ops pass |

## Check Domains

| # | Check ID | Domain | Profiles |
| --- | --- | --- | --- |
| 1 | `typecheck` | TypeScript compilation | quick, continuous, full |
| 2 | `lint` | oxlint errors/warnings | quick, continuous, full |
| 3 | `lockfile_integrity` | Lockfile-lint validation | quick, continuous, full |
| 4 | `git_status` | Uncommitted files, branch count | quick, continuous, full |
| 5 | `services_health` | Third-party API health | continuous, full |
| 6 | `sentry_regression` | Sentry unresolved errors | continuous, full |
| 7 | `i18n_coverage` | Translation completeness | continuous, full |
| 8 | `bundle_budget` | Bundle size thresholds | continuous, full |
| 9 | `test_required_gap` | Required test matrix | continuous, full |
| 10 | `dep_outdated` | npm outdated (major/minor/patch) | full |
| 11 | `dep_audit` | npm audit vulnerabilities | full |
| 12 | `dep_osv` | OSV vulnerability scanner | full |
| 13 | `security_semgrep` | Semgrep static analysis | full |
| 14 | `type_coverage` | Type coverage % (target ≥95%) | full |
| 15 | `test_unit` | Vitest unit suite | full |
| 16 | `test_coverage_gap` | Uncovered files | full |
| 17 | `duplication` | Code duplication (jscpd) | full |
| 18 | `spelling` | Spelling (cspell) | full |
| 19 | `dep_cruiser` | Dependency boundary violations | full |
| 20 | `knip_unused` | Unused exports/dependencies | full |
| 21 | `license_compliance` | Copyleft license detection | full |
| 22 | `docs_freshness` | Stale documentation (>60 days) | full |

## Report Format

```json
{
  "timestamp": "2026-03-07T...",
  "profile": "full",
  "durationMs": 900000,
  "overall": "PASS|WARN|FAIL",
  "checkCount": 22,
  "checks": {
    "dep_outdated": {
      "status": "WARN",
      "durationMs": 5000,
      "metrics": { "major": 2, "minor": 5, "patch": 12 },
      "findings": [
        { "severity": "high", "message": "react 19.2.4 → 19.3.0" }
      ]
    }
  },
  "trends": {
    "bundle_budget.main_entry_kib": [710, 712, 715],
    "type_coverage.pct": [96.2, 96.1, 96.3]
  },
  "regressions": [
    { "check": "bundle_budget", "metric": "main_entry_kib", "from": 712, "to": 715, "delta": "+0.4%" }
  ],
  "improvements": [
    { "check": "type_coverage", "metric": "pct", "from": 96.1, "to": 96.3, "delta": "+0.2%" }
  ]
}
```

## Report Location

- Latest: `reports/harness/latest.json`
- History: `reports/harness/<timestamp>.json` (last 30 retained per load)

## Corrective Flow

1. **Nightly ops** runs `harness-report.mjs --profile=full` → writes `reports/harness/latest.json`
2. **Sentinel** (ANQ-105) reads the report during its next cycle
3. For each FAIL status or regression, sentinel creates:
   - `[PARENT]` issue describing the check domain failure
   - `[CHILD]` issues for each specific finding with fix instructions
4. **Guardian** (15min) manages issue labels, priority, and state
5. **Symphony** picks up issues and agents implement fixes
6. Next harness run detects improvements → closes the feedback loop

## Commands

```bash
make harness            # Full 22-check report
make harness:quick      # Quick 4-check smoke test
make harness:continuous # Continuous 9-check pass
```

## Scheduled Integration

| Timer | Harness Profile |
| --- | --- |
| `anqr-ops-continuous.timer` (hourly) | `continuous` (via nightly-ops-pass.mjs) |
| `anqr-ops-nightly.timer` (daily 02:30) | `full` (via nightly-ops-pass.mjs) |

## Extension Guide

To add a new check domain:

1. Add a `checkMyDomain()` function in `scripts/ops/harness-report.mjs`
2. Return `{ status: 'PASS'|'WARN'|'FAIL', metrics: {}, findings: [] }`
3. Register in `CHECK_REGISTRY` with appropriate profiles
4. Add trend tracking in `trendMetrics` if the check has numeric metrics
5. Add regression detection in `detectRegressions` if applicable
6. Update this doc's check table

## Future Domains (Linear Issues)

These require AI analysis or broader implementation and are tracked as Linear issues:

- Accessibility compliance (axe-core integration)
- Lighthouse CI (performance, SEO, best practices scores)
- Competitive analysis & UX evolution
- React 19 / Vite 8 feature adoption audit
- ISO 18004 full compliance validation
- Android build health automation
- SEO & sitemap automation
- Gallery showcase freshness
- PWA audit & enhancement
- Netlify function performance monitoring
