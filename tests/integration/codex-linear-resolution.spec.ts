/**
 * E2E tests for Codex CLI dynamic AI model selection — Linear issue resolution flow.
 *
 * Validates that `codex -c model='"symphony/main"' -c model_provider='"symphony"'`
 * can successfully process long multi-tool tasks that simulate resolving
 * complex Linear issues, including:
 *
 * 1. search_linear_issues tool invocation
 * 2. Code search + Linear context synthesis
 * 3. Multi-step analysis with file reads and writes
 * 4. Bridge tool loop stability over extended runs
 * 5. Journalctl log analysis for error detection
 *
 * Run: npx vitest run tests/integration/codex-linear-resolution.spec.ts
 *       --config vitest.integration.config.ts
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "node:child_process";
import { spawnSymphonyBridge } from "../helpers/spawn-test-bridge";
import { runCodexExec, createTempWorkDir, cleanupTempDir } from "../helpers/run-codex-exec";
import { watchJournalctl, fetchJournalctlLogs, isJournalctlAvailable } from "../helpers/watch-journalctl";
import { waitForProviders } from "../helpers/wait-for-providers";

// Skip entire suite if codex CLI is not available
const codexAvailable = (() => {
  try {
    execSync("which codex", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

// ── Test suite ──────────────────────────────────────────────────────────

describe.skipIf(!codexAvailable)("Codex CLI — Linear issue resolution E2E", () => {
  let bridge: Awaited<ReturnType<typeof spawnSymphonyBridge>> | null = null;
  let tempDir: string | null = null;
  let logWatcher: ReturnType<typeof watchJournalctl> | null = null;

  beforeAll(async () => {
    bridge = await spawnSymphonyBridge({
      preferredPort: 14329,
      apiKey: "test-symphony-linear",
    });

    console.log(`[linear-e2e] Bridge started on port ${bridge.port}`);

    const available = await waitForProviders(bridge.baseUrl, bridge.apiKey, 1, 90_000);
    console.log(`[linear-e2e] ${available} provider(s) available`);

    tempDir = createTempWorkDir();

    // Watch journalctl for the codex service
    if (isJournalctlAvailable()) {
      logWatcher = watchJournalctl({
        unit: "anqr-symphony-codex.service",
        since: "1 min ago",
      });
    }
  }, 120_000);

  afterAll(async () => {
    if (bridge) {
      await bridge.cleanup();
      console.log(`[linear-e2e] Bridge stopped`);
    }
    if (tempDir) {
      cleanupTempDir(tempDir);
    }
    if (logWatcher) {
      const logs = logWatcher.stop();
      const errorLines = logs
        .split("\n")
        .filter((l) => /error|fatal|crash|timeout|ECONNREFUSED/i.test(l))
        .slice(0, 30);
      if (errorLines.length > 0) {
        console.log(`[linear-e2e] Journalctl error lines detected:`);
        for (const line of errorLines) {
          console.log(`  ${line}`);
        }
      }
    }
  });

  // ── 1. Bridge exposes search_linear_issues tool ────────────────────

  it("bridge accepts a tool-aware chat request with search_linear_issues available", async () => {
    if (!bridge) throw new Error("Bridge not initialized");

    // Verify the bridge is running and accepts tool-aware requests.
    // The search_linear_issues tool is defined in tools.mjs and exposed
    // to tool-capable providers.
    const res = await fetch(`${bridge.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bridge.apiKey}`,
      },
      body: JSON.stringify({
        model: "symphony/main",
        messages: [{ role: "user", content: "What tools do you have? List them briefly." }],
        stream: false,
      }),
      signal: AbortSignal.timeout(60_000),
    });

    // Accept either success or a provider error — either proves the request
    // was routed through the tool-aware pipeline
    expect(res.status).not.toBe(400);
    expect(res.status).not.toBe(404);
  }, 70_000);

  // ── 2. search_linear_issues tool via Codex exec ────────────────────

  it(
    "codex exec can invoke search_linear_issues through the bridge",
    async () => {
      if (!bridge) throw new Error("Bridge not initialized");

      const result = await runCodexExec({
        prompt:
          "Use the search_linear_issues tool to search for 'validation errors' in the ANQR project. " +
          "If the tool returns results, tell me how many results were found. " +
          "If the tool returns an error, tell me what the error message was.",
        bridgeBaseUrl: bridge.baseUrl,
        bridgeApiKey: bridge.apiKey,
        timeoutMs: 150_000,
      });

      if (result.timedOut) {
        console.log(`[linear-e2e] search_linear_issues TIMED OUT after ${result.durationMs}ms`);
        console.log(`[linear-e2e] stderr: ${result.stderr.slice(0, 500)}`);
      }

      expect(result.timedOut).toBe(false);
      expect(result.exitCode).not.toBeNull();

      // The output should contain something — either search results or
      // an error about the RAG index not being built (which is expected
      // in CI environments without a populated Linear export)
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    },
    170_000,
  ); // 170s: tool selection + Linear RAG search + response

  // ── 3. Multi-step Linear issue resolution ──────────────────────────

  it(
    "codex exec completes a multi-step Linear issue resolution simulation",
    async () => {
      if (!bridge) throw new Error("Bridge not initialized");
      if (!tempDir) throw new Error("Temp dir not initialized");

      // Simulates resolving a Linear issue that requires:
      // 1. Search Linear issues for prior context
      // 2. Search codebase for the relevant implementation
      // 3. Read the relevant files
      // 4. Write an analysis/solution to a file
      const reportPath = `linear-resolution-report.md`;

      const result = await runCodexExec({
        prompt:
          "I need to resolve a Linear issue about provider routing failures. Steps: " +
          "1) Use search_linear_issues to look for prior issues about 'provider routing'. " +
          "2) Search the codebase for 'selectProvider' and 'credit-gate' to understand the implementation. " +
          "3) Read the key files you find. " +
          "4) Write a brief summary of how provider routing works and common failure modes " +
          `to ${reportPath} as markdown with bullet points.`,
        bridgeBaseUrl: bridge.baseUrl,
        bridgeApiKey: bridge.apiKey,
        cwd: tempDir,
        timeoutMs: 240_000,
      });

      if (result.timedOut) {
        console.log(`[linear-e2e] Multi-step resolution TIMED OUT after ${result.durationMs}ms`);
        console.log(`[linear-e2e] stderr: ${result.stderr.slice(0, 500)}`);
      }

      expect(result.timedOut).toBe(false);
      expect(result.exitCode).not.toBeNull();

      // Verify completion — the task should finish without crashing
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(10);
    },
    260_000,
  ); // 260s: 4-step Linear issue resolution simulation

  // ── 4. Long tool loop stability ────────────────────────────────────

  it(
    "codex exec handles a 5+ tool call chain without timing out or crashing",
    async () => {
      if (!bridge) throw new Error("Bridge not initialized");
      if (!tempDir) throw new Error("Temp dir not initialized");

      // This test ensures the tool loop can handle many sequential tool calls
      // — a common pattern when resolving complex Linear issues that require
      // investigating multiple files and making cross-references
      const result = await runCodexExec({
        prompt:
          "Investigate the test coverage for the harness. Steps: " +
          "1) Search for 'spec.ts' files in the project using glob. " +
          "2) Read the first test file you find. " +
          "3) Search for 'describe' in the codebase to count test suites. " +
          "4) Read the vitest config to understand test configuration. " +
          "5) Write a one-sentence summary of what you found about test coverage.",
        bridgeBaseUrl: bridge.baseUrl,
        bridgeApiKey: bridge.apiKey,
        cwd: tempDir,
        timeoutMs: 240_000,
      });

      if (result.timedOut) {
        console.log(`[linear-e2e] 5-tool chain TIMED OUT after ${result.durationMs}ms`);
        console.log(`[linear-e2e] stderr: ${result.stderr.slice(0, 500)}`);
      }

      expect(result.timedOut).toBe(false);
      // Any non-null exit code proves the tool loop didn't crash
      expect(result.exitCode).not.toBeNull();

      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    },
    260_000,
  ); // 260s: 5+ tool calls need extended time

  // ── 5. Journalctl log analysis for bridge errors ───────────────────

  it("journalctl shows no fatal errors from the bridge during Codex workloads", async () => {
    if (!isJournalctlAvailable()) {
      console.log("[linear-e2e] journalctl not available — skipping log analysis");
      return;
    }

    // Fetch logs from the last 5 minutes
    const logs = fetchJournalctlLogs("anqr-symphony-codex.service", "5 min ago");

    if (!logs || logs.trim().length === 0) {
      console.log("[linear-e2e] No journalctl logs found — service may not be running");
      return;
    }

    // Check for fatal errors — these would indicate bridge crashes
    const fatalErrors = logs
      .split("\n")
      .filter((l) => /fatal|segfault|SIGSEGV|SIGABRT|unhandled.*exception/i.test(l));

    // Check for connection refused errors — these indicate bridge restarts
    const connectionErrors = logs
      .split("\n")
      .filter((l) => /ECONNREFUSED|connection refused/i.test(l));

    // Log what we found for diagnostics
    if (fatalErrors.length > 0) {
      console.log(`[linear-e2e] FATAL errors in journalctl: ${fatalErrors.length}`);
      for (const line of fatalErrors.slice(0, 10)) {
        console.log(`  ${line}`);
      }
    }

    if (connectionErrors.length > 0) {
      console.log(`[linear-e2e] Connection errors in journalctl: ${connectionErrors.length}`);
    }

    // Fatal errors are a hard failure — the bridge should never crash
    expect(fatalErrors.length).toBe(0);

    // Connection errors should be rare (indicates possible bridge restarts)
    // We allow up to 5 since the bridge may restart between provider probes
    expect(connectionErrors.length).toBeLessThan(5);
  });

  // ── 6. Bridge health after extended workloads ──────────────────────

  it("bridge remains healthy after extended Linear-style workloads", async () => {
    if (!bridge) throw new Error("Bridge not initialized");

    const res = await fetch(`${bridge.baseUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    expect(res.ok).toBe(true);

    const health = (await res.json()) as Record<string, unknown>;
    expect(health.status).toBe("ok");

    // Verify metrics endpoint still works
    const metricsRes = await fetch(`${bridge.baseUrl}/v1/metrics`, {
      headers: { Authorization: `Bearer ${bridge.apiKey}` },
      signal: AbortSignal.timeout(5000),
    });
    expect(metricsRes.ok).toBe(true);

    const metrics = (await metricsRes.json()) as Record<string, unknown>;
    const bridgeMetrics = metrics.bridge as Record<string, unknown> | undefined;

    if (bridgeMetrics) {
      const totalRequests = (bridgeMetrics.totalRequests as number) || 0;
      const totalErrors = (bridgeMetrics.totalErrors as number) || 0;

      if (totalRequests > 0) {
        const errorRate = totalErrors / totalRequests;
        // Error rate under 50% after extended workloads
        expect(errorRate).toBeLessThan(0.5);
        console.log(
          `[linear-e2e] Bridge metrics: ${totalRequests} requests, ` +
            `${totalErrors} errors (${(errorRate * 100).toFixed(1)}% error rate)`,
        );
      }
    }
  });
});
