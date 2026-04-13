# Symphony Bridge Truncation

## Purpose
Directory for operator tooling and diagnostics; immediate files include `build-dynamic-catalog-limits.mjs`, `build-provider-max-input-tokens.mjs`, `chars-per-token.mjs`, `default-max-input-tokens.mjs`, and others.

## Contents
- 20 immediate files
- 0 child directories

## Key Files
- `build-dynamic-catalog-limits.mjs` - Exports `buildDynamicCatalogLimits`, the main helper defined in this file.
- `build-provider-max-input-tokens.mjs` - Exports `buildProviderMaxInputTokens`, the main helper defined in this file.
- `chars-per-token.mjs` - Exports `CHARS_PER_TOKEN`, a shared constant or state value used by sibling modules.
- `default-max-input-tokens.mjs` - Exports `DEFAULT_MAX_INPUT_TOKENS`, a shared constant or state value used by sibling modules.
- `estimate-messages-tokens.mjs` - Exports `estimateMessagesTokens`, the main helper defined in this file.
- `estimate-tokens.mjs` - Exports `estimateTokens`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `message-truncation-marker.mjs` - Exports `MESSAGE_TRUNCATION_MARKER`, a shared constant or state value used by sibling modules.
- `min-message-budget-tokens.mjs` - Exports `MIN_MESSAGE_BUDGET_TOKENS`, a shared constant or state value used by sibling modules.
- `per-message-char-limit.mjs` - Exports `PER_MESSAGE_CHAR_LIMIT`, a shared constant or state value used by sibling modules.
- `provider-max-input-tokens.mjs` - Exports `PROVIDER_MAX_INPUT_TOKENS`, a shared constant or state value used by sibling modules.
- `static-context-windows.mjs` - Exports `STATIC_CONTEXT_WINDOWS`, a shared constant or state value used by sibling modules.
- `static-input-budgets.mjs` - Exports `STATIC_INPUT_BUDGETS`, a shared constant or state value used by sibling modules.
- `to-input-budget.mjs` - Exports `toInputBudget`, the main helper defined in this file.
- `tool-definition-overhead-tokens.mjs` - Exports `TOOL_DEFINITION_OVERHEAD_TOKENS`, a shared constant or state value used by sibling modules.
- `truncate-message-content.mjs` - Exports `truncateMessageContent`, the main helper defined in this file.
- `truncate-messages-for-provider.mjs` - Exports `truncateMessagesForProvider`, the main helper defined in this file.
- `truncate-string.mjs` - Exports `truncateString`, the main helper defined in this file.
- `validate-context-coherence.mjs` - Exports `validateContextCoherence`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 20 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
