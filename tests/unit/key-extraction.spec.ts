import { describe, it, expect } from "vitest";

const { getDiscordChannelId } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/get-discord-channel-id.mjs"
);

const { getLinearIssueId } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/get-linear-issue-id.mjs"
);

describe("getDiscordChannelId", () => {
  it("extracts channel ID from guild:channel format", () => {
    expect(getDiscordChannelId("discord:guild123:channel456")).toBe(
      "channel456"
    );
  });

  it("extracts channel ID from channel-only format", () => {
    expect(getDiscordChannelId("discord:channel789")).toBe("channel789");
  });

  it("returns null for linear session key", () => {
    expect(getDiscordChannelId("linear:ANQ-1")).toBeNull();
  });

  it("returns null for header session key", () => {
    expect(getDiscordChannelId("header:some-key")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(getDiscordChannelId(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(getDiscordChannelId(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getDiscordChannelId("")).toBeNull();
  });
});

describe("getLinearIssueId", () => {
  it("extracts issue ID from linear session key", () => {
    expect(getLinearIssueId("linear:ANQ-1234")).toBe("ANQ-1234");
  });

  it("extracts issue ID with project prefix", () => {
    expect(getLinearIssueId("linear:PROJ-567")).toBe("PROJ-567");
  });

  it("returns null for discord session key", () => {
    expect(getLinearIssueId("discord:guild:chan")).toBeNull();
  });

  it("returns null for header session key", () => {
    expect(getLinearIssueId("header:some-key")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(getLinearIssueId(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(getLinearIssueId(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getLinearIssueId("")).toBeNull();
  });
});

describe("key extraction symmetry", () => {
  it("discord and linear extraction are mutually exclusive", () => {
    const discordKey = "discord:g:c";
    const linearKey = "linear:ANQ-1";

    expect(getDiscordChannelId(discordKey)).not.toBeNull();
    expect(getDiscordChannelId(linearKey)).toBeNull();
    expect(getLinearIssueId(linearKey)).not.toBeNull();
    expect(getLinearIssueId(discordKey)).toBeNull();
  });
});
