# ANQR Secret Loading

All secrets are loaded via `EnvironmentFile=` directives in systemd unit files.
No committed service file may contain live secret values.

## Required Secret Files

### `~/.config/systemd/user/anqr-ops.env`

Primary secret store for systemd user services. Contains all API keys,
tokens, and credentials needed by the harness runtime.

Required variables for core operation:

| Variable                  | Used By                                | Required |
| ------------------------- | -------------------------------------- | -------- |
| `LINEAR_API_KEY`          | linear-webhook, linear-export, nightly | Yes      |
| `LINEAR_WEBHOOK_SECRET`   | linear-webhook signature verification  | Yes      |
| `DISCORD_BOT_TOKEN`       | discord-router                         | Yes      |
| `OPENROUTER_API_KEY`      | openclaw-gateway, provider routing     | Yes      |
| `ELEVENLABS_API_KEY`      | openclaw-gateway voice                 | Yes      |
| `OPENAI_API_KEY`          | provider routing fallback              | Yes      |
| `CODEBUFF_API_KEY`        | codebuff-direct SDK                    | Yes      |
| `SENTRY_AUTH_TOKEN`       | error reporting                        | No       |
| `OLLAMA_API_KEY`          | local model access                     | No       |
| `SYMPHONY_BRIDGE_API_KEY` | executor bridge auth                   | Yes      |

### `~/.config/symphony/anqr.env`

Secondary/override env file for Symphony-specific configuration.
Loaded with `-` prefix (optional — service starts without it).

## Failure Behavior

Services that use `EnvironmentFile=` (without `-` prefix) will fail to start
if the file is missing. This is intentional — services must not run without
required secrets.

Services that use `EnvironmentFile=-` (with `-` prefix) will start even if
the file is missing. Use this only for optional override files.

## Validation

```bash
# Check that no committed service files contain live secrets
grep -rn 'sk-or-v1\|sk_[a-f0-9]\{20,\}' services/systemd/

# Verify env files exist on host
ls -la ~/.config/systemd/user/anqr-ops.env
ls -la ~/.config/symphony/anqr.env
```
