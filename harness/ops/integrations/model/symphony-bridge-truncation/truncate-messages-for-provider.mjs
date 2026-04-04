import { CHARS_PER_TOKEN } from "./chars-per-token.mjs";
import { DEFAULT_MAX_INPUT_TOKENS } from "./default-max-input-tokens.mjs";
import { MIN_MESSAGE_BUDGET_TOKENS } from "./min-message-budget-tokens.mjs";
import { PER_MESSAGE_CHAR_LIMIT } from "./per-message-char-limit.mjs";
import { PROVIDER_MAX_INPUT_TOKENS } from "./provider-max-input-tokens.mjs";
import { TOOL_DEFINITION_OVERHEAD_TOKENS } from "./tool-definition-overhead-tokens.mjs";
import { estimateMessagesTokens } from "./estimate-messages-tokens.mjs";
import { truncateMessageContent } from "./truncate-message-content.mjs";
import { validateContextCoherence } from "./validate-context-coherence.mjs";
import { logInfo, logError, logDebug } from "./logger.mjs";

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

  const baseMaxTokens =
    options.maxTokensOverride ||
    PROVIDER_MAX_INPUT_TOKENS[providerName] ||
    DEFAULT_MAX_INPUT_TOKENS;
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
  // For low-context providers like Groq, preserve more recent context
  const isLowContextProvider = baseMaxTokens <= 8000;
  const keepLast = isLowContextProvider ? 3 : 4; // Keep fewer messages for Groq to preserve quality
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

  // Validate context coherence after truncation
  const coherence = validateContextCoherence(truncated, providerName);
  if (!coherence.valid) {
    for (const warning of coherence.warnings) {
      logInfo(`⚠️ Context coherence: ${warning}`);
    }
  }

  logInfo(`[truncateMessagesForProvider] Complete`, {
    providerName,
    originalMessageCount: messages.length,
    truncatedMessageCount: truncated.length,
    estimatedTokens: estimated,
    maxTokens,
    coherenceValid: coherence.valid,
    coherenceWarnings: coherence.warnings.length,
  });

  return truncated;
}
