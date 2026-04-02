# OpenClaw Configuration (Redacted)

Local copy of `~/.openclaw` configuration for the ANQR harness OpenClaw gateway.

Secrets are replaced with `{{PLACEHOLDER}}` values — see `.env.example` for the full list.

## File inventory

| File | Purpose |
|------|---------|
| `openclaw.json` | Main config: Discord, voice, whisper STT, plugins, agents, gateway |
| `models.json` | Provider + model definitions (Symphony bridge, Ollama, OpenRouter) |
| `config.json` | TTS and gateway HTTP endpoint config |
| `clawdbot.json` | Bot settings: workspace, concurrency, gateway auth |
| `exec-approvals.json` | Exec approval socket config |
| `credentials/` | Discord pairing and allowFrom |
| `identity/` | Device keypair and auth tokens |
| `settings/tts.json` | TTS auto-mode setting |
| `agents/main/agent/` | Main agent model routing + auth profiles |
| `agents/voice/agent/` | Voice agent model routing |
| `workspace/` | Main agent workspace files (AGENTS.md, SOUL.md, etc.) |
| `workspace-voice/` | Voice agent workspace files |

## Restore to `~/.openclaw`

```bash
# 1. Copy structure
cp -r scripts/ops/runtime/openclaw-config/* ~/.openclaw/

# 2. Replace placeholders with real values
# Edit ~/.openclaw/openclaw.json and replace {{...}} placeholders
# Edit ~/.openclaw/clawdbot.json and replace {{...}} placeholders
# Edit ~/.openclaw/identity/*.json and replace {{...}} placeholders
# Edit ~/.openclaw/agents/main/agent/auth-profiles.json and replace {{...}} placeholders

# 3. Install the lossless-claw extension (684MB, not included)
openclaw plugin install @martian-engineering/lossless-claw

# 4. Restart gateway
systemctl --user restart openclaw-gateway.service
```

## What's NOT included

- `extensions/` — npm-installed plugins (reinstall via `openclaw plugin install`)
- `agents/*/sessions/` — ephemeral session history
- `browser/` — browser automation data
- `memory/` — agent memory files
- `tasks/` — task queue data
- `lcm.db*` — SQLite database (lossless-claw)
- `logs/` — log files
- `*.bak*`, `*.backup*` — backup files
- `delivery-queue/`, `canvas/`, `completions/`, `cron/`, `voice-calls/`, `subagents/`, `devices/` — runtime state

## Key config changes (from Discord voice setup)

- `channels.discord.voice.daveEncryption` → `true`
- `channels.discord.voice.decryptionFailureTolerance` → `24`
- `messages.tts.auto` → `off` (prevents TTS leaking to text channel)
- `tools.media.models` → whisper CLI with `--device cpu`, `{{MediaPath}}`, `{{OutputDir}}`
- `audio.transcription.command` → whisper with `--device cpu`
- `plugins.allow` → includes `openai` for `mediaUnderstandingProvider`
- `channels.discord.allowFrom` → user authorized for voice commands
