/**
 * Fake implementations for harness testing
 *
 * Following testing-strategy-anqr-1.0.md:
 * - Fakes implement ports, not convenience mocks
 * - Used for integration tests without real external dependencies
 */


// Fake HTTP client for bridge testing
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

// Fake provider failure simulator
export class FakeProviderFailureSimulator {
  private failures: Map<string, number> = new Map();
  private failureWindowMs: number;

  constructor(failureWindowSeconds: number = 360) {
    this.failureWindowMs = failureWindowSeconds * 1000;
  }

  recordFailure(providerName: string): void {
    this.failures.set(providerName, Date.now());
  }

  isFailed(providerName: string): boolean {
    const lastFailure = this.failures.get(providerName);
    if (!lastFailure) return false;
    return Date.now() - lastFailure < this.failureWindowMs;
  }

  clearFailures(): void {
    this.failures.clear();
  }

  clearProviderFailure(providerName: string): void {
    this.failures.delete(providerName);
  }
}

// Fake metrics collector
export class FakeMetricsCollector {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number): void {
    const existing = this.metrics.get(name) || [];
    existing.push(value);
    this.metrics.set(name, existing);
  }

  getMetrics(name: string): number[] {
    return this.metrics.get(name) || [];
  }

  getAverage(name: string): number {
    const values = this.getMetrics(name);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  getSum(name: string): number {
    const values = this.getMetrics(name);
    return values.reduce((a, b) => a + b, 0);
  }

  reset(): void {
    this.metrics.clear();
  }
}

// Fake queue state
export class FakeQueueState {
  private items: Array<{ id: string; status: string; priority: number }> = [];

  enqueue(item: { id: string; priority: number }): void {
    this.items.push({ ...item, status: "pending" });
    this.items.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): { id: string; status: string; priority: number } | undefined {
    return this.items.shift();
  }

  getItems(): Array<{ id: string; status: string; priority: number }> {
    return [...this.items];
  }

  getPendingCount(): number {
    return this.items.filter((i) => i.status === "pending").length;
  }

  complete(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.status = "completed";
    }
  }

  fail(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.status = "failed";
    }
  }

  clear(): void {
    this.items = [];
  }
}

// Factory function to create configured fakes
export function createHarnessFakes() {
  return {
    bridgeClient: new FakeBridgeClient({
      baseUrl: "http://127.0.0.1:4319/v1",
      apiKey: "local-symphony",
    }),
    codebuffClient: new FakeBridgeClient({
      baseUrl: "http://127.0.0.1:4318/v1",
      apiKey: "local-bridge",
    }),
    failureSimulator: new FakeProviderFailureSimulator(),
    metricsCollector: new FakeMetricsCollector(),
    queueState: new FakeQueueState(),
  };
}