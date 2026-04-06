# ANQR Integrations

## 1. Directory Overview

This directory contains boundary-specific integrations for the ANQR (Agentic Number Query Runner) harness. It provides connectivity with external services including Linear (issue tracking), model providers (AI backend integration), notifications (Discord), email (ingest), and SonarQube (code quality). Each integration is organized into dedicated subdirectories with a consistent module decomposition pattern.

## 2. File Summaries

### Root Level

- **README.md** - This file. Provides documentation for the integrations directory.

### Subdirectories

**linear/** - Linear issue tracking integration:
- Core client: `linear-client.mjs` - Central API client for Linear operations
- Issue automation: `create-issue-template.mjs`, `issue-hygiene.mjs`, `validate-issue.mjs`
- Review tools: `review-open-issues.mjs`, `review-specified-issues.mjs`
- Incident management: `incident-manager.mjs`, `incident-evidence.mjs`, `incident-resolution.mjs`, `incident-fingerprint.mjs`
- Sync utilities: `github-linear-sync-audit.mjs`, `export-issues.mjs`
- Test workflow: `test-agent-workflow.mjs`
- Additional tools: `reopen-marked-issues.mjs`, `delete-sonar-issues.mjs`, `analyze-canceled-issues.mjs`, `get-discord-label-id.mjs`

**model/** - Model provider integration:
- Bridge: `symphony-openai-bridge.mjs` - Main OpenAI-compatible bridge for routing requests to AI providers
- Credit gate: `symphony-credit-gate.mjs` - Provider selection and ranking logic
- Router: `symphony-agent-router.mjs` - Agent routing decisions
- Adaptive context: `symphony-adaptive-context.mjs` - Context management
- Session state: `symphony-session-state.mjs` - Session persistence
- Provider health: `symphony-provider-health.mjs` - Health monitoring
- Direct integrations: `codebuff-direct.mjs`, `discord-request-router.mjs`, `linear-webhook-receiver.mjs`
- Utilities: `ollama-local-audit.mjs`, `set-max-listeners.mjs`

**notifications/** - Notification integrations:
- Discord: `openclaw-discord.mjs` - Discord webhook notifications
- Test: `test-discord.mjs` - Discord notification testing

**email/** - Email integration:
- Email ingest: `email-ingest.mjs` - Email ingestion and processing

**sonar/** - SonarQube integration:
- Sync: `sonar-linear-sync.mjs` - Synchronize SonarQube issues to Linear
- Audit: `sonar-linear-audit.mjs` - Audit and manage consolidated Linear issues

## 3. Overall Directory Function

This directory serves as the integration layer for the ANQR harness, providing connectivity with external systems:

- **Linear Integration**: Provides comprehensive issue tracking automation including issue creation, review workflows, hygiene enforcement, incident management, and GitHub sync capabilities.

- **Model Integration**: Manages AI provider routing through the Symphony OpenAI bridge, provider selection via credit gate, session state management, and adaptive context handling.

- **Notification Integration**: Enables Discord notifications for system events and alerts.

- **Email Integration**: Provides email ingestion capabilities for processing incoming emails.

- **SonarQube Integration**: Synchronizes code quality issues from SonarQube to Linear for tracking and resolution.

Each subdirectory follows a decomposition pattern where facade files (ending in `.mjs`) re-export from matching directories containing `index.mjs` and `runtime.mjs` modules.

## 4. Usage Instructions

This directory is primarily used through imports from other harness modules. Each integration can be accessed via its facade file:

```javascript
import { createIssue, updateIssue, listIssuesByState } from "./ops/integrations/linear/linear-client.mjs";
import { invokeWithAI } from "./ops/integrations/model/symphony-openai-bridge.mjs";
import { sendDiscordMessage } from "./ops/integrations/notifications/openclaw-discord.mjs";
import { ingestEmail } from "./ops/integrations/email/email-ingest.mjs";
import { syncSonarToLinear } from "./ops/integrations/sonar/sonar-linear-sync.mjs";
```

Each subdirectory can also be executed directly where applicable:

```bash
# Linear operations
node ops/integrations/linear/review-open-issues.mjs

# Model bridge
node ops/integrations/model/symphony-openai-bridge.mjs

# Notifications
node ops/integrations/notifications/openclaw-discord.mjs
```

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - Used by linear integration modules
- **../../core/symphony-config.mjs** - Configuration for integrations
- **../../lib/logger.mjs** - Shared logging utility
- **../../lib/notify.mjs** - Notification utilities

### External Services

- **Linear** - Issue tracking API (linear integration)
- **Discord** - Webhook notifications (notifications)
- **Email systems** - Via notmuch or other mail tools (email)
- **SonarQube** - Code quality platform (sonar)
- **AI Providers** - OpenAI-compatible APIs (model)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid API credentials for respective services (Linear API key, Discord webhook, SonarQube token, etc.)

## 6. Additional Comments

- **Facade Pattern**: Each subdirectory uses a decomposition pattern where facade files re-export from sibling modules. This maintains backwards compatibility while allowing for cleaner code organization.

- **Module Structure**: Subdirectories typically contain `index.mjs` (main exports), `runtime.mjs` (execution entry point), and supporting modules. Each subdirectory also has its own README.md for specific documentation.

- **Error Handling**: Each integration implements service-specific error handling and retry logic appropriate to the external service's API.

- **Configuration**: Integration-specific configuration is typically managed through environment variables or imported from core configuration modules.

- **Testing**: Some integrations include test suites (e.g., `symphony-openai-bridge-fallback.spec.ts`, `symphony-session-state.spec.ts`) in the model subdirectory.