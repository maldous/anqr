# ANQR 1.0 Definition

This is the single canonical launch-scope definition for ANQR 1.0.

## Current truthful claim

The currently claimable 1.0 surface is:

- `apps/web`
- `netlify/*` for public HTTP QR API and MCP

Not currently claimable:

- `apps/api`
- Android
- iPhone

Mobile may later be added to the 1.0 claim, but it is not part of the truthful launch claim today.

## Objective

Ship the first maintained public ANQR release on the new package architecture, with:

- strict package-boundary governance
- explicit contracts
- truthful public web and Netlify delivery
- a stable engineering/harness operating model

## Required launch capabilities for the current claim

- QR generation
  - standard QR
  - advanced styling where currently supported
  - animation and overlays through the current guarded server/runtime surface
- QR analysis
  - structural and scannability diagnostics in the current product surface
- sharing and export
  - current web and Netlify-supported sharing/export flows
- public API
  - documented HTTP QR generation surface
- MCP
  - public anonymous/default posture with perimeter controls

## Required supporting capabilities

- OpenAPI and MCP documentation kept in sync with the actual public surfaces
- observability and analytics preserved where still in scope
- support contact and launch/public information kept truthful

## Deferred or conditional capabilities

- mobile launch
- authenticated MCP/API posture
- enterprise-only integrations
- any future `apps/api` promotion
- testing expansion beyond the current intentional rebuild strategy

## Non-goals for the current claim

- pretending `apps/api` is live
- claiming Android or iPhone launch-readiness because roots exist
- copying legacy structures wholesale without current architectural ownership

## Launch bar

### Functional

- current web and Netlify QR generation works truthfully
- API and MCP surfaces match their contracts and docs
- current in-scope share/export/analyze flows remain intact

### Quality

- required current-platform gates are green
- package architecture remains enforced
- contracts remain explicit and clean

### Reliability

- output is stable and scannable for the supported current-platform surface
- guarded remote asset handling remains enforced for overlays and related fetches

### Performance

- web and Netlify delivery remain within current visible performance budgets
- no unbounded regressions are introduced in core generation or delivery

### Documentation

- launch truth lives in one place
- harness doctrine is documented
- evidence expectations are documented
- archive vs live doctrine is explicit
