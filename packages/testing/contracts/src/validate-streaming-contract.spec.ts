import { describe, it, expect } from "vitest";
import { validateStreamingContract } from "./validate-streaming-contract";

describe("validateStreamingContract", () => {
  it("should validate valid streaming chunks with [DONE] sentinel", () => {
    const chunks = [
      {
        id: "chatcmpl-123",
        object: "chat.completion.chunk",
        created: 1234567890,
        model: "test-model",
        choices: [
          {
            index: 0,
            delta: { role: "assistant", content: "Hello" },
            finish_reason: null,
          },
        ],
      },
      {
        id: "chatcmpl-123",
        object: "chat.completion.chunk",
        created: 1234567890,
        model: "test-model",
        choices: [
          {
            index: 0,
            delta: { content: " world" },
            finish_reason: null,
          },
        ],
      },
      "[DONE]",
    ];

    const result = validateStreamingContract(chunks);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.finalChunkFound).toBe(true);
  });

  it("should validate chunks without [DONE] sentinel", () => {
    const chunks = [
      {
        id: "chatcmpl-123",
        object: "chat.completion.chunk",
        created: 1234567890,
        model: "test-model",
        choices: [
          {
            index: 0,
            delta: { role: "assistant", content: "test" },
            finish_reason: null,
          },
        ],
      },
    ];

    const result = validateStreamingContract(chunks);
    expect(result.valid).toBe(true);
    expect(result.finalChunkFound).toBe(false);
  });

  it("should parse JSON string chunks", () => {
    const chunks = [
      JSON.stringify({
        id: "chatcmpl-123",
        object: "chat.completion.chunk",
        created: 1234567890,
        model: "test-model",
        choices: [
          {
            index: 0,
            delta: { role: "assistant", content: "test" },
            finish_reason: null,
          },
        ],
      }),
      "[DONE]",
    ];

    const result = validateStreamingContract(chunks);
    expect(result.valid).toBe(true);
    expect(result.finalChunkFound).toBe(true);
  });

  it("should reject invalid chunk schema", () => {
    const chunks = [
      {
        id: "chatcmpl-123",
        object: "invalid.type", // invalid object type
        created: 1234567890,
        model: "test-model",
        choices: [],
      },
    ];

    const result = validateStreamingContract(chunks);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("Chunk 0 validation failed");
  });

  it("should validate multiple chunks and identify which failed", () => {
    const chunks = [
      {
        id: "chatcmpl-123",
        object: "chat.completion.chunk",
        created: 1234567890,
        model: "test-model",
        choices: [
          {
            index: 0,
            delta: { role: "assistant", content: "valid" },
            finish_reason: null,
          },
        ],
      },
      {
        id: "chatcmpl-123",
        object: "invalid.type",
        created: 1234567890,
        model: "test-model",
        choices: [],
      },
    ];

    const result = validateStreamingContract(chunks);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Chunk 1 validation failed");
  });

  it("should handle empty chunks array", () => {
    const result = validateStreamingContract([]);
    expect(result.valid).toBe(true);
    expect(result.finalChunkFound).toBe(false);
  });

  it("should handle chunk with finish_reason set", () => {
    const chunks = [
      {
        id: "chatcmpl-123",
        object: "chat.completion.chunk",
        created: 1234567890,
        model: "test-model",
        choices: [
          {
            index: 0,
            delta: { content: "final" },
            finish_reason: "stop",
          },
        ],
      },
    ];

    const result = validateStreamingContract(chunks);
    expect(result.valid).toBe(true);
  });

  it("should handle chunk with optional delta fields", () => {
    const chunks = [
      {
        id: "chatcmpl-123",
        object: "chat.completion.chunk",
        created: 1234567890,
        model: "test-model",
        choices: [
          {
            index: 0,
            delta: {},
            finish_reason: null,
          },
        ],
      },
    ];

    const result = validateStreamingContract(chunks);
    expect(result.valid).toBe(true);
  });
});
