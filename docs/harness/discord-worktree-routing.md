# Discord to Worktree Routing Architecture

## Overview

Discord requests are routed to isolated worktrees to enable concurrent issue execution without conflicts. Each worktree runs its own Symphony bridge instance with isolated working directory and git state.

## Architecture Layers

```
Discord Bot (OpenClaw Gateway)
       ↓
Discord Request Router (port 18790)
       ↓
Worktree Symphony Bridges (ports 4325-4328)
       ↓
Symphony Provider Cascade
       ↓
Git Worktrees (wt5-wt8)
```

## Components

### 1. Discord Request Router (`discord-request-router.mjs`)

**Purpose**: Load balance Discord requests across available worktrees

**Port**: 18790  
**Environment**:
- `DISCORD_ROUTER_PORT=18790`
- `DISCORD_WORKTREES=5,6,7,8`
- `MAX_CONCURRENT=4`

**Routing Logic**:
- Least-loaded worktree selection
- Concurrent request tracking per worktree
- Overload protection (429 when max concurrent reached)
- Routes to Symphony bridge in target worktree (not OpenClaw gateway)

**Key URLs**:
- Health: `http://127.0.0.1:18790/health`
- Stats: `http://127.0.0.1:18790/stats`
- Endpoint: `POST /v1/chat/completions`

### 2. Worktree Symphony Bridges

**Purpose**: Execute Symphony provider cascade in isolated worktree context

**Port Mapping**:
```
wt5 → http://127.0.0.1:4325/v1
wt6 → http://127.0.0.1:4326/v1
wt7 → http://127.0.0.1:4327/v1
wt8 → http://127.0.0.1:4328/v1
```

**Working Directory**: Each bridge runs in its worktree directory
```
wt5 → /home/user/src/anqr-wt5
wt6 → /home/user/src/anqr-wt6
wt7 → /home/user/src/anqr-wt7
wt8 → /home/user/src/anqr-wt8
```

**Environment per worktree**:
```bash
ANQR_WORKTREE_ID=wt5
ANQR_WORKTREE_PATH=/home/user/src/anqr-wt5
SYMPHONY_BRIDGE_PORT=4325
```

### 3. OpenClaw Gateway (Discord Bot)

**Purpose**: Single gateway instance shared across all worktrees

**Port**: 18789  
**Lock File**: `~/.cache/anqr-openclaw/gateway.lock`

**Singleton Design**:
- Only one gateway process runs across wt5-wt8
- Lock-based coordination prevents duplicate instances
- Automatic failover if owner crashes
- Bonjour/advertiser disabled to prevent hostname churn

**Service**: `anqr-discord-bridge@{5,6,7,8}.service`

## Request Flow

### Incoming Discord Command

1. **User sends Discord message** → OpenClaw Gateway (port 18789)

2. **Gateway forwards to router**:
   ```
   POST http://127.0.0.1:18790/v1/chat/completions
   Headers:
     X-OpenClaw-Session: discord:channel:<CHANNEL_ID>
   Body:
     { model: "symphony/main", messages: [...], stream: true }
   ```

3. **Router selects worktree**:
   - Checks concurrent request count per worktree
   - Selects least-loaded worktree (e.g., wt5 has 0 active, wt6 has 2 → choose wt5)
   - Returns 429 if all worktrees at capacity

4. **Router proxies to worktree Symphony bridge**:
   ```
   POST http://127.0.0.1:4325/v1/chat/completions
   Headers:
     X-OpenClaw-Session: discord:channel:<CHANNEL_ID>
     X-Worktree-ID: wt5
   Body:
     { model: "symphony/main", messages: [...], stream: true }
   ```

5. **Worktree Symphony bridge executes**:
   - Runs in `/home/user/src/anqr-wt5` working directory
   - Uses wt5's git branch (`symphony/wt5`)
   - All file operations scoped to wt5
   - Provider cascade (codebuff → groq → gemini → ...)
   - Streams response back through router to OpenClaw

6. **Response flows back**:
   ```
   Worktree Symphony Bridge (SSE stream)
     → Discord Router (proxy SSE)
       → OpenClaw Gateway
         → Discord Bot
           → Discord Channel
   ```

## Header Propagation

### X-Worktree-ID

**Injected by**: Discord router  
**Consumed by**: Symphony bridge, agent runtime  
**Purpose**: Identify which worktree is executing the request  

**Flow**:
```
Router adds: X-Worktree-ID: wt5
  ↓
Symphony bridge reads header
  ↓
Agent runtime uses for diagnostics/logging
```

### X-OpenClaw-Session

**Origin**: OpenClaw Gateway  
**Propagated through**: Router → Bridge → Agent  
**Purpose**: Session continuity, tool proxying  

**Format**: `discord:channel:<CHANNEL_ID>`

## Worktree Isolation

### Git Isolation
- Each worktree has independent working tree
- Shared object store (efficient)
- Branch: `symphony/wt5`, `symphony/wt6`, etc.
- Base: `origin/main` (refreshed on creation)

