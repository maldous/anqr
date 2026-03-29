# Worktree Quick Start Guide

**Goal:** Enable concurrent Symphony execution to increase throughput 75-150%.

**Time required:** 10 minutes

**Prerequisites:**
- Full harness capability (systemd user services, credentials)
- 4+ GB RAM, 2+ CPU cores
- 2+ GB free disk space

## Quick Start (3 Steps)

### Step 1: Create Worktrees (2 minutes)

```bash
cd /home/user/src/anqr
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 2
```

**Expected output:**
```
🚀 Initializing worktree pool (2 worktrees)...
✅ Created worktree: /home/user/src/anqr-wt1 (branch: symphony/wt1)
✅ Created worktree: /home/user/src/anqr-wt2 (branch: symphony/wt2)
✅ Worktree pool initialized: 2/2 worktrees created
```

**Verify:**
```bash
node scripts/ops/orchestration/symphony-worktree-pool.mjs status
```

### Step 2: Install Systemd Services (1 minute)

```bash
cp services/systemd/anqr-symphony-runner@.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner@.timer ~/.config/systemd/user/
systemctl --user daemon-reload
```

### Step 3: Enable Concurrent Runners (1 minute)

```bash
systemctl --user enable --now anqr-symphony-runner@1.timer
systemctl --user enable --now anqr-symphony-runner@2.timer
```

**Verify:**
```bash
systemctl --user list-timers | grep symphony
```

**Expected:** Two timers active, firing every 2 minutes.

## Monitoring

**Watch logs in real-time:**
```bash
journalctl --user -u 'anqr-symphony-runner@*.service' -f
```

**Check runner status:**
```bash
systemctl --user status anqr-symphony-runner@1.service
systemctl --user status anqr-symphony-runner@2.service
```

**Check worktree health:**
```bash
node scripts/ops/orchestration/symphony-worktree-pool.mjs status
```

**Monitor queue:**
```bash
node scripts/ops/orchestration/symphony-queue-control.mjs --check
```

## Scaling

**Add a third runner:**
```bash
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 3
systemctl --user enable --now anqr-symphony-runner@3.timer
```

**Remove a runner:**
```bash
systemctl --user stop anqr-symphony-runner@3.timer
systemctl --user disable anqr-symphony-runner@3.timer
```

## Troubleshooting

**Problem: No issues being picked up**
- Check queue: `node scripts/ops/orchestration/symphony-queue-control.mjs --check`
- Feed queue: `node scripts/ops/orchestration/symphony-queue-control.mjs --feed`

**Problem: Runner appears stuck**
- Check for expired leases: `node scripts/ops/orchestration/symphony-queue-control.mjs --enforce`
- Restart runner: `systemctl --user restart anqr-symphony-runner@1.service`

**Problem: Worktree shows "prunable" status**
- Repair: `node scripts/ops/orchestration/symphony-worktree-pool.mjs repair`
- If that fails, recreate: `node scripts/ops/orchestration/symphony-worktree-pool.mjs cleanup && node scripts/ops/orchestration/symphony-worktree-pool.mjs init 2`

**Problem: Disk space low**
- Garbage collect: `cd /home/user/src/anqr && git gc --aggressive --prune=now`

## Emergency Rollback

If concurrent execution causes issues, return to single runner:

```bash
# Stop all worktree runners
systemctl --user stop 'anqr-symphony-runner@*.timer'
systemctl --user disable 'anqr-symphony-runner@*.timer'

# Start original single runner
systemctl --user start anqr-symphony-runner.timer

# Optionally clean up worktrees
node scripts/ops/orchestration/symphony-worktree-pool.mjs cleanup
```

**No data loss** — all state preserved in `reports/symphony/state.json`.

## What to Expect

**Single runner (baseline):**
- 2-3 issues/hour
- 40-60% idle time

**With 2 concurrent runners:**
- 4-5 issues/hour (75% increase)
- 20-30% idle time

**With 4 concurrent runners:**
- 6-8 issues/hour (150% increase)
- 10-20% idle time

## Next Steps

After 24 hours of operation:

1. **Review performance:** `journalctl --user -u 'anqr-symphony-runner@*.service' --since '24 hours ago' | grep completed`
2. **Check for issues:** `node scripts/ops/orchestration/symphony-worktree-pool.mjs status`
3. **Adjust scaling:** Add/remove runners based on queue depth and resource usage

## Full Documentation

For complete details, see:
- [12-concurrent-execution-with-worktrees.md](/home/user/src/anqr/docs/harness/12-concurrent-execution-with-worktrees.md) — comprehensive guide
- [ANQ-1099-worktree-investigation.md](/home/user/src/anqr/docs/harness/evidence/ANQ-1099-worktree-investigation.md) — investigation and design
- [scripts/ops/orchestration/README.md](/home/user/src/anqr/scripts/ops/orchestration/README.md) — operational reference
