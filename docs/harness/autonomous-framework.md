# Autonomous Best Practice Harness (FACE-BPH)

Fully Autonomous Corrective Evolving Best Practice Harness Engineering framework.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  TIER 3: AI-DRIVEN CORRECTION                           │
│  Guardian + CI Monitor → create/close Linear issues     │
│  WORKFLOW.md + linear_graphql tool                       │
└──────────────────────┬──────────────────────────────────┘
                       │ reads reports/harness/latest.json
┌──────────────────────┴──────────────────────────────────┐
│  TIER 2: SCHEDULED AUTOMATION                           │
│  Guardian (5m) · Continuous (1h) · Nightly (02:30)      │
│  CI Monitor (5m) · Email Ingest (5m)                    │
│  nightly-ops-pass.mjs runs harness-report.mjs           │
│  ci-failure-monitor.mjs bridges GitHub CI → Linear      │
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

| Profile      | Checks                                       | Duration | When                  |
| ------------ | -------------------------------------------- | -------- | --------------------- |
| `quick`      | 4 (typecheck, lint, lockfile, git)           | ~30s     | Local dev, pre-commit |
| `continuous` | 8 (quick + services, sentry, i18n, required) | ~3min    | Hourly ops pass       |
| `full`       | 22 (all domains)                             | ~15min   | Nightly ops pass      |

## Check Domains

