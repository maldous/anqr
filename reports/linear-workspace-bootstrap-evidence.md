# Linear Workspace Bootstrap Evidence

## Summary

Created the fresh ANQR 1.0 Linear workspace shape on the live `Anqr` team using the canonical hybrid model from the new harness doctrine.

## Scope class

- docs-harness

## Workspace URL

- https://linear.app/anqr

## Projects created

- Foundation & Governance
- Documentation & Doctrine
- Harness & Automation
- Web Experience
- API & MCP Delivery
- QR Engine & Core Packages
- Mobile Convergence
- Observability & Reliability
- Release Readiness
- Growth / SEO / Discoverability
- Compliance / Privacy
- Incidents / Ops

## Labels created

- pkg:contracts
- pkg:domain
- pkg:application
- pkg:platform
- pkg:ui
- pkg:analytics
- pkg:observability
- pkg:config
- pkg:testing
- app:web
- app:api
- app:mobile
- runtime:netlify
- runtime:harness
- runtime:mobile
- runtime:android
- runtime:ios
- docs
- release
- incident
- human-only
- sonar

## States created

- Blocked
- Human Review

## Deviations from manifest

- None for required projects, labels, or states.
- The live team still contains legacy extra states:
  - Merging
  - Rework
  - Pending
  - Duplicate
- The live team still contains legacy projects:
  - ANQR 1.0 Launch
  - ANQR Post-Launch
- Legacy non-canonical labels also remain and must be classified or retired deliberately later.

## Operator

- Matthew Aldous

## Follow-up issues opened

- None yet. The next work should classify legacy Linear drift and update harness integrations that currently encode old state IDs or assumptions.

## Decisions made

- The canonical state model is now:
  - Backlog
  - Todo
  - In Progress
  - In Review
  - Blocked
  - Human Review
  - Done
  - Canceled
- Extra legacy states were not deleted during first bootstrap; they are recorded as drift for deliberate follow-up.

## Commands run

```bash
npm run cspell
node - <<'NODE'
// Queried current Linear team/projects/labels/states against the manifest.
NODE
node - <<'NODE'
// Created missing projects, labels, and states via Linear GraphQL.
NODE
```

## Results

- PASS: `npm run cspell`
- PASS: live Linear query confirmed missing canonical projects, labels, and states
- PASS: live Linear mutations created the missing canonical projects, labels, and states

## Changed files

- README.md
- docs/harness/00-index.md
- docs/harness/03-workspace-governance.md
- docs/harness/workspace/README.md
- docs/harness/workspace/linear-workspace.manifest.json
- docs/harness/workspace/bootstrap-checklist.md
- docs/harness/workspace/issue-template.md
- reports/linear-workspace-bootstrap-evidence.md

## Commit

- Pending Phase 2 workspace-bootstrap commit.

## Issue comment text

- Phase 2 workspace bootstrap completed on the live Anqr Linear team. All canonical projects, labels, and required states now exist. Legacy extra states/projects remain recorded as deliberate follow-up drift, not silent deletion.

## Artifacts attached/linked

- docs/harness/workspace/linear-workspace.manifest.json
- docs/harness/workspace/bootstrap-checklist.md
- docs/harness/workspace/issue-template.md
- reports/linear-workspace-bootstrap-evidence.md

## Risk / rollback note

- This change mutated the live Linear team by adding projects, labels, and states.
- Rollback would require deliberate archival or deletion in Linear; it is not a pure git rollback.

## Follow-up work

- classify or retire legacy extra Linear states, labels, and projects
- update harness scripts that currently encode old state IDs or assume the pre-bootstrap team shape
- start Phase 3 harness-runtime classification under the new workspace
