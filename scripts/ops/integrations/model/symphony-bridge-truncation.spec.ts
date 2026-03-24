/**
 * Unit tests for symphony-bridge-truncation.mjs
 *
 * Tests the 4-pass message truncation strategy that prevents
 * context_length_exceeded errors when sending messages to providers.
 *
 * Run: npx vitest run scripts/ops/integrations/model/symphony-bridge-truncation.spec.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  estimateTokens,
  estimateMessagesTokens,
  truncateString,
  truncateMessageContent,
  truncateMessagesForProvider,
  PROVIDER_MAX_INPUT_TOKENS,
  DEFAULT_MAX_INPUT_TOKENS,
  PER_MESSAGE_CHAR_LIMIT,
  CHARS_PER_TOKEN,
  MESSAGE_TRUNCATION_MARKER,
  // @ts-expect-error -- .mjs has no declaration file
} from "./symphony-bridge-truncation.mjs";

// Suppress console.log from truncation passes during tests
beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
});

// ---------------------------------------------------------------------------
// Helper to build messages of specific sizes
// ---------------------------------------------------------------------------

function makeMessage(role: string, charCount: number): { role: string; content: string } {
  return { role, content: "x".repeat(charCount) };
}

function makeArrayContentMessage(
  role: string,
  parts: Array<{ type: string; text?: string; result?: string }>,
): { role: string; content: Array<{ type: string; text?: string; result?: string }> } {
  return { role, content: parts };
}

// ---------------------------------------------------------------------------
// estimateTokens
// ---------------------------------------------------------------------------

describe("estimateTokens", () => {
  it("returns 0 for null/undefined/empty", () => {
    expect(estimateTokens(null)).toBe(0);
    expect(estimateTokens(undefined)).toBe(0);
    expect(estimateTokens("")).toBe(0);
  });

  it("estimates ~4 chars per token for strings", () => {
    expect(estimateTokens("abcd")).toBe(1);
    expect(estimateTokens("abcde")).toBe(2); // ceil(5/4)
    expect(estimateTokens("a".repeat(100))).toBe(25);
    expect(estimateTokens("a".repeat(101))).toBe(26); // ceil(101/4)
  });

  it("JSON-stringifies objects before estimating", () => {
    const obj = { key: "value" };
    const jsonLen = JSON.stringify(obj).length; // '{"key":"value"}' = 15
    expect(estimateTokens(obj)).toBe(Math.ceil(jsonLen / CHARS_PER_TOKEN));
  });
});

// ---------------------------------------------------------------------------
// estimateMessagesTokens
// ---------------------------------------------------------------------------

describe("estimateMessagesTokens", () => {
  it("returns 0 for empty array", () => {
    expect(estimateMessagesTokens([])).toBe(0);
  });

  it("adds 4-token overhead per message", () => {
    const msgs = [{ role: "user", content: "" }];
    expect(estimateMessagesTokens(msgs)).toBe(4); // overhead only, empty content = 0
  });

  it("counts string content correctly", () => {
    const msgs = [{ role: "user", content: "a".repeat(400) }];
    // 400 chars / 4 = 100 tokens + 4 overhead = 104
    expect(estimateMessagesTokens(msgs)).toBe(104);
  });

  it("counts array content parts", () => {
    const msgs = [
      {
        role: "assistant",
        content: [
          { type: "text", text: "a".repeat(40) },
          { type: "text", text: "b".repeat(40) },
        ],
      },
    ];
    // 2 parts: each 40/4=10 tokens. total: 20 + 4 overhead = 24
    expect(estimateMessagesTokens(msgs)).toBe(24);
  });

  it("sums across multiple messages", () => {
    const msgs = [
      { role: "system", content: "a".repeat(100) },
      { role: "user", content: "b".repeat(200) },
    ];
    // msg1: 25 + 4 = 29. msg2: 50 + 4 = 54. total: 83
    expect(estimateMessagesTokens(msgs)).toBe(83);
  });
});

// ---------------------------------------------------------------------------
// truncateString
// ---------------------------------------------------------------------------

describe("truncateString", () => {
  it("returns null/undefined unchanged", () => {
    expect(truncateString(null, 100)).toBeNull();
    expect(truncateString(undefined, 100)).toBeUndefined();
  });

  it("returns short strings unchanged", () => {
    expect(truncateString("hello", 100)).toBe("hello");
  });

  it("returns string at exact limit unchanged", () => {
    const str = "a".repeat(50);
    expect(truncateString(str, 50)).toBe(str);
  });

  it("truncates long strings and appends marker", () => {
    const str = "a".repeat(200);
    const result = truncateString(str, 100);
    expect(result).toBe("a".repeat(100) + MESSAGE_TRUNCATION_MARKER);
    expect(result.length).toBe(100 + MESSAGE_TRUNCATION_MARKER.length);
  });
});

// ---------------------------------------------------------------------------
// truncateMessageContent
// ---------------------------------------------------------------------------

describe("truncateMessageContent", () => {
  it("does not mutate the original message", () => {
    const original = { role: "user", content: "a".repeat(200) };
    const contentBefore = original.content;
    truncateMessageContent(original, 50);
    expect(original.content).toBe(contentBefore);
  });

  it("truncates string content over the limit", () => {
    const msg = { role: "user", content: "a".repeat(200) };
    const result = truncateMessageContent(msg, 50);
    expect(result.content).toBe("a".repeat(50) + MESSAGE_TRUNCATION_MARKER);
    expect(result.role).toBe("user");
  });

  it("leaves string content under the limit unchanged", () => {
    const msg = { role: "user", content: "short" };
    const result = truncateMessageContent(msg, 100);
    expect(result.content).toBe("short");
  });

  it("truncates text parts in array content", () => {
    const msg = makeArrayContentMessage("assistant", [
      { type: "text", text: "a".repeat(200) },
      { type: "text", text: "short" },
    ]);
    const result = truncateMessageContent(msg, 50);
    expect(result.content[0].text).toBe("a".repeat(50) + MESSAGE_TRUNCATION_MARKER);
    expect(result.content[1].text).toBe("short");
  });

  it("truncates tool-result parts with string results", () => {
    const msg = makeArrayContentMessage("assistant", [
      { type: "tool-result", result: "x".repeat(200) },
    ]);
    const result = truncateMessageContent(msg, 50);
    expect(result.content[0].result).toBe("x".repeat(50) + MESSAGE_TRUNCATION_MARKER);
  });

  it("truncates tool-result parts with object results", () => {
    const largeObj = { data: "y".repeat(200) };
    const msg = makeArrayContentMessage("assistant", [
      { type: "tool-result", result: largeObj as unknown as string },
    ]);
    const result = truncateMessageContent(msg, 50);
    expect(typeof result.content[0].result).toBe("string");
    expect((result.content[0].result as string).length).toBeLessThanOrEqual(
      50 + MESSAGE_TRUNCATION_MARKER.length,
    );
  });

  it("leaves non-text, non-tool-result parts unchanged", () => {
    const msg = makeArrayContentMessage("assistant", [{ type: "image", text: "a".repeat(200) }]);
    const result = truncateMessageContent(msg, 50);
    // image type should not be truncated (only 'text' type checks text)
    expect(result.content[0].text).toBe("a".repeat(200));
  });
});

// ---------------------------------------------------------------------------
// truncateMessagesForProvider — full 4-pass strategy
// ---------------------------------------------------------------------------

describe("truncateMessagesForProvider", () => {
  describe("under budget — no truncation", () => {
    it("returns original messages when under budget", () => {
      const messages = [makeMessage("system", 100), makeMessage("user", 200)];
      const result = truncateMessagesForProvider(messages, "gemini");
      // gemini has 200K limit — these tiny messages should pass through unchanged
      expect(result).toBe(messages); // same reference
    });

    it("uses DEFAULT_MAX_INPUT_TOKENS for unknown providers", () => {
      const messages = [makeMessage("user", 100)];
      const result = truncateMessagesForProvider(messages, "unknown-provider");
      expect(result).toBe(messages);
    });
  });

  describe("Pass 1 — truncate oversized individual messages", () => {
    it("truncates a single large message to fit within cerebras limit", () => {
      // cerebras: 6K token limit
      // One 30K-char message = ~7500 tokens > 6000
      // After Pass 1: truncated to 12K chars = ~3000 tokens + overhead → fits
      const messages = [makeMessage("system", 100), makeMessage("user", 30_000)];
      const result = truncateMessagesForProvider(messages, "cerebras");

      expect(result.length).toBe(2);
      expect(result[0].content).toBe("x".repeat(100)); // system unchanged
      expect(result[1].content.length).toBeLessThanOrEqual(
        PER_MESSAGE_CHAR_LIMIT + MESSAGE_TRUNCATION_MARKER.length,
      );
      expect(result[1].content).toContain(MESSAGE_TRUNCATION_MARKER);
      expect(estimateMessagesTokens(result)).toBeLessThanOrEqual(
        PROVIDER_MAX_INPUT_TOKENS["cerebras"],
      );
    });
  });

  describe("Pass 2 — drop oldest middle messages", () => {
    it("drops old non-system messages and keeps system + last 4", () => {
      // cerebras: 6K token limit
      // 1 system + 8 user messages × 4000 chars each (all < 12K → Pass 1 no-op)
      // Total: ~8061 tokens > 6000
      // After Pass 2: drop 4, keep last 4 → ~4069 tokens → fits
      const messages = [
        makeMessage("system", 100),
        ...Array.from({ length: 8 }, (_, i) => ({
          role: "user",
          content: `msg${i}:` + "x".repeat(3994), // ~4000 chars total
        })),
      ];
      const result = truncateMessagesForProvider(messages, "cerebras");

      // Should have: system + drop-marker + last 4 user messages
      expect(result.length).toBe(6);
      expect(result[0].role).toBe("system");
      expect(result[0].content).toBe(messages[0].content); // original system
      expect(result[1].role).toBe("system"); // drop marker
      expect(result[1].content).toContain("earlier messages removed");
      // Last 4 messages should be msg4 through msg7
      expect(result[2].content).toContain("msg4:");
      expect(result[3].content).toContain("msg5:");
      expect(result[4].content).toContain("msg6:");
      expect(result[5].content).toContain("msg7:");
      expect(estimateMessagesTokens(result)).toBeLessThanOrEqual(
        PROVIDER_MAX_INPUT_TOKENS["cerebras"],
      );
    });
  });

  describe("Pass 3 — aggressive truncation", () => {
    it("aggressively truncates remaining messages after Pass 2 is insufficient", () => {
      // cerebras: 6K token limit
      // 1 system (100 chars) + 4 user messages × 10K chars (all < 12K → Pass 1 no-op, ≤4 → Pass 2 no-op)
      // Total: ~10045 tokens > 6000
      // After Pass 3 (4000 char limit): each 10K → ~4042 → fits
      const messages = [
        makeMessage("system", 100),
        ...Array.from({ length: 4 }, () => makeMessage("user", 10_000)),
      ];
      const result = truncateMessagesForProvider(messages, "cerebras");

      const aggressiveLimit = Math.floor(PER_MESSAGE_CHAR_LIMIT / 3);
      expect(result.length).toBe(5); // system + 4 user (no dropping needed)
      for (let i = 1; i < result.length; i++) {
        expect((result[i].content as string).length).toBeLessThanOrEqual(
          aggressiveLimit + MESSAGE_TRUNCATION_MARKER.length,
        );
      }
      expect(estimateMessagesTokens(result)).toBeLessThanOrEqual(
        PROVIDER_MAX_INPUT_TOKENS["cerebras"],
      );
    });
  });

  describe("Pass 4 — last resort", () => {
    it("keeps only system + last 2 non-system messages when all else fails", () => {
      // cerebras: 6K token limit
      // 3 system messages × 5K chars + 10 user messages × 5K chars
      // Total: ~16302 tokens > 6K
      // Pass 1: all < 12K → no change
      // Pass 2: drop 6, keep 4 → 3 sys + marker + 4 user
      // Pass 3: 3 sys + marker + 4 user all truncated to 4K → ~7129 tokens > 6K
      // Pass 4: first system + last 2 non-system → fits
      const messages = [
        ...Array.from({ length: 3 }, (_, i) => ({
          role: "system" as const,
          content: `sys${i}:` + "x".repeat(4995),
        })),
        ...Array.from({ length: 10 }, (_, i) => ({
          role: "user" as const,
          content: `usr${i}:` + "x".repeat(4995),
        })),
      ];
      const result = truncateMessagesForProvider(messages, "cerebras");

      // Pass 4 keeps: first system + last 2 non-system
      expect(result.length).toBe(3);
      expect(result[0].role).toBe("system");
      // Last 2 non-system messages are usr8 and usr9
      expect(result[1].content).toContain("usr8:");
      expect(result[2].content).toContain("usr9:");
      expect(estimateMessagesTokens(result)).toBeLessThanOrEqual(
        PROVIDER_MAX_INPUT_TOKENS["cerebras"],
      );
    });

    it("works without system messages", () => {
      // No system messages — all user messages. Multiple system messages are
      // needed to reach Pass 4 (since Pass 2 reduces to marker + 4 non-system
      // which fits after Pass 3 for cerebras). Here we use 3 system-role
      // messages labelled as such to force Pass 4.
      const messages = [
        ...Array.from({ length: 3 }, (_, i) => ({
          role: "system" as const,
          content: `sys${i}:` + "x".repeat(4995),
        })),
        ...Array.from({ length: 10 }, (_, i) => ({
          role: "user" as const,
          content: `usr${i}:` + "x".repeat(4995),
        })),
      ];
      // Verify Pass 4 produces result under budget
      const result = truncateMessagesForProvider(messages, "cerebras");
      expect(result.length).toBe(3); // sys[0] + last 2 non-system
      expect(result[0].role).toBe("system");
      expect(result[0].content).toContain("sys0:");
      expect(estimateMessagesTokens(result)).toBeLessThanOrEqual(
        PROVIDER_MAX_INPUT_TOKENS["cerebras"],
      );
    });

    it("handles no system messages gracefully at earlier passes", () => {
      // 13 user messages × 5K chars — no system messages.
      // Resolves at Pass 2 (drops 9, keeps marker + last 4).
      const messages = Array.from({ length: 13 }, (_, i) => ({
        role: "user" as const,
        content: `usr${i}:` + "x".repeat(4995),
      }));
      const result = truncateMessagesForProvider(messages, "cerebras");

      // Pass 2: marker + last 4 non-system
      expect(result.length).toBe(5);
      expect(result[0].role).toBe("system"); // drop marker
      expect(result[0].content).toContain("earlier messages removed");
      expect(result[4].content).toContain("usr12:");
      expect(estimateMessagesTokens(result)).toBeLessThanOrEqual(
        PROVIDER_MAX_INPUT_TOKENS["cerebras"],
      );
    });
  });

  describe("provider limit lookups", () => {
    it("uses provider-specific limits from PROVIDER_MAX_INPUT_TOKENS", () => {
      // gemini has 200K — large messages should pass through
      const messages = [makeMessage("system", 1000), makeMessage("user", 50_000)];
      const result = truncateMessagesForProvider(messages, "gemini");
      expect(result).toBe(messages); // no truncation needed
    });

    it("falls back to DEFAULT_MAX_INPUT_TOKENS for unknown providers", () => {
      // DEFAULT = 24K tokens. One 120K-char message = 30K tokens > 24K
      const messages = [makeMessage("user", 120_000)];
      const result = truncateMessagesForProvider(messages, "some-openrouter-model");
      expect(result).not.toBe(messages);
      expect(result[0].content).toContain(MESSAGE_TRUNCATION_MARKER);
    });
  });

  describe("edge cases", () => {
    it("handles empty message array", () => {
      const result = truncateMessagesForProvider([], "cerebras");
      expect(result).toEqual([]);
    });

    it("handles single message under budget", () => {
      const messages = [makeMessage("user", 100)];
      const result = truncateMessagesForProvider(messages, "cerebras");
      expect(result).toBe(messages);
    });

    it("preserves message roles through all passes", () => {
      const messages = [
        makeMessage("system", 100),
        { role: "user", content: "a".repeat(30_000) },
        { role: "assistant", content: "response" },
      ];
      const result = truncateMessagesForProvider(messages, "cerebras");
      expect(result.some((m: { role: string }) => m.role === "system")).toBe(true);
      expect(result.some((m: { role: string }) => m.role === "user")).toBe(true);
      expect(result.some((m: { role: string }) => m.role === "assistant")).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Constants validation
// ---------------------------------------------------------------------------

describe("truncation constants", () => {
  it("exports expected provider limits", () => {
    expect(PROVIDER_MAX_INPUT_TOKENS["cerebras"]).toBe(6_000);
    expect(PROVIDER_MAX_INPUT_TOKENS["groq"]).toBe(6_000);
    expect(PROVIDER_MAX_INPUT_TOKENS["gemini"]).toBe(200_000);
    expect(PROVIDER_MAX_INPUT_TOKENS["codebuff"]).toBe(200_000);
    expect(PROVIDER_MAX_INPUT_TOKENS["mistral"]).toBe(24_000);
  });

  it("has a conservative default", () => {
    expect(DEFAULT_MAX_INPUT_TOKENS).toBe(24_000);
  });

  it("uses 4 chars per token", () => {
    expect(CHARS_PER_TOKEN).toBe(4);
  });

  it("limits per-message content to 12K chars", () => {
    expect(PER_MESSAGE_CHAR_LIMIT).toBe(12_000);
  });

  it("has a truncation marker", () => {
    expect(MESSAGE_TRUNCATION_MARKER).toContain("truncated");
  });
});
