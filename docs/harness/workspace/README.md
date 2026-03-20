# Workspace Bootstrap Artifacts

This directory contains the concrete bootstrap artifacts for the fresh ANQR Linear workspace.

## Purpose

These files translate the governance rules in [../03-workspace-governance.md](/home/user/src/anqr/docs/harness/03-workspace-governance.md) into reusable bootstrap inputs.

## Files

- [linear-workspace.manifest.json](/home/user/src/anqr/docs/harness/workspace/linear-workspace.manifest.json)
  - machine-readable project, label, state, and sizing definition
- [bootstrap-checklist.md](/home/user/src/anqr/docs/harness/workspace/bootstrap-checklist.md)
  - exact operator sequence for standing up the workspace
- [issue-template.md](/home/user/src/anqr/docs/harness/workspace/issue-template.md)
  - canonical issue body structure aligned to the evidence contract

## Rule

If workspace governance changes, update the manifest and checklist in the same change. Do not leave the machine-readable artifacts behind the doctrine.
