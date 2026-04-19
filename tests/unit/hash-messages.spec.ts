import { describe, it, expect } from "vitest";

const { hashMessages } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/hash-messages.mjs"
);

describe("hashMessages", () => {
  it("returns a sha256-prefixed hash for a simple message array", () => {
    const result = hashMessages([{ role: "user", content: "hello" }]);
    expect(result).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("returns the same hash for identical inputs", () => {
    const messages = [
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi there" },
    ];
    const a = hashMessages(messages);
    const b = hashMessages(messages);
    expect(a).toBe(b);
  });

  it("returns different hashes for different inputs", () => {
    const a = hashMessages([{ role: "user", content: "hello" }]);
    const b = hashMessages([{ role: "user", content: "goodbye" }]);
    expect(a).not.toBe(b);
  });

  it("returns a hash for an empty array", () => {
    const result = hashMessages([]);
    expect(result).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("handles nested objects in messages", () => {
    const result = hashMessages([
      {
        role: "assistant",
        content: [
          { type: "text", text: "hello" },
          { type: "image_url", url: "https://example.com/img.png" },
        ],
      },
    ]);
    expect(result).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("hash is deterministic across calls with same structure", () => {
    const msgs1 = [{ role: "user", content: "test" }];
    const msgs2 = [{ role: "user", content: "test" }];
    expect(hashMessages(msgs1)).toBe(hashMessages(msgs2));
  });

  it("order matters — different order produces different hash", () => {
    const a = hashMessages([
      { role: "user", content: "first" },
      { role: "user", content: "second" },
    ]);
    const b = hashMessages([
      { role: "user", content: "second" },
      { role: "user", content: "first" },
    ]);
    expect(a).not.toBe(b);
  });
});
