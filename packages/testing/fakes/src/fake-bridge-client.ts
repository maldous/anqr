export class FakeBridgeClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(options: { baseUrl: string; apiKey: string }) {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
  }

  async getModels(): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/v1/models`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    return res.json();
  }

  async chatCompletion(request: {
    model?: string;
    messages: Array<{ role: string; content: string }>;
    stream?: boolean;
  }): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });
    return res.json();
  }

  async *streamChatCompletion(request: {
    model?: string;
    messages: Array<{ role: string; content: string }>;
  }): AsyncGenerator<string> {
    const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!res.body) {
      throw new Error("No response body");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return;
          }
          yield data;
        }
      }
    }
  }

  async health(): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/health`);
    return res.json();
  }

  async metrics(): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/v1/metrics`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    return res.json();
  }

  async stats(): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/v1/stats`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    return res.json();
  }
}
