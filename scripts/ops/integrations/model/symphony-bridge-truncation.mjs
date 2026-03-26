/**
 * symphony-bridge-truncation.mjs — Pure message truncation utilities.
 *
 * Extracted from symphony-openai-bridge.mjs so they can be unit-tested
 * without triggering the bridge's HTTP server and provider probe side effects.
 */

import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logError, logDebug } = createLogger();

// ---------------------------------------------------------------------------
// Provider context limits — conservative input token budgets per provider.
// These are deliberately lower than the actual model context to leave room
// for output tokens, tool definitions, and overhead.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Tool definition overhead — estimated token cost of sending tool schemas.
// 6 tools with Zod schemas serialize to ~470 raw JSON tokens, but providers
// expand these with function-call wrappers, parameter descriptions, and
// chat-ML formatting. A 3–4× multiplier gives a safe estimate.
// ---------------------------------------------------------------------------
export const TOOL_DEFINITION_OVERHEAD_TOKENS = 2_000;
export const MIN_MESSAGE_BUDGET_TOKENS = 1_000; // floor — never shrink below this

export const PROVIDER_MAX_INPUT_TOKENS = {
  // --- Paid / managed providers ---
  codex: 100_000, // GPT-5 Codex, 200K context
  codebuff: 200_000, // managed internally by SDK
  "codebuff-bridge": 200_000, // managed internally

  // --- Direct free-cloud providers ---
  groq: 6_000, // llama-3.3-70b: 12K TPM free tier (shared input+output+tools)
  mistral: 24_000, // mistral-small-latest: 32K context
  gemini: 200_000, // gemini-2.5-flash: 1M context
  "gemini-lite": 200_000, // gemini-2.5-flash-lite: 1M context
  sambanova: 24_000, // Llama-3.3-70B: 128K context, conservative
  cerebras: 6_000, // llama3.1-8b: 8K context free tier
  "github-models": 100_000, // gpt-4.1-mini: 128K context

  // --- OpenRouter FREE models (context varies by underlying model) ---
  "openrouter-nemotron-super": 24_000, // 120B, 128K context
  "openrouter-free": 16_000, // auto-routed, varies
  "openrouter-nemotron-nano-30b": 16_000, // 30B, 128K context
  "openrouter-qwen3-next-80b": 24_000, // 80B, 128K context
  "openrouter-step3-5-flash": 16_000, // step-3.5-flash
  "openrouter-trinity-mini": 8_000, // small model
  "openrouter-nemotron-nano-9b": 16_000, // 9B, 128K context
  "openrouter-minimax-m2.5": 24_000, // minimax, 1M context
  "openrouter-qwen3-coder": 24_000, // qwen3-coder, 128K
  "openrouter-lfm-2.5-thinking": 8_000, // 1.2B param, 32K context
  "openrouter-lfm-2.5-instruct": 8_000, // 1.2B param, 32K context
  "openrouter-nemotron-nano-12b-vl": 16_000, // 12B, 128K context
  "openrouter-trinity-large": 16_000, // medium model
  "openrouter-mistral-small-3.1": 24_000, // 24B, 32K context
  "openrouter-llama-3.3-70b": 24_000, // 70B, 128K context
  "openrouter-qwen3-4b": 8_000, // 4B, 32K context
  "openrouter-gpt-oss-120b": 24_000, // 120B
  "openrouter-gpt-oss-20b": 16_000, // 20B
  "openrouter-llama-3.2-3b": 8_000, // 3B, 128K context but tiny
  "openrouter-dolphin-mistral": 24_000, // 24B, 32K context
  "openrouter-gemma-3-27b": 24_000, // 27B, 128K context
  "openrouter-glm-4.5-air": 24_000, // glm-4.5-air, 128K
  "openrouter-gemma-3n-e2b": 8_000, // small model
  "openrouter-gemma-3-4b": 8_000, // 4B, 128K context
  "openrouter-gemma-3n-e4b": 8_000, // small model
  "openrouter-gemma-3-12b": 16_000, // 12B, 128K context
  "openrouter-hermes-3-405b": 24_000, // 405B, 128K context

  // --- Local safety-net providers ---
  "ollama-qwen2.5-coder-3b": 24_000, // qwen2.5-coder:3b-instruct ~32K
  "ollama-qwen2.5-coder-0.5b": 16_000, // qwen2.5-coder:0.5b ~32K
};
export const DEFAULT_MAX_INPUT_TOKENS = 16_000; // unknown providers get conservative default
export const MESSAGE_TRUNCATION_MARKER = "\n... [truncated for context limits]";
export const PER_MESSAGE_CHAR_LIMIT = 12_000; // ~3K tokens — truncate any single message content beyond this
export const CHARS_PER_TOKEN = 4; // conservative estimate for English/code