### Process Isolation
- Separate Symphony bridge process per worktree
- Independent systemd service per bridge
- Separate port allocation prevents conflicts

### File System Isolation
- Working directory scoped to worktree
- Tool execution (read_file, write_file) scoped to worktree
- Validation commands (typecheck, lint) run in worktree

## Systemd Services

### Router Service
```ini
# anqr-discord-router.service
[Service]
WorkingDirectory=/home/user/src/anqr
ExecStart=node scripts/ops/integrations/model/discord-request-router.mjs
Environment=DISCORD_ROUTER_PORT=18790
Environment=DISCORD_WORKTREES=5,6,7,8
Environment=MAX_CONCURRENT=4
```

**Install**:
```bash
cp services/systemd/anqr-discord-router.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now anqr-discord-router.service
```

### Worktree Bridge Services
```ini
# anqr-symphony-bridge@.service (template)
[Service]
WorkingDirectory=/home/user/src/anqr-wt%i
ExecStart=node scripts/ops/integrations/model/symphony-openai-bridge.mjs
Environment=SYMPHONY_BRIDGE_PORT=432%i
Environment=ANQR_WORKTREE_ID=wt%i
Environment=ANQR_WORKTREE_PATH=/home/user/src/anqr-wt%i
```

**Install**:
```bash
# Copy template service
cp services/systemd/anqr-symphony-bridge@.service ~/.config/systemd/user/
systemctl --user daemon-reload

# Enable and start for each worktree (5-8)
systemctl --user enable --now anqr-symphony-bridge@5.service
systemctl --user enable --now anqr-symphony-bridge@6.service
systemctl --user enable --now anqr-symphony-bridge@7.service
systemctl --user enable --now anqr-symphony-bridge@8.service

# Verify all bridges are running
systemctl --user status anqr-symphony-bridge@{5,6,7,8}.service
```

### Gateway Services (Singleton)
```ini
# anqr-discord-bridge@.service (all instances coordinate via lock)
[Service]
WorkingDirectory=/home/user/src/anqr-wt%i
ExecStart=node scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs
Environment=OPENCLAW_GATEWAY_PORT=18789
Environment=OPENCLAW_LOCK_DIR=/home/user/.cache/anqr-openclaw
```

**Install**:
```bash
systemctl --user enable --now anqr-discord-bridge@5.timer
systemctl --user enable --now anqr-discord-bridge@6.timer
systemctl --user enable --now anqr-discord-bridge@7.timer
systemctl --user enable --now anqr-discord-bridge@8.timer
```

## Monitoring

### Router Health Check
```bash
curl http://127.0.0.1:18790/health
```

**Response**:
```json
{
  "status": "ok",
  "maxConcurrent": 4,
  "activeRequests": 2,
  "availableSlots": 2,
  "worktrees": [
    { "id": 5, "activeRequests": 1, "healthy": true },
    { "id": 6, "activeRequests": 1, "healthy": true },
    { "id": 7, "activeRequests": 0, "healthy": true },
    { "id": 8, "activeRequests": 0, "healthy": true }
  ]
}
```

### Worktree Bridge Health
```bash
curl http://127.0.0.1:4325/health  # wt5
curl http://127.0.0.1:4326/health  # wt6
curl http://127.0.0.1:4327/health  # wt7
curl http://127.0.0.1:4328/health  # wt8
```

### Service Status
```bash
# Router
systemctl --user status anqr-discord-router.service

# Worktree bridges
systemctl --user status anqr-symphony-bridge@{5,6,7,8}.service

# Gateway instances
systemctl --user status anqr-discord-bridge@{5,6,7,8}.service
```

### Logs
```bash
# Router logs
journalctl --user -u anqr-discord-router.service -f

# Worktree bridge logs
journalctl --user -u anqr-symphony-bridge@5.service -f

# Gateway logs
journalctl --user -u anqr-discord-bridge@5.service -f
```

## Deployment Checklist

Before testing Discord worktree isolation:

1. **Create worktrees** (if not already created):
   ```bash
   git worktree add ../anqr-wt5 -b symphony/wt5 origin/main
   git worktree add ../anqr-wt6 -b symphony/wt6 origin/main
   git worktree add ../anqr-wt7 -b symphony/wt7 origin/main
   git worktree add ../anqr-wt8 -b symphony/wt8 origin/main
   ```

2. **Install worktree bridge services**:
   ```bash
   cp services/systemd/anqr-symphony-bridge@.service ~/.config/systemd/user/
   systemctl --user daemon-reload
   systemctl --user enable --now anqr-symphony-bridge@{5,6,7,8}.service
   ```

3. **Install Discord router service**:
   ```bash
   cp services/systemd/anqr-discord-router.service ~/.config/systemd/user/
   systemctl --user daemon-reload
   systemctl --user enable --now anqr-discord-router.service
   ```

