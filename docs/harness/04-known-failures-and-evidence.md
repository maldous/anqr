# Known Failures And Evidence> **⚠️ Pre-implementation architecture review document.** Written before Workstreams A–G. The structural failures listed here were addressed in Workstreams A–G. The current known issues section below reflects live operational findings from 2026-05.

## Summary (Historical)

The failures described below were structural and were addressed by Workstreams A–G:

- duplicate dispatch → ADR-0002 authoritative scheduler
- recovery git mutation → ADR-0005 state-only recovery
- split scheduling → ADR-0002 scheduler is sole claim authority
- capacity advisory → durable state reconstruction on startup
- worktree drift → ADR-0005 reset_to_main for idle, sticky base SHA
- test gaps → added concurrency and lease-expiry tests

## Current Known Issues (2026-05)

These are live operational findings not captured in the historical table above:

| Issue | Evidence | Mechanism | Status |
| ----- | -------- | --------- | ------ |
| Watchdog false "unhealthy" on all executors | All 8 executors flagged `health check timeout` every cycle | Executor bridges return large JSON (~628 providers, 60KB+) taking 5–8s to serialize, exceeding the 5s timeout | Fixed: timeout raised to 10s (2026-05-16). wt4 occasionally hits 15s — may need further tuning or a lightweight `/ping` endpoint |
| Issues cycling fast without file changes | Issues reach `Canceled` with no commit produced | Agent fixes target correctly before runner commits; `changedFiles=[]` + `HEAD===origin/main` causes immediate cancel | Fixed: auto-cancel added in `execute-issue.mjs` (2026-05-16) |
| `integrated_main` issues not reaching Done | ANQ-3312, ANQ-3273 stuck in `integrated_main` | `anqr-linear-reconciler.service` was dead (exit status 0/SUCCESS) — reconciler handles the `integrated_main → Done` transition | Fixed: service restarted (2026-05-16). Reconciler exits cleanly after long runs — needs watchdog monitoring or restart policy |
| Catch-parameter rename breaks test assertions | AI renames catch param but changes test assertion strings | `validation_failed_repairable` when agent renames `catch (e)` → `catch (error_)` AND also renames string literals in `expect(...).toHaveBeenCalledWith('some error')` | Documented in `harness/ops/symphony/WORKFLOW.md` Sonar catch-parameter rules. Agent must only rename the parameter, not string literals |
| `anqr-nightly.service` failing | `anqr-nightly.service` in `failed` state | Nightly operations pass encountering errors | Needs investigation — service is dead but not blocking pipeline |
| Discord routers use same port load-balancer | `anqr-discord-router.service` + `anqr-discord-text-router.service` + `anqr-discord-voice-router.service` | Three router services for different Discord workloads (text vs voice vs main) | Operational split — currently wt1-4 for Linear, wt5-8 for Discord, with text/voice sub-split |

## Resolved Historical Issues

| Failure | Resolution | Date |
| ------- | ---------- | ---- |
| Duplicate Linear dispatch | ADR-0002 scheduler is sole claim authority | 2026-04 |
| Recovery mutates git | ADR-0005 state-only recovery; `reset_to_main` for dirty worktrees | 2026-04 |
| Split scheduling authority | `symphony-scheduler.service` owns all claims | 2026-04 |
| Late conflict discovery | Integrator uses retry with re-fetch+cherry-pick on non-fast-forward | 2026-05 |
| Runner skips `updateIssue(inReview)` after push | Runner no longer calls `updateIssue(inReview)` when push succeeds | 2026-05 |
| Watchdog false unhealthy (5s timeout) | HEALTH_CHECK_TIMEOUT_MS raised to 10000ms | 2026-05-16 |
| No-op `propose_str_replace` and `propose_write_file` tools | Removed from bridge | 2026-05 |
| Bridge worktree lease not released on SIGTERM | Bridge now releases worktree lease on SIGTERM | 2026-05 |
| Git sync used `merge --ff-only` | Changed to `reset --hard` for worktree sync | 2026-05 |

## Current nonconformances that must be documented openly

### The system is not effectively once

The current runtime is not effectively-once for mutating Linear work.

It is at best at-least-once with manual cleanup.

### Reconciler exit behavior needs monitoring

The `linear-reconciler` runs as an infinite `--daemon` loop but can exit cleanly (status=0/SUCCESS) after long running periods (~4h39min observed). The watchdog does not monitor it. Without a restart policy, `integrated_main` issues will stack up without transitioning to Done.

### Watchdog timeout still borderline for wt4

wt4 occasionally takes >10s on the health endpoint (15s observed on curl). The 10s timeout may still cause occasional false timeouts for wt4 specifically. Long-term fix: add a lightweight `/ping` endpoint to bridges that returns minimal JSON without the provider list.

### Ancillary services are not ancillary enough

`linear-reconciler`, `symphony-worktree-recovery`, and parts of runner behavior are shaping execution ownership and git state.

That violates the intended model where executors do work and support services only recover from failure.

### Worktree identity is overloaded

A worktree currently represents:

- a pool slot
- a long-lived branch
- a mutable sandbox
- a repair surface
- a possible durable owner of issue progress

Those roles should be split.

### Existing documentation mixed intent with remediation

Previous docs often described a desired state as if it already existed.

This set replaces that with explicit status labeling.
