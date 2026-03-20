# Workspace Governance

This document defines the fresh Linear workspace model for ANQR 1.0 foundation work.

## Project model

Use a hybrid model:

- projects by stream or package family
- concrete packages tracked by labels/components

Required projects:

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

## Required labels

- `pkg:contracts`
- `pkg:domain`
- `pkg:application`
- `pkg:platform`
- `pkg:ui`
- `pkg:analytics`
- `pkg:observability`
- `pkg:config`
- `pkg:testing`
- `app:web`
- `app:api`
- `app:mobile`
- `runtime:netlify`
- `runtime:harness`
- `runtime:mobile`
- `runtime:android`
- `runtime:ios`
- `docs`
- `release`
- `incident`
- `human-only`
- `sonar`

## States

Use this state model:

- `Backlog`
- `Todo`
- `In Progress`
- `In Review`
- `Blocked`
- `Human Review`
- `Done`
- `Canceled`

## Rules

- use `Human Review` for approvals, secrets, legal, store, billing, and claim changes
- use `Blocked` only for external blockers
- use `Canceled` for superseded work, not silent deletion
- keep evidence in the issue body or linked artifact
- preserve migration-history context when rebooting the workspace

## Sizing

Use simple relative sizing:

- `S`
- `M`
- `L`
- `XL`

Break down `XL` work before active execution where practical.

## Bootstrap artifacts

Use the concrete bootstrap inputs under [workspace](/home/user/src/anqr/docs/harness/workspace):

- [README.md](/home/user/src/anqr/docs/harness/workspace/README.md)
- [linear-workspace.manifest.json](/home/user/src/anqr/docs/harness/workspace/linear-workspace.manifest.json)
- [bootstrap-checklist.md](/home/user/src/anqr/docs/harness/workspace/bootstrap-checklist.md)
- [issue-template.md](/home/user/src/anqr/docs/harness/workspace/issue-template.md)
