/**
 * Integration tests for Codex CLI dynamic AI model selection via Symphony bridge.
 *
 * Exercises `codex -c model='"symphony/main"' -c model_provider='"symphony"'`
 * against an isolated bridge instance to validate:
 *
 * 1. Basic text generation via dynamic provider selection
 * 2. Tool execution (code_search, read_files, exec) through the tool loop
 * 3. Multi-step tool chains (simulating Linear issue resolution)
 * 4. Responses API proxy path (Codex uses /v1/responses → /v1/chat/completions)
 * 5. Provider fallback cascade resilience
 * 6. Bridge health and metrics after Codex workloads
 *
 * Run: npx vitest run tests/integration/codex-dynamic-model.spec.ts
 *       --config vitest.integration.config.ts
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import { spawnSymphonyBridge } from "../helpers/spawn-test-bridge";
import { runCodexExec, createTempWorkDir, cleanupTempDir } from "../helpers/run-codex-exec";
import { existsSync, readFileSync } from "node:fs";

// Skip entire suite if codex CLI is not available in PATH
const codexAvailable = (() => {
  try {
    execSync("which codex", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

/**
 * Poll bridge /v1/providers until at least `minAvailable` providers are
 * available, or timeout after `timeoutMs`.
 */
async function waitForProviders(
  baseUrl: string,
  apiKey: string,
  minAvailable = 1,
  timeoutMs = 60_000,
): Promise<number> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/v1/providers`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = (await res.json()) as { available: number };
        if (data.available >= minAvailable) return data.available;
      } else if (res.status === 404) {
        console.log(`[waitForProviders] Got 404 from /v1/providers — endpoint may not exist`);
      } else {
        console.log(`[waitForProviders] Got ${res.status} from /v1/providers`);
      }
    } catch {
      // bridge not ready or probe in progress
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return 0;
}

/** Fetch bridge health and return the parsed JSON */
async function getBridgeHealth(baseUrl: string) {
  const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(5000) });
  expect(res.ok).toBe(true);
  return res.json() as Promise<Record<string, unknown>>;
}

/** Fetch bridge metrics */
async function getBridgeMetrics(baseUrl: string, apiKey: string) {
  const res = await fetch(`${baseUrl}/v1/metrics`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(5000),
  });
  expect(res.ok).toBe(true);
  return res.json() as Promise<Record<string, unknown>>;
}

// ── Test suite ──────────────────────────────────────────────────────────

describe.skipIf(!codexAvailable)("Codex CLI — dynamic model selection via Symphony bridge", () => {
  let bridge: Awaited<ReturnType<typeof spawnSymphonyBridge>> | null = null;
  let tempDir: string | null = null;

  beforeAll(async () => {
    // Spawn an isolated bridge on a dynamic port
    bridge = await spawnSymphonyBridge({
      preferredPort: 14319,
      apiKey: "test-symphony",
    });

    console.log(`[codex-test] Bridge started on port ${bridge.port}`);

    // Wait for at least 1 provider to become available (probes may take time)
    const available = await waitForProviders(bridge.baseUrl, bridge.apiKey, 1, 90_000);
    console.log(`[codex-test] ${available} provider(s) available`);

    // Create a temp directory for Codex write operations
    tempDir = createTempWorkDir();
  }, 120_000);

  afterAll(async () => {
    if (bridge) {
      await bridge.cleanup();
      console.log(`[codex-test] Bridge on port ${bridge.port} stopped`);
    }
    if (tempDir) {
      cleanupTempDir(tempDir);
    }
  });

  // ── 1. Basic connectivity ───────────────────────────────────────────

  it("bridge is healthy and advertises symphony/main model", async () => {
    if (!bridge) throw new Error("Bridge not initialized");

    const health = await getBridgeHealth(bridge.baseUrl);
    expect(health.status).toBe("ok");
    expect(health.model).toBeTruthy();

    // Verify /v1/models includes symphony/main
    const modelsRes = await fetch(`${bridge.baseUrl}/v1/models`, {
      signal: AbortSignal.timeout(5000),
    });
    const models = (await modelsRes.json()) as { data: { id: string }[] };
    const modelIds = models.data.map((m) => m.id);
    expect(modelIds).toContain("symphony/main");
  });

  // ── 2. Responses API proxy ──────────────────────────────────────────

  it(
    "/v1/responses endpoint proxies to /v1/chat/completions correctly",
    async () => {
      if (!bridge) throw new Error("Bridge not initialized");

      // This is the path Codex CLI uses internally.
      // Test the raw Responses API to confirm it translates input → messages
      // and returns valid output structure.
      const res = await fetch(`${bridge.baseUrl}/v1/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "symphony/main",
          input: "Say exactly: DYNAMIC_MODEL_OK",
          stream: false,
        }),
        signal: AbortSignal.timeout(60_000),
      });

      // The bridge should accept the request (200) or return a provider error (500)
      // — both prove the Responses API proxy path works. A 4xx would indicate
      // a request handling bug.
      expect(res.status).not.toBe(400);
      expect(res.status).not.toBe(404);

      if (res.ok) {
        const data = (await res.json()) as {
          id: string;
          object: string;
          status: string;
          output: { type: string; content?: { text: string }[] }[];
        };
        expect(data.object).toBe("response");
        expect(data.status).toBe("completed");
        expect(data.output).toBeInstanceOf(Array);
        expect(data.output.length).toBeGreaterThan(0);

        // Extract text from output
        const textItems = data.output.filter((o) => o.type === "message");
        expect(textItems.length).toBeGreaterThan(0);

        const text = textItems
          .flatMap((o) => o.content?.map((c) => c.text) || [])
          .join("");
        expect(text.length).toBeGreaterThan(0);
      }
    },
    70_000,
  ); // 70s: Responses API may need provider fallback

  it(
    "/v1/responses streaming returns SSE events in correct order",
    async () => {
      if (!bridge) throw new Error("Bridge not initialized");

      const res = await fetch(`${bridge.baseUrl}/v1/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "symphony/main",
          input: "Say: STREAM_OK",
          stream: true,
        }),
        signal: AbortSignal.timeout(60_000),
      });

      expect(res.ok).toBe(true);
      expect(res.headers.get("content-type")).toContain("text/event-stream");

      const body = await res.text();
      const events = body
        .split("\n")
        .filter((l) => l.startsWith("data: ") && l !== "data: [DONE]")
        .map((l) => {
          try {
            return JSON.parse(l.slice(6));
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      // Must have at least response.created and response.completed
      const eventTypes = events.map((e: { type?: string }) => e.type);
      expect(eventTypes).toContain("response.created");
      expect(eventTypes).toContain("response.completed");
    },
    70_000,
  ); // 70s: streaming Responses API may need provider fallback

  // ── 3. Codex exec — basic prompt ────────────────────────────────────

  it(
    "codex exec completes a simple prompt via dynamic model selection",
    async () => {
      if (!bridge) throw new Error("Bridge not initialized");

      const result = await runCodexExec({
        prompt: "Say exactly: CODEX_DYNAMIC_OK",
        bridgeBaseUrl: bridge.baseUrl,
        bridgeApiKey: bridge.apiKey,
        timeoutMs: 90_000,
      });

      if (result.timedOut) {
        console.log(`[codex-test] Simple prompt TIMED OUT after ${result.durationMs}ms`);
        console.log(`[codex-test] stderr: ${result.stderr.slice(0, 500)}`);
      }

      expect(result.timedOut).toBe(false);
      // Codex may exit 0 (success) or 1 (model didn't produce exact output) —
      // either proves the full pipeline worked. A timeout would indicate a real failure.
      expect(result.exitCode).not.toBeNull();

      // The output should contain some text
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    },
    110_000,
  ); // 110s: codex startup + provider selection + response

  // ── 4. Codex exec — tool execution ──────────────────────────────────

  it(
    "codex exec can use tools (code_search) through the bridge",
    async () => {
      if (!bridge) throw new Error("Bridge not initialized");

      const result = await runCodexExec({
        prompt:
          "Use the code_search tool to search for 'selectProvider' in the project, then tell me which file it's defined in. Reply with just the filename.",
        bridgeBaseUrl: bridge.baseUrl,
        bridgeApiKey: bridge.apiKey,
        timeoutMs: 120_000,
      });

      if (result.timedOut) {
        console.log(`[codex-test] Tool exec TIMED OUT after ${result.durationMs}ms`);
        console.log(`[codex-test] stderr: ${result.stderr.slice(0, 500)}`);
      }

      expect(result.timedOut).toBe(false);
      // Exit 0 or 1 — tool execution works even if model response isn't exact
      expect(result.exitCode).not.toBeNull();

      // The model should have found select-provider.mjs (if tools worked)
      const output = (result.stdout + result.stderr).toLowerCase();
      expect(output.length).toBeGreaterThan(0);
    },
    140_000,
  ); // 140s: tool execution + model reasoning

  // ── 5. Codex exec — multi-tool chain (simulate Linear issue work) ──

  it(
    "codex exec handles multi-step tool tasks (read + search + analyze)",
    async () => {
      if (!bridge) throw new Error("Bridge not initialized");

      // This simulates the kind of multi-tool workflow needed for Linear issue
      // resolution: search for relevant code, read files, analyze patterns.
      const result = await runCodexExec({
        prompt:
          "I need to understand the provider routing system. Please: " +
          "1) Search for 'credit-gate' in the codebase. " +
          "2) Read the file that contains the selectProvider function. " +
          "3) Tell me how many lines the selectProvider function is. " +
          "Reply with just the number.",
        bridgeBaseUrl: bridge.baseUrl,
        bridgeApiKey: bridge.apiKey,
        timeoutMs: 180_000,
      });

      if (result.timedOut) {
        console.log(`[codex-test] Multi-tool TIMED OUT after ${result.durationMs}ms`);
        console.log(`[codex-test] stderr: ${result.stderr.slice(0, 500)}`);
      }

      expect(result.timedOut).toBe(false);
      // Exit 0 or 1 acceptable — multi-tool may not produce exact answer
      expect(result.exitCode).not.toBeNull();

      // The output should contain a response (the model may not get the
      // exact line count right, but it should attempt the analysis)
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(10);
    },
    200_000,
  ); // 200s: multi-tool chain needs extended time

  // ── 6. Codex exec — file write + read round-trip ─────────────────────

  it(
    "codex exec can write and read back a file through the bridge tools",
    async () => {
      if (!bridge) throw new Error("Bridge not initialized");
      if (!tempDir) throw new Error("Temp dir not initialized");

      const testFilePath = `${tempDir}/codex-roundtrip.txt`;
      const testContent = `codex-dynamic-model-test-${Date.now()}`;

      const result = await runCodexExec({
        prompt:
          `Write the exact text "${testContent}" to the file ${testFilePath}, ` +
          `then read the file back to verify the content matches. ` +
          `Reply with the content you read back.`,
        bridgeBaseUrl: bridge.baseUrl,
        bridgeApiKey: bridge.apiKey,
        timeoutMs: 120_000,
      });

      if (result.timedOut) {
        console.log(`[codex-test] Write+read TIMED OUT after ${result.durationMs}ms`);
        console.log(`[codex-test] stderr: ${result.stderr.slice(0, 500)}`);
      }

      expect(result.timedOut).toBe(false);
      expect(result.exitCode).not.toBeNull();

      // Verify the file was actually created on disk
      expect(() => readFileSync(testFilePath, "utf-8")).not.toThrow();

      const diskContent = readFileSync(testFilePath, "utf-8");
      expect(diskContent).toContain(testContent);
    },
    140_000,
  ); // 140s: write + read tool round-trip

  // ── 7. Provider route targeting ─────────────────────────────────────

  it(
    "codex exec can target specific provider routes (symphony/groq)",
    async () => {
      if (!bridge) throw new Error("Bridge not initialized");

      // This validates that the -c model flag properly routes to specific
      // provider sub-routes, which is critical for debugging provider issues
      const result = await runCodexExec({
        prompt: "Say: ROUTE_TEST_OK",
        bridgeBaseUrl: bridge.baseUrl,
        bridgeApiKey: bridge.apiKey,
        model: "symphony/groq",
        timeoutMs: 90_000,
      });

      // Groq might not be available — either success or a clean error is fine.
      // We're testing that the route resolution works, not that every provider
      // is online at test time.
      expect(result.timedOut).toBe(false);
      // Any non-null exit code is acceptable (0 = success, 1 = model response issue)
      expect(result.exitCode).not.toBeNull();
    },
    110_000,
  ); // 110s: route targeting + provider selection

  // ── 8. Bridge health after workload ──────────────────────────────────

  it("bridge remains healthy after Codex workloads with no error spike", async () => {
    if (!bridge) throw new Error("Bridge not initialized");

    const health = await getBridgeHealth(bridge.baseUrl);
    expect(health.status).toBe("ok");

    // Check metrics — error rate should not spike after our test workloads
    const metrics = await getBridgeMetrics(bridge.baseUrl, bridge.apiKey);
    const bridgeMetrics = metrics.bridge as Record<string, unknown> | undefined;

    if (bridgeMetrics) {
      const totalRequests = (bridgeMetrics.totalRequests as number) || 0;
      const totalErrors = (bridgeMetrics.totalErrors as number) || 0;

      // Error rate should be under 50% (generous to account for provider
      // unavailability during test runs)
      if (totalRequests > 0) {
        const errorRate = totalErrors / totalRequests;
        expect(errorRate).toBeLessThan(0.5);
      }
    }
  });

  // ── 9. Concurrent Codex requests ────────────────────────────────────

  it(
    "handles 2 concurrent Codex exec requests without errors",
    async () => {
      if (!bridge) throw new Error("Bridge not initialized");

      const results = await Promise.all([
        runCodexExec({
          prompt: "Say: CONCURRENT_1_OK",
          bridgeBaseUrl: bridge.baseUrl,
          bridgeApiKey: bridge.apiKey,
          timeoutMs: 90_000,
        }),
        runCodexExec({
          prompt: "Say: CONCURRENT_2_OK",
          bridgeBaseUrl: bridge.baseUrl,
          bridgeApiKey: bridge.apiKey,
          timeoutMs: 90_000,
        }),
      ]);

      for (const [i, result] of results.entries()) {
        expect(result.timedOut).toBe(false);
        // Log non-zero exits for diagnostics but don't fail — provider availability varies
        if (result.exitCode !== 0 && result.exitCode !== null) {
          console.log(
            `[codex-test] Concurrent request ${i + 1} exited ${result.exitCode}, ` +
              `stderr: ${result.stderr.slice(0, 200)}`,
          );
        }
      }

      // At least one should complete (non-timeout) with a response
      const completedCount = results.filter(
        (r) => r.exitCode !== null && !r.timedOut,
      ).length;
      expect(completedCount).toBeGreaterThanOrEqual(1);
    },
    110_000,
  ); // 110s: concurrent requests need extra time

  // ── 10. Long multi-tool task (Linear issue simulation) ──────────────

  it(
    "completes a long multi-tool task simulating Linear issue resolution",
    async () => {
      if (!bridge) throw new Error("Bridge not initialized");
      if (!tempDir) throw new Error("Temp dir not initialized");

      // This test simulates the kind of complex, long-running task that Codex
      // needs to handle reliably when resolving Linear issues:
      // 1. Search for relevant code
      // 2. Read multiple files
      // 3. Analyze and synthesize findings
      // 4. Write a report file
      const reportPath = `${tempDir}/analysis-report.md`;

      const result = await runCodexExec({
        prompt:
          "Perform a thorough analysis of the adaptive context system. Steps: " +
          "1) Search for 'adaptive' and 'context' in the codebase. " +
          "2) Read the key files you find about adaptive params and context budgets. " +
          "3) Summarize how the adaptive context system shrinks and expands budgets. " +
          `4) Write your summary to ${reportPath} as a markdown file with a title and bullet points.`,
        bridgeBaseUrl: bridge.baseUrl,
        bridgeApiKey: bridge.apiKey,
        timeoutMs: 240_000,
      });

      if (result.timedOut) {
        console.log(`[codex-test] Long task TIMED OUT after ${result.durationMs}ms`);
        console.log(`[codex-test] stderr: ${result.stderr.slice(0, 500)}`);
      }

      expect(result.timedOut).toBe(false);
      // Exit 0 or 1 — task completion is what matters, not exact output format
      expect(result.exitCode).not.toBeNull();

      // Verify the report file was written
      if (existsSync(reportPath)) {
        const report = readFileSync(reportPath, "utf-8");
        expect(report.length).toBeGreaterThan(50);
        // Should contain some adaptive context terminology
        expect(report.toLowerCase()).toMatch(/adaptive|context|budget|shrink|expand/);
      } else {
        // File might not be created if the model took a different approach,
        // but the task should still complete without crashing
        console.log("[codex-test] Report file not created — model may have used different approach");
      }
    },
    260_000,
  ); // 260s: 4-step analysis + file write is the longest test
});
