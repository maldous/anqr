/**
 * symphony-bridge-truncation.mjs — Pure message truncation utilities.
 *
 * Extracted from symphony-openai-bridge.mjs so they can be unit-tested
 * without triggering the bridge's HTTP server and provider probe side effects.
 */

// ---------------------------------------------------------------------------
// Provider context limits — conservative input token budgets per provider.
// These are deliberately lower than the actual model context to leave room
// for output tokens, tool definitions, and overhead.
// ---------------------------------------------------------------------------

export const PROVIDER_MAX_INPUT_TOKENS = {
  codex: 100_000,
  codebuff: 200_000, // managed internally by SDK
  groq: 6_000, // 12K TPM free tier shared with output
  mistral: 24_000, // 32K context
  gemini: 200_000, // 1M context — very generous
  "gemini-lite": 200_000,
  sambanova: 24_000, // 128K context but conservative
  cerebras: 6_000, // 8K total context
  "github-models": 100_000, // gpt-4.1-mini 128K
  "codebuff-bridge": 200_000, // managed internally
  "ollama-qwen2.5-coder-3b": 24_000, // qwen2.5-coder:3b-instruct ~32K
  "ollama-qwen2.5-coder-0.5b": 16_000,
};
export const DEFAULT_MAX_INPUT_TOKENS = 24_000; // OpenRouter and unknown providers
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
 * @returns {Array} - Truncated messages that fit within the provider's budget
 */
export function truncateMessagesForProvider(messages, providerName) {
  // Validate input - must have at least one message
  if (!messages || messages.length === 0) {
    console.error(
      `[symphony-bridge] ⚠️ truncateMessagesForProvider: messages array is empty (provider: ${providerName}) - this should never happen`,
    );
    // Return a minimal valid message to prevent AI SDK errors
    return [{ role: "user", content: "[Error: No messages provided]" }];
  }

  const maxTokens = PROVIDER_MAX_INPUT_TOKENS[providerName] || DEFAULT_MAX_INPUT_TOKENS;
  let estimated = estimateMessagesTokens(messages);

  // Under budget — no truncation needed
  if (estimated <= maxTokens) return messages;

  console.error(
    `[symphony-bridge] ✂️ Context pruning for ${providerName}: ~${estimated} tokens > ${maxTokens} limit`,
  );

  // Pass 1: Truncate oversized individual messages
  let truncated = messages.map((msg) => truncateMessageContent(msg, PER_MESSAGE_CHAR_LIMIT));
  estimated = estimateMessagesTokens(truncated);
  if (estimated <= maxTokens) {
    console.error(
      `[symphony-bridge] ✂️ Pass 1 (truncate large messages): ~${estimated} tokens — fits`,
    );
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

  if (nonSystemMessages.length > keepLast) {
    const dropped = nonSystemMessages.length - keepLast;
    const kept = nonSystemMessages.slice(-keepLast);
    const marker = {
      role: "system",
      content: `[${dropped} earlier messages removed for context limits]`,
    };
    truncated = [...systemMessages, marker, ...kept];
    estimated = estimateMessagesTokens(truncated);
    console.error(
      `[symphony-bridge] ✂️ Pass 2 (drop ${dropped} middle messages): ~${estimated} tokens`,
    );
    if (estimated <= maxTokens) return truncated;
  }

  // Pass 3: Aggressively truncate remaining messages to half the per-message limit
  const aggressiveLimit = Math.floor(PER_MESSAGE_CHAR_LIMIT / 3);
  truncated = truncated.map((msg) => truncateMessageContent(msg, aggressiveLimit));
  estimated = estimateMessagesTokens(truncated);
  console.error(
    `[symphony-bridge] ✂️ Pass 3 (aggressive truncation to ${aggressiveLimit} chars/msg): ~${estimated} tokens`,
  );

  // Pass 4: Last resort — fresh start with only system + last 2 ORIGINAL messages.
  // Uses the original nonSystemMessages (not the truncated set) intentionally —
  // this is a complete reset rather than iterating on previous passes.
  if (estimated > maxTokens) {
    const lastResortLimit = Math.floor((maxTokens * CHARS_PER_TOKEN) / 3); // ~1/3 of total budget in chars
    const sysMsg =
      systemMessages.length > 0 ? [truncateMessageContent(systemMessages[0], lastResortLimit)] : [];
    const lastTwo = nonSystemMessages
      .slice(-2)
      .map((m) => truncateMessageContent(m, lastResortLimit));
    truncated = [...sysMsg, ...lastTwo];
    estimated = estimateMessagesTokens(truncated);
    console.error(
      `[symphony-bridge] ✂️ Pass 4 (last resort — system + last 2): ~${estimated} tokens`,
    );
  }

  // Final validation - ensure we always return at least one message
  if (!truncated || truncated.length === 0) {
    console.error(
      `[symphony-bridge] ⚠️ Truncation resulted in empty array — returning last message only`,
    );
    const lastMsg = messages[messages.length - 1];
    const emergencyLimit = Math.floor((maxTokens * CHARS_PER_TOKEN) / 2);
    return [truncateMessageContent(lastMsg, emergencyLimit)];
  }

  return truncated;
}
