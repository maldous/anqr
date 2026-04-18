import { describe, it, expect } from "vitest";
import {
  resolveSessionKey,
  isDiscordSessionKey,
  isLinearSessionKey,
  getLinearIssueId,
  getDiscordChannelId,
} from "../../harness/ops/integrations/model/symphony-session-state/index.mjs";

describe("resolveSessionKey", () => {
  it("resolves Discord guild + channel to discord:guildId:channelId", () => {
    const key = resolveSessionKey({
      discordGuildId: "guild1",
      discordChannelId: "channel1",
    });
    expect(key).toBe("discord:guild1:channel1");
  });

  it("resolves Discord channel only (DMs) to discord:channelId", () => {
    const key = resolveSessionKey({ discordChannelId: "dm-channel" });
    expect(key).toBe("discord:dm-channel");
  });

  it("resolves Linear issue identifier to linear:ANQ-1234", () => {
    const key = resolveSessionKey({ linearIssueIdentifier: "ANQ-1234" });
    expect(key).toBe("linear:ANQ-1234");
  });

  it("resolves header session key to header:value", () => {
    const key = resolveSessionKey({ headerSessionKey: "sess-abc" });
    expect(key).toBe("header:sess-abc");
  });

  it("returns null when no identity is available", () => {
    expect(resolveSessionKey({})).toBeNull();
  });

  it("prioritizes Discord over Linear", () => {
    const key = resolveSessionKey({
      discordGuildId: "g1",
      discordChannelId: "c1",
      linearIssueIdentifier: "ANQ-999",
    });
    expect(key).toBe("discord:g1:c1");
  });

  it("prioritizes Linear over header fallback", () => {
    const key = resolveSessionKey({
      linearIssueIdentifier: "ANQ-555",
      headerSessionKey: "sess-xyz",
    });
    expect(key).toBe("linear:ANQ-555");
  });

  it("keys never collide across source types", () => {
    const dk = resolveSessionKey({ discordGuildId: "g", discordChannelId: "c" });
    const lk = resolveSessionKey({ linearIssueIdentifier: "ANQ-1" });
    const hk = resolveSessionKey({ headerSessionKey: "test" });
    expect(dk).not.toBe(lk);
    expect(dk).not.toBe(hk);
    expect(lk).not.toBe(hk);
  });

  it("is deterministic — same inputs always produce same key", () => {
    const input = { discordGuildId: "g1", discordChannelId: "c1" };
    expect(resolveSessionKey(input)).toBe(resolveSessionKey(input));
  });
});

describe("isDiscordSessionKey", () => {
  it("returns true for Discord keys", () => {
    expect(isDiscordSessionKey("discord:g:c")).toBe(true);
    expect(isDiscordSessionKey("discord:chan")).toBe(true);
  });

  it("returns false for Linear keys", () => {
    expect(isDiscordSessionKey("linear:ANQ-1")).toBe(false);
  });

  it("returns false for header keys", () => {
    expect(isDiscordSessionKey("header:sess")).toBe(false);
  });

  it("returns false for null/undefined", () => {
    expect(isDiscordSessionKey(null)).toBe(false);
    expect(isDiscordSessionKey(undefined)).toBe(false);
  });
});

describe("isLinearSessionKey", () => {
  it("returns true for Linear keys", () => {
    expect(isLinearSessionKey("linear:ANQ-1234")).toBe(true);
  });

  it("returns false for Discord keys", () => {
    expect(isLinearSessionKey("discord:g:c")).toBe(false);
  });

  it("returns false for null/undefined", () => {
    expect(isLinearSessionKey(null)).toBe(false);
  });
});

describe("getLinearIssueId", () => {
  it("extracts issue identifier from Linear key", () => {
    expect(getLinearIssueId("linear:ANQ-1234")).toBe("ANQ-1234");
  });

  it("returns null for non-Linear keys", () => {
    expect(getLinearIssueId("discord:g:c")).toBeNull();
    expect(getLinearIssueId(null)).toBeNull();
  });
});

describe("getDiscordChannelId", () => {
  it("extracts channel ID from guild:channel key", () => {
    expect(getDiscordChannelId("discord:guild1:channel1")).toBe("channel1");
  });

  it("extracts channel ID from channel-only key", () => {
    expect(getDiscordChannelId("discord:dm-channel")).toBe("dm-channel");
  });

  it("returns null for non-Discord keys", () => {
    expect(getDiscordChannelId("linear:ANQ-1")).toBeNull();
    expect(getDiscordChannelId(null)).toBeNull();
  });
});
