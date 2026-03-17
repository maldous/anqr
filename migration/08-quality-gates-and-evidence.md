# 08. Quality gates and evidence

## Mandatory gates throughout migration

```bash
npm run typecheck
npm run lint
npm run depcruise
npm run test:unit
npm run harness:quick
```

## Boundary gates at phase ends

```bash
npm run harness:full
npm run nightly:dry-run
npm run queue:check
npm run cspell
```

## Evidence expectations

After each migration phase, capture:

- files moved
- shims introduced
- imports rewritten
- config files changed
- remaining legacy roots
- validation commands run
- exact failures and fixes if any

## Definition of acceptable intermediate state

Acceptable:

- `src/*` still exists
- compatibility shims still exist
- root scripts still point at shims
- netlify still deploys from its current root

Not acceptable:

- package boundaries violated
- apps importing from `src` after an extracted package exists
- harness runtime broken by path churn
- fat netlify handlers after equivalent package logic exists
- preserved broad-bucket roots as new package names