// ---------------------------------------------------------------------------
// Token estimation
// ---------------------------------------------------------------------------

export function estimateTokens(text) {
  if (!text) return 0;
  const str = typeof text === "string" ? text : JSON.stringify(text);
  return Math.ceil(str.length / CHARS_PER_TOKEN);
}

export function estimateMessagesTokens(messages) {
  let total = 0;
  for (const msg of messages) {
    total += 4; // per-message overhead (role, delimiters)
    if (typeof msg.content === "string") {
      total += estimateTokens(msg.content);
    } else if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        total += estimateTokens(part.text || part.content || JSON.stringify(part));
      }
    }
  }
  return total;
}

// ---------------------------------------------------------------------------
// String and message truncation
// ---------------------------------------------------------------------------

export function truncateString(str, maxChars) {
  if (!str || str.length <= maxChars) return str;
  return str.slice(0, maxChars) + MESSAGE_TRUNCATION_MARKER;
}

export function truncateMessageContent(msg, maxChars) {
  const clone = { ...msg };
  if (typeof clone.content === "string") {
    clone.content = truncateString(clone.content, maxChars);
  } else if (Array.isArray(clone.content)) {
    clone.content = clone.content.map((part) => {
      if (part.type === "text" && part.text && part.text.length > maxChars) {
        return { ...part, text: truncateString(part.text, maxChars) };
      }
      if (part.type === "tool-result" && part.result) {
        const resultStr =
          typeof part.result === "string" ? part.result : JSON.stringify(part.result);
        if (resultStr.length > maxChars) {
          return { ...part, result: truncateString(resultStr, maxChars) };
        }
      }
      return part;
    });
  }
  return clone;
}

// ---------------------------------------------------------------------------
// Main truncation entry point — 4-pass strategy
// ---------------------------------------------------------------------------

/**
 * Truncate messages to fit within a provider's context limit.
 *
 * Strategy (applied in order until under budget):
 *   1. Truncate any individual message content > PER_MESSAGE_CHAR_LIMIT
 *   2. Drop oldest non-system, non-final messages from the middle
 *   3. Aggressively halve the per-message limit and re-truncate
 *   4. Last resort — keep only system + last 2 original messages
 *
 * @param {Array} messages - AI SDK formatted messages
 * @param {string} providerName - Provider name for context limit lookup
 * @param {{ useTools?: boolean, maxTokensOverride?: number }} options - Options for truncation
 * @returns {Array} - Truncated messages that fit within the provider's budget
 */
