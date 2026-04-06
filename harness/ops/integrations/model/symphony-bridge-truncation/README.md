# ANQR Symphony Bridge Truncation

## 1. Directory Overview

This directory contains message truncation and context management utilities for the ANQR (Agentic Number Query Runner) Symphony bridge. It provides functionality to intelligently truncate messages when they exceed provider token limits, ensuring AI model calls remain within acceptable context windows while preserving the most relevant information.

## 2. File Summaries

### Constants and Configuration

- **min-message-budget-tokens.mjs** - Exports `MIN_MESSAGE_BUDGET_TOKENS` (1,000). Defines the minimum budget of tokens that must be preserved for message content.

- **message-truncation-marker.mjs** - Exports `MESSAGE_TRUNCATION_MARKER` ("\n... [truncated for context limits]"). The marker appended to truncated content to indicate truncation occurred.

- **chars-per-token.mjs** - Exports `CHARS_PER_TOKEN` (4). The average character-to-token ratio used for token estimation.

- **default-max-input-tokens.mjs** - Exports `DEFAULT_MAX_INPUT_TOKENS` (16,000). Fallback token limit for providers without specific configuration.

- **per-message-char-limit.mjs** - Exports `PER_MESSAGE_CHAR_LIMIT` (12,000). Character limit applied to individual messages during truncation.

- **tool-definition-overhead-tokens.mjs** - Exports `TOOL_DEFINITION_OVERHEAD_TOKENS` (2,000). Overhead budget reserved for tool definitions in API calls.

- **static-provider-max-input-tokens.mjs** - Static token limits for providers: codex (100K), codebuff (200K), groq (6K), mistral (24K), gemini (200K), sambanova (24K), cerebras (4K), github-models (8K), huggingface (24K), fireworks (24K), together (24K), ollama models.

### Estimation and Calculation

- **estimate-tokens.mjs** - Exports `estimateTokens()` function. Estimates token count by dividing character length by CHARS_PER_TOKEN (4).

- **estimate-messages-tokens.mjs** - Exports `estimateMessagesTokens()` function. Calculates total tokens for an array of messages, including per-message overhead (4 tokens) and handling both string and array content types.

- **to-input-budget.mjs** - Exports `toInputBudget()` function. Converts context window length to input budget (60% of context, minimum 4,000, requires minimum 4,096 context).

- **build-dynamic-openrouter-limits.mjs** - Exports `buildDynamicOpenrouterLimits()` function. Builds dynamic token limits for openrouter-free and openrouter providers by fetching cached context windows.

- **build-provider-max-input-tokens.mjs** - Exports `buildProviderMaxInputTokens()` function. Combines static provider limits with dynamic openrouter limits, with fallback for openrouter-free (24K).

- **provider-max-input-tokens.mjs** - Exports `PROVIDER_MAX_INPUT_TOKENS` constant. Pre-built provider token limits combining static and dynamic sources.

### Truncation Logic

- **truncate-string.mjs** - Exports `truncateString()` function. Truncates string to maxChars and appends truncation marker if exceeded.

- **truncate-message-content.mjs** - Exports `truncateMessageContent()` function. Handles truncation of message content supporting both string and array content types (text parts and tool-result parts).

- **truncate-messages-for-provider.mjs** - Exports `truncateMessagesForProvider()` function. Main truncation orchestrator with 4-pass algorithm: (1) truncate oversized individual messages, (2) drop oldest middle messages (keep last 3-4), (3) aggressive truncation to 1/3 per-message limit, (4) last resort with system + last 2 messages.

### Validation

- **validate-context-coherence.mjs** - Exports `validateContextCoherence()` function. Validates truncated messages for: presence of system message, role alternation (user/assistant), and absence of truncation markers in last message.

### Facade and Utilities

- **index.mjs** - Generated facade index re-exporting all public API members: TOOL_DEFINITION_OVERHEAD_TOKENS, MIN_MESSAGE_BUDGET_TOKENS, PROVIDER_MAX_INPUT_TOKENS, DEFAULT_MAX_INPUT_TOKENS, MESSAGE_TRUNCATION_MARKER, PER_MESSAGE_CHAR_LIMIT, CHARS_PER_TOKEN, estimateTokens, estimateMessagesTokens, truncateString, truncateMessageContent, validateContextCoherence, truncateMessagesForProvider.

- **logger.mjs** - Shared logger module using the project's logger.mjs, exporting logInfo, logError, logDebug.

## 3. Overall Directory Function

This directory serves as the context management layer for the Symphony bridge. The truncation system ensures that AI provider calls remain within token limits by intelligently reducing message content while preserving the most recent and relevant context.

The truncation algorithm follows a progressive strategy:
1. **Pass 1**: Truncate individual oversized messages to PER_MESSAGE_CHAR_LIMIT (12K chars)
2. **Pass 2**: Drop oldest middle messages (keep last 3 for low-context providers like Groq, 4 for others)
3. **Pass 3**: Aggressively truncate remaining messages to 1/3 of per-message limit
4. **Pass 4**: Last resort - reset to system + last 2 original messages

Key design decisions:
- Low-context providers (<=8000 tokens) keep fewer messages to preserve quality
- Minimum message budget of 1000 tokens ensures some content always remains
- Tool overhead of 2000 tokens reserved when tools are used
- Context coherence validation warns about missing system messages, broken role alternation, and incomplete final turns
- Always returns at least one valid message to prevent AI SDK errors

## 4. Usage Instructions

This module is primarily imported by other Symphony bridge components. Usage pattern:

```javascript
import { truncateMessagesForProvider } from "./symphony-bridge-truncation/index.mjs";

// Truncate messages for a specific provider
const truncated = truncateMessagesForProvider(messages, "groq", {
  useTools: true,
  maxTokensOverride: null
});
```

The function accepts:
- `messages` - Array of message objects with role and content
- `providerName` - Provider identifier (e.g., "groq", "gemini", "ollama-qwen2.5-coder-3b")
- `options` - Optional configuration:
  - `useTools` - Boolean indicating if tools are used (adds 2000 token overhead)
  - `maxTokensOverride` - Override the default max tokens for the provider

## 5. Dependencies

### Internal Dependencies

- **../../../lib/logger.mjs** - Project logger used for truncation logging
- **../symphony-openai-bridge/get-cached-context-window-by-provider-name.mjs** - For dynamic openrouter limit calculation

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid provider configuration for token limits

### External Services

- OpenRouter API (optional, for dynamic context window limits)

## 6. Additional Comments

- **Token Estimation**: Uses a simple 4 characters-per-token heuristic, which is approximate but sufficient for context management.

- **Provider-Specific Behavior**: Low-context providers like Groq (6K tokens) and Cerebras (4K tokens) receive different treatment - they keep fewer messages (3 vs 4) to preserve recent context quality.

- **Safety Features**: The module includes multiple safeguards - returns minimal placeholder message if input is empty, validates context coherence, and ensures at least one message always exists in output.

- **Logging**: Comprehensive debug and info logging tracks truncation decisions for debugging context management issues.

- **Dynamic Limits**: OpenRouter providers use dynamic limits based on actual model context windows fetched at runtime, while other providers use static pre-configured limits.