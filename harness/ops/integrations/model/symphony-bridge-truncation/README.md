# ANQR Symphony Bridge Truncation

## 1. Directory Overview

This directory contains message truncation and context management utilities for the ANQR (Agentic
Number Query Runner) Symphony bridge. It provides functionality to intelligently truncate messages
when they exceed provider token limits, ensuring AI model calls remain within acceptable context
windows while preserving the most relevant information. It currently contains 19 files and 0
subdirectories.

## 2. File Summaries

### Files

- **build-dynamic-openrouter-limits.mjs** - Exports `buildDynamicOpenrouterLimits()` function. Builds dynamic token limits for openrouter-free and openrouter providers by fetching cached context windows.
- **build-provider-max-input-tokens.mjs** - Exports `buildProviderMaxInputTokens()` function. Combines static provider limits with dynamic openrouter limits, with fallback for openrouter-free (24K).
- **chars-per-token.mjs** - Exports `CHARS_PER_TOKEN` (4). The average character-to-token ratio used for token estimation.
- **default-max-input-tokens.mjs** - Exports `DEFAULT_MAX_INPUT_TOKENS` (16,000). Fallback token limit for providers without specific configuration.
- **estimate-messages-tokens.mjs** - Exports `estimateMessagesTokens()` function. Calculates total tokens for an array of messages, including per-message overhead (4 tokens) and handling both string and array content types.
- **estimate-tokens.mjs** - Exports `estimateTokens()` function. Estimates token count by dividing character length by CHARS_PER_TOKEN (4).
- **index.mjs** - Generated facade index re-exporting all public API members: TOOL_DEFINITION_OVERHEAD_TOKENS, MIN_MESSAGE_BUDGET_TOKENS, PROVIDER_MAX_INPUT_TOKENS, DEFAULT_MAX_INPUT_TOKENS, MESSAGE_TRUNCATION_MARKER, PER_MESSAGE_CHAR_LIMIT, CHARS_PER_TOKEN, estimateTokens, estimateMessagesTokens, truncateString, truncateMessageContent, validateContextCoherence, truncateMessagesForProvider.
- **logger.mjs** - Shared logger module using the project's logger.mjs, exporting logInfo, logError, logDebug.
- **message-truncation-marker.mjs** - Exports `MESSAGE_TRUNCATION_MARKER` ("\n... [truncated for context limits]"). The marker appended to truncated content to indicate truncation occurred.
- **min-message-budget-tokens.mjs** - Exports `MIN_MESSAGE_BUDGET_TOKENS` (1,000). Defines the minimum budget of tokens that must be preserved for message content.
- **per-message-char-limit.mjs** - Exports `PER_MESSAGE_CHAR_LIMIT` (12,000). Character limit applied to individual messages during truncation.
- **provider-max-input-tokens.mjs** - Exports `PROVIDER_MAX_INPUT_TOKENS` constant. Pre-built provider token limits combining static and dynamic sources.
- **static-provider-max-input-tokens.mjs** - Static token limits for providers: codex (100K), codebuff (200K), groq (6K), mistral (24K), gemini (200K), sambanova (24K), cerebras (4K), github-models (8K), huggingface (24K), fireworks (24K), together (24K), ollama models.
- **to-input-budget.mjs** - Exports `toInputBudget()` function. Converts context window length to input budget (60% of context, minimum 4,000, requires minimum 4,096 context).
- **tool-definition-overhead-tokens.mjs** - Exports `TOOL_DEFINITION_OVERHEAD_TOKENS` (2,000). Overhead budget reserved for tool definitions in API calls.
- **truncate-message-content.mjs** - Exports `truncateMessageContent()` function. Handles truncation of message content supporting both string and array content types (text parts and tool-result parts).
- **truncate-messages-for-provider.mjs** - Exports `truncateMessagesForProvider()` function. Main truncation orchestrator with 4-pass algorithm: (1) truncate oversized individual messages, (2) drop oldest middle messages (keep last 3-4), (3) aggressive truncation to 1/3 per-message limit, (4) last resort with system + last 2 messages.
- **truncate-string.mjs** - Exports `truncateString()` function. Truncates string to maxChars and appends truncation marker if exceeded.
- **validate-context-coherence.mjs** - Exports `validateContextCoherence()` function. Validates truncated messages for: presence of system message, role alternation (user/assistant), and absence of truncation markers in last message.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
