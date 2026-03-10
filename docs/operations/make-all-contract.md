# `make all` Determinism Contract

Canonical contract for the production pipeline orchestration used by `make all`.

Implementation source of truth: `scripts/ops/run-make-all.mjs`.

## Stage Contracts

| #  | Stage           | Determinism criteria                                                   | Explicit skip contract                                                        | Explicit failure contract                                                   |
| -- | --------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1  | `install`       | Lockfile-driven dependency install + fixed Playwright browser install. | Never skipped.                                                                | Fails pipeline if `make install` or Playwright install fails.              |
| 2  | `i18n-pull`     | Pulls canonical i18n subtree paths only.                               | Skip on remote/unavailable repository access.                                 | Non-zero is converted to `SKIP`, pipeline continues.                       |
| 3  | `i18n-xlate`    | Runs canonical translation scripts over tracked txt files.             | Skip when external translation service is unavailable.                        | Non-zero is converted to `SKIP`, pipeline continues.                       |
| 4  | `i18n-fill`     | Deterministic txt -> TS/JSON regeneration.                             | Never skipped.                                                                | Fails pipeline if generation exits non-zero.                               |
| 5  | `assets`        | Regenerates icons and sitemap from canonical scripts/templates.        | Android icons skip when `android/` does not exist.                            | Fails pipeline if required asset generation exits non-zero.                |
| 6  | `build`         | Fixed build command + repository config.                               | Never skipped.                                                                | Fails pipeline if `make build` exits non-zero.                             |
| 7  | `test`          | Fixed Makefile `test` gate sequence.                                   | Never skipped.                                                                | Fails pipeline on any required quality/test command failure.               |
| 8  | `gallery-local` | Deterministic scenario inventory + controlled sharding vars.           | Never skipped.                                                                | Fails pipeline if generation exits non-zero.                               |
| 9  | `gallery-publish` | Deterministic curation from local artifact source.                   | Never skipped.                                                                | Fails pipeline if publish generation exits non-zero.                       |
| 10 | `reports`       | Fixed report scripts + coverage gap generation.                        | `test:unit:coverage` threshold miss is explicit `SKIP`; gap report still runs. | Fails pipeline if payload matrix, i18n report, or coverage gap fails.      |
| 11 | `sonar`         | Deterministic analysis config against current tree.                    | Skip when SonarQube service is unavailable.                                   | Non-zero is converted to `SKIP`, pipeline continues.                       |
| 12 | `deploy`        | Fixed deploy and IndexNow command path.                                | Skip with human-blocker metadata when `ALLOW_PAID_ACTIONS != 1`.             | With approval, deploy failure is `FAIL`; IndexNow failure is explicit `SKIP`. |
| 13 | `android`       | Fixed bump/build commands and release artifact path.                   | Skip when Android prereqs are missing; upload skips when key file absent.     | Build/release failures are `FAIL`; upload failure is explicit `SKIP`.      |
| 14 | `services`      | Canonical validator scripts writing deterministic reports.             | Skip when credentials/network dependency unavailable.                          | Non-zero is converted to `SKIP`, pipeline continues.                       |
| 15 | `i18n-push`     | Deterministic subtree split/push from canonical i18n directories.      | Skip on remote push unavailability.                                           | Non-zero is converted to `SKIP`, pipeline continues.                       |
| 16 | `summary`       | Deterministic stage-order status report.                               | Never skipped.                                                                | Fails only if summary report write fails.                                  |

## Human Blocker Contract

When stage 12 is skipped because `ALLOW_PAID_ACTIONS != 1`, treat it as a human-only blocker:

1. Create a `[HUMAN]` issue in `Pending` with exact release approval steps.
2. Capture evidence requirements:
   - Netlify production deploy URL + deploy ID
   - `reports/indexnow-submission.json` showing successful submissions
3. Re-run with explicit approval:

```bash
ALLOW_PAID_ACTIONS=1 make all
```

## Evidence Output

Every run writes deterministic machine-readable evidence:

- `reports/pipeline/make-all/latest.json` (latest run summary)
- `reports/pipeline/make-all/<timestamp>/summary.json` (historical run)
- `reports/pipeline/make-all/<timestamp>/*.log` (per-stage logs)
