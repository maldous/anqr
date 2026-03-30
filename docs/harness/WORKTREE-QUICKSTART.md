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

**Problem: All worktrees corrupted (disk full, etc.)**

If all worktrees are corrupted simultaneously:

```bash
# Step 1: Stop all runners
systemctl --user stop 'anqr-symphony-runner@*.timer'

# Step 2: Remove all worktrees
node scripts/ops/orchestration/symphony-worktree-pool.mjs cleanup

# Step 3: Recreate fresh pool
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 2

# Step 4: Restart runners
systemctl --user start 'anqr-symphony-runner@*.timer'
```

**No data loss** — all state preserved in `reports/symphony/state.json`.

## Emergency Rollback

If concurrent execution causes issues, reduce to a minimal worktree footprint:

```bash
# Stop all worktree runners
systemctl --user stop 'anqr-symphony-runner@*.timer'
systemctl --user disable 'anqr-symphony-runner@*.timer'

# Re-enable a single worktree runner only
systemctl --user enable --now anqr-symphony-runner@1.timer

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

## Important: Work Visibility Between Worktrees

**How worktrees see each other's work:**

- Each worktree syncs with `origin/main` **twice** during execution:
  1. **Initial sync** before starting work (via `git fetch origin main && git merge origin/main --ff-only`)
  2. **Pre-validation sync** before validation (save patch -> fast-forward to `origin/main` -> replay patch with `git apply --index --3way`)
- Completed work is pushed to `origin/main` immediately after commit (with automatic retry + rebase)
- **This means:** Work from other worktrees becomes visible when syncing with origin
- **Pre-validation replay catches conflicts early** before wasting time on validation

**Example flow:**

```
Worktree 1: Initial sync → Works on ANQ-100 → Pre-validation sync → Validates → Commits → Pushes to origin/main
Worktree 2: Initial sync (gets ANQ-100) → Works on ANQ-101 → Pre-validation sync → Validates → Commits → Pushes
Worktree 3: Initial sync (gets ANQ-100 + ANQ-101) → Works on ANQ-102 → Pre-validation sync → Validates → Commits → Pushes
```

**Conflict handling:**

- If pre-validation sync detects conflicts, the worktree aborts and returns the issue to Todo
- This prevents wasted validation cycles on code that will conflict anyway
- The issue can be retried later with the latest changes already merged

**Push retry mechanism:**

- If multiple worktrees push simultaneously, rejected pushes automatically rebase and retry
- Up to 3 retry attempts with automatic conflict resolution
- This ensures all completed work reaches `origin/main` reliably

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
