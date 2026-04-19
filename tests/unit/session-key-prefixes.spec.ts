import { describe, it, expect } from "vitest";

const {
  DISCORD_PREFIX,
  LINEAR_PREFIX,
  HEADER_PREFIX,
} = await import(
  "../../harness/ops/integrations/model/symphony-session-state/session-key-prefixes.mjs"
);

describe("session-key-prefixes", () => {
  describe("DISCORD_PREFIX", () => {
    it('is "discord:"', () => {
      expect(DISCORD_PREFIX).toBe("discord:");
    });
  });

  describe("LINEAR_PREFIX", () => {
    it('is "linear:"', () => {
      expect(LINEAR_PREFIX).toBe("linear:");
    });
  });

  describe("HEADER_PREFIX", () => {
    it('is "header:"', () => {
      expect(HEADER_PREFIX).toBe("header:");
    });
  });

  describe("prefix uniqueness", () => {
    it("all three prefixes are distinct", () => {
      const set = new Set([DISCORD_PREFIX, LINEAR_PREFIX, HEADER_PREFIX]);
      expect(set.size).toBe(3);
    });

    it("no prefix is a prefix of another", () => {
      expect(LINEAR_PREFIX.startsWith(DISCORD_PREFIX)).toBe(false);
      expect(HEADER_PREFIX.startsWith(DISCORD_PREFIX)).toBe(false);
      expect(DISCORD_PREFIX.startsWith(LINEAR_PREFIX)).toBe(false);
      expect(HEADER_PREFIX.startsWith(LINEAR_PREFIX)).toBe(false);
    });
  });
});
