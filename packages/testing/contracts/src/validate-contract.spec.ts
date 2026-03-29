import { describe, it, expect } from "vitest";
import { validateContract } from "./validate-contract";

describe("validateContract", () => {
  it("should validate valid request and response", () => {
    const request = {
      model: "test-model",
      messages: [{ role: "user", content: "test" }],
    };

    const response = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1234567890,
      model: "test-model",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "response" },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
    };

    const result = validateContract(request, response);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject invalid request", () => {
    const request = {
      model: "test-model",
      messages: [{ role: "invalid", content: "test" }], // invalid role
    };

    const response = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1234567890,
      model: "test-model",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "response" },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
    };

    const result = validateContract(request, response);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("Request validation failed");
  });

  it("should reject invalid response", () => {
    const request = {
      model: "test-model",
      messages: [{ role: "user", content: "test" }],
    };

    const response = {
      id: "chatcmpl-123",
      object: "invalid.type", // invalid object type
      created: 1234567890,
      model: "test-model",
      choices: [],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    };

    const result = validateContract(request, response);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("Response validation failed");
  });

  it("should accept optional request fields", () => {
    const request = {
      model: "test-model",
      messages: [{ role: "user", content: "test" }],
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 100,
      stream: false,
    };

    const response = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1234567890,
      model: "test-model",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "response" },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
    };

    const result = validateContract(request, response);
    expect(result.valid).toBe(true);
  });

  it("should accept symphony-specific response extensions", () => {
    const request = {
      model: "test-model",
      messages: [{ role: "user", content: "test" }],
    };

    const response = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1234567890,
      model: "test-model",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "response" },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
      _symphony_provider: "codex",
      _symphony_attempts: 1,
      _symphony_tried: ["codex"],
      _symphony_duration_ms: 1500,
    };

    const result = validateContract(request, response);
    expect(result.valid).toBe(true);
  });

  it("should reject both invalid request and response", () => {
    const request = { invalid: "request" };
    const response = { invalid: "response" };

    const result = validateContract(request, response);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toContain("Request validation failed");
    expect(result.errors[1]).toContain("Response validation failed");
  });
});
