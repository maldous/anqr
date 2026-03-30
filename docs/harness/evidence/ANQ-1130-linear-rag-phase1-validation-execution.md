# ANQ-1130: Linear RAG Phase 1 Validation Execution

## Summary

This issue tracks the execution and verification of all manual validation steps defined in ANQ-1129. The goal is to ensure that all validation steps pass to confirm Phase 1 readiness for production deployment of the Linear RAG integration.

## Scope class

Harness validation — Linear RAG

## Validation Steps from ANQ-1129

The following validation steps are extracted from ANQ-1129 and must be executed and verified.

### Test 1: Export Pipeline

- [ ] Run export script with `LINEAR_API_KEY` set
- [ ] Verify output file `reports/linear-export/issues-latest.json` exists
- [ ] Verify file contains valid JSON and non-empty array
- [ ] Verify issue count is as expected (fetches open issues + recent Done)
- [ ] Verify Canceled issues are excluded (count of canceled = 0)
- [ ] Verify export completes within reasonable time (<60s target)

**Script:** `scripts/ops/integrations/linear/export-issues.mjs`

### Test 2: RAG Index Pipeline

- [ ] Ensure Ollama is running and accessible at `http://localhost:11434`
- [ ] Run index builder `scripts/ops/lib/rag/build-index-linear.mjs`
- [ ] Verify index files created: `reports/rag-index-linear/index.json` and `meta.json`
- [ ] Verify `meta.json` contains `chunkCount`, `lastBuild`, `indexSizeBytes`
- [ ] Verify chunk count is reasonable (should roughly match issue count)
- [ ] Verify index build completes within <2 minutes

**Note:** Index builder requires the export data to exist.

### Test 3: Search Integration

- [ ] Run search CLI: `node -e "import('./scripts/ops/lib/search/linear-search.mjs').then(m => m.searchLinearIssues('validation', 5).then(console.log))"`
- [ ] Verify results array is returned with at least one match
- [ ] Verify each result contains: `identifier`, `title`, `state`, `priority`, `score`, `excerpt`
- [ ] Verify scores are between 0 and 1
- [ ] Verify excerpts are non-empty strings

**Note:** Search requires the index to be built.

### Test 4: Systemd Services

- [ ] Install services: copy `services/systemd/anqr-linear-export.*` and `anqr-rag-rebuild-linear.*` to `~/.config/systemd/user/`
- [ ] Reload systemd daemon: `systemctl --user daemon-reload`
- [ ] Enable and start timers: `systemctl --user enable --now anqr-linear-export.timer` and `anqr-rag-rebuild-linear.timer`
- [ ] Verify timers are scheduled: `systemctl --user list-timers | grep linear`
- [ ] Test manual execution: `systemctl --user start anqr-linear-export.service` and `anqr-rag-rebuild-linear.service`
- [ ] Check logs: `journalctl --user -u anqr-linear-export.service -n 50` and similar for rebuild service
- [ ] Verify logs show successful completion (exit code 0) or identify errors

### Test 5: Monitoring Integration

- [ ] Run harness report: `node scripts/ops/reporting/harness-report.mjs full`
- [ ] Verify output includes `linear-rag-pipeline` check
- [ ] Verify check status is passing (✅) with reasonable metrics
- [ ] Verify metrics displayed: Export issue count, index chunk count, age in hours
- [ ] Verify no staleness alerts (export and index should be fresh after manual run)

## Commands Run

Record actual commands executed and their outputs.

```bash
# Example:
export LINEAR_API_KEY="lin_api_xxx"
node scripts/ops/integrations/linear/export-issues.mjs
# etc.
```

## Validation Results

Summarize the overall result. All tests must pass for validation to be considered successful.

- **Overall Status:** ⏳ Pending / ✅ Pass / ❌ Fail
- **Failed Steps:** (list any failures)
- **Notes:** (any observations, performance metrics, issues encountered)

## Changed Files

N/A — This issue is for validation only; no code changes required.

## Risk / Rollback Note

N/A — No code changes in this issue. If validation fails, refer to ANQ-1129 for implementation details and create remediation issues.

## Follow-up Work

- If all validation passes: Mark this issue as complete. Consider ANQ-1129 Phase 1 deployment-ready.
- If validation fails:
  - Create new ANQ issues to address each failure
  - Reference this issue in those issues
  - Re-run validation after fixes are deployed

## Acceptance Criteria

From ANQ-1129 Phase 1 success criteria, the following must be demonstrated:

- ✅ Linear export runs nightly without errors (systemd timer validated)
- ✅ Linear RAG index builds in <2 min (performance validated)
- ✅ Search integration returns correct results (CLI validated)
- ✅ Monitoring integration passes in harness-report
- ✅ All manual tests produce expected outputs

Phase 2 (comments + transitions) will be triggered based on 2 weeks of monitoring post-deployment if agents struggle with missing comment context or transition history.

## Related Issues

- **ANQ-1129**: Linear RAG Phase 1 Validation & Monitoring (parent documentation)
- **ANQ-1120**: Linear Issue RAG Integration Investigation (parent investigation)

---

**Created:** 2025-06-20
**Assignees:** (TBD)
**Priority:** P1 - Blocking deployment
