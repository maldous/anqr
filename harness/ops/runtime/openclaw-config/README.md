# ANQR OpenClaw Configuration

## 1. Directory Overview

This directory contains the local copy of the OpenClaw gateway configuration for the ANQR (Agentic Number Query Runner) harness. OpenClaw is an agentic runtime that provides Discord voice integration, tool execution, and multi-model AI connectivity. The configuration has been sanitized with secrets replaced by placeholder values for version control safety.

## 2. File Summaries

### Configuration Files

- **openclaw.json** - Main OpenClaw configuration file containing:
  - Meta information (version, last touched timestamp)
  - Environment variables (API keys for OpenRouter, ElevenLabs)
  - Authentication profiles (Ollama provider)
  - Model providers (OpenRouter, Ollama, Symphony Bridge) with model definitions
  - Agent configurations (main and voice agents with model routing)
  - Tools configuration (coding profile, web search via Brave)
  - Discord channel settings (enabled, voice, guild permissions)
  - Gateway configuration (port 18789, local mode, token auth)
  - Plugin system (lossless-claw, discord, talk-voice, voice-call, elevenlabs, browser, microsoft, openai)
  - Skill entries (gh-issues, goplaces, notion, openai-image-gen, openai-whisper-api, sag, self-improving-agent, free-ride)

- **models.json** - Provider and model definitions:
  - Symphony Bridge provider (baseUrl: http://127.0.0.1:18790/v1) with 15+ model variants
  - Ollama provider (localhost:11434) with Qwen2.5 and Qwen3 models
  - Primary agent model configuration with extensive fallback chain

- **config.json** - TTS and gateway HTTP configuration:
  - TTS settings (disabled, ElevenLabs provider)
  - Gateway HTTP endpoints (responses enabled)

- **clawdbot.json** - Bot runtime settings:
  - Workspace path (/home/user/clawd)
  - Concurrency limits (maxConcurrent: 4, subagents: 8)
  - Gateway mode (local, port 18789, bind: lan)
  - Authentication (token mode)
  - Wizard metadata (last run configuration)

- **exec-approvals.json** - Exec approval socket configuration:
  - Socket path (/home/user/.openclaw/exec-approvals.sock)
  - Socket token placeholder

- **.env.example** - Environment variable template:
  - Discord bot token
  - OpenRouter API key
  - ElevenLabs API key
  - Gateway auth token
  - Device ID and keys
  - Operator token
  - Exec approvals socket credentials
  - Codex OAuth tokens

### Subdirectories

- **credentials/** - Discord pairing and allowFrom configurations
- **identity/** - Device keypair and authentication tokens
- **settings/** - Runtime settings (tts.json for TTS auto-mode)
- **agents/main/agent/** - Main agent model routing and auth profiles
- **agents/voice/agent/** - Voice agent model routing configuration
- **workspace/** - Main agent workspace files (AGENTS.md, SOUL.md, etc.)
- **workspace-voice/** - Voice agent workspace files

## 3. Overall Directory Function

This directory serves as the configuration source for the ANQR harness's OpenClaw gateway runtime. The configuration enables:

- **Discord Integration**: Voice and text channel communication with guild-specific permissions
- **Multi-Provider Model Routing**: Fallback chain from Symphony Bridge through multiple providers (Groq, Mistral, Gemini, OpenRouter, etc.) to local Ollama
- **Voice Capabilities**: TTS (ElevenLabs, Microsoft), Whisper STT, voice encryption
- **Tool System**: Browser automation, file operations, web search, subagent spawning
- **Plugin Architecture**: Lossless-claw context management, Discord, voice-call, ElevenLabs integrations
- **Gateway Server**: Local HTTP server on port 18789 with token authentication

The configuration is designed for the ANQR workflow where Symphony acts as the orchestrator and OpenClaw provides the execution environment for agent tasks.

## 4. Usage Instructions

### Restore to ~/.openclaw

To use this configuration in a live OpenClaw deployment:

```bash
# 1. Copy structure
cp -r harness/ops/runtime/openclaw-config/* ~/.openclaw/

# 2. Replace placeholders with real values
# Edit ~/.openclaw/openclaw.json and replace CHANGEME placeholders
# Edit ~/.openclaw/clawdbot.json and replace CHANGEME placeholders
# Edit ~/.openclaw/identity/*.json and replace CHANGEME placeholders
# Edit ~/.openclaw/agents/main/agent/auth-profiles.json and replace CHANGEME placeholders

# 3. Install the lossless-claw extension (684MB, not included)
openclaw plugin install @martian-engineering/lossless-claw

# 4. Restart gateway
systemctl --user restart openclaw-gateway.service
```

### Model Selection

The default agent uses Symphony Bridge with automatic provider selection:
- Primary: symphony-bridge/symphony/main
- Fallbacks: 15+ providers including codex, codebuff, groq, mistral, gemini, openrouter, ollama-local

### Gateway Access

The gateway runs locally on `http://127.0.0.1:18789` with token authentication.

## 5. Dependencies

### External Services

- **Discord Bot** - Requires valid bot token with voice and message permissions
- **OpenRouter API** - For free tier models (Llama 3.3, Qwen3-Next)
- **ElevenLabs API** - For TTS voice generation
- **Microsoft Azure** - For TTS and voice chat
- **Brave Search** - For web search tool

### Internal Dependencies

- **Symphony Bridge** - Must be running at http://127.0.0.1:18790/v1
- **Ollama** - Must be running at localhost:11434
- **Lossless-claw Plugin** - Version 0.5.3 (npm package)

### Runtime Requirements

- Node.js for OpenClaw gateway
- Whisper CLI for audio transcription
- Linux with systemd for service management

## 6. Additional Comments

### What's NOT Included

- `extensions/` - npm-installed plugins (reinstall via `openclaw plugin install`)
- `agents/*/sessions/` - ephemeral session history
- `browser/` - browser automation data
- `memory/` - agent memory files
- `tasks/` - task queue data
- `lcm.db*` - SQLite database (lossless-claw)
- `logs/` - log files
- `*.bak*`, `*.backup*` - backup files
- `delivery-queue/`, `canvas/`, `completions/`, `cron/`, `voice-calls/`, `subagents/`, `devices/` - runtime state

### Key Config Differences (from Default Discord Voice Setup)

- `channels.discord.voice.daveEncryption` set to `true` for voice encryption
- `channels.discord.voice.decryptionFailureTolerance` set to `24` hours
- `messages.tts.auto` set to `off` to prevent TTS leaking to text channels
- `tools.media.models` configured with Whisper CLI using `--device cpu`
- `audio.transcription.command` uses Whisper with `--device cpu`
- `plugins.allow` includes `openai` for media understanding provider
- `channels.discord.allowFrom` contains authorized user for voice commands

### Security Note

All API keys and tokens are replaced with `CHANGEME` placeholders. Never commit actual secrets to version control. Use `.env.example` as a template for required credentials.