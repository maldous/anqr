# ADR-0010 External Symlinks And Secrets Inventory

- Status: Accepted
- Date: 2026-04-14

## Context

ADR-0009 established that the repository must be the authoritative source for host-local configuration, with drift detectable as an engineering failure.

Three external configuration surfaces exist:

- `~/.config/systemd/user/` — systemd service and timer units, plus an environment file containing secrets
- `~/.config/symphony/` — Symphony executor and router environment file
- `~/.openclaw/` — OpenClaw Gateway configuration, credentials, identity, and runtime state

Previously, these were maintained by manual copy from the repository, creating drift risk. The repository now symlinks all non-sensitive configuration into the external locations, making the project the single source of truth for structure and behavior.

Sensitive files (tokens, keys, private keys, pairing credentials) and runtime state (databases, logs, queues) remain as regular files outside the repository and are never committed.

## Decision

### Symlink strategy

All repository-managed configuration is symlinked from the external location into the project tree. The project is authoritative for structure; the host is authoritative for secrets and runtime state.

**Systemd** (`~/.config/systemd/user/` → `services/systemd/`):

All `.service` and `.timer` files are symlinked. After any change, run `systemctl --user daemon-reload`.

**Symphony** (`~/.config/symphony/anqr.env` → `~/.config/systemd/user/anqr-ops.env`):

The symphony env file is symlinked to the live systemd env file (the host copy with populated secrets). This ensures both `EnvironmentFile=` directives in systemd services resolve to the same populated values. The project template (`services/systemd/anqr-ops.env`) serves as the committed key inventory with empty values; the live host file at `~/.config/systemd/user/anqr-ops.env` contains real secrets.

**OpenClaw** (`~/.openclaw/` → `harness/ops/runtime/openclaw-config/`):

| External path | Project source | Symlinked |
|---|---|---|
| `~/.openclaw/config.json` | `harness/ops/runtime/openclaw-config/config.json` | ✅ Yes |
| `~/.openclaw/models.json` | `harness/ops/runtime/openclaw-config/models.json` | ✅ Yes |
| `~/.openclaw/update-check.json` | `harness/ops/runtime/openclaw-config/update-check.json` | ✅ Yes |
| `~/.openclaw/agents/` | `harness/ops/runtime/openclaw-config/agents/` | ✅ Yes |
| `~/.openclaw/canvas/` | `harness/ops/runtime/openclaw-config/canvas/` | ✅ Yes |
| `~/.openclaw/cron/` | `harness/ops/runtime/openclaw-config/cron/` | ✅ Yes |
| `~/.openclaw/settings/` | `harness/ops/runtime/openclaw-config/settings/` | ✅ Yes |
| `~/.openclaw/skills/` | `harness/ops/runtime/openclaw-config/skills/` | ✅ Yes |
| `~/.openclaw/subagents/` | `harness/ops/runtime/openclaw-config/subagents/` | ✅ Yes |
| `~/.openclaw/workspace/` | `harness/ops/runtime/openclaw-config/workspace/` | ✅ Yes |
| `~/.openclaw/workspace-voice/` | `harness/ops/runtime/openclaw-config/workspace-voice/` | ✅ Yes |

### Sensitive files — NOT symlinked

The following files contain secrets and must remain as regular files on the host. They are never committed to the repository. Each file's sensitive keys are listed so that operators know exactly what to update during rotation.

#### `~/.config/systemd/user/anqr-ops.env` (and `~/.config/symphony/anqr.env`)

The live host file at `~/.config/systemd/user/anqr-ops.env` is a regular file populated with real secret values. It is **not** symlinked — it is the authoritative live copy. The symphony path `~/.config/symphony/anqr.env` is symlinked to this live file so both `EnvironmentFile=` directives resolve identically.

The repository template `services/systemd/anqr-ops.env` is the committed key inventory (empty values). Operators populate the live host file using this template as a reference. Sensitive keys:

| Key | Purpose |
|---|---|
| `CEREBRAS_TOKEN` | Cerebras AI provider API token |
| `FIREWORKS_KEY` | Fireworks AI provider API key |
| `GEMINI_TOKEN` | Google Gemini AI provider token |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key (alternate) |
| `GROQ_TOKEN` | Groq AI provider token |
| `HUGGING_FACE_READ_TOKEN` | Hugging Face read-only access token |
| `HUGGING_TOKEN` | Hugging Face general access token |
| `MISTRAL_TOKEN` | Mistral AI provider token |
| `OLLAMA_API_KEY` | Ollama API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `OPENROUTER_TOKEN` | OpenRouter token (alternate) |
| `SAMBANOVA_TOKEN` | SambaNova AI provider token |
| `TOGETHER_KEY` | Together AI provider key |
| `CODEBUFF_API_KEY` | Codebuff API key for Symphony executors |
| `CONTEXT7_API_KEY` | Context7 MCP API key |
| `OPENCLAW_GATEWAY_TOKEN` | Authenticates harness services with OpenClaw Gateway |
| `LINEAR_API_KEY` | Linear API key for issue management |
| `LINEAR_WEBHOOK_SECRET` | HMAC secret for Linear webhook signature verification |
| `DISCORD_BOT_TOKEN` | Discord bot authentication token |
| `GITHUB_MODELS_TOKEN` | GitHub Models API token |
| `GITHUB_TOKEN` | GitHub personal access token |
| `BREVO_SMTP_KEY` | Brevo SMTP relay API key |
| `MSMTP_KEY` | msmtp mail transport key |
| `CLOUDFLARE_TOKEN` | Cloudflare API token |
| `CLOUDFLARE_TOKEN_READALL` | Cloudflare read-all API token |
| `CLOUDFLARE_TOKEN_ZARAZ` | Cloudflare Zaraz API token |
| `NETLIFY_API_TOKEN` | Netlify deployment API token |
| `SENTRY_AUTH_TOKEN` | Sentry error-tracking auth token |
| `LINKUP_API_KEY` | Linkup API key |
| `SNYK_TOKEN` | Snyk security scanning token |
| `SONAR_TOKEN` | SonarQube analysis token |
| `SONARQUBE_TOKEN` | SonarQube API token (alternate) |
| `ELEVENLABS_API_KEY` | ElevenLabs text-to-speech API key |
| `GOOGLE_PLACES_API_KEY` | Google Places API key |