| #   | Check ID             | Domain                           | Profiles                |
| --- | -------------------- | -------------------------------- | ----------------------- |
| 1   | `typecheck`          | TypeScript compilation           | quick, continuous, full |
| 2   | `lint`               | oxlint errors/warnings           | quick, continuous, full |
| 3   | `lockfile_integrity` | Lockfile-lint validation         | quick, continuous, full |
| 4   | `git_status`         | Uncommitted files, branch count  | quick, continuous, full |
| 5   | `services_health`    | Third-party API health           | continuous, full        |
| 6   | `sentry_regression`  | Sentry unresolved errors         | continuous, full        |
| 7   | `i18n_coverage`      | Translation completeness         | continuous, full        |
| 8   | `bundle_budget`      | Bundle size thresholds           | continuous, full        |
| 9   | `test_required_gap`  | Required test matrix             | continuous, full        |
| 10  | `dep_outdated`       | npm outdated (major/minor/patch) | full                    |
| 11  | `dep_audit`          | npm audit vulnerabilities        | full                    |
| 12  | `dep_osv`            | OSV vulnerability scanner        | full                    |
| 13  | `security_semgrep`   | Semgrep static analysis          | full                    |
| 14  | `type_coverage`      | Type coverage % (target ≥95%)    | full                    |
| 15  | `test_unit`          | Vitest unit suite                | full                    |
| 16  | `test_coverage_gap`  | Uncovered files                  | full                    |
| 17  | `duplication`        | Code duplication (jscpd)         | full                    |
| 18  | `spelling`           | Spelling (cspell)                | full                    |
| 19  | `dep_cruiser`        | Dependency boundary violations   | full                    |
| 20  | `knip_unused`        | Unused exports/dependencies      | full                    |
| 21  | `license_compliance` | Copyleft license detection       | full                    |
| 22  | `docs_freshness`     | Stale documentation (>60 days)   | full                    |

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
      "findings": [{ "severity": "high", "message": "react 19.2.4 → 19.3.0" }]
    }
  },
  "trends": {
    "bundle_budget.main_entry_kib": [710, 712, 715],
    "type_coverage.pct": [96.2, 96.1, 96.3]
  },
  "regressions": [
    {
      "check": "bundle_budget",
      "metric": "main_entry_kib",
      "from": 712,
      "to": 715,
      "delta": "+0.4%"
    }
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
2. **Guardian** reads the report and creates `[HARNESS]` issues for FAIL/ERROR checks (deduplicates via state file)
3. **CI failure monitor** (every 5 min) scans GitHub Actions notification emails:
   - `Run failed: <workflow>` → creates a `[CI]` issue (one per unique workflow, deduplicates)
   - `Run succeeded: <workflow>` → auto-closes the matching `[CI]` issue
4. **Guardian** (5min) manages issue labels, priority, and state; classifies `[CI]` issues as `reliability`
   - Retry-escalated catastrophic runs are routed to `Todo` for later AI retry (not `Pending`)
   - Retry escalation threshold: **60 minutes** (issues stuck in retry queue longer than this are auto-escalated)
5. **Guardian issue guards** prevent pipeline congestion:
   - **Sonar finding count guard**: issues with >20 findings (`GUARDIAN_SONAR_FINDINGS_MAX`) are treated as oversized and not fed into Symphony
   - **Non-archive issue cap**: slice/child issue creation is blocked when non-archive issues ≥250 (`GUARDIAN_MAX_NON_ARCHIVE_ISSUES`)
6. **Symphony** picks up issues and agents implement fixes
7. Next harness run / CI run detects improvements → closes the feedback loop

## Commands

```bash
make harness            # Full 22-check report
make harness:quick      # Quick 4-check smoke test
make harness:continuous # Continuous 9-check pass
make monitor:ci         # GitHub CI failure monitor (create/close [CI] issues)
```

## Scheduled Integration

| Timer                                  | Harness Profile                         |
| -------------------------------------- | --------------------------------------- |
| `anqr-ops-continuous.timer` (hourly)   | `continuous` (via nightly-ops-pass.mjs) |
| `anqr-ops-nightly.timer` (daily 02:30) | `full` (via nightly-ops-pass.mjs)       |

## Extension Guide

To add a new check domain:

1. Add a `checkMyDomain()` function in `scripts/ops/harness-report.mjs`
2. Return `{ status: 'PASS'|'WARN'|'FAIL', metrics: {}, findings: [] }`
3. Register in `CHECK_REGISTRY` with appropriate profiles
4. Add trend tracking in `trendMetrics` if the check has numeric metrics
5. Add regression detection in `detectRegressions` if applicable
6. Update this doc's check table

## Cross-Platform Testing Infrastructure

The harness now covers four rendering paths with deterministic tests:

| Path    | Runner     | Tests                                                     | Gate                                    |
| ------- | ---------- | --------------------------------------------------------- | --------------------------------------- |
| Browser | Playwright | `tests/basic\|advanced\|professional/`                    | `make test:tiers`                       |
| API     | Playwright | `tests/api/qr-api.spec.ts` (30+ tests)                    | `make test:api`                         |
| Parity  | Playwright | `tests/api/cross-platform-parity.spec.ts` (pixelmatch)    | `make test:parity`                      |
| iOS     | Appium     | `tests/appium/specs/ios-platform.spec.ts` (25+ tests)     | `make test:appium:ios` (macOS only)     |
| Android | Appium     | `tests/appium/specs/android-platform.spec.ts` (27+ tests) | `make test:appium:android` (Linux only) |

OS gates enforce platform isolation:

- `make test:appium:ios` errors on non-macOS
- `make test:appium:android` errors on non-Linux, auto-sets `ANQR_BASE_URL=http://10.0.2.2:8888`
- `make test:appium` auto-detects the OS and selects the correct platform
- `wdio.conf.ts` excludes `ios-platform.spec.ts` on Android and `android-platform.spec.ts` on iOS

All Playwright tests (browser + API + parity) run against `netlify dev` on port 8888, giving full access to both the Vite app and Netlify Functions.

## Issue Types Created by Automation

| Prefix      | Source                                 | Lifecycle                                                     |
| ----------- | -------------------------------------- | ------------------------------------------------------------- |
| `[HARNESS]` | Guardian reads harness report          | Created on FAIL/ERROR; resolved when check passes             |
| `[CI]`      | CI failure monitor reads GitHub emails | Created on "Run failed:"; closed on "Run succeeded:"          |
| `[EMAIL]`   | Email ingest reads inbound mail        | Created from email; Symphony interprets into actionable issue |

## Future Domains (Linear Issues)

These require AI analysis or broader implementation and are tracked as Linear issues:

- Cross-platform parity as an automated harness check (compare API vs browser snapshots nightly)
- Appium device-to-API parity (compare iOS/Android canvas captures against `/api/qr` baseline)
- Accessibility compliance (axe-core integration)
- Lighthouse CI (performance, SEO, best practices scores)
- Competitive analysis & UX evolution
- React 19 / Vite 8 feature adoption audit
- ISO 18004 full compliance validation
- Android build health automation
- iOS build health automation
- SEO & sitemap automation
- Gallery showcase freshness
- PWA audit & enhancement
- Netlify function performance monitoring
- Expand Appium mobile E2E test coverage (ANQ-244)