export function truncateMessagesForProvider(messages, providerName, options = {}) {
  // Validate input - must have at least one message
  if (!messages || messages.length === 0) {
    logError(
      `⚠️ truncateMessagesForProvider: messages array is empty (provider: ${providerName}) - this should never happen`,
      {
        providerName,
        messageCount: messages?.length,
      },
    );
    // Return a minimal valid message to prevent AI SDK errors
    return [{ role: "user", content: "[Error: No messages provided]" }];
  }

  const baseMaxTokens = options.maxTokensOverride || PROVIDER_MAX_INPUT_TOKENS[providerName] || DEFAULT_MAX_INPUT_TOKENS;
  const toolOverhead = options.useTools === true ? TOOL_DEFINITION_OVERHEAD_TOKENS : 0;
  const maxTokens = Math.max(baseMaxTokens - toolOverhead, MIN_MESSAGE_BUDGET_TOKENS);
  let estimated = estimateMessagesTokens(messages);

  logDebug(`[truncateMessagesForProvider] Entry`, {
    providerName,
    messageCount: messages.length,
    estimatedTokens: estimated,
    baseMaxTokens,
    toolOverhead,
    effectiveMaxTokens: maxTokens,
    needsTruncation: estimated > maxTokens,
  });

  // Under budget — no truncation needed
  if (estimated <= maxTokens) {
    logDebug(`[truncateMessagesForProvider] No truncation needed`, {
      providerName,
      estimatedTokens: estimated,
      maxTokens,
    });
    return messages;
  }

  logInfo(`✂️ Context pruning for ${providerName}: ~${estimated} tokens > ${maxTokens} limit`, {
    providerName,
    estimatedTokens: estimated,
    maxTokens,
    overBudgetBy: estimated - maxTokens,
  });

  // Pass 1: Truncate oversized individual messages
  logDebug(`[truncateMessagesForProvider] Pass 1: Truncating large messages`, {
    perMessageLimit: PER_MESSAGE_CHAR_LIMIT,
  });
  let truncated = messages.map((msg) => truncateMessageContent(msg, PER_MESSAGE_CHAR_LIMIT));
  estimated = estimateMessagesTokens(truncated);
  if (estimated <= maxTokens) {
    logInfo(`✂️ Pass 1 (truncate large messages): ~${estimated} tokens — fits`, {
      estimatedTokens: estimated,
      maxTokens,
      messageCount: truncated.length,
    });
    return truncated;
  }

  // Pass 2: Drop oldest middle messages (keep system + last 4)
  const keepLast = 4;
  const systemMessages = [];
  const nonSystemMessages = [];
  for (const msg of truncated) {
    if (msg.role === "system") {
      systemMessages.push(msg);
    } else {
      nonSystemMessages.push(msg);
    }
  }

  logDebug(`[truncateMessagesForProvider] Pass 2: Dropping middle messages`, {
    nonSystemCount: nonSystemMessages.length,
    keepLast,
    willDrop: nonSystemMessages.length > keepLast,
  });
  if (nonSystemMessages.length > keepLast) {
    const dropped = nonSystemMessages.length - keepLast;
    const kept = nonSystemMessages.slice(-keepLast);
    const marker = {
      role: "system",
      content: `[${dropped} earlier messages removed for context limits]`,
    };
    truncated = [...systemMessages, marker, ...kept];
    estimated = estimateMessagesTokens(truncated);
    logInfo(`✂️ Pass 2 (drop ${dropped} middle messages): ~${estimated} tokens`, {
      droppedCount: dropped,
      estimatedTokens: estimated,
      maxTokens,
      messageCount: truncated.length,
    });
    if (estimated <= maxTokens) return truncated;
  }

  // Pass 3: Aggressively truncate remaining messages to half the per-message limit
  const aggressiveLimit = Math.floor(PER_MESSAGE_CHAR_LIMIT / 3);
  logDebug(`[truncateMessagesForProvider] Pass 3: Aggressive truncation`, {
    aggressiveLimit,
    messageCount: truncated.length,
  });
  truncated = truncated.map((msg) => truncateMessageContent(msg, aggressiveLimit));
  estimated = estimateMessagesTokens(truncated);
  logInfo(
    `✂️ Pass 3 (aggressive truncation to ${aggressiveLimit} chars/msg): ~${estimated} tokens`,
    {
      aggressiveLimit,
      estimatedTokens: estimated,
      maxTokens,
      messageCount: truncated.length,
    },
  );

  // Pass 4: Last resort — fresh start with only system + last 2 ORIGINAL messages.
  // Uses the original nonSystemMessages (not the truncated set) intentionally —
  // this is a complete reset rather than iterating on previous passes.
  if (estimated > maxTokens) {
    const lastResortLimit = Math.floor((maxTokens * CHARS_PER_TOKEN) / 3); // ~1/3 of total budget in chars
    logDebug(`[truncateMessagesForProvider] Pass 4: Last resort`, {
      lastResortLimit,
      systemMessageCount: systemMessages.length,
      originalNonSystemCount: nonSystemMessages.length,
    });
    const sysMsg =
      systemMessages.length > 0 ? [truncateMessageContent(systemMessages[0], lastResortLimit)] : [];
    const lastTwo = nonSystemMessages
      .slice(-2)
      .map((m) => truncateMessageContent(m, lastResortLimit));
    truncated = [...sysMsg, ...lastTwo];
    estimated = estimateMessagesTokens(truncated);
    logInfo(`✂️ Pass 4 (last resort — system + last 2): ~${estimated} tokens`, {
      lastResortLimit,
      estimatedTokens: estimated,
      maxTokens,
      messageCount: truncated.length,
    });
  }

  // Final validation - ensure we always return at least one message
  if (!truncated || truncated.length === 0) {
    logError(`⚠️ Truncation resulted in empty array — returning last message only`, {
      providerName,
      originalMessageCount: messages.length,
    });
    const lastMsg = messages[messages.length - 1];
    const emergencyLimit = Math.floor((maxTokens * CHARS_PER_TOKEN) / 2);
    return [truncateMessageContent(lastMsg, emergencyLimit)];
  }

  logInfo(`[truncateMessagesForProvider] Complete`, {
    providerName,
    originalMessageCount: messages.length,
    truncatedMessageCount: truncated.length,
    estimatedTokens: estimated,
    maxTokens,
  });

  return truncated;
}
