import { describe, it, expect } from "vitest";
import { validateContextCoherence } from "./symphony-bridge-truncation.mjs";

describe("validateContextCoherence", () => {
  it("should pass for valid conversation with system message and role alternation", () => {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
      { role: "user", content: "How are you?" },
    ];

    const result = validateContextCoherence(messages, "test-provider");

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("should warn when system message is missing", () => {
    const messages = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
    ];

    const result = validateContextCoherence(messages, "test-provider");

    expect(result.valid).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("No system message found");
  });

  it("should warn when role alternation is broken", () => {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello" },
      { role: "user", content: "Still here?" }, // Consecutive user messages
      { role: "assistant", content: "Yes!" },
    ];

    const result = validateContextCoherence(messages, "test-provider");

    expect(result.valid).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("Role alternation broken");
    expect(result.warnings[0]).toContain("consecutive user messages");
  });

  it("should warn when last message contains truncation marker", () => {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Response text\n... [truncated for context limits]" },
    ];

    const result = validateContextCoherence(messages, "test-provider");

    expect(result.valid).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("truncation marker");
    expect(result.warnings[0]).toContain("incomplete");
  });

  it("should allow multiple system messages without warning", () => {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "system", content: "Additional context." },
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi!" },
    ];

    const result = validateContextCoherence(messages, "test-provider");

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("should detect multiple coherence issues", () => {
    const messages = [
      { role: "user", content: "Hello" }, // No system message
      { role: "user", content: "Anyone there?" }, // Broken alternation
    ];

    const result = validateContextCoherence(messages, "test-provider");

    expect(result.valid).toBe(false);
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
  });

  it("should handle empty messages array gracefully", () => {
    const messages = [];

    const result = validateContextCoherence(messages, "test-provider");

    expect(result.valid).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("No system message found");
  });

  it("should pass for conversation ending with user message", () => {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
      { role: "user", content: "Tell me more" }, // Ends with user - valid
    ];

    const result = validateContextCoherence(messages, "test-provider");

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("should handle array content in messages", () => {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: [
          { type: "text", text: "Hello" },
          { type: "text", text: "World" },
        ],
      },
      { role: "assistant", content: "Hi!" },
    ];

    const result = validateContextCoherence(messages, "test-provider");

    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });
});