4. **Verify all services are running**:
   ```bash
   # Check router
   systemctl --user status anqr-discord-router.service
   curl http://127.0.0.1:18790/health
   
   # Check worktree bridges
   systemctl --user status anqr-symphony-bridge@{5,6,7,8}.service
   curl http://127.0.0.1:4325/health  # wt5
   curl http://127.0.0.1:4326/health  # wt6
   curl http://127.0.0.1:4327/health  # wt7
   curl http://127.0.0.1:4328/health  # wt8
   ```

5. **Configure OpenClaw gateway** to route to Discord router (port 18790) instead of main Symphony bridge

## Troubleshooting

### Issue: Discord commands not routing to worktrees

**Symptoms**:
- Commands execute in main repo instead of worktrees
- File changes conflict across concurrent requests

**Diagnosis**:
1. Check router is running: `systemctl --user status anqr-discord-router.service`
2. Check worktree bridges: `systemctl --user status anqr-symphony-bridge@{5,6,7,8}.service`
3. Verify router routes to correct ports: `curl http://127.0.0.1:18790/health`

**Fix**:
- Ensure router targets Symphony bridges (ports 4325-4328), not gateway (18789)
- Verify `DISCORD_WORKTREES=5,6,7,8` environment variable
- Check router code routes to `432{id}` ports

### Issue: Overload errors (429)

**Symptoms**:
- Discord returns "⚠️ System Overload"
- All concurrent slots full

**Diagnosis**:
```bash
curl http://127.0.0.1:18790/health | jq '.activeRequests, .maxConcurrent'
```

**Fix**:
- Increase `MAX_CONCURRENT` in router service
- Add more worktrees (wt9, wt10, etc.)
- Check if requests are hanging (stuck validations)

### Issue: Gateway conflicts (multiple instances)

**Symptoms**:
- "OpenClaw (4)" hostname in Discord
- Voice announcements fail intermittently

**Diagnosis**:
```bash
# Check lock ownership
cat ~/.cache/anqr-openclaw/gateway.lock

# Check running gateways
ps aux | grep openclaw
```

**Fix**:
- Restart all gateway services to re-compete for lock
- Verify singleton wrapper is being used
- Check `OPENCLAW_DISABLE_BONJOUR=1` is set

### Issue: Wrong working directory

**Symptoms**:
- File changes appear in main repo
- Validation errors reference wrong paths

**Diagnosis**:
```bash
# Check bridge working directory
systemctl --user show anqr-symphony-bridge@5.service | grep WorkingDirectory
```

**Fix**:
- Ensure `WorkingDirectory=/home/user/src/anqr-wt%i` in service
- Verify `ANQR_WORKTREE_PATH` environment variable
- Restart bridge service after fixing

## Configuration Reference

### Discord Router (`discord-request-router.mjs`)

**Environment Variables**:
- `DISCORD_ROUTER_PORT` - Router listen port (default: 18790)
- `DISCORD_WORKTREES` - Comma-separated worktree IDs (default: "5,6,7,8")
- `MAX_CONCURRENT` - Max concurrent requests (default: 4)

**URL Format**: `http://127.0.0.1:432{worktreeId}`

### Worktree Symphony Bridge

**Environment Variables**:
- `SYMPHONY_BRIDGE_PORT` - Bridge listen port (4325-4328)
- `ANQR_WORKTREE_ID` - Worktree identifier (wt5-wt8)
- `ANQR_WORKTREE_PATH` - Absolute worktree path
- `SYMPHONY_BRIDGE_API_KEY` - Auth token (default: "local-symphony")
- `SYMPHONY_MODEL_ID` - Default model (default: "symphony/main")

**Working Directory**: Must match `ANQR_WORKTREE_PATH`

### OpenClaw Gateway

**Environment Variables**:
- `OPENCLAW_GATEWAY_PORT` - Gateway port (18789)
- `OPENCLAW_LOCK_DIR` - Lock directory (default: ~/.cache/anqr-openclaw)
- `OPENCLAW_DISABLE_BONJOUR` - Disable Bonjour (set to "1")
- `DISCORD_BOT_TOKEN` - Discord bot token
- `DISCORD_SERVER_ID` - Discord server ID
- `DISCORD_TEXT_CHANNEL_ID` - Text channel ID
- `DISCORD_VOICE_CHANNEL_ID` - Voice channel ID

**Lock File**: `~/.cache/anqr-openclaw/gateway.lock`

## Future Enhancements

### Dynamic Worktree Scaling
- Auto-create worktrees on demand
- Scale up during high load
- Cleanup idle worktrees

### Issue-to-Worktree Assignment
- Assign specific issues to specific worktrees
- Track issue ownership per worktree
- Prevent issue conflicts

### Health Monitoring
- Automated health checks
- Auto-restart failed bridges
- Capacity alerts

---

**Last Updated**: 2026-03-30  
**Related Files**:
- `scripts/ops/integrations/model/discord-request-router.mjs`
- `scripts/ops/integrations/model/symphony-openai-bridge.mjs`
- `scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs`
- `services/systemd/anqr-discord-router.service`
- `services/systemd/anqr-symphony-bridge@.service`
- `services/systemd/anqr-discord-bridge@.service`
