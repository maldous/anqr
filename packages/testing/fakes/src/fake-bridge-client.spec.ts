import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { FakeBridgeClient } from "./fake-bridge-client";

describe("FakeBridgeClient", () => {
  let client: FakeBridgeClient;
  const mockBaseUrl = "http://localhost:4319/v1";
  const mockApiKey = "test-key";

  beforeEach(() => {
    client = new FakeBridgeClient({
      baseUrl: mockBaseUrl,
      apiKey: mockApiKey,
    });
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getModels", () => {
    it("should fetch models with correct auth header", async () => {
      const mockResponse = { object: "list", data: [] };
      (global.fetch as any).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await client.getModels();

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/v1/models`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockApiKey}` },
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("chatCompletion", () => {
    it("should send chat completion request", async () => {
      const mockResponse = { id: "chatcmpl-123", object: "chat.completion" };
      (global.fetch as any).mockResolvedValue({
        json: async () => mockResponse,
      });

      const request = {
        model: "test-model",
        messages: [{ role: "user", content: "test" }],
      };

      const result = await client.chatCompletion(request);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/v1/chat/completions`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockApiKey}`,
          },
          body: JSON.stringify(request),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle streaming parameter", async () => {
      const mockResponse = { id: "chatcmpl-123" };
      (global.fetch as any).mockResolvedValue({
        json: async () => mockResponse,
      });

      const request = {
        messages: [{ role: "user", content: "test" }],
        stream: true,
      };

      await client.chatCompletion(request);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(request),
        }),
      );
    });
  });

  describe("health", () => {
    it("should fetch health endpoint", async () => {
      const mockResponse = { status: "healthy", model: "test" };
      (global.fetch as any).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await client.health();

      expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/health`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("metrics", () => {
    it("should fetch metrics with auth", async () => {
      const mockResponse = { bridge: {}, creditGate: {} };
      (global.fetch as any).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await client.metrics();

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/v1/metrics`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockApiKey}` },
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("stats", () => {
    it("should fetch stats with auth", async () => {
      const mockResponse = { rankedProviders: [], providerStats: {} };
      (global.fetch as any).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await client.stats();

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/v1/stats`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockApiKey}` },
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("streamChatCompletion", () => {
    it("should yield data chunks and stop at [DONE] sentinel", async () => {
      // Simulate SSE chunks
      const chunks = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
        "data: [DONE]\n",
      ];

      const stream = new ReadableStream({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        },
      });

      (global.fetch as any).mockResolvedValue({ body: stream });

      const request = {
        messages: [{ role: "user", content: "test" }],
      };

      const results: string[] = [];
      for await (const chunk of client.streamChatCompletion(request)) {
        results.push(chunk);
      }

      expect(results).toEqual([
        '{"choices":[{"delta":{"content":"Hello"}}]}',
        '{"choices":[{"delta":{"content":" world"}}]}',
      ]);

      // Verify fetch called with stream=true
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/v1/chat/completions`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockApiKey}`,
          },
          body: JSON.stringify({ ...request, stream: true }),
        }),
      );
    });

    it("should throw if response body is null", async () => {
      (global.fetch as any).mockResolvedValue({ body: null });

      const request = {
        messages: [{ role: "user", content: "test" }],
      };

      const iterator = client.streamChatCompletion(request);
      await expect(iterator.next()).rejects.toThrow("No response body");
    });

    it("should handle stream ending without [DONE] sentinel", async () => {
      const chunks = [
        'data: {"choices":[{"delta":{"content":"chunk1"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":"chunk2"}}]}\n\n',
      ];

      const stream = new ReadableStream({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close(); // Close without sending [DONE]
        },
      });

      (global.fetch as any).mockResolvedValue({ body: stream });

      const request = { messages: [{ role: "user", content: "test" }] };
      const results: string[] = [];

      for await (const chunk of client.streamChatCompletion(request)) {
        results.push(chunk);
      }

      expect(results).toEqual([
        '{"choices":[{"delta":{"content":"chunk1"}}]}',
        '{"choices":[{"delta":{"content":"chunk2"}}]}',
      ]);
    });

    it("should ignore lines not starting with 'data: '", async () => {
      const chunks = [
        "event: message\n", // should be ignored
        'data: {"test":1}\n\n',
        ": keep-alive\n", // should be ignored
        "data: [DONE]\n",
      ];

      const stream = new ReadableStream({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        },
      });

      (global.fetch as any).mockResolvedValue({ body: stream });

      const request = { messages: [{ role: "user", content: "test" }] };
      const results: string[] = [];

      for await (const chunk of client.streamChatCompletion(request)) {
        results.push(chunk);
      }

      expect(results).toEqual(['{"test":1}']);
    });

    it("should handle empty chunks gracefully", async () => {
      const chunks = ["\n\n", "data: {}\n\n"];

      const stream = new ReadableStream({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        },
      });

      (global.fetch as any).mockResolvedValue({ body: stream });

      const request = { messages: [{ role: "user", content: "test" }] };
      const results: string[] = [];

      for await (const chunk of client.streamChatCompletion(request)) {
        results.push(chunk);
      }

      expect(results).toEqual(["{}"]);
    });
  });
});
