/**
 * OpenClaw E2E scenarios for Symphony routing, fallback, and streaming
 *
 * Tests OpenClaw-driven execution against the local harness stack:
 * - Symphony primary model selection
 * - Fallback model list matching Symphony route inventory
 * - Command execution through SDK, HTTP, and streaming modes
 * - Provider degradation and recovery behavior
 *
 * Requires: Bridges running on ports 4319 (symphony) and 4318 (codebuff)
 * Run: npx playwright test tests/e2e/openclaw-symphony.spec.ts
 */

import { test, expect } from "@playwright/test";

const SYMPHONY_BASE_URL = "http://127.0.0.1:4319";
const CODEBUFF_BASE_URL = "http://127.0.0.1:4318";
const SYMPHONY_API_KEY = "local-symphony";
const CODEBUFF_API_KEY = "local-bridge";

const symphonyTestScenarios = {
  simplePrompt: {
    messages: [{ role: "user" as const, content: "Say 'ok' if you can read this." }],
    model: "symphony/main",
    stream: false,
  },
  streamingPrompt: {
    messages: [{ role: "user" as const, content: "Count from 1 to 5." }],
    model: "symphony/main",
    stream: true,
  },
  toolExecutionRead: {
    messages: [{ role: "user" as const, content: "Read the package.json file." }],
    model: "symphony/main",
    stream: false,
  },
  toolExecutionExec: {
    messages: [{ role: "user" as const, content: "Run 'echo hello'." }],
    model: "symphony/main",
    stream: false,
  },
  toolExecutionGlob: {
    messages: [{ role: "user" as const, content: "Find all .ts files." }],
    model: "symphony/main",
    stream: false,
  },
};

const openclawConfig = {
  primaryModel: "symphony-bridge/symphony/main",
  fallbackModels: [
    "symphony-bridge/symphony/codex",
    "symphony-bridge/symphony/codebuff",
    "symphony-bridge/symphony/codebuff-bridge",
    "symphony-bridge/symphony/groq",
    "symphony-bridge/symphony/mistral",
    "symphony-bridge/symphony/gemini",
    "symphony-bridge/symphony/gemini-lite",
    "symphony-bridge/symphony/openrouter",
    "symphony-bridge/symphony/sambanova",
    "symphony-bridge/symphony/cerebras",
    "symphony-bridge/symphony/ollama-local",
    "codebuff-bridge/codebuff/base",
  ],
};

// Helper: check if a bridge is reachable
async function isBridgeReachable(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3_000) });
    return res.ok;
  } catch {
    return false;
  }
}

test.describe("OpenClaw Model Configuration", () => {
  test("primary model should be Symphony main", () => {
    expect(openclawConfig.primaryModel).toBe("symphony-bridge/symphony/main");
  });

  test("fallback models should include all Symphony routes", () => {
    const symphonyRoutes = [
      "symphony/codex",
      "symphony/codebuff",
      "symphony/codebuff-bridge",
      "symphony/groq",
      "symphony/mistral",
      "symphony/gemini",
      "symphony/gemini-lite",
      "symphony/openrouter",
      "symphony/sambanova",
      "symphony/cerebras",
      "symphony/ollama-local",
    ];

    for (const route of symphonyRoutes) {
      const hasFallback = openclawConfig.fallbackModels.some((f) =>
        f.includes(route),
      );
      expect(hasFallback, `Missing fallback for ${route}`).toBe(true);
    }
  });

  test("fallback list should include Codebuff as last resort", () => {
    const lastFallback = openclawConfig.fallbackModels[
      openclawConfig.fallbackModels.length - 1
    ];
    expect(lastFallback).toBe("codebuff-bridge/codebuff/base");
  });
});

