# Performance & Bundle Audit (2026-02-15)

## Build + Budget Runs
- Command: `make test:bundle:budget`
- Result: PASS
- Latest budget report: `reports/bundle-budget.md`

## Concrete Optimization Implemented
1. Locale/static alias deduplication in lazy loaders:
- `src/i18n/index.ts` now aliases duplicate locale variants and excludes duplicate modules from glob loading.
- `src/i18n/static/index.ts` now aliases duplicate static-content variants and excludes duplicate modules from glob loading.
2. CI/quality budget enforcement:
- `scripts/check-bundle-budgets.mjs` is wired into `make quality` and `npm run test:signoff`.

## Before vs After (Iteration 2)
| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Main entry (KiB) | 524.0 | 524.0 | 0.0 |
| Non-i18n total (KiB) | 1678.8 | 1680.2 | +1.4 |
| i18n total (KiB) | 22910.3 | 21433.4 | -1476.9 |
| PWA precache payload (KiB) | 25284.07 | 23808.61 | -1475.46 |

## Budget Gate Status
- Main entry cap (`<=700 KiB`): PASS
- Non-i18n cap (`<=2200 KiB`): PASS
- i18n warning (`<=22000 KiB`): PASS
- i18n hard max (`<=24000 KiB`): PASS

## Assessment
- i18n/static payload remains the largest cost center, but it is now reduced and under explicit enforced budgets.
- Performance risk for launch is now bounded by CI gates rather than manual observation.
