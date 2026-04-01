
### 2026-03-30T08:58:43.826Z - Watchdog rolled back symphony bridge from ead8bbdac to ba6a0aa59 (stuck in activating for 65s)

╔════════════════════════════════════════════════════════════════╗
║ 🚨 WATCHDOG AUTOMATIC ROLLBACK 🚨                              ║
╠════════════════════════════════════════════════════════════════╣
║ Service:        symphony                                        ║
║ Failed Commit:  ead8bbdac                                       ║
║ Rolled Back To: ba6a0aa59                                       ║
║ Reason:         stuck in activating for 65s                     ║
╠════════════════════════════════════════════════════════════════╣
║ ⚠️  REVIEW THE FAILED COMMIT BEFORE MAKING NEW CHANGES         ║
╚════════════════════════════════════════════════════════════════╝


## 2026-03-31T10:19 - Full System Restart

- Committed and pushed main (commit 5ac4e4ecc)
- Synced all 8 worktrees (wt1-wt8) to main
- Restarted all services (symphony-bridge, context7-mcp, discord-router, watchdog, discord-bridge@1-8, symphony-runner@1-8)
- Re-enabled Symphony task execution


## 2026-03-31T14:00 - All-in-One Symphony Bridge Design Decision

**ADR-0003 created:** Consolidate Codebuff bridge + routing into Symphony bridge.

**Problem identified:** Codebuff bridge had cwd caching defect (F1) — client keyed by `costMode` only, ignoring `cwd`. Requests for one worktree could reuse client from another worktree, breaking isolation.

**Design decision:** Merge all capabilities into single Symphony bridge per worktree:
- AI completion (`/v1/chat/completions`)
- Codebuff SDK operations (tool use, code edits)
- Worktree-bound via systemd `WorkingDirectory`

**Benefits:**
- Eliminates caching defects (no shared state)
- Simplifies architecture (one service per worktree)
- Reduces service count (8 fewer Codebuff bridge instances)
- WorkingDirectory is single source of truth for isolation

**Next steps:**
- Phase 1: Integrate Codebuff SDK into `symphony-openai-bridge.mjs`
- Phase 2: Deploy updated Symphony bridge template
- Phase 3: Deprecate and remove Codebuff bridge services
- Phase 4: Update all documentation

See `docs/adr/ADR-0003-all-in-one-symphony-bridge.md` for full rationale.

## 2026-03-31T12:22 - Worktree E2E Validation Complete (Phases 0-8)

**All 9 phases of worktree concurrent execution validation complete.**

### Phase Summary

| Phase | Result | Key Evidence |
|-------|--------|--------------|
| Phase 0: Documentation & Review | ✅ COMPLETE | External reviewer feedback incorporated |
| Phase 1: Fix Proven Code Defects | ✅ COMPLETE | F1-F4 fixed, regression tests pass |
| Phase 2: Clean Up Deployed State | ✅ COMPLETE | Stale units removed, services reconciled |
| Phase 3: Runtime Config Verification | ✅ COMPLETE | openclaw.json wins merge, models.json updated |
| Phase 4: Service Startup & Smoke Testing | ✅ COMPLETE | All 7 ports listening, health OK |
| Phase 5: Discord Flow E2E Validation | ✅ COMPLETE | Isolation infrastructure verified |
| Phase 6: Linear Flow E2E Validation | ✅ COMPLETE | Infrastructure validated (provider capacity gap noted) |
| Phase 7: Concurrent Operation Validation | ✅ COMPLETE | 2 simultaneous runners, 429 overflow, worktree sync |
| Phase 8: Documentation Finalization | ✅ COMPLETE | All UNVERIFIED language replaced, gaps resolved |

### Operational State

- **9 worktrees:** 1 main (control plane) + 4 Symphony runners (wt1-wt4) + 4 Discord worktrees (wt5-wt8)
- **7 ports listening:** 4319 (main bridge), 4325-4328 (worktree bridges), 18789 (gateway), 18790 (router)
- **4 runner timers:** wt1-wt4, firing every 2 minutes
- **Source routing:** Symphony runners handle non-Discord issues; Discord worktrees handle Discord issues
- **Concurrency limit:** Max 8 (4 Symphony + 4 Discord), enforced by lease system + router

### Bugs Fixed During Validation

- `worktreeId is not defined` in `callLLM` (commit 068d92c8c)
- Pre-flight lint blocker: unused `PROJECT_ROOT` (commit a659d7e05)
- Pre-flight cspell: added `bursty`/`inrepo` to dictionary
- Stale `qwen-portal-auth` plugin config removed
- Gateway restart loop: added port-alive detection to singleton

### Lessons Learned

- Provider capacity (rate limits / empty responses) is the current throughput bottleneck, not infrastructure
- All 15 providers in the cascade hit rate limits during testing — need provider capacity expansion
- Worktree isolation is robust: 6 layers of defense all verified
- Port-alive detection prevents gateway restart loops when external services own the port


