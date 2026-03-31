# Worktree Symphony Bridge Deployment

## Issue: Discord Commands Executing in Main Repo

**Symptom**: Discord commands execute in `/home/user/src/anqr` (main repo) instead of isolated worktrees (`/home/user/src/anqr-wt5`, etc.)

**Root Cause**: The `anqr-symphony-bridge@.service` template was missing, so no Symphony bridges were running on worktree ports (4325-4328). The Discord router tried to route requests to these ports, but with no listeners, requests fell back to the main bridge (port 4319) running in the main repo.

**Evidence**: 
- File `worktree-name.txt` created in `/home/user/src/anqr` with content "anqr"
- Expected behavior: Two files created in two different worktrees with different names

## Solution

The templated service file `anqr-symphony-bridge@.service` has been created to enable proper worktree isolation.

### Quick Deploy

```bash
# Copy template service
cp services/systemd/anqr-symphony-bridge@.service ~/.config/systemd/user/

# Reload systemd
systemctl --user daemon-reload

# Enable and start all worktree bridges
systemctl --user enable --now anqr-symphony-bridge@{5,6,7,8}.service

# Verify they're running
systemctl --user status anqr-symphony-bridge@{5,6,7,8}.service
```

### Verify Deployment

```bash
# Check each bridge is listening on correct port
curl http://127.0.0.1:4325/health  # wt5
curl http://127.0.0.1:4326/health  # wt6
curl http://127.0.0.1:4327/health  # wt7
curl http://127.0.0.1:4328/health  # wt8

# Check logs for each worktree bridge
journalctl --user -u anqr-symphony-bridge-wt5 -f
journalctl --user -u anqr-symphony-bridge-wt6 -f
journalctl --user -u anqr-symphony-bridge-wt7 -f
journalctl --user -u anqr-symphony-bridge-wt8 -f
```

### Port Mapping

| Worktree | Directory | Port | Service |
|----------|-----------|------|---------|
| wt5 | `/home/user/src/anqr-wt5` | 4325 | `anqr-symphony-bridge@5.service` |
| wt6 | `/home/user/src/anqr-wt6` | 4326 | `anqr-symphony-bridge@6.service` |
| wt7 | `/home/user/src/anqr-wt7` | 4327 | `anqr-symphony-bridge@7.service` |
| wt8 | `/home/user/src/anqr-wt8` | 4328 | `anqr-symphony-bridge@8.service` |

### Environment Variables Per Instance

Each worktree bridge instance sets:
- `ANQR_WORKTREE_ID=wt5` (or wt6, wt7, wt8)
- `ANQR_WORKTREE_PATH=/home/user/src/anqr-wt5` (or wt6, wt7, wt8)
- `SYMPHONY_BRIDGE_PORT=4325` (or 4326, 4327, 4328)
- `WorkingDirectory=/home/user/src/anqr-wt5` (or wt6, wt7, wt8)

The `WorkingDirectory` is **critical** - it ensures all file operations happen in the worktree, not the main repo.

### Test Isolation

After deploying, test with Discord commands:

1. Send two concurrent Discord commands
2. Each should execute in a different worktree
3. File operations should create files in worktree directories, not main repo
4. Check router stats: `curl http://127.0.0.1:18790/stats`

### Architecture Flow

```
Discord Bot (OpenClaw Gateway, port 18789)
       ↓
Discord Request Router (port 18790)
       ↓ (routes to least-loaded worktree)
Worktree Symphony Bridge (ports 4325-4328)
       ↓ (executes in worktree directory)
Git Worktree (wt5-wt8, isolated working trees)
```

## Related Files

- `services/systemd/anqr-symphony-bridge@.service` - Template service (THIS FILE WAS MISSING)
- `services/systemd/anqr-discord-router.service` - Discord router service
- `scripts/ops/integrations/model/discord-request-router.mjs` - Router implementation
- `scripts/ops/integrations/model/symphony-openai-bridge.mjs` - Bridge implementation
- `docs/harness/discord-worktree-routing.md` - Full architecture documentation

## Troubleshooting

**Q: Service won't start**
```bash
# Check logs
journalctl --user -u anqr-symphony-bridge@5.service --no-pager

# Common issue: Worktree doesn't exist
git worktree list
# If missing: git worktree add ../anqr-wt5 -b symphony/wt5 origin/main
```

**Q: Port already in use**
```bash
# Check what's listening
ss -tln | grep 4325

# Kill conflicting process if needed
# Then restart: systemctl --user restart anqr-symphony-bridge@5.service
```

**Q: Commands still executing in main repo**
```bash
# Verify bridges are actually running in worktree directories
systemctl --user show anqr-symphony-bridge@5.service | grep WorkingDirectory
# Should show: WorkingDirectory=/home/user/src/anqr-wt5

# Check router is routing to correct ports
curl http://127.0.0.1:18790/health | jq
```

---

**Created**: 2026-03-30  
**Issue**: Worktree isolation not working (file created in main repo)  
**Fix**: Created missing `anqr-symphony-bridge@.service` template
