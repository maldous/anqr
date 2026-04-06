# ANQR Symphony Bridge Truncation

## 1. Directory Overview

This directory implements **ANQR Symphony Bridge Truncation** within the ANQR harness. Key immediate entries include `index.mjs`, `static-provider-max-input-tokens.mjs`, `build-provider-max-input-tokens.mjs`, `truncate-messages-for-provider.mjs`. The current inventory is 19 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-dynamic-openrouter-limits.mjs** - Exports `buildDynamicOpenrouterLimits`, which builds dynamic openrouter limits.
- **build-provider-max-input-tokens.mjs** - Exports `buildProviderMaxInputTokens`, which builds provider max input tokens.
- **chars-per-token.mjs** - Exports `CHARS_PER_TOKEN`, a shared constant used by sibling modules.
- **default-max-input-tokens.mjs** - Exports `DEFAULT_MAX_INPUT_TOKENS`, a shared constant used by sibling modules.
- **estimate-messages-tokens.mjs** - Exports `estimateMessagesTokens`, which implements estimate messages tokens.
- **estimate-tokens.mjs** - Exports `estimateTokens`, which implements estimate tokens.
- **index.mjs** - Facade module that re-exports public members from `./tool-definition-overhead-tokens.mjs`, `./min-message-budget-tokens.mjs`, `./provider-max-input-tokens.mjs`, `./default-max-input-tokens.mjs`, `./message-truncation-marker.mjs`, `./per-message-char-limit.mjs`, and 7 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`.
- **message-truncation-marker.mjs** - Exports `MESSAGE_TRUNCATION_MARKER`, a shared constant used by sibling modules.
- **min-message-budget-tokens.mjs** - Exports `MIN_MESSAGE_BUDGET_TOKENS`, a shared constant used by sibling modules.
- **per-message-char-limit.mjs** - Exports `PER_MESSAGE_CHAR_LIMIT`, a shared constant used by sibling modules.
- **provider-max-input-tokens.mjs** - Exports `PROVIDER_MAX_INPUT_TOKENS`, a shared constant used by sibling modules.
- **static-provider-max-input-tokens.mjs** - Exports `STATIC_PROVIDER_MAX_INPUT_TOKENS`, a shared constant used by sibling modules.
- **to-input-budget.mjs** - Exports `toInputBudget`, which implements to input budget.
- **tool-definition-overhead-tokens.mjs** - Exports `TOOL_DEFINITION_OVERHEAD_TOKENS`, a shared constant used by sibling modules.
- **truncate-message-content.mjs** - Exports `truncateMessageContent`, which implements truncate message content.
- **truncate-messages-for-provider.mjs** - Exports `truncateMessagesForProvider`, which implements truncate messages for provider.
- **truncate-string.mjs** - Exports `truncateString`, which implements truncate string.
- **validate-context-coherence.mjs** - Exports `validateContextCoherence`, which validates context coherence.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory use Symphony integration.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/integrations/model/symphony-bridge-truncation/index.mjs";
```

## 5. Dependencies

- **Internal relative modules** - `../../../lib/logger.mjs`, `../symphony-openai-bridge/get-cached-context-window-by-provider-name.mjs`, `./build-dynamic-openrouter-limits.mjs`, `./build-provider-max-input-tokens.mjs`, `./chars-per-token.mjs`, `./default-max-input-tokens.mjs`, `./estimate-messages-tokens.mjs`, `./estimate-tokens.mjs`, `./logger.mjs`, `./message-truncation-marker.mjs`, `./min-message-budget-tokens.mjs`, `./per-message-char-limit.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
