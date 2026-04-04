# Linear Drift Classification

## Summary

This report classifies the remaining live Linear drift against the canonical ANQR 1.0 workspace model after the Phase 2 bootstrap checkpoint.

## Scope class

- docs-harness

## Workspace

- https://linear.app/anqr
- team: `Anqr`
- team key: `ANQ`

## Canonical state model

The canonical state model is:

- `Backlog`
- `Todo`
- `In Progress`
- `In Review`
- `Blocked`
- `Human Review`
- `Done`
- `Canceled`

## Non-canonical states

| Item        | Disposition  | Reason                                                                    | Owner/runtime   | Replacement target                                             | Blocking risk | Follow-up issue                            |
| ----------- | ------------ | ------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------- | ------------- | ------------------------------------------ |
| `Merging`   | transitional | legacy automation state; not part of the new canonical model              | runtime:harness | map to `In Review` or remove after runner/queue classification | medium        | Classify and converge legacy Linear states |
| `Rework`    | transitional | legacy retry/rework state not reflected in new governance                 | runtime:harness | map to `Todo` or `Blocked` with explicit evidence rules        | medium        | Classify and converge legacy Linear states |
| `Pending`   | transitional | legacy waiting state duplicates canonical intent without doctrine support | runtime:harness | map to `Blocked`, `Human Review`, or remove                    | medium        | Classify and converge legacy Linear states |
| `Duplicate` | archive-only | legacy cancellation subclass                                              | runtime:harness | fold into `Canceled` plus label/comment evidence               | low           | Classify and converge legacy Linear states |

## Non-canonical projects

| Item               | Disposition  | Reason                                                      | Owner/runtime | Replacement target                                       | Blocking risk | Follow-up issue                              |
| ------------------ | ------------ | ----------------------------------------------------------- | ------------- | -------------------------------------------------------- | ------------- | -------------------------------------------- |
| `ANQR 1.0 Launch`  | transitional | legacy umbrella project predates the hybrid stream model    | docs-harness  | map open work into the new stream projects, then archive | medium        | Classify and converge legacy Linear projects |
| `ANQR Post-Launch` | transitional | legacy umbrella project not aligned to the new stream model | docs-harness  | map live work into new projects, then archive            | low           | Classify and converge legacy Linear projects |

## Non-canonical labels

| Item          | Disposition  | Reason                                                                | Owner/runtime   | Replacement target                                                              | Blocking risk | Follow-up issue                            |
| ------------- | ------------ | --------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------- | ------------- | ------------------------------------------ |
| `paid`        | transitional | spend governance still matters but label is not in canonical taxonomy | docs-harness    | map to `human-only` plus release/compliance documentation if still needed       | low           | Classify and converge legacy Linear labels |
| `billing`     | transitional | finance-sensitive work still exists                                   | docs-harness    | map to `human-only` or a later explicit finance taxonomy                        | low           | Classify and converge legacy Linear labels |
| `payment`     | transitional | overlaps with billing/compliance concepts                             | docs-harness    | map to `human-only` or explicit compliance taxonomy                             | low           | Classify and converge legacy Linear labels |
| `p0`          | transitional | priority label from older system                                      | runtime:harness | replace with issue priority field and release evidence                          | medium        | Classify and converge legacy Linear labels |
| `p1`          | transitional | priority label from older system                                      | runtime:harness | replace with issue priority field and release evidence                          | medium        | Classify and converge legacy Linear labels |
| `reliability` | duplicate    | overlaps with `Observability & Reliability` project plus issue scope  | docs-harness    | map to project + canonical package/runtime labels                               | low           | Classify and converge legacy Linear labels |
| `perf`        | transitional | performance work still exists but label is outside canonical set      | docs-harness    | decide retain as explicit secondary label or fold into project/issue scope      | low           | Classify and converge legacy Linear labels |
| `security`    | transitional | security work still exists but label is outside canonical set         | docs-harness    | decide retain as explicit secondary label or fold into compliance/project scope | low           | Classify and converge legacy Linear labels |
| `analytics`   | duplicate    | overlaps with `pkg:analytics`                                         | docs-harness    | map to `pkg:analytics`                                                          | low           | Classify and converge legacy Linear labels |
| `ads`         | transitional | monetization/ads still in launch backlog                              | docs-harness    | decide later explicit monetization label or fold into project scope             | low           | Classify and converge legacy Linear labels |
| `api`         | duplicate    | overlaps with `app:api` and `runtime:netlify`                         | docs-harness    | map to canonical runtime/app labels                                             | low           | Classify and converge legacy Linear labels |
| `ios`         | duplicate    | overlaps with `runtime:ios`                                           | docs-harness    | map to `runtime:ios`                                                            | low           | Classify and converge legacy Linear labels |
| `android`     | duplicate    | overlaps with `runtime:android`                                       | docs-harness    | map to `runtime:android`                                                        | low           | Classify and converge legacy Linear labels |
| `web`         | duplicate    | overlaps with `app:web`                                               | docs-harness    | map to `app:web`                                                                | low           | Classify and converge legacy Linear labels |
| `Feature`     | transitional | legacy issue-type label                                               | runtime:harness | decide retain/archive once issue templates and project usage settle             | low           | Classify and converge legacy Linear labels |
| `Improvement` | transitional | legacy issue-type label                                               | runtime:harness | decide retain/archive once issue templates and project usage settle             | low           | Classify and converge legacy Linear labels |
| `Bug`         | transitional | legacy issue-type label                                               | runtime:harness | decide retain/archive once issue templates and project usage settle             | low           | Classify and converge legacy Linear labels |

## Recommended next order

1. classify every non-canonical state as retain, map, archive, or remove
2. classify legacy umbrella projects before deleting anything
3. update harness scripts that still encode old state IDs or assumptions
4. only then perform destructive Linear cleanup

## Risk / rollback

- This report is read-only. No further Linear mutation was performed during classification.
- Destructive cleanup should not happen until the harness/runtime classification is complete.
