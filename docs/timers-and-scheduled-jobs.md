# ANQR Timers and Scheduled Jobs

## Timer Inventory

### Mutating Jobs (modify state/data)

| Timer                      | Service                      | Schedule    | Behavior                                                                                               |
| -------------------------- | ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `anqr-nightly.timer`       | `anqr-nightly.service`       | 02:00 daily | Runs nightly ops: queue control, guardian, notify, archive. **Mutates Linear issues and queue state.** |
| `anqr-email-ingest.timer`  | `anqr-email-ingest.service`  | Every 5 min | Syncs mail via mbsync, creates Linear issues from allowed senders. **Mutates Linear and mail tags.**   |
| `anqr-rag-rebuild.timer`   | `anqr-rag-rebuild.service`   | 03:00 daily | Rebuilds RAG vector index from project sources. **Mutates index files on disk.**                       |
| `anqr-linear-export.timer` | `anqr-linear-export.service` | 02:30 daily | Exports Linear issues to JSON for downstream indexing. **Writes export files.**                        |

### Diagnostic/Reporting Jobs (read-only)

| Timer                        | Service                        | Schedule                 | Behavior                                                        |
| ---------------------------- | ------------------------------ | ------------------------ | --------------------------------------------------------------- |
| `anqr-worktree-health.timer` | `anqr-worktree-health.service` | Every 5 min (after boot) | Snapshots worktree fleet health. **Writes health report only.** |

## Timer Safety Classification

- **Safe to disable:** `anqr-worktree-health.timer` (diagnostic only)
- **Caution on disable:** `anqr-email-ingest.timer` (mail backlog accumulates)
- **Impact on disable:** `anqr-nightly.timer` (no nightly hygiene or archival)
- **Impact on disable:** `anqr-rag-rebuild.timer` (search index goes stale)
- **Impact on disable:** `anqr-linear-export.timer` (RAG linear data goes stale)

## Operational Schedule

```
02:00  anqr-nightly         (mutating: queue + issue hygiene)
02:30  anqr-linear-export   (mutating: writes export JSON)
03:00  anqr-rag-rebuild     (mutating: rebuilds vector index)

Every 5m  anqr-email-ingest     (mutating: mail → Linear issues)
Every 5m  anqr-worktree-health  (diagnostic: health snapshot)
```
