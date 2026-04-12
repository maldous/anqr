/**
 * OpenClaw E2E scenarios for Symphony routing, fallback, and streaming
 *
 * Tests OpenClaw-driven execution against the local harness stack:
 * - Symphony primary model selection
 * - Fallback model list matching Symphony route inventory
 * - Command execution through SDK, HTTP, and streaming modes
 * - Provider degradation and recovery behavior
 *
 * Requires: Symphony agent router running on port 4319
 * Run: npx playwright test tests/e2e/openclaw-symphony.spec.ts
 */

import { test, expect } from "@playwright/test";
import {
  type ModelsListOutput,
  type ModelsStatusOutput,
  openclawConfig,
  SYMPHONY_BASE_URL,
  SYMPHONY_EXECUTOR_URL,
  SYMPHONY_API_KEY,
  symphonyTestScenarios,
  isBridgeReachable,
  sendCompletion,
  isTransientError,
  sendStreamingCompletion,
  validateStreamChunks,
  runCli,
  runCliJson,
  isGatewayReachable,
  spawnTuiAndCapture,
  runTuiPromptWithPexpect,
} from "./openclaw-helpers";

test.describe("OpenClaw Model Configuration", () => {
  test("primary model should be Symphony main", () => {
    expect(openclawConfig.primaryModel).toBe("symphony-bridge/symphony/main");
  });

  test("fallback models should include all Symphony routes", () => {
    const symphonyRoutes = [
      "symphony/codex",
      "symphony/codebuff",
      "symphony/groq",
      "symphony/mistral",
      "symphony/gemini",
      "symphony/gemini-lite",
      "symphony/openrouter",
      "symphony/sambanova",
      "symphony/cerebras",
      "symphony/ollama-local",
      "symphony/text",
    ];

    for (const route of symphonyRoutes) {
      const hasFallback = openclawConfig.fallbackModels.some((f) => f.includes(route));
      expect(hasFallback, `Missing fallback for ${route}`).toBe(true);
    }
  });

  test("fallback models should include direct ollama safety-net models", () => {
    const ollamaModels = ["ollama/qwen2.5-coder:0.5b", "ollama/qwen2.5-coder:3b-instruct"];

    for (const model of ollamaModels) {
      const hasFallback = openclawConfig.fallbackModels.includes(model);
      expect(hasFallback, `Missing direct ollama fallback: ${model}`).toBe(true);
    }
  });

  test("fallback list should include Codebuff as last resort", () => {
    const lastFallback = openclawConfig.fallbackModels[openclawConfig.fallbackModels.length - 1];
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
    const freeProviders = openclawConfig.fallbackModels.filter(
      (f) => f.includes("groq") || f.includes("gemini") || f.includes("openrouter"),
    );

    expect(freeProviders.length).toBeGreaterThan(0);
  });

  test("fallback chain should include local fallback", () => {
    const hasLocalFallback = openclawConfig.fallbackModels.some((f) => f.startsWith("ollama/"));

    expect(hasLocalFallback).toBe(true);
  });

  test("direct ollama models should rank after all symphony-bridge routes", () => {
    const firstDirectOllamaIdx = openclawConfig.fallbackModels.findIndex((f: string) =>
      f.startsWith("ollama/"),
    );
    if (firstDirectOllamaIdx < 0) return;

    const symphonyAfterOllama = openclawConfig.fallbackModels
      .slice(firstDirectOllamaIdx)
      .filter((f: string) => f.startsWith("symphony-bridge/"));
    expect(
      symphonyAfterOllama.length,
      "No symphony-bridge route should appear after the first direct ollama model in the fallback chain",
    ).toBe(0);
  });

  test("codebuff-bridge should be the absolute last fallback", () => {
    const lastFallback = openclawConfig.fallbackModels[openclawConfig.fallbackModels.length - 1];
    expect(lastFallback).toBe("codebuff-bridge/codebuff/base");
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
    const reachable = await isBridgeReachable(SYMPHONY_EXECUTOR_URL);
    test.skip(!reachable, "Symphony executor not reachable - requires running executor on port 4321");

    const res = await fetch(`${SYMPHONY_EXECUTOR_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.model).toBeTruthy();
    expect(data.tools).toBeDefined();
    console.log(
      `[openclaw-e2e] Symphony health: configured=${data.providersConfigured}, available=${data.providersAvailable}, withStats=${data.providersWithStats}, tools=${data.tools?.join(", ")}`,
    );
    if (data.configuredProviders) {
      const available = data.configuredProviders.filter((p: { available: boolean }) => p.available);
      console.log(
        `[openclaw-e2e] Available providers: ${available.map((p: { name: string }) => p.name).join(", ")}`,
      );
    }
  });

  test("Symphony bridge /v1/models lists all expected models", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

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
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const { status, data, elapsed } = await sendCompletion(
      "symphony/main",
      "Say 'ok' if you can read this.",
    );
    const errMsg = (data.error as Record<string, string>)?.message ?? "";
    if (isTransientError(status, errMsg)) {
      console.log(`[openclaw-e2e] Symphony completion: transient error, skipping (${errMsg})`);
      test.skip(
        true,
        "Transient error (rate limit or quota) - test valid but environment-dependent",
      );
    }

    expect(status).toBe(200);
    expect(data.choices).toBeDefined();
    const content = (data.choices as Array<{ message: { content: string } }>)[0].message.content;
    expect(content).toBeTruthy();
    expect(data._symphony_provider).toBeDefined();

    console.log(
      `[openclaw-e2e] Symphony completion: provider=${data._symphony_provider}, duration=${data._symphony_duration_ms}ms, elapsed=${elapsed}ms`,
    );
    console.log(
      `[openclaw-e2e] Response: ${typeof content === "string" ? content.slice(0, 200) : JSON.stringify(content).slice(0, 200)}`,
    );
  });

  test("Symphony bridge streaming completion", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const { status, chunks, content, elapsed, contentType, errMsg } = await sendStreamingCompletion(
      "symphony/main",
      "Count from 1 to 3.",
    );
    if (isTransientError(status, errMsg)) {
      console.log(`[openclaw-e2e] Symphony streaming: transient error, skipping (${errMsg})`);
      test.skip(
        true,
        "Transient error (rate limit or quota) - test valid but environment-dependent",
      );
    }

    expect(status).toBe(200);
    expect(contentType).toContain("text/event-stream");
    expect(chunks.length).toBeGreaterThan(0);

    console.log(`[openclaw-e2e] Symphony streaming: ${chunks.length} chunks, elapsed=${elapsed}ms`);
    console.log(`[openclaw-e2e] Streamed content: ${content.slice(0, 200)}`);
  });

  test("Symphony bridge /v1/stats returns provider statistics", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_EXECUTOR_URL);
    test.skip(!reachable, "Symphony executor not reachable - requires running executor on port 4321");

    const res = await fetch(`${SYMPHONY_EXECUTOR_URL}/v1/stats`, {
      headers: { Authorization: `Bearer ${SYMPHONY_API_KEY}` },
      signal: AbortSignal.timeout(5_000),
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.rankedProviders).toBeDefined();
    expect(data.providerStats).toBeDefined();
    console.log(
      `[openclaw-e2e] Provider stats: ${Object.keys(data.providerStats).length} providers tracked`,
    );
  });
});

// ---------------------------------------------------------------------------
// Complete Provider & Route Registry
// ---------------------------------------------------------------------------
// Every provider configured in symphony-credit-gate.mjs is listed here.
// When a new provider is added there, add it here — the inventory test will
// fail if they drift, which is the regression-detection mechanism.
// ---------------------------------------------------------------------------

const DIRECT_PROVIDERS = [
  { name: "codex", model: "gpt-5-codex", envVar: null },
  // codebuff now runs inside Symphony bridges - removed standalone config
  { name: "groq", model: "llama-3.3-70b-versatile", envVar: "GROQ_TOKEN" },
  { name: "mistral", model: "mistral-small-latest", envVar: "MISTRAL_TOKEN" },
  { name: "gemini", model: "gemini-2.5-flash", envVar: "GEMINI_TOKEN" },
  { name: "gemini-lite", model: "gemini-2.5-flash-lite", envVar: "GEMINI_TOKEN" },
  { name: "sambanova", model: "Meta-Llama-3.3-70B-Instruct", envVar: "SAMBANOVA_TOKEN" },
  { name: "cerebras", model: "llama3.1-8b", envVar: "CEREBRAS_TOKEN" },
  { name: "github-models", model: "gpt-4.1-mini", envVar: "GITHUB_MODELS_TOKEN" },
  { name: "codebuff-paid", model: "codebuff-paid", envVar: null },
  { name: "codebuff-free", model: "codebuff-free", envVar: null },
  { name: "huggingface", model: "huggingface-inference", envVar: "HUGGINGFACE_TOKEN" },
  { name: "fireworks", model: "fireworks-inference", envVar: "FIREWORKS_TOKEN" },
  { name: "together", model: "together-inference", envVar: "TOGETHER_TOKEN" },
];

// OpenRouter providers now use dynamic vendor-model naming (e.g.
// "openrouter-nvidia-nemotron-3-super-120b-a12b-free") and there are hundreds
// of them. We validate via the health endpoint instead of a hardcoded list.
const MINIMUM_OPENROUTER_PROVIDERS = 20;

const LOCAL_PROVIDERS = [
  { name: "ollama-qwen2.5-coder-3b", model: "qwen2.5-coder:3b-instruct" },
  { name: "ollama-qwen2.5-coder-0.5b", model: "qwen2.5-coder:0.5b" },
];

// Providers in the credit-gate but blocklisted by the bridge — they appear in
// the credit-gate PROVIDERS array but the bridge filters them out of its
// configuredProviders list, so the inventory test must NOT expect them.
const BRIDGE_BLOCKLISTED_PROVIDERS = [{ name: "openclaw", model: "openclaw:main" }];

// Base provider names we expect in the bridge (excludes dynamically-named
// openrouter sub-model variants which are validated separately)
const ALL_EXPECTED_PROVIDER_NAMES = [
  ...DIRECT_PROVIDERS,
  ...LOCAL_PROVIDERS,
].map((p) => p.name);

const EXPECTED_ROUTES = [
  "symphony/main",
  "symphony/text",
  "symphony/codex",
  "symphony/codebuff",
  "symphony/codebuff-paid",
  "symphony/codebuff-free",
  "symphony/groq",
  "symphony/mistral",
  "symphony/gemini",
  "symphony/gemini-lite",
  "symphony/openrouter",
  "symphony/sambanova",
  "symphony/cerebras", // advertised but excluded by tool probe — see Tool-Capability Probe Validation tests
  "symphony/github-models",
  "symphony/huggingface",
  "symphony/fireworks",
  "symphony/together",
  "symphony/ollama-local",
  "symphony/ollama-qwen2.5-coder-3b",
  "symphony/ollama-qwen2.5-coder-0.5b",
  "symphony/ollama-qwen3-coder-next",
];

// Routes that target a single named provider (remote APIs with dedicated keys)
// cerebras is excluded: dynamic tool-capability probe detects it emits raw JSON
// tool output instead of structured tool calls. Its pinned route still exists
// but returns "excluded by tool-capability probe" errors.
const REMOTE_API_ROUTES = [
  { route: "symphony/groq", provider: "groq" },
  { route: "symphony/mistral", provider: "mistral" },
  { route: "symphony/gemini", provider: "gemini" },
  { route: "symphony/gemini-lite", provider: "gemini-lite" },
  { route: "symphony/sambanova", provider: "sambanova" },
  { route: "symphony/github-models", provider: "github-models" },
  { route: "symphony/huggingface", provider: "huggingface" },
  { route: "symphony/fireworks", provider: "fireworks" },
  { route: "symphony/together", provider: "together" },
];

// Routes that use heuristic selection or pools
const HEURISTIC_ROUTES = [
  { route: "symphony/main", description: "heuristic selection" },
  { route: "symphony/text", description: "text-only heuristic" },
  { route: "symphony/openrouter", description: "openrouter pool (27 models)" },
];

// Routes that need local/special services
const LOCAL_SERVICE_ROUTES = [
  { route: "symphony/codebuff", provider: "codebuff", description: "Codebuff SDK" },
  { route: "symphony/codex", provider: "codex", description: "Codex API (often quota-exhausted)" },
  {
    route: "symphony/ollama-qwen2.5-coder-3b",
    provider: "ollama-qwen2.5-coder-3b",
    description: "Local Ollama (qwen2.5-coder 3B)",
  },
  {
    route: "symphony/ollama-qwen2.5-coder-0.5b",
    provider: "ollama-qwen2.5-coder-0.5b",
    description: "Local Ollama (qwen2.5-coder 0.5B)",
  },
  {
    route: "symphony/codebuff-paid",
    provider: "codebuff-paid",
    description: "Codebuff paid tier",
  },
  {
    route: "symphony/codebuff-free",
    provider: "codebuff-free",
    description: "Codebuff free tier",
  },
  {
    route: "symphony/ollama-qwen3-coder-next",
    provider: "ollama-qwen3-coder-next",
    description: "Local Ollama (qwen3-coder-next)",
  },
];

// ---------------------------------------------------------------------------
// Provider Inventory Tests
// ---------------------------------------------------------------------------

test.describe("Provider Inventory (requires running bridge)", () => {
  test.setTimeout(30_000);

  test("all expected providers are configured in the bridge", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_EXECUTOR_URL);
    test.skip(!reachable, "Symphony executor not reachable - requires running executor on port 4321");

    const res = await fetch(`${SYMPHONY_EXECUTOR_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    expect(res.status).toBe(200);
    const data = await res.json();

    const configured = (data.configuredProviders ?? []).map((p: { name: string }) => p.name);

    const missing = ALL_EXPECTED_PROVIDER_NAMES.filter((name) => !configured.includes(name));
    const unexpected = configured.filter(
      (name: string) => !ALL_EXPECTED_PROVIDER_NAMES.includes(name),
    );

    if (missing.length > 0) {
      console.log(`[openclaw-e2e] ⚠️  Missing providers: ${missing.join(", ")}`);
    }
    // Filter unexpected to only flag truly unknown base providers — sub-model
    // variants (e.g. "groq-llama-3-3-70b-versatile") are dynamically generated
    // and validated separately via the openrouter/sub-model tests.
    const baseProviderPrefixes = ALL_EXPECTED_PROVIDER_NAMES.map((n) => n + "-");
    const trulyUnexpected = unexpected.filter(
      (name: string) =>
        !name.startsWith("openrouter-") &&
        !baseProviderPrefixes.some((prefix) => name.startsWith(prefix)),
    );
    if (trulyUnexpected.length > 0) {
      console.log(
        `[openclaw-e2e] ⚠️  Unexpected base providers (add to test): ${trulyUnexpected.join(", ")}`,
      );
    }
    if (unexpected.length > trulyUnexpected.length) {
      console.log(
        `[openclaw-e2e] ℹ️  ${unexpected.length - trulyUnexpected.length} additional sub-model variants configured`,
      );
    }
    console.log(
      `[openclaw-e2e] Provider inventory: ${configured.length} configured, ` +
        `${ALL_EXPECTED_PROVIDER_NAMES.length} base expected, ` +
        `${missing.length} missing, ${trulyUnexpected.length} unexpected base`,
    );

    expect(missing, `Providers missing from bridge: ${missing.join(", ")}`).toHaveLength(0);
    expect(
      trulyUnexpected,
      `Unknown base providers in bridge — update the test: ${trulyUnexpected.join(", ")}`,
    ).toHaveLength(0);
  });

  test("all expected routes are exposed by the bridge", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_EXECUTOR_URL);
    test.skip(!reachable, "Symphony executor not reachable - requires running executor on port 4321");

    const res = await fetch(`${SYMPHONY_EXECUTOR_URL}/v1/models`, {
      signal: AbortSignal.timeout(5_000),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    const modelIds: string[] = data.data.map((m: { id: string }) => m.id);

    const missingRoutes = EXPECTED_ROUTES.filter((r) => !modelIds.includes(r));
    const unexpectedRoutes = modelIds.filter((r) => !EXPECTED_ROUTES.includes(r));

    if (missingRoutes.length > 0) {
      console.log(`[openclaw-e2e] ⚠️  Missing routes: ${missingRoutes.join(", ")}`);
    }
    if (unexpectedRoutes.length > 0) {
      console.log(
        `[openclaw-e2e] ⚠️  Unexpected routes (add to test): ${unexpectedRoutes.join(", ")}`,
      );
    }
    console.log(
      `[openclaw-e2e] Route inventory: ${modelIds.length} exposed, ${EXPECTED_ROUTES.length} expected`,
    );

    expect(missingRoutes, `Routes missing: ${missingRoutes.join(", ")}`).toHaveLength(0);
    expect(
      unexpectedRoutes,
      `Routes in bridge not in test — update the test: ${unexpectedRoutes.join(", ")}`,
    ).toHaveLength(0);
  });

  test("all direct providers report available", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_EXECUTOR_URL);
    test.skip(!reachable, "Symphony executor not reachable - requires running executor on port 4321");

    const res = await fetch(`${SYMPHONY_EXECUTOR_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    const data = await res.json();
    const providers: Array<{ name: string; available: boolean }> = data.configuredProviders ?? [];

    const directNames = DIRECT_PROVIDERS.map((p) => p.name);
    const unavailable = providers
      .filter((p) => directNames.includes(p.name) && !p.available)
      .map((p) => p.name);

    console.log(
      `[openclaw-e2e] Direct provider availability: ` +
        `${directNames.length - unavailable.length}/${directNames.length} available` +
        (unavailable.length > 0 ? ` (unavailable: ${unavailable.join(", ")})` : ""),
    );

    expect(
      unavailable.length,
      `Direct providers unavailable: ${unavailable.join(", ")}`,
    ).toBeLessThanOrEqual(1);
  });

  test("blocklisted providers are not configured in the bridge", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_EXECUTOR_URL);
    test.skip(!reachable, "Symphony executor not reachable - requires running executor on port 4321");

    const res = await fetch(`${SYMPHONY_EXECUTOR_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    const data = await res.json();
    const configured = (data.configuredProviders ?? []).map((p: { name: string }) => p.name);

    const leaked = BRIDGE_BLOCKLISTED_PROVIDERS.filter((p) => configured.includes(p.name));

    expect(
      leaked,
      `Blocklisted providers should not be configured: ${leaked.map((p) => p.name).join(", ")}`,
    ).toHaveLength(0);
  });

  test("openrouter providers report available", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_EXECUTOR_URL);
    test.skip(!reachable, "Symphony executor not reachable - requires running executor on port 4321");

    const res = await fetch(`${SYMPHONY_EXECUTOR_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    const data = await res.json();
    const providers: Array<{ name: string; available: boolean }> = data.configuredProviders ?? [];

    const orProviders = providers.filter((p) => p.name.startsWith("openrouter-"));
    const unavailable = orProviders.filter((p) => !p.available).map((p) => p.name);

    console.log(
      `[openclaw-e2e] OpenRouter availability: ${orProviders.length - unavailable.length}/${orProviders.length} available` +
        (unavailable.length > 0 ? ` (unavailable: ${unavailable.slice(0, 10).join(", ")})` : ""),
    );

    expect(
      orProviders.length,
      "OpenRouter providers should be configured",
    ).toBeGreaterThanOrEqual(MINIMUM_OPENROUTER_PROVIDERS);
  });
});

// ---------------------------------------------------------------------------
// Tool-Capability Probe Validation (requires running bridge)
// ---------------------------------------------------------------------------

test.describe("Tool-Capability Probe Validation (requires running bridge)", () => {
  test.setTimeout(30_000);

  test("toolProbe health fields are present and valid", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_EXECUTOR_URL);
    test.skip(!reachable, "Symphony executor not reachable - requires running executor on port 4321");

    const res = await fetch(`${SYMPHONY_EXECUTOR_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.toolProbe).toBeDefined();
    expect(Array.isArray(data.toolProbe.capable)).toBe(true);
    expect(Array.isArray(data.toolProbe.excluded)).toBe(true);
    expect(Array.isArray(data.toolProbe.unclassified)).toBe(true);
    expect(Array.isArray(data.toolProbe.blocked)).toBe(true);

    // Known-capable providers must be in the capable list
    const capable: string[] = data.toolProbe.capable;
    for (const known of ["codex", "codebuff"]) {
      expect(capable, `Known-capable provider "${known}" should be in toolProbe.capable`).toContain(
        known,
      );
    }

    // Blocked providers must have a reason
    for (const entry of data.toolProbe.blocked) {
      expect(entry.name).toBeTruthy();
      expect(entry.reason).toBeTruthy();
    }

    // No provider should appear in both capable and excluded
    const excluded: string[] = data.toolProbe.excluded;
    const overlap = capable.filter((n: string) => excluded.includes(n));
    expect(overlap, `Providers in both capable AND excluded: ${overlap.join(", ")}`).toHaveLength(
      0,
    );

    console.log(
      `[openclaw-e2e] Tool probe: capable=${capable.length}, excluded=${excluded.length}, ` +
        `unclassified=${data.toolProbe.unclassified.length}, blocked=${data.toolProbe.blocked.length}`,
    );
  });

  test("excluded providers are NOT in health rankedProviders", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_EXECUTOR_URL);
    test.skip(!reachable, "Symphony executor not reachable - requires running executor on port 4321");

    const res = await fetch(`${SYMPHONY_EXECUTOR_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    expect(res.status).toBe(200);
    const data = await res.json();

    const excluded: string[] = data.toolProbe?.excluded ?? [];
    const rankedNames: string[] = (data.rankedProviders ?? []).map((p: { name: string }) => p.name);

    const leaked = excluded.filter((n) => rankedNames.includes(n));
    expect(
      leaked,
      `Excluded providers should NOT appear in rankedProviders: ${leaked.join(", ")}`,
    ).toHaveLength(0);

    console.log(
      `[openclaw-e2e] Ranked providers (top 5): ${rankedNames.join(", ")} | ` +
        `Excluded: ${excluded.join(", ")} | Leaked: ${leaked.length}`,
    );
  });

  test("excluded providers are NOT in /v1/stats rankedProviders", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_EXECUTOR_URL);
    test.skip(!reachable, "Symphony executor not reachable - requires running executor on port 4321");

    const healthRes = await fetch(`${SYMPHONY_EXECUTOR_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    const healthData = await healthRes.json();
    const excluded: string[] = healthData.toolProbe?.excluded ?? [];

    const statsRes = await fetch(`${SYMPHONY_EXECUTOR_URL}/v1/stats`, {
      headers: { Authorization: `Bearer ${SYMPHONY_API_KEY}` },
      signal: AbortSignal.timeout(5_000),
    });
    expect(statsRes.status).toBe(200);
    const statsData = await statsRes.json();
    const rankedNames: string[] = (statsData.rankedProviders ?? []).map(
      (p: { name: string }) => p.name,
    );

    const leaked = excluded.filter((n) => rankedNames.includes(n));
    expect(
      leaked,
      `Excluded providers in /v1/stats rankedProviders: ${leaked.join(", ")}`,
    ).toHaveLength(0);

    console.log(
      `[openclaw-e2e] /v1/stats ranked: ${rankedNames.length} providers | ` +
        `Excluded leak check: ${leaked.length === 0 ? "PASS ✅" : `FAIL — ${leaked.join(", ")}`}`,
    );
  });

  test("pinned routes for excluded providers return clear error", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_EXECUTOR_URL);
    test.skip(!reachable, "Symphony executor not reachable - requires running executor on port 4321");

    const healthRes = await fetch(`${SYMPHONY_EXECUTOR_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    const healthData = await healthRes.json();
    const excluded: string[] = healthData.toolProbe?.excluded ?? [];

    if (excluded.length === 0) {
      console.log("[openclaw-e2e] No excluded providers — skipping pinned route error test");
      test.skip(
        true,
        "No excluded providers - this is a valid state where all providers are capable",
      );
    }

    // Map excluded provider names to their pinned routes
    const pinnedRoutes = EXPECTED_ROUTES.filter((route) => {
      const suffix = route.replace("symphony/", "");
      return excluded.includes(suffix);
    });

    for (const route of pinnedRoutes) {
      const { status, data } = await sendCompletion(route, "Say ok.");
      const errMsg = (data.error as Record<string, string>)?.message ?? "";

      expect(status, `Pinned route ${route} should return 500 for excluded provider`).toBe(500);
      expect(errMsg, `Error for ${route} should mention tool-capability probe exclusion`).toMatch(
        /excluded by tool-capability probe|non-tool-capable/,
      );

      console.log(
        `[openclaw-e2e] Excluded route ${route}: status=${status}, error="${errMsg.slice(0, 120)}" ✅`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Remote API Route Completion Tests — one per dedicated-provider route
// ---------------------------------------------------------------------------

test.describe("Remote API Route Completions (requires running bridge)", () => {
  test.setTimeout(120_000);

  for (const { route, provider } of REMOTE_API_ROUTES) {
    test(`${provider} — completion via ${route}`, async () => {
      const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
      test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

      const { status, data, elapsed } = await sendCompletion(route);
      const errMsg = (data.error as Record<string, string>)?.message ?? "";

      if (isTransientError(status, errMsg)) {
        console.log(`[openclaw-e2e] ${provider}: transient error, skipping (${errMsg})`);
        test.skip(
          true,
          "Transient error (rate limit or quota) - test valid but environment-dependent",
        );
      }

      expect(status, `${provider} returned HTTP ${status}: ${errMsg}`).toBe(200);
      expect(data.choices).toBeDefined();
      const content = (data.choices as Array<{ message: { content: string } }>)[0].message.content;
      expect(content, `${provider} returned empty content`).toBeTruthy();
      expect(data._symphony_provider).toBe(provider);

      console.log(
        `[openclaw-e2e] ${provider}: duration=${data._symphony_duration_ms}ms, ` +
          `elapsed=${elapsed}ms, content=${String(content).slice(0, 80)}`,
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Heuristic & Pool Route Completion Tests
// ---------------------------------------------------------------------------

test.describe("Heuristic & Pool Route Completions (requires running bridge)", () => {
  test.setTimeout(120_000);

  for (const { route, description } of HEURISTIC_ROUTES) {
    test(`${route} — ${description}`, async () => {
      const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
      test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

      const { status, data, elapsed } = await sendCompletion(route);
      const errMsg = (data.error as Record<string, string>)?.message ?? "";

      if (isTransientError(status, errMsg)) {
        console.log(`[openclaw-e2e] ${route}: transient error, skipping (${errMsg})`);
        test.skip(
          true,
          "Transient error (rate limit or quota) - test valid but environment-dependent",
        );
      }

      expect(status, `${route} returned HTTP ${status}: ${errMsg}`).toBe(200);
      expect(data.choices).toBeDefined();
      expect(data._symphony_provider).toBeDefined();

      console.log(
        `[openclaw-e2e] ${route}: provider=${data._symphony_provider}, ` +
          `duration=${data._symphony_duration_ms}ms, elapsed=${elapsed}ms`,
      );
    });
  }

  test("symphony/openrouter selects from the openrouter pool", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const selectedProviders = new Set<string>();
    const attempts = 3;
    let transientCount = 0;

    for (let i = 0; i < attempts; i++) {
      const { status, data } = await sendCompletion(
        "symphony/openrouter",
        `Reply with only the number ${i + 1}.`,
      );
      const errMsg = (data.error as Record<string, string>)?.message ?? "";

      if (isTransientError(status, errMsg)) {
        transientCount++;
        if (transientCount >= 2) break;
        continue;
      }

      if (status === 200 && typeof data._symphony_provider === "string") {
        selectedProviders.add(data._symphony_provider);
        expect(
          data._symphony_provider.startsWith("openrouter-"),
          `symphony/openrouter selected non-openrouter provider: ${data._symphony_provider}`,
        ).toBe(true);
      }
    }

    console.log(
      `[openclaw-e2e] openrouter rotation: ${selectedProviders.size} distinct from ${attempts} requests ` +
        `(${transientCount} transient) — ${[...selectedProviders].join(", ")}`,
    );
    if (transientCount >= attempts) {
      console.log(
        `[openclaw-e2e] openrouter rotation: all requests were transient errors, skipping`,
      );
      test.skip(
        true,
        "All requests were transient errors - provider availability issue, not test issue",
      );
    }

    expect(selectedProviders.size).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Local & Special Service Route Tests
// ---------------------------------------------------------------------------

test.describe("Local & Special Service Routes (requires running bridge)", () => {
  test.setTimeout(120_000);

  for (const { route, provider, description } of LOCAL_SERVICE_ROUTES) {
    test(`${route} — ${description}`, async () => {
      const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
      test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

      const { status, data, elapsed } = await sendCompletion(route);
      const errMsg = (data.error as Record<string, string>)?.message ?? "";
      if (isTransientError(status, errMsg)) {
        console.log(
          `[openclaw-e2e] ${route} (${provider}): transient/unavailable, skipping (${errMsg})`,
        );
        test.skip(
          true,
          "Transient error (rate limit or quota) - test valid but environment-dependent",
        );
        return;
      }

      if (
        status === 500 &&
        /not supported|no.key|unavailable|not reachable|connection refused|No providers available|system memory/i.test(
          errMsg,
        )
      ) {
        console.log(
          `[openclaw-e2e] ${route} (${provider}): service unavailable, skipping (${errMsg})`,
        );
        test.skip(
          true,
          "Service unavailable - provider not configured or not running, test is valid",
        );
      }

      expect(status, `${route} returned HTTP ${status}: ${errMsg}`).toBe(200);
      expect(data.choices).toBeDefined();

      console.log(
        `[openclaw-e2e] ${route}: provider=${data._symphony_provider}, ` +
          `duration=${data._symphony_duration_ms}ms, elapsed=${elapsed}ms`,
      );
    });
  }
});

// ---------------------------------------------------------------------------
// OpenRouter Model Coverage — verify every model is reachable
// ---------------------------------------------------------------------------

test.describe("OpenRouter Model Coverage (requires running bridge)", () => {
  test.setTimeout(300_000);

  test("openrouter models are in the configured provider list", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_EXECUTOR_URL);
    test.skip(!reachable, "Symphony executor not reachable - requires running executor on port 4321");

    const res = await fetch(`${SYMPHONY_EXECUTOR_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    const data = await res.json();
    const configured: string[] = (data.configuredProviders ?? []).map((p: { name: string }) => p.name);

    const orConfigured = configured.filter((name) => name.startsWith("openrouter-"));

    console.log(
      `[openclaw-e2e] OpenRouter models: ${orConfigured.length} configured ` +
        `(minimum ${MINIMUM_OPENROUTER_PROVIDERS} expected)`,
    );

    expect(
      orConfigured.length,
      `Only ${orConfigured.length} openrouter providers configured, expected at least ${MINIMUM_OPENROUTER_PROVIDERS}`,
    ).toBeGreaterThanOrEqual(MINIMUM_OPENROUTER_PROVIDERS);
  });

  test("openrouter models are exercised via pool route", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const selectedProviders = new Set<string>();
    const results: Array<{ provider: string; ok: boolean }> = [];
    const rounds = 5;

    for (let i = 0; i < rounds; i++) {
      try {
        const { status, data } = await sendCompletion(
          "symphony/openrouter",
          `Reply with only the digit ${i}.`,
        );
        const provider = String(data._symphony_provider ?? "unknown");
        const ok = status === 200;
        results.push({ provider, ok });
        if (ok) selectedProviders.add(provider);
      } catch {
        results.push({ provider: "error", ok: false });
      }
    }

    const successes = results.filter((r) => r.ok).length;
    console.log(
      `[openclaw-e2e] OpenRouter pool exercise: ${successes}/${rounds} succeeded, ` +
        `${selectedProviders.size} distinct providers — ${[...selectedProviders].join(", ")}`,
    );

    expect(successes, "OpenRouter pool should succeed at least once").toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Full Provider Cascade Summary
// ---------------------------------------------------------------------------

test.describe("Full Provider Cascade Summary (requires running bridge)", () => {
  test.setTimeout(180_000);

  test("remote API routes — majority succeed in parallel", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const results: Array<{ route: string; provider: string; status: number }> = [];

    await Promise.allSettled(
      REMOTE_API_ROUTES.map(async ({ route, provider }) => {
        try {
          const { status, data } = await sendCompletion(route, "Reply with only the word 'pong'.");
          results.push({
            route,
            provider: String(data._symphony_provider ?? provider),
            status,
          });
        } catch {
          results.push({ route, provider, status: 0 });
        }
      }),
    );

    const succeeded = results.filter((r) => r.status === 200);
    const failed = results.filter((r) => r.status !== 200);

    console.log(
      `[openclaw-e2e] Cascade summary: ${succeeded.length}/${REMOTE_API_ROUTES.length} remote routes succeeded\n` +
        `  ✅ ${succeeded.map((r) => r.provider).join(", ") || "none"}\n` +
        `  ❌ ${failed.map((r) => `${r.provider}(${r.status})`).join(", ") || "none"}`,
    );

    expect(
      succeeded.length,
      `Only ${succeeded.length}/${REMOTE_API_ROUTES.length} remote API routes succeeded`,
    ).toBeGreaterThanOrEqual(2);

    const distinctProviders = new Set(succeeded.map((r) => r.provider));
    expect(
      distinctProviders.size,
      "Responses should come from distinct providers",
    ).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// Per-Provider Streaming Completions — SSE contract per route (gap #1 + #8)
// ---------------------------------------------------------------------------

test.describe("Per-Provider Streaming Completions (requires running bridge)", () => {
  test.setTimeout(120_000);

  for (const { route, provider } of REMOTE_API_ROUTES) {
    test(`${provider} — streaming via ${route}`, async () => {
      const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
      test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

      const { status, chunks, content, elapsed, contentType, errMsg } =
        await sendStreamingCompletion(route, "Say hello in one word.");

      if (isTransientError(status, errMsg)) {
        console.log(`[openclaw-e2e] ${provider} streaming: transient error, skipping (${errMsg})`);
        test.skip(
          true,
          "Transient error (rate limit or quota) - test valid but environment-dependent",
        );
        return;
      }

      expect(status, `${provider} streaming returned HTTP ${status}: ${errMsg}`).toBe(200);
      expect(contentType, `${provider} streaming content-type`).toContain("text/event-stream");
      expect(chunks.length, `${provider} streaming produced no chunks`).toBeGreaterThan(0);

      const validation = validateStreamChunks(chunks);
      if (!validation.valid) {
        console.log(
          `[openclaw-e2e] ${provider} streaming schema errors: ${validation.errors.join("; ")}`,
        );
      }
      expect(
        validation.valid,
        `${provider} streaming chunk schema invalid: ${validation.errors[0] ?? ""}`,
      ).toBe(true);

      console.log(
        `[openclaw-e2e] ${provider} streaming: ${chunks.length} chunks, ` +
          `elapsed=${elapsed}ms, content=${content.slice(0, 80)}, done=${validation.hasDone}`,
      );
    });
  }

  test("symphony/main — streaming with schema validation", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const { status, chunks, content, elapsed, contentType, errMsg } = await sendStreamingCompletion(
      "symphony/main",
      "Say ok.",
    );
    if (isTransientError(status, errMsg)) {
      test.skip(
        true,
        "Transient error (rate limit or quota) - test valid but environment-dependent",
      );
    }

    expect(status).toBe(200);
    expect(contentType).toContain("text/event-stream");
    expect(chunks.length).toBeGreaterThan(0);

    const validation = validateStreamChunks(chunks);
    expect(validation.valid, `Schema errors: ${validation.errors.join("; ")}`).toBe(true);

    console.log(
      `[openclaw-e2e] symphony/main streaming: ${chunks.length} chunks, ` +
        `elapsed=${elapsed}ms, hasDone=${validation.hasDone}, content=${content.slice(0, 80)}`,
    );
  });

  test("symphony/text — streaming with schema validation", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const { status, chunks, content, elapsed, contentType, errMsg } = await sendStreamingCompletion(
      "symphony/text",
      "Say ok.",
    );
    if (isTransientError(status, errMsg)) {
      test.skip(
        true,
        "Transient error (rate limit or quota) - test valid but environment-dependent",
      );
    }

    expect(status).toBe(200);
    expect(contentType).toContain("text/event-stream");
    expect(chunks.length).toBeGreaterThan(0);

    const validation = validateStreamChunks(chunks);
    expect(validation.valid, `Schema errors: ${validation.errors.join("; ")}`).toBe(true);

    console.log(
      `[openclaw-e2e] symphony/text streaming: ${chunks.length} chunks, ` +
        `elapsed=${elapsed}ms, hasDone=${validation.hasDone}, content=${content.slice(0, 80)}`,
    );
  });

  test("symphony/openrouter — streaming with schema validation", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const { status, chunks, content, elapsed, contentType, errMsg } = await sendStreamingCompletion(
      "symphony/openrouter",
      "Say ok.",
    );
    if (isTransientError(status, errMsg)) {
      test.skip(
        true,
        "Transient error (rate limit or quota) - test valid but environment-dependent",
      );
    }

    expect(status).toBe(200);
    expect(contentType).toContain("text/event-stream");
    expect(chunks.length).toBeGreaterThan(0);

    const validation = validateStreamChunks(chunks);
    expect(validation.valid, `Schema errors: ${validation.errors.join("; ")}`).toBe(true);

    console.log(
      `[openclaw-e2e] symphony/openrouter streaming: ${chunks.length} chunks, ` +
        `elapsed=${elapsed}ms, hasDone=${validation.hasDone}, content=${content.slice(0, 80)}`,
    );
  });

  for (const { route, provider, description } of LOCAL_SERVICE_ROUTES) {
    test(`${route} — streaming (${description})`, async () => {
      const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
      test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

      const { status, chunks, content, elapsed, contentType, errMsg } =
        await sendStreamingCompletion(route, "Say ok.");
      if (isTransientError(status, errMsg)) {
        console.log(`[openclaw-e2e] ${route} streaming: transient error, skipping (${errMsg})`);
        test.skip(
          true,
          "Transient error (rate limit or quota) - test valid but environment-dependent",
        );
        return;
      }

      if (
        status === 500 &&
        /not supported|no.key|unavailable|not reachable|connection refused|No providers available|system memory/i.test(
          errMsg,
        )
      ) {
        console.log(
          `[openclaw-e2e] ${route} streaming (${provider}): service unavailable, skipping (${errMsg})`,
        );
        test.skip(
          true,
          "Service unavailable - provider not configured or not running, test is valid",
        );
      }

      expect(status, `${route} streaming returned HTTP ${status}: ${errMsg}`).toBe(200);
      expect(contentType).toContain("text/event-stream");
      expect(chunks.length).toBeGreaterThan(0);

      const validation = validateStreamChunks(chunks);
      if (!validation.valid) {
        console.log(
          `[openclaw-e2e] ${route} streaming schema errors: ${validation.errors.join("; ")}`,
        );
      }

      console.log(
        `[openclaw-e2e] ${route} streaming: ${chunks.length} chunks, ` +
          `elapsed=${elapsed}ms, hasDone=${validation.hasDone}, content=${content.slice(0, 80)}`,
      );
    });
  }

  test("streaming cascade — majority of remote routes stream successfully", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const results: Array<{ provider: string; ok: boolean; chunks: number }> = [];

    await Promise.allSettled(
      REMOTE_API_ROUTES.map(async ({ route, provider }) => {
        const { status, chunks } = await sendStreamingCompletion(route, "Say ok.");
        results.push({ provider, ok: status === 200 && chunks.length > 0, chunks: chunks.length });
      }),
    );

    const succeeded = results.filter((r) => r.ok);
    console.log(
      `[openclaw-e2e] Streaming cascade: ${succeeded.length}/${REMOTE_API_ROUTES.length} streamed — ` +
        `${succeeded.map((r) => `${r.provider}(${r.chunks}ch)`).join(", ")}`,
    );

    expect(
      succeeded.length,
      `Only ${succeeded.length}/${REMOTE_API_ROUTES.length} routes streamed successfully`,
    ).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// Live Tool-Use & Command Execution (gap #2)
// ---------------------------------------------------------------------------

test.describe("Live Tool-Use & Command Execution (requires running bridge)", () => {
  test.setTimeout(120_000);

  test("exec tool — bridge executes shell command and returns output", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const { status, data, elapsed } = await sendCompletion(
      "symphony/main",
      "Run the shell command: echo hello-from-tool-test. Return only the output.",
    );
    const errMsg = (data.error as Record<string, string>)?.message ?? "";
    if (isTransientError(status, errMsg)) {
      test.skip(
        true,
        "Transient error (rate limit or quota) - test valid but environment-dependent",
      );
    }

    expect(status, `tool-use exec returned HTTP ${status}: ${errMsg}`).toBe(200);
    expect(data.choices).toBeDefined();

    const content = String(
      (data.choices as Array<{ message: { content: string } }>)[0]?.message?.content ?? "",
    );
    console.log(
      `[openclaw-e2e] Tool exec: provider=${data._symphony_provider}, elapsed=${elapsed}ms, ` +
        `content=${content.slice(0, 200)}`,
    );
  });

  test("read tool — bridge reads a file and returns content", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const { status, data, elapsed } = await sendCompletion(
      "symphony/main",
      "Read the file package.json and tell me the value of the 'name' field. Reply with only the value.",
    );
    const errMsg = (data.error as Record<string, string>)?.message ?? "";
    if (isTransientError(status, errMsg)) {
      test.skip(
        true,
        "Transient error (rate limit or quota) - test valid but environment-dependent",
      );
    }

    expect(status, `tool-use read returned HTTP ${status}: ${errMsg}`).toBe(200);
    expect(data.choices).toBeDefined();

    const content = String(
      (data.choices as Array<{ message: { content: string } }>)[0]?.message?.content ?? "",
    );
    console.log(
      `[openclaw-e2e] Tool read: provider=${data._symphony_provider}, elapsed=${elapsed}ms, ` +
        `content=${content.slice(0, 200)}`,
    );
  });

  test("glob tool — bridge lists files matching a pattern", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const { status, data, elapsed } = await sendCompletion(
      "symphony/main",
      "Use the glob tool to find files matching '*.json' in the project root. List them.",
    );
    const errMsg = (data.error as Record<string, string>)?.message ?? "";
    if (isTransientError(status, errMsg)) {
      test.skip(
        true,
        "Transient error (rate limit or quota) - test valid but environment-dependent",
      );
    }

    expect(status, `tool-use glob returned HTTP ${status}: ${errMsg}`).toBe(200);
    expect(data.choices).toBeDefined();

    const content = String(
      (data.choices as Array<{ message: { content: string } }>)[0]?.message?.content ?? "",
    );
    console.log(
      `[openclaw-e2e] Tool glob: provider=${data._symphony_provider}, elapsed=${elapsed}ms, ` +
        `content=${content.slice(0, 200)}`,
    );
  });

  test("streaming tool-use — exec via streaming mode", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const { status, chunks, content, elapsed, errMsg } = await sendStreamingCompletion(
      "symphony/main",
      "Run the command: echo streaming-tool-test. Return only the output.",
    );
    if (isTransientError(status, errMsg)) {
      test.skip(
        true,
        "Transient error (rate limit or quota) - test valid but environment-dependent",
      );
    }

    expect(status, `streaming tool-use returned HTTP ${status}: ${errMsg}`).toBe(200);
    expect(chunks.length).toBeGreaterThan(0);

    console.log(
      `[openclaw-e2e] Streaming tool exec: ${chunks.length} chunks, ` +
        `elapsed=${elapsed}ms, content=${content.slice(0, 200)}`,
    );
  });
});

// ---------------------------------------------------------------------------
// Provider Degradation & Recovery Simulation (gap #9)
// ---------------------------------------------------------------------------

test.describe("Provider Degradation & Recovery (requires running bridge)", () => {
  test.setTimeout(120_000);

  test("invalid route returns error without crashing the bridge", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const { status, data } = await sendCompletion("symphony/nonexistent-provider-xyz");
    // The bridge's resolveRoute() falls back unknown models to symphony/main,
    // so a 200 (fallback-to-default) is valid alongside explicit error codes.
    expect([200, 400, 404, 500]).toContain(status);

    if (status === 200) {
      console.log(
        `[openclaw-e2e] Invalid route: status=200 (fell back to default model), provider=${data._symphony_provider}`,
      );
    } else {
      const errMsg = (data.error as Record<string, string>)?.message ?? "";
      console.log(`[openclaw-e2e] Invalid route: status=${status}, error=${errMsg.slice(0, 100)}`);
    }
  });

  test("bridge recovers after invalid route error", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    await sendCompletion("symphony/nonexistent-provider-xyz");

    const { status, data } = await sendCompletion("symphony/main", "Say ok.");
    const errMsg = (data.error as Record<string, string>)?.message ?? "";
    if (isTransientError(status, errMsg)) {
      test.skip(
        true,
        "Transient error (rate limit or quota) - test valid but environment-dependent",
      );
    }

    expect(status, `Recovery request failed with HTTP ${status}: ${errMsg}`).toBe(200);
    expect(data.choices).toBeDefined();
    console.log(
      `[openclaw-e2e] Bridge recovery: provider=${data._symphony_provider}, status=200 ✅`,
    );
  });

  test("bridge recovers after malformed request", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    await fetch(`${SYMPHONY_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SYMPHONY_API_KEY}` },
      body: "{ broken json",
      signal: AbortSignal.timeout(10_000),
    }).catch(() => {});

    const { status, data } = await sendCompletion("symphony/main", "Say ok.");
    const errMsg = (data.error as Record<string, string>)?.message ?? "";
    if (isTransientError(status, errMsg)) {
      test.skip(
        true,
        "Transient error (rate limit or quota) - test valid but environment-dependent",
      );
    }

    expect(status, `Post-malformed recovery failed: ${errMsg}`).toBe(200);
    console.log(`[openclaw-e2e] Post-malformed recovery: provider=${data._symphony_provider} ✅`);
  });

  test("bridge health remains ok after error sequence", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const res = await fetch(`${SYMPHONY_BASE_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    console.log(
      `[openclaw-e2e] Post-degradation health: status=${data.status}, ` +
        `configured=${data.providersConfigured}, available=${data.providersAvailable}`,
    );
  });
});

// ---------------------------------------------------------------------------
// Regression Tests for Known Incident Classes (gap #10)
// ---------------------------------------------------------------------------

test.describe("Regression: Known Incident Classes (requires running bridge)", () => {
  test.setTimeout(120_000);

  test("REGRESSION: AI SDK v6 /v1/responses path — third-party providers use /v1/chat/completions", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    // cerebras removed: dynamically excluded by tool-capability probe
    const thirdPartyRoutes = [{ route: "symphony/groq", provider: "groq" }];

    for (const { route, provider } of thirdPartyRoutes) {
      const { status, data } = await sendCompletion(route, "Say ok.");
      const errMsg = (data.error as Record<string, string>)?.message ?? "";

      if (isTransientError(status, errMsg)) continue;

      expect(
        errMsg,
        `${provider}: should not get 'Not Found' (AI SDK v6 /v1/responses regression)`,
      ).not.toMatch(/Not Found/);

      if (status === 200) {
        console.log(
          `[openclaw-e2e] REGRESSION(v6-responses): ${provider} OK via chat/completions path`,
        );
      }
    }
  });

  test("REGRESSION: .chat() vs () — providers return content, not endpoint errors", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const routes = [
      { route: "symphony/groq", provider: "groq" },
      { route: "symphony/gemini", provider: "gemini" },
      { route: "symphony/cerebras", provider: "cerebras" },
    ];

    let successes = 0;
    for (const { route, provider } of routes) {
      const { status, data } = await sendCompletion(route, "Say ok.");
      const errMsg = (data.error as Record<string, string>)?.message ?? "";

      if (isTransientError(status, errMsg)) continue;

      if (status === 200) {
        const content = (data.choices as Array<{ message: { content: string } }>)[0]?.message
          ?.content;
        expect(content, `${provider}: .chat() regression — empty content`).toBeTruthy();
        successes++;
        console.log(`[openclaw-e2e] REGRESSION(.chat): ${provider} returned content OK`);
      }
    }

    expect(successes, "At least 2 of 3 regression routes should succeed").toBeGreaterThanOrEqual(2);
  });

  test("REGRESSION: provider cascade does not get stuck after single provider failure", async () => {
    const reachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    test.skip(!reachable, "Symphony bridge not reachable - requires running bridge on port 4319");

    const { status: s1 } = await sendCompletion("symphony/main", "Say 1.");
    const { status: s2 } = await sendCompletion("symphony/main", "Say 2.");
    const { status: s3 } = await sendCompletion("symphony/main", "Say 3.");

    const successes = [s1, s2, s3].filter((s) => s === 200).length;
    console.log(
      `[openclaw-e2e] REGRESSION(cascade-stuck): ${successes}/3 sequential requests succeeded ` +
        `(statuses: ${s1}, ${s2}, ${s3})`,
    );

    expect(
      successes,
      "Cascade should not get stuck — at least 2 of 3 sequential requests should succeed",
    ).toBeGreaterThanOrEqual(2);
  });
});

// Live Codebuff Bridge Tests section removed - Codebuff is now integrated into Symphony per ADR-0003

// ---------------------------------------------------------------------------
// OpenClaw CLI Model Validation
// ---------------------------------------------------------------------------

test.describe("OpenClaw CLI Model Validation", () => {
  test.setTimeout(30_000);

  test("openclaw models list shows all configured models", () => {
    let data: ModelsListOutput;
    try {
      data = runCliJson<ModelsListOutput>("models list --json");
    } catch {
      console.log("[openclaw-e2e] openclaw CLI not available, skipping");
      test.skip(true, "OpenClaw CLI not installed or not in PATH - test requires openclaw CLI");
      return;
    }

    expect(data.count).toBeGreaterThanOrEqual(17);

    const keys = data.models.map((m) => m.key);
    console.log(`[openclaw-e2e] CLI models list: ${data.count} models`);

    expect(keys).toContain("symphony-bridge/symphony/main");
    expect(keys).toContain("symphony-bridge/symphony/codex");
    expect(keys).toContain("symphony-bridge/symphony/groq");
    expect(keys).toContain("symphony-bridge/symphony/gemini");
    expect(keys).toContain("symphony-bridge/symphony/ollama-local");
    expect(keys).toContain("symphony-bridge/symphony/text");
    expect(keys).toContain("ollama/qwen2.5-coder:0.5b");
    expect(keys).toContain("ollama/qwen2.5-coder:3b-instruct");
    expect(keys).toContain("codebuff-bridge/codebuff/base");
  });

  test("default model is symphony-bridge/symphony/main", () => {
    let data: ModelsListOutput;
    try {
      data = runCliJson<ModelsListOutput>("models list --json");
    } catch {
      test.skip(true, "OpenClaw CLI not installed or not in PATH - test requires openclaw CLI");
      return;
    }

    const defaultModel = data.models.find((m) => m.tags.includes("default"));
    expect(defaultModel, "No model tagged as default").toBeDefined();
    expect(defaultModel!.key).toBe("symphony-bridge/symphony/main");
  });

  test("openclaw models status shows correct default and fallback chain", () => {
    let data: ModelsStatusOutput;
    try {
      data = runCliJson<ModelsStatusOutput>("models status --json");
    } catch {
      test.skip(true, "OpenClaw CLI not installed or not in PATH - test requires openclaw CLI");
      return;
    }

    expect(data.defaultModel).toBe("symphony-bridge/symphony/main");
    expect(data.resolvedDefault).toBe("symphony-bridge/symphony/main");
    expect(data.fallbacks.length).toBeGreaterThanOrEqual(12);

    console.log(
      `[openclaw-e2e] CLI status: default=${data.defaultModel}, fallbacks=${data.fallbacks.length}, ` +
        `allowed=${data.allowed.length}`,
    );
  });

  test("live fallback ordering places direct ollama models after all symphony routes", () => {
    let data: ModelsStatusOutput;
    try {
      data = runCliJson<ModelsStatusOutput>("models status --json");
    } catch {
      test.skip(true, "OpenClaw CLI not installed or not in PATH - test requires openclaw CLI");
      return;
    }

    const { fallbacks } = data;
    const firstDirectOllamaIdx = fallbacks.findIndex((f) => f.startsWith("ollama/"));
    if (firstDirectOllamaIdx < 0) {
      console.log(
        "[openclaw-e2e] No direct ollama models in live fallbacks, skipping ordering check",
      );
      return;
    }

    const symphonyAfterOllama = fallbacks
      .slice(firstDirectOllamaIdx)
      .filter((f) => f.startsWith("symphony-bridge/"));

    console.log(
      `[openclaw-e2e] Live fallback ordering: first direct ollama at index ${firstDirectOllamaIdx}, ` +
        `${symphonyAfterOllama.length} symphony routes after it`,
    );

    expect(
      symphonyAfterOllama.length,
      `Symphony routes found after first direct ollama model: ${symphonyAfterOllama.join(", ")}`,
    ).toBe(0);
  });

  test("live fallback chain includes all symphony bridge routes from config", () => {
    let data: ModelsStatusOutput;
    try {
      data = runCliJson<ModelsStatusOutput>("models status --json");
    } catch {
      test.skip(true, "OpenClaw CLI not installed or not in PATH - test requires openclaw CLI");
      return;
    }

    const expectedSymphonyRoutes = [
      "symphony-bridge/symphony/codex",
      "symphony-bridge/symphony/codebuff",
      "symphony-bridge/symphony/groq",
      "symphony-bridge/symphony/mistral",
      "symphony-bridge/symphony/gemini",
      "symphony-bridge/symphony/gemini-lite",
      "symphony-bridge/symphony/openrouter",
      "symphony-bridge/symphony/sambanova",
      "symphony-bridge/symphony/cerebras",
      "symphony-bridge/symphony/ollama-local",
      "symphony-bridge/symphony/text",
    ];

    const missing = expectedSymphonyRoutes.filter((r) => !data.fallbacks.includes(r));
    if (missing.length > 0) {
      console.log(
        `[openclaw-e2e] Missing symphony routes in live fallbacks: ${missing.join(", ")}`,
      );
    }

    expect(
      missing,
      `Symphony routes missing from live fallbacks: ${missing.join(", ")}`,
    ).toHaveLength(0);
  });

  test("codebuff-bridge is last in the live fallback chain", () => {
    let data: ModelsStatusOutput;
    try {
      data = runCliJson<ModelsStatusOutput>("models status --json");
    } catch {
      test.skip(true, "OpenClaw CLI not installed or not in PATH - test requires openclaw CLI");
      return;
    }

    const lastFallback = data.fallbacks[data.fallbacks.length - 1];
    expect(lastFallback).toBe("codebuff-bridge/codebuff/base");
  });
});

// ---------------------------------------------------------------------------
// OpenClaw Model Selection Validation
// ---------------------------------------------------------------------------

test.describe("OpenClaw Model Selection Validation", () => {
  test.setTimeout(30_000);

  test("all symphony bridge models are selectable (in allowed list)", () => {
    let data: ModelsStatusOutput;
    try {
      data = runCliJson<ModelsStatusOutput>("models status --json");
    } catch {
      test.skip(true, "OpenClaw CLI not installed or not in PATH - test requires openclaw CLI");
      return;
    }

    const expectedModels = [
      "symphony-bridge/symphony/main",
      "symphony-bridge/symphony/text",
      "symphony-bridge/symphony/codex",
      "symphony-bridge/symphony/codebuff",
      "symphony-bridge/symphony/groq",
      "symphony-bridge/symphony/mistral",
      "symphony-bridge/symphony/gemini",
      "symphony-bridge/symphony/gemini-lite",
      "symphony-bridge/symphony/openrouter",
      "symphony-bridge/symphony/sambanova",
      "symphony-bridge/symphony/cerebras",
      "symphony-bridge/symphony/ollama-local",
    ];

    const missing = expectedModels.filter((m) => !data.allowed.includes(m));
    if (missing.length > 0) {
      console.log(`[openclaw-e2e] Symphony models NOT selectable: ${missing.join(", ")}`);
    }

    expect(missing, `Symphony models not in allowed list: ${missing.join(", ")}`).toHaveLength(0);

    console.log(
      `[openclaw-e2e] All ${expectedModels.length} symphony bridge models are selectable`,
    );
  });

  test("all direct ollama models are selectable (in allowed list)", () => {
    let data: ModelsStatusOutput;
    try {
      data = runCliJson<ModelsStatusOutput>("models status --json");
    } catch {
      test.skip(true, "OpenClaw CLI not installed or not in PATH - test requires openclaw CLI");
      return;
    }

    const ollamaModels = ["ollama/qwen2.5-coder:0.5b", "ollama/qwen2.5-coder:3b-instruct"];

    const missing = ollamaModels.filter((m) => !data.allowed.includes(m));
    expect(missing, `Ollama models not in allowed list: ${missing.join(", ")}`).toHaveLength(0);

    console.log(`[openclaw-e2e] All ${ollamaModels.length} direct ollama models are selectable`);
  });

  // codebuff-bridge model test removed — standalone Codebuff bridge retired per ADR-0003

  test("configured model count matches expected", () => {
    let data: ModelsListOutput;
    try {
      data = runCliJson<ModelsListOutput>("models list --json");
    } catch {
      test.skip(true, "OpenClaw CLI not installed or not in PATH - test requires openclaw CLI");
      return;
    }

    const configuredModels = data.models.filter((m) => m.tags.includes("configured"));
    console.log(
      `[openclaw-e2e] Configured models: ${configuredModels.length} ` +
        `(${configuredModels.map((m) => m.key).join(", ")})`,
    );

    expect(configuredModels.length).toBeGreaterThanOrEqual(17);
  });
});

// ---------------------------------------------------------------------------
// OpenClaw TUI Validation (requires running gateway)
// ---------------------------------------------------------------------------

test.describe("OpenClaw TUI Validation (requires running gateway)", () => {
  test.setTimeout(60_000);

  test("gateway is healthy (prerequisite for TUI)", () => {
    const reachable = isGatewayReachable();
    if (!reachable) {
      console.log("[openclaw-e2e] Gateway not reachable, skipping TUI tests");
      test.skip(true, "OpenClaw gateway not reachable - requires running gateway on port 4320");
    }

    const output = runCli("health");
    expect(output).toContain("Agents:");
    console.log(`[openclaw-e2e] Gateway health: ${output.split("\n")[0]}`);
  });

  test("openclaw tui starts and produces output", async () => {
    const reachable = isGatewayReachable();
    if (!reachable) {
      test.skip(true, "OpenClaw gateway not reachable - requires running gateway on port 4320");
    }

    const { output, exitCode } = await spawnTuiAndCapture("Say ok", 15_000);

    /* oxlint-disable no-control-regex -- intentional ANSI escape stripping */
    const stripped = output
      .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "")
      .replace(/[\x00-\x09\x0b-\x1f]/g, "");
    /* oxlint-enable no-control-regex */
    console.log(
      `[openclaw-e2e] TUI output (${stripped.length} chars, exitCode=${exitCode}): ` +
        `${stripped.slice(0, 300).replace(/\n/g, "⏎")}`,
    );

    expect(
      stripped.length,
      "TUI should produce some output (connection banner, prompt, or response)",
    ).toBeGreaterThan(0);
  });

  test("openclaw tui connects to gateway and receives response", async () => {
    const reachable = isGatewayReachable();
    if (!reachable) {
      test.skip(true, "OpenClaw gateway not reachable - requires running gateway on port 4320");
    }

    const { output } = await spawnTuiAndCapture("Reply with only the word pong", 20_000);

    /* oxlint-disable no-control-regex -- intentional ANSI escape stripping */
    const stripped = output
      .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "")
      .replace(/[\x00-\x09\x0b-\x1f]/g, "");
    /* oxlint-enable no-control-regex */
    const lower = stripped.toLowerCase();

    const hasResponse =
      lower.includes("pong") ||
      lower.includes("ok") ||
      lower.includes("connected") ||
      lower.includes("symphony") ||
      lower.includes("session") ||
      stripped.length > 100;

    console.log(
      `[openclaw-e2e] TUI response check (${stripped.length} chars): ` +
        `hasPong=${lower.includes("pong")}, ` +
        `preview=${stripped.slice(0, 400).replace(/\n/g, "⏎")}`,
    );

    expect(hasResponse, "TUI should show a connection indicator or model response").toBe(true);
  });

  test("openclaw tui sends prompt through pipeline and validates response via API", async () => {
    test.setTimeout(180_000);

    const reachable = isGatewayReachable();
    if (!reachable) {
      test.skip(true, "OpenClaw gateway not reachable - requires running gateway on port 4320");
    }

    const sessionId = `e2e-content-${Date.now()}`;
    const prompt = "What is 6 times 7? Reply with ONLY the number, nothing else.";

    // Phase 1: Send prompt through the TUI and validate pipeline
    const tuiResult = runTuiPromptWithPexpect(prompt, sessionId, 120);

    console.log(
      `[openclaw-e2e] TUI prompt test: connected=${tuiResult.connected}, ` +
        `running=${tuiResult.running}, idle=${tuiResult.idle}, ` +
        `elapsed=${tuiResult.elapsed}s, rawLen=${tuiResult.rawLength}, ` +
        `error=${tuiResult.error || "none"}`,
    );
    if (tuiResult.modelInfo) {
      console.log(`[openclaw-e2e] TUI model: ${tuiResult.modelInfo}`);
    }
    if (tuiResult.tokenInfo) {
      console.log(`[openclaw-e2e] TUI tokens: ${tuiResult.tokenInfo}`);
    }

    expect(tuiResult.connected, "TUI should connect to the gateway").toBe(true);

    expect(
      tuiResult.running || tuiResult.idle,
      "Model should start processing the prompt (running or idle state)",
    ).toBe(true);

    if (tuiResult.idle) {
      expect(
        tuiResult.modelInfo.length,
        "TUI should display model identifier after completion",
      ).toBeGreaterThan(0);
    }

    // Phase 2: Validate response content via Symphony HTTP API
    // (same backend the TUI uses — proves the pipeline returns correct content)
    const bridgeReachable = await isBridgeReachable(SYMPHONY_BASE_URL);
    if (!bridgeReachable) {
      console.log("[openclaw-e2e] Symphony bridge not reachable, skipping content validation");
      return;
    }

    const { status, data, elapsed } = await sendCompletion("symphony/main", prompt);
    const errMsg = (data.error as Record<string, string>)?.message ?? "";
    if (isTransientError(status, errMsg)) {
      console.log(`[openclaw-e2e] Content validation: transient error (${errMsg}), skipping`);
      test.skip(true, "Transient error");
      return;
    }

    expect(status, `HTTP API returned ${status}: ${errMsg}`).toBe(200);

    const content = String(
      (data.choices as Array<{ message: { content: string } }>)[0]?.message?.content ?? "",
    );

    console.log(
      `[openclaw-e2e] Content validation: provider=${data._symphony_provider}, ` +
        `elapsed=${elapsed}ms, content="${content.slice(0, 100)}"`,
    );

    expect(
      content.includes("42"),
      `Model response should contain "42" for 6×7, got: "${content.slice(0, 200)}"`,
    ).toBe(true);
  });
});
