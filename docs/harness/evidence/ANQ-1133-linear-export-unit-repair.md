# ANQ-1133: Harness – repair missing anqr-linear-export user unit installation

**Date:** 2026-03-30
**Scope:** docs-harness / harness runtime
**Issue:** ANQ-1133

---

## Summary

Linear export automation existed in-repo but the user systemd inventory lacked both the service and timer, leaving `systemctl --user` unable to load `anqr-linear-export.*`. Copied the service/timer into `~/.config/systemd/user`, reloaded the manager, enabled the timer, and executed a manual run to confirm exports succeed and logs populate.

## Actions Taken

1. Installed units:
   ```bash
   cp services/systemd/anqr-linear-export.service ~/.config/systemd/user/
   cp services/systemd/anqr-linear-export.timer ~/.config/systemd/user/
   systemctl --user daemon-reload
   systemctl --user enable --now anqr-linear-export.timer
   ```
2. Verified loadable units:
   ```bash
   systemctl --user list-units 'anqr-linear-export*' --all
   ```
   Output shows both service and timer `loaded`, timer `active (waiting)`.
3. Manual export test:
   ```bash
   systemctl --user start anqr-linear-export.service
   journalctl --user -u anqr-linear-export.service -n 15
   ```
   Journal confirms export completed (104 issues) and service exited successfully.

## Current Status

- `anqr-linear-export.service` installed at `~/.config/systemd/user/anqr-linear-export.service`
- `anqr-linear-export.timer` enabled and scheduled for 02:30 daily (with 5-minute randomized delay)
- Next trigger reported by `systemctl --user status anqr-linear-export.timer`
- Manual run completed at 17:26 Australia/Melbourne local time on 2026-03-30

## Evidence Snippets

```
$ systemctl --user list-units 'anqr-linear-export*' --all
  UNIT                       LOAD   ACTIVE   SUB     DESCRIPTION
  anqr-linear-export.service loaded inactive dead    ANQR Linear issue export
  anqr-linear-export.timer   loaded active   waiting ANQR Linear issue export timer
```

```
$ journalctl --user -u anqr-linear-export.service -n 10
Mar 30 17:26:33 foo anqr-linear-export[223099]: [export-issues.mjs:69] [INFO] Starting Linear issue export...
Mar 30 17:26:34 foo anqr-linear-export[223099]: [export-issues.mjs:79] [INFO] Found 82 recent Done issues
Mar 30 17:26:34 foo anqr-linear-export[223099]: [export-issues.mjs:94] [INFO] ✅ Export complete: reports/linear-export/issues-latest.json
Mar 30 17:26:34 foo anqr-linear-export[223099]: [export-issues.mjs:95] [INFO] Exported 104 issues
Mar 30 17:26:34 foo systemd[4009431]: Finished anqr-linear-export.service - ANQR Linear issue export.
```

## Follow-ups

- Keep `services/systemd/README.md` timer table updated (now includes Linear export entry).
- Monitor nightly runs via `harness-report` Linear RAG section; investigate if timer misses future deadlines.
