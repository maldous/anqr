# Quality Gates

This document is the canonical gate reference for ANQR 1.0 foundation work.

## Gate tiers

### Inner loop

Run the smallest truthful set for the slice you are changing.

Typical examples:

- `npm run typecheck`
- `npm run lint`
- `npm run depcruise:all`
- `npm run contracts:check`
- `npm run audit:ast`

### Pre-merge base set

For current in-scope work, the default base set is:

```bash
npm run typecheck:apps
npm run typecheck:packages
npm run typecheck:netlify
npm run lint:apps
npm run lint:packages
npm run lint:netlify
npm run depcruise:all
npm run contracts:check
npm run audit:ast
npm run openapi:generate
npm run test:unit
npm run build:web
```

Conditional add-ons:

- web UI / critical-flow change -> `npm run test:basic`
- gallery / render / export change -> `npm run test:advanced`
- broad regression / release pass -> `npm run test`
- harness-only work -> `npm run harness:quick`, `npm run queue:all:dry-run`, `npm run symphony:status`
- mobile work -> mobile gates are separate and are not part of the default in-scope base set

### Release

Release-grade current-platform checks include:

- `make quality-release`
- Sonar scan and export
- launch-route and doc truth verification
- public API / MCP contract sync

### Mobile-only

Only required if mobile is brought back into the 1.0 claim:

- `npm run test:appium:android`
- `npm run test:appium:ios`

### Manual / external

- legal and privacy approvals
- ads or billing approvals
- store and signing actions
- production perimeter rollout

## Truth rule

Do not claim a gate passed unless it actually ran in the relevant environment.
