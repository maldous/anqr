# Workspace Bootstrap Checklist

Use this checklist when creating or resetting the fresh ANQR Linear workspace.

## 1. Create the workspace skeleton

- create the workspace or confirm the reset target
- set the workspace display name to `ANQR 1.0`
- confirm the hybrid model:
  - projects by stream or package family
  - labels for concrete package or runtime ownership

## 2. Create projects

Create every project listed in [linear-workspace.manifest.json](/home/user/src/anqr/docs/harness/workspace/linear-workspace.manifest.json).

Do not collapse projects unless the doctrine changes first.

## 3. Create labels

Create every required label from the manifest.

Rules:

- labels are required for concrete ownership
- `human-only` must exist before any sensitive migration work is routed
- `sonar` must exist before Sonar issue sync is enabled

## 4. Create states

Create the canonical state set:

- `Backlog`
- `Todo`
- `In Progress`
- `In Review`
- `Blocked`
- `Human Review`
- `Done`
- `Canceled`

## 5. Set state usage

- `Backlog`
  - not yet ready for active execution
- `Todo`
  - execution-ready
- `In Progress`
  - active work in flight
- `In Review`
  - evidence or merge validation pending
- `Blocked`
  - external blocker only
- `Human Review`
  - secret, legal, billing, store, prod-control, or launch-claim decision required
- `Done`
  - evidence attached and outcome accepted
- `Canceled`
  - superseded with explanation

## 6. Set sizing

Use:

- `S`
- `M`
- `L`
- `XL`

`XL` work should be split before active execution where practical.

## 7. Preserve required history

- preserve the migrated history that still explains current work
- preserve done and canceled history that records abandoned approaches
- do not import legacy noise that no longer informs current architecture

## 8. Publish bootstrap proof

Record:

- workspace URL
- created projects
- created labels
- created states
- any deviations from the manifest
- who performed the bootstrap
- which follow-up tasks were opened immediately after bootstrap