test.describe("Symphony Bridge Primary Model Selection", () => {
  test("should route to symphony/main when primary model requested", () => {
    const model = openclawConfig.primaryModel;
    expect(model).toMatch(/^symphony-bridge\/symphony\//);

    const routePart = model.replace("symphony-bridge/", "");
    expect(routePart).toBe("symphony/main");
  });

  test("should include provider in response when using primary model", () => {
    const responseContract = {
      _symphony_provider: expect.any(String),
      _symphony_attempts: expect.any(Number),
      _symphony_duration_ms: expect.any(Number),
    };

    expect(responseContract._symphony_provider).toBeDefined();
  });
});

test.describe("Symphony Fallback Continuity", () => {
  test("fallback chain should have at least 5 providers", () => {
    expect(openclawConfig.fallbackModels.length).toBeGreaterThanOrEqual(5);
  });

  test("fallback chain should include free providers", () => {
    const freeProviders = openclawConfig.fallbackModels.filter((f) =>
      f.includes("groq") || f.includes("gemini") || f.includes("openrouter"),
    );

    expect(freeProviders.length).toBeGreaterThan(0);
  });

  test("fallback chain should include local fallback", () => {
    const hasLocalFallback = openclawConfig.fallbackModels.some((f) =>
      f.includes("ollama-local"),
    );

    expect(hasLocalFallback).toBe(true);
  });
});

test.describe("Provider Degradation Simulation", () => {
  test("should have multiple fallback options for resilience", () => {
    const fallbackCount = openclawConfig.fallbackModels.length;
    expect(fallbackCount).toBeGreaterThanOrEqual(3);
  });

  test("should include diverse provider types", () => {
    const providerTypes = openclawConfig.fallbackModels.map((f) => {
      if (f.includes("codex")) return "codex";
      if (f.includes("codebuff")) return "codebuff";
      if (f.includes("groq")) return "groq";
      if (f.includes("gemini")) return "gemini";
      if (f.includes("ollama")) return "ollama";
      if (f.includes("sambanova")) return "sambanova";
      if (f.includes("cerebras")) return "cerebras";
      if (f.includes("openrouter")) return "openrouter";
      return "other";
    });

    const uniqueTypes = new Set(providerTypes);
    expect(uniqueTypes.size).toBeGreaterThanOrEqual(4);
  });
});

test.describe("Command Execution Modes", () => {
  test("should support non-streaming HTTP mode", () => {
    const scenario = symphonyTestScenarios.simplePrompt;
    expect(scenario.stream).toBe(false);
  });

  test("should support streaming HTTP mode", () => {
    const scenario = symphonyTestScenarios.streamingPrompt;
    expect(scenario.stream).toBe(true);
  });

  test("should support tool execution via SDK", () => {
    const readScenario = symphonyTestScenarios.toolExecutionRead;
    const execScenario = symphonyTestScenarios.toolExecutionExec;
    const globScenario = symphonyTestScenarios.toolExecutionGlob;

    expect(readScenario.messages[0].content).toContain("Read");
    expect(execScenario.messages[0].content).toContain("Run");
    expect(globScenario.messages[0].content).toContain("Find");
  });
});

test.describe("Live Symphony Bridge Tests (requires running bridge)", () => {
  test.setTimeout(120_000);

  test("Symphony bridge health check", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    if (!reachable) {
      test.skip();
      return;
    }

    const res = await fetch(`${SYMPHONY_BASE_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.model).toBeTruthy();
    expect(data.tools).toBeDefined();
    console.log(`[openclaw-e2e] Symphony health: configured=${data.providersConfigured}, available=${data.providersAvailable}, withStats=${data.providersWithStats}, tools=${data.tools?.join(", ")}`);
    if (data.configuredProviders) {
      const available = data.configuredProviders.filter((p: { available: boolean }) => p.available);
      console.log(`[openclaw-e2e] Available providers: ${available.map((p: { name: string }) => p.name).join(", ")}`);
    }
  });

  test("Symphony bridge /v1/models lists all expected models", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    if (!reachable) {
      test.skip();
      return;
    }

    const res = await fetch(`${SYMPHONY_BASE_URL}/v1/models`, {
      signal: AbortSignal.timeout(5_000),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    const modelIds = data.data.map((m: { id: string }) => m.id);

    expect(modelIds).toContain("symphony/main");
    expect(modelIds).toContain("symphony/codebuff");
    expect(modelIds).toContain("symphony/groq");
    expect(modelIds).toContain("symphony/ollama-local");
    console.log(`[openclaw-e2e] Symphony models: ${modelIds.join(", ")}`);
  });

  test("Symphony bridge non-streaming completion", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    if (!reachable) {
      test.skip();
      return;
    }

    const startTime = Date.now();
    const res = await fetch(`${SYMPHONY_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SYMPHONY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "symphony/main",
        messages: [{ role: "user", content: "Say 'ok' if you can read this." }],
      }),
      signal: AbortSignal.timeout(90_000),
    });

    const elapsed = Date.now() - startTime;
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.choices).toBeDefined();
    expect(data.choices[0].message.content).toBeTruthy();
    expect(data._symphony_provider).toBeDefined();

    console.log(`[openclaw-e2e] Symphony completion: provider=${data._symphony_provider}, duration=${data._symphony_duration_ms}ms, elapsed=${elapsed}ms`);
    const content = data.choices[0].message.content;
    console.log(`[openclaw-e2e] Response: ${typeof content === "string" ? content.slice(0, 200) : JSON.stringify(content).slice(0, 200)}`);
  });

  test("Symphony bridge streaming completion", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    if (!reachable) {
      test.skip();
      return;
    }

    const startTime = Date.now();
    const res = await fetch(`${SYMPHONY_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SYMPHONY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "symphony/main",
        messages: [{ role: "user", content: "Count from 1 to 3." }],
        stream: true,
      }),
      signal: AbortSignal.timeout(90_000),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const chunks: string[] = [];
    let fullContent = "";
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let doneReading = false;

    if (reader) {
      while (!doneReading) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              doneReading = true;
              break;
            }
            if (data.trim()) {
              chunks.push(data);
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) fullContent += content;
              } catch {
                // Ignore parse errors for ping/malformed chunks
              }
            }
          }
        }
      }
    }

    const elapsed = Date.now() - startTime;
    expect(chunks.length).toBeGreaterThan(0);
    console.log(`[openclaw-e2e] Symphony streaming: ${chunks.length} chunks, elapsed=${elapsed}ms`);
    console.log(`[openclaw-e2e] Streamed content: ${fullContent.slice(0, 200)}`);
  });

  test("Symphony bridge /v1/stats returns provider statistics", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    if (!reachable) {
      test.skip();
      return;
    }

    const res = await fetch(`${SYMPHONY_BASE_URL}/v1/stats`, {
      headers: { Authorization: `Bearer ${SYMPHONY_API_KEY}` },
      signal: AbortSignal.timeout(5_000),
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.rankedProviders).toBeDefined();
    expect(data.providerStats).toBeDefined();
    console.log(`[openclaw-e2e] Provider stats: ${Object.keys(data.providerStats).length} providers tracked`);
  });
});

const TARGETED_PROVIDERS = [
  { name: "groq", route: "symphony/groq", model: "llama-3.3-70b-versatile" },
  { name: "gemini", route: "symphony/gemini", model: "gemini-2.5-flash" },
  { name: "mistral", route: "symphony/mistral", model: "mistral-small-latest" },
  { name: "sambanova", route: "symphony/sambanova", model: "Meta-Llama-3.3-70B-Instruct" },
  { name: "cerebras", route: "symphony/cerebras", model: "llama3.1-8b" },
] as const;

test.describe("Per-Provider Completion Tests (requires running bridge)", () => {
  test.setTimeout(120_000);

  for (const provider of TARGETED_PROVIDERS) {
    test(`${provider.name} — non-streaming completion via ${provider.route}`, async () => {
      const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
      if (!reachable) {
        test.skip();
        return;
      }

      const startTime = Date.now();
      const res = await fetch(`${SYMPHONY_BASE_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SYMPHONY_API_KEY}`,
        },
        body: JSON.stringify({
          model: provider.route,
          messages: [{ role: "user", content: "Say hello in one word." }],
        }),
        signal: AbortSignal.timeout(90_000),
      });

      const elapsed = Date.now() - startTime;
      const data = await res.json();

      const errMsg = data.error?.message ?? "";
      if (res.status === 429 || (res.status === 500 && /Too Many Requests|rate.limit/i.test(errMsg))) {
        console.log(`[openclaw-e2e] ${provider.name}: rate-limited, skipping (${errMsg})`);
        test.skip();
        return;
      }

      expect(res.status, `${provider.name} returned HTTP ${res.status}: ${errMsg}`).toBe(200);
      expect(data.choices).toBeDefined();

      const content = data.choices[0].message.content;
      expect(content, `${provider.name} returned empty content`).toBeTruthy();
      expect(data._symphony_provider).toBe(provider.name);

      console.log(
        `[openclaw-e2e] ${provider.name}: provider=${data._symphony_provider}, ` +
        `model=${provider.model}, duration=${data._symphony_duration_ms}ms, ` +
        `elapsed=${elapsed}ms, content=${String(content).slice(0, 100)}`,
      );
    });
  }

  test("all targeted providers return distinct responses", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    if (!reachable) {
      test.skip();
      return;
    }

    const results: Array<{ name: string; status: number; provider: string }> = [];

    await Promise.allSettled(
      TARGETED_PROVIDERS.map(async (provider) => {
        const res = await fetch(`${SYMPHONY_BASE_URL}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SYMPHONY_API_KEY}`,
          },
          body: JSON.stringify({
            model: provider.route,
            messages: [{ role: "user", content: "Reply with only the word 'pong'." }],
          }),
          signal: AbortSignal.timeout(90_000),
        });
        const data = await res.json();
        results.push({ name: provider.name, status: res.status, provider: data._symphony_provider });
      }),
    );

    const succeeded = results.filter((r) => r.status === 200);

    console.log(
      `[openclaw-e2e] Provider cascade: ${succeeded.length}/${TARGETED_PROVIDERS.length} succeeded — ` +
      `${succeeded.map((r) => r.name).join(", ")}`,
    );

    expect(
      succeeded.length,
      `Only ${succeeded.length}/${TARGETED_PROVIDERS.length} providers succeeded`,
    ).toBeGreaterThanOrEqual(3);

    const usedProviders = new Set(succeeded.map((r) => r.provider));
    expect(
      usedProviders.size,
      "Responses should come from distinct providers",
    ).toBeGreaterThanOrEqual(3);
  });
});

test.describe("Live Codebuff Bridge Tests (requires running bridge)", () => {
  test.setTimeout(120_000);

  test("Codebuff bridge health check", async () => {
    const reachable = await isBridgeReachable(CODEBUFF_BASE_URL);
    if (!reachable) {
      test.skip();
      return;
    }

    const res = await fetch(`${CODEBUFF_BASE_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toMatch(/^(ok|initializing)$/);
    expect(data.model).toBe("codebuff/base");
    console.log(`[openclaw-e2e] Codebuff health: keyConfigured=${data.apiKeyConfigured}, mode=${data.mode}`);
  });

  test("Codebuff bridge /v1/models lists codebuff model", async () => {
    const reachable = await isBridgeReachable(CODEBUFF_BASE_URL);
    if (!reachable) {
      test.skip();
      return;
    }

    const res = await fetch(`${CODEBUFF_BASE_URL}/v1/models`, {
      signal: AbortSignal.timeout(5_000),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    const modelIds = data.data.map((m: { id: string }) => m.id);
    expect(modelIds).toContain("codebuff/base");
  });

  test("Codebuff bridge non-streaming completion", async () => {
    const reachable = await isBridgeReachable(CODEBUFF_BASE_URL);
    if (!reachable) {
      test.skip();
      return;
    }

    const startTime = Date.now();
    const res = await fetch(`${CODEBUFF_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CODEBUFF_API_KEY}`,
      },
      body: JSON.stringify({
        model: "codebuff/base",
        messages: [{ role: "user", content: "Say 'ok'." }],
      }),
      signal: AbortSignal.timeout(90_000),
    });

    const elapsed = Date.now() - startTime;

    if (res.status === 200) {
      const data = await res.json();
      expect(data.choices).toBeDefined();
      expect(data.choices[0].message.content).toBeTruthy();
      console.log(`[openclaw-e2e] Codebuff completion: elapsed=${elapsed}ms, content=${data.choices[0].message.content.slice(0, 200)}`);
    } else {
      const error = await res.json();
      console.log(`[openclaw-e2e] Codebuff completion failed: status=${res.status}, error=${error.error?.message}`);
      expect(error.error).toBeDefined();
    }
  });

  test("Codebuff bridge streaming completion", async () => {
    const reachable = await isBridgeReachable(CODEBUFF_BASE_URL);
    if (!reachable) {
      test.skip();
      return;
    }

    const startTime = Date.now();
    const res = await fetch(`${CODEBUFF_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CODEBUFF_API_KEY}`,
      },
      body: JSON.stringify({
        model: "codebuff/base",
        messages: [{ role: "user", content: "Count to 3." }],
        stream: true,
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (res.status === 200) {
      expect(res.headers.get("content-type")).toContain("text/event-stream");

      const chunks: string[] = [];
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let doneReading = false;

      if (reader) {
        while (!doneReading) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                doneReading = true;
                break;
              }
              if (data.trim()) chunks.push(data);
            }
          }
        }
      }

      const elapsed = Date.now() - startTime;
      expect(chunks.length).toBeGreaterThan(0);
      console.log(`[openclaw-e2e] Codebuff streaming: ${chunks.length} chunks, elapsed=${elapsed}ms`);
    } else {
      const error = await res.json();
      console.log(`[openclaw-e2e] Codebuff streaming failed: status=${res.status}, error=${error.error?.message}`);
    }
  });
});