The env file also contains non-secret configuration keys that do not require rotation:

| Key | Purpose |
|---|---|
| `HOME` | User home directory for systemd services |
| `JAVA_HOME` | JDK path for Android/Gradle builds |
| `PATH` | Executable search path for systemd services |
| `PNPM_HOME` | pnpm package manager home |
| `LOG_LEVEL` | Logging verbosity |
| `OLLAMA_API_BASE` | Ollama inference endpoint URL |
| `SONAR_HOST_URL` | SonarQube server URL |
| `DISCORD_TEXT_CHANNEL_ID` | Discord text channel identifier |
| `MYMEMORY_EMAIL` | MyMemory translation API contact email |
| `APPLE_APP_STORE_CONNECT_ISSUER_ID` | Apple App Store Connect issuer identifier |
| `APPLE_APP_STORE_CONNECT_KEY_ID` | Apple App Store Connect key identifier |
| `ARGOS_DEVICE_TYPE` | Argos device type for mobile builds |
| `CAPACITOR_ANDROID_STUDIO_PATH` | Path to Android Studio |

#### `~/.openclaw/.env`

OpenClaw Gateway environment file. Sensitive keys:

| Key | Purpose |
|---|---|
| `AIS_API_KEY` | AIS API key used by OpenClaw Gateway |
| `OPENROUTER_API_KEY` | OpenRouter API key (OpenClaw copy) |

#### `~/.openclaw/openclaw.json`

Primary OpenClaw Gateway configuration. Sensitive key paths:

| JSON path | Purpose |
|---|---|
| `env.OPENROUTER_API_KEY` | OpenRouter API key for model routing |
| `env.ELEVENLABS_API_KEY` | ElevenLabs API key for voice |
| `hooks.token` | Webhook authentication token |
| `channels.discord.token` | Discord bot token (OpenClaw copy) |
| `gateway.auth.token` | Gateway authentication token (`OPENCLAW_GATEWAY_TOKEN` equivalent) |

#### `~/.openclaw/clawdbot.json`

ClawdBot personality and gateway config. Sensitive key paths:

| JSON path | Purpose |
|---|---|
| `talk.apiKey` | Text-to-speech API key |
| `gateway.auth.token` | Gateway authentication token |

#### `~/.openclaw/exec-approvals.json`

Execution approval socket security. Sensitive key paths:

| JSON path | Purpose |
|---|---|
| `socket.token` | Unix socket authentication token |

#### `~/.openclaw/identity/device.json`

Device identity keypair. Sensitive key paths:

| JSON path | Purpose |
|---|---|
| `publicKeyPem` | Device public key (PEM-encoded) |
| `privateKeyPem` | Device private key (PEM-encoded) — most sensitive |

#### `~/.openclaw/identity/device-auth.json`

Device authentication tokens. Sensitive key paths:

| JSON path | Purpose |
|---|---|
| `tokens.operator.token` | Operator-role authentication token |

#### `~/.openclaw/credentials/`

Discord pairing credentials directory. Contains `discord-pairing.json` (pairing state) and `discord-default-allowFrom.json` (authorized Discord user IDs).

#### `~/.openclaw/devices/`

Paired device registry. Contains `paired.json` with per-device entries that include:

| JSON path (per device) | Purpose |
|---|---|
| `publicKey` | Device public key |
| `tokens.operator.token` | Per-device operator token |

### Runtime state directories — NOT symlinked, NOT sensitive

These directories contain runtime-generated state and are not managed by the repository:

| Directory | Contents |
|---|---|
| `~/.openclaw/browser/` | Browser automation state |
| `~/.openclaw/completions/` | Completion cache |
| `~/.openclaw/delivery-queue/` | Message delivery queue |
| `~/.openclaw/extensions/` | Runtime extensions |
| `~/.openclaw/logs/` | Application logs |
| `~/.openclaw/memory/` | Memory store (includes `main.sqlite`) |
| `~/.openclaw/tasks/` | Task execution state (includes `runs.sqlite`) |
| `~/.openclaw/voice-calls/` | Voice call session state |
| `~/.openclaw/lcm.db` | SQLite lifecycle database |
| `~/.openclaw/lcm.db-shm` | SQLite shared memory |
| `~/.openclaw/lcm.db-wal` | SQLite write-ahead log |

### Systemd runtime directories — NOT symlinked

| Directory | Contents |
|---|---|
| `~/.config/systemd/user/default.target.wants/` | Systemd auto-enable targets |
| `~/.config/systemd/user/timers.target.wants/` | Systemd timer enable targets |
| `~/.config/systemd/user/*.service.d/` | Systemd drop-in override directories |

## Consequences

- The repository is the single authoritative source for all non-sensitive configuration
- Configuration drift between the repository and host is eliminated for symlinked files
- Sensitive files are explicitly inventoried with key names so operators know what to rotate
- After any repository change to a service or config file, the change is live immediately (symlink)
- After systemd file changes, `systemctl --user daemon-reload` is still required
- Runtime state directories are host-only and never committed
- `chmod 600` must be maintained on all files containing secrets
