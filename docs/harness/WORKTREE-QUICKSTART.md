# Worktree Quick Start Guide

**Goal:** keep a single public Symphony agent while executing all mutations inside isolated git worktrees.

## Quick start

```bash
cd /home/user/src/anqr
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 8

cp services/systemd/anqr-symphony-bridge.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-bridge@.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner@.service ~/.config/systemd/user/
cp services/systemd/anqr-symphony-runner@.timer ~/.config/systemd/user/
cp services/systemd/anqr-discord-router.service ~/.config/systemd/user/
cp services/systemd/anqr-discord-bridge@.service ~/.config/systemd/user/
cp services/systemd/anqr-discord-bridge@.timer ~/.config/systemd/user/
systemctl --user daemon-reload

systemctl --user enable --now anqr-symphony-bridge.service
systemctl --user enable --now anqr-symphony-bridge@{1,2,3,4,5,6,7,8}.service
systemctl --user enable --now anqr-symphony-runner@{1,2,3,4}.timer
systemctl --user enable --now anqr-discord-router.service
systemctl --user enable --now anqr-discord-bridge@{5,6,7,8}.timer
```

## Flow

```text
OpenClaw -> 4319 router -> selected 432x worktree bridge -> AI execution in that worktree
Linear Todo -> worktree runner -> local 4321-4324 bridge
Discord -> OpenClaw gateway -> Discord router -> 4325-4328 bridge
```

## Notes

- there is no standalone Codebuff bridge in the active design
- Codebuff now runs directly inside each worktree-local Symphony bridge
- the root repository is control-plane only; mutation belongs in worktrees
