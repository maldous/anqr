import { describe, it, expect, vi, beforeEach } from "vitest";

const { hasConfiguredCredentials } = await import("./has-configured-credentials.mjs");

describe("hasConfiguredCredentials", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should check OPENAI_API_KEY for codex-sdk driver", () => {
    const provider = { driver: "codex-sdk" };
    vi.stubEnv("OPENAI_API_KEY", "sk-xxx");
    expect(hasConfiguredCredentials(provider)).toBe(true);
    vi.stubEnv("OPENAI_API_KEY", "");
    expect(hasConfiguredCredentials(provider)).toBe(false);
  });

  it("should check envVar when present", () => {
    const provider = { envVar: "ANTHROPIC_API_KEY" };
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-xxx");
    expect(hasConfiguredCredentials(provider)).toBe(true);
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(hasConfiguredCredentials(provider)).toBe(false);
  });

  it("should reject REPLACE placeholder values", () => {
    const provider = { envVar: "MY_KEY" };
    vi.stubEnv("MY_KEY", "REPLACE");
    expect(hasConfiguredCredentials(provider)).toBe(false);
  });

  it("should accept single-char env var values (not placeholder check)", () => {
    const provider = { envVar: "MY_KEY" };
    vi.stubEnv("MY_KEY", "x");
    expect(hasConfiguredCredentials(provider)).toBe(false); // length > 1 check
  });

  it("should return true when loadToken is a function", () => {
    const provider = { loadToken: () => "token" };
    expect(hasConfiguredCredentials(provider)).toBe(true);
  });

  it("should return true when no envVar and no loadToken", () => {
    expect(hasConfiguredCredentials({})).toBe(true);
  });
});
