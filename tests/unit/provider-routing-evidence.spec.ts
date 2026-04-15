import { describe, it, expect, afterAll, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Workstream F — Provider routing evidence tests.
 *
 * Phase 1+2: Evidence recording modules and lifecycle.
 * Phase 3:   Failure-path evidence coverage (F2, F3, F4, F6).
 *
 * Test strategy:
 * - ~12 architecture guard tests: source-level wiring checks for cross-module
 *   integration that cannot be tested without a full HTTP server.
 * - ~25 runtime behavioral tests: import actual modules, create evidence
 *   records, and verify correct output shapes and data flow.
 */

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

// ---------------------------------------------------------------------------
// 1. Architecture guard — wiring verification
// ---------------------------------------------------------------------------
// Source-level checks that verify cross-module integration wiring. These guard
// against accidental removal of evidence emission call sites during refactors.
// They intentionally read source text because the alternative (spinning up the
// full HTTP server with mocked providers) is disproportionately expensive.

describe("Architecture guard — wiring verification", () => {
  const serverPath = path.resolve(
    REPO_ROOT,
    "harness/ops/integrations/model/symphony-openai-bridge/server.mjs",
  );
  const fallbackPath = path.resolve(
    REPO_ROOT,
    "harness/ops/integrations/model/symphony-openai-bridge/invoke-with-fallback.mjs",
  );
  const streamPath = path.resolve(
    REPO_ROOT,
    "harness/ops/integrations/model/symphony-openai-bridge/invoke-with-fallback-stream.mjs",
  );

  // --- server.mjs wiring ---

  it("server.mjs imports all four evidence functions", () => {
    const source = fs.readFileSync(serverPath, "utf-8");
    expect(source).toContain("recordProviderSelection");
    expect(source).toContain("recordProviderRoutingEvidence");
    expect(source).toContain("recordContextReductionEvidence");
    expect(source).toContain("recordSafetyNetEvidence");
  });

  it("server.mjs emits routing evidence on all five paths (streaming/non-streaming success, streaming/non-streaming failure, Codebuff relay)", () => {
    const source = fs.readFileSync(serverPath, "utf-8");
    const routingCalls = source.match(/recordProviderRoutingEvidence\(correlationId/g);
    // 5 call sites: streaming success, streaming failure, non-streaming success,
    // non-streaming failure, Codebuff transparent relay
    expect(routingCalls).not.toBeNull();
    expect(routingCalls!.length).toBeGreaterThanOrEqual(5);
  });

  it("server.mjs emits safety-net evidence for both streaming and non-streaming failure", () => {
    const source = fs.readFileSync(serverPath, "utf-8");
    const safetyNetCalls = source.match(/recordSafetyNetEvidence\(correlationId/g);
    expect(safetyNetCalls).not.toBeNull();
    expect(safetyNetCalls!.length).toBeGreaterThanOrEqual(2);
  });

  it("server.mjs emits context-reduction evidence on success and failure paths", () => {
    const source = fs.readFileSync(serverPath, "utf-8");
    const reductionCalls = source.match(/recordContextReductionEvidence\(\s*correlationId/g) ||
      source.match(/recordContextReductionEvidence\(correlationId/g);
    // 4 call sites: streaming success, streaming failure, non-streaming success,
    // non-streaming failure
    expect(reductionCalls).not.toBeNull();
    expect(reductionCalls!.length).toBeGreaterThanOrEqual(4);
  });

  it("server.mjs failure paths emit routing evidence with selectedProvider: null", () => {
    const source = fs.readFileSync(serverPath, "utf-8");
    // Non-streaming and streaming failure paths must record null selectedProvider
    expect(source).toContain("selectedProvider: null");
  });

  it("server.mjs Codebuff relay path emits routing evidence (F6)", () => {
    const source = fs.readFileSync(serverPath, "utf-8");
    // The Codebuff relay section must contain routing evidence emission
    expect(source).toContain("Codebuff transparent relay (F6)");
    expect(source).toContain("result.providerName");
  });

  // --- invokeWithFallback wiring ---

  it("invokeWithFallback tracks fallbackChain, contextReductions, and returns them", () => {
    const source = fs.readFileSync(fallbackPath, "utf-8");
    expect(source).toContain("const fallbackChain = []");
    expect(source).toContain("const contextReductions = []");
    expect(source).toContain("fallbackChain: [...fallbackChain]");
    expect(source).toContain("contextReductions: [...contextReductions]");
  });

  it("invokeWithFallbackStream tracks fallbackChain, contextReductions, and returns them", () => {
    const source = fs.readFileSync(streamPath, "utf-8");
    expect(source).toContain("const fallbackChain = []");
    expect(source).toContain("const contextReductions = []");
    expect(source).toContain("fallbackChain: [...fallbackChain]");
    expect(source).toContain("contextReductions: [...contextReductions]");
  });

  it("both invoke functions include contextReductions in safetyNetData (F4)", () => {
    const fallbackSource = fs.readFileSync(fallbackPath, "utf-8");
    const streamSource = fs.readFileSync(streamPath, "utf-8");
    // safetyNetData must carry contextReductions for failure-path evidence
    expect(fallbackSource).toContain("contextReductions: [...contextReductions]");
    expect(streamSource).toContain("contextReductions: [...contextReductions]");
    // Verify it's inside safetyNetData assignment (both have the pattern)
    const fallbackSafetyNet = fallbackSource.slice(
      fallbackSource.indexOf("exhaustionError.safetyNetData"),
      fallbackSource.indexOf("throw exhaustionError"),
    );
    expect(fallbackSafetyNet).toContain("contextReductions");
  });

  // --- Barrel exports ---

  it("task-evidence index.mjs exports all evidence functions", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/core/task-evidence/index.mjs"),
      "utf-8",
    );
    expect(source).toContain("recordProviderRoutingEvidence");
    expect(source).toContain("recordContextReductionEvidence");
    expect(source).toContain("recordSafetyNetEvidence");
    expect(source).toContain("queryRoutingEvidence");
  });

  it("task-evidence.mjs facade re-exports from index", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/core/task-evidence.mjs"),
      "utf-8",
    );
    expect(source).toContain("task-evidence/index.mjs");
  });
});

// ---------------------------------------------------------------------------
// 2. recordProviderRoutingEvidence — runtime behavior
// ---------------------------------------------------------------------------

describe("recordProviderRoutingEvidence — runtime", () => {
  const corrId = `test-routing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  beforeAll(async () => {
    const { saveEvidence } = await import(
      "../../harness/ops/core/task-evidence/save-evidence.mjs"
    );
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );
    evidencePath = getEvidencePath(corrId);
    saveEvidence(corrId, { createdAt: new Date().toISOString(), correlationId: corrId });
  });

  afterAll(() => {
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
  });

  it("records success routing with correct shape", async () => {
    const { recordProviderRoutingEvidence } = await import(
      "../../harness/ops/core/task-evidence/record-provider-routing-evidence.mjs"
    );
    const result = recordProviderRoutingEvidence(corrId, {
      routeModelId: "gpt-4o",
      allowedProviders: ["groq", "gemini", "openrouter"],
      selectedProvider: "gemini",
      attempts: 2,
      triedProviders: ["groq", "gemini"],
      fallbackChain: [
        { providerName: "groq", model: "llama-3", attemptNumber: 1, outcome: "failure", durationMs: 1200, errorType: "rate_limit", errorMessage: "429 Too Many Requests" },
        { providerName: "gemini", model: "gemini-2.5-pro", attemptNumber: 2, outcome: "success", durationMs: 3400 },
      ],
    });

    expect(result).not.toBeNull();
    expect(result.providerRouting.decidedAt).toBeTruthy();
    expect(result.providerRouting.routeModelId).toBe("gpt-4o");
    expect(result.providerRouting.selectedProvider).toBe("gemini");
    expect(result.providerRouting.attempts).toBe(2);
    expect(result.providerRouting.triedProviders).toEqual(["groq", "gemini"]);
    expect(result.providerRouting.hasFallback).toBe(true);
    expect(result.providerRouting.fallbackChain).toHaveLength(2);
  });

  it("per-attempt entries include errorType/errorMessage for failures and null for successes", async () => {
    const loaded = JSON.parse(fs.readFileSync(evidencePath, "utf-8"));
    const chain = loaded.providerRouting.fallbackChain;
    expect(chain[0].outcome).toBe("failure");
    expect(chain[0].errorType).toBe("rate_limit");
    expect(chain[0].errorMessage).toBe("429 Too Many Requests");
    expect(chain[0].durationMs).toBe(1200);
    expect(chain[1].outcome).toBe("success");
    expect(chain[1].errorType).toBeNull();
    expect(chain[1].errorMessage).toBeNull();
  });

  it("hasFallback is false when attempts === 1", async () => {
    const { recordProviderRoutingEvidence } = await import(
      "../../harness/ops/core/task-evidence/record-provider-routing-evidence.mjs"
    );
    const result = recordProviderRoutingEvidence(corrId, {
      routeModelId: "gpt-4o",
      selectedProvider: "gemini",
      attempts: 1,
      triedProviders: ["gemini"],
      fallbackChain: [{ providerName: "gemini", attemptNumber: 1, outcome: "success", durationMs: 500 }],
    });
    expect(result.providerRouting.hasFallback).toBe(false);
  });

  it("records failure routing with selectedProvider: null", async () => {
    const { recordProviderRoutingEvidence } = await import(
      "../../harness/ops/core/task-evidence/record-provider-routing-evidence.mjs"
    );
    const result = recordProviderRoutingEvidence(corrId, {
      routeModelId: "gpt-4o",
      selectedProvider: null,
      attempts: 3,
      triedProviders: ["groq", "gemini", "openrouter"],
      fallbackChain: [
        { providerName: "groq", attemptNumber: 1, outcome: "failure", durationMs: 100, errorType: "rate_limit", errorMessage: "429" },
        { providerName: "gemini", attemptNumber: 2, outcome: "failure", durationMs: 200, errorType: "context_too_large", errorMessage: "too large" },
        { providerName: "openrouter", attemptNumber: 3, outcome: "failure", durationMs: 300, errorType: "server_error", errorMessage: "500" },
      ],
    });
    expect(result.providerRouting.selectedProvider).toBeNull();
    expect(result.providerRouting.hasFallback).toBe(true);
    expect(result.providerRouting.fallbackChain.every((e: { outcome: string }) => e.outcome === "failure")).toBe(true);
  });

  it("returns null for unknown correlationId", async () => {
    const { recordProviderRoutingEvidence } = await import(
      "../../harness/ops/core/task-evidence/record-provider-routing-evidence.mjs"
    );
    const result = recordProviderRoutingEvidence("nonexistent-id-abc123", {
      routeModelId: "test",
      selectedProvider: "test",
      attempts: 1,
      triedProviders: ["test"],
      fallbackChain: [],
    });
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3. recordContextReductionEvidence — runtime
// ---------------------------------------------------------------------------

describe("recordContextReductionEvidence — runtime", () => {
  const corrId = `test-ctx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  beforeAll(async () => {
    const { saveEvidence } = await import(
      "../../harness/ops/core/task-evidence/save-evidence.mjs"
    );
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );
    evidencePath = getEvidencePath(corrId);
    saveEvidence(corrId, { createdAt: new Date().toISOString() });
  });

  afterAll(() => {
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
  });

  it("records single reduction with correct shape", async () => {
    const { recordContextReductionEvidence } = await import(
      "../../harness/ops/core/task-evidence/record-context-reduction-evidence.mjs"
    );
    const result = recordContextReductionEvidence(corrId, [
      { providerName: "groq", previousCap: null, newCap: 8192, reason: "reported_limit", reportedLimit: 8192 },
    ]);
    expect(result).not.toBeNull();
    expect(result.contextReduction.recordedAt).toBeTruthy();
    expect(result.contextReduction.reductionCount).toBe(1);
    expect(result.contextReduction.finalCap).toBe(8192);
    expect(result.contextReduction.reductions[0].providerName).toBe("groq");
    expect(result.contextReduction.reductions[0].reason).toBe("reported_limit");
    expect(result.contextReduction.reductions[0].previousCap).toBeNull();
  });

  it("records multiple reductions and tracks finalCap from last entry", async () => {
    const { recordContextReductionEvidence } = await import(
      "../../harness/ops/core/task-evidence/record-context-reduction-evidence.mjs"
    );
    const result = recordContextReductionEvidence(corrId, [
      { providerName: "groq", previousCap: null, newCap: 8192, reason: "reported_limit", reportedLimit: 8192 },
      { providerName: "gemini", previousCap: 8192, newCap: 4096, reason: "estimated_from_request", requestedTokens: 6800 },
    ]);
    expect(result.contextReduction.reductionCount).toBe(2);
    expect(result.contextReduction.finalCap).toBe(4096);
    expect(result.contextReduction.reductions[1].reason).toBe("estimated_from_request");
    expect(result.contextReduction.reductions[1].requestedTokens).toBe(6800);
  });

  it("returns undefined for empty reductions array", async () => {
    const { recordContextReductionEvidence } = await import(
      "../../harness/ops/core/task-evidence/record-context-reduction-evidence.mjs"
    );
    const result = recordContextReductionEvidence(corrId, []);
    expect(result).toBeUndefined();
  });

  it("returns undefined for null/missing correlationId", async () => {
    const { recordContextReductionEvidence } = await import(
      "../../harness/ops/core/task-evidence/record-context-reduction-evidence.mjs"
    );
    const result = recordContextReductionEvidence("", [{ providerName: "a", previousCap: null, newCap: 1000, reason: "reported_limit" }]);
    expect(result).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 4. recordSafetyNetEvidence — runtime
// ---------------------------------------------------------------------------

describe("recordSafetyNetEvidence — runtime", () => {
  const corrId = `test-safety-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  beforeAll(async () => {
    const { saveEvidence } = await import(
      "../../harness/ops/core/task-evidence/save-evidence.mjs"
    );
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );
    evidencePath = getEvidencePath(corrId);
    saveEvidence(corrId, { createdAt: new Date().toISOString() });
  });

  afterAll(() => {
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
  });

  it("records exhaustion state with correct shape", async () => {
    const { recordSafetyNetEvidence } = await import(
      "../../harness/ops/core/task-evidence/record-safety-net-evidence.mjs"
    );
    const result = recordSafetyNetEvidence(corrId, {
      triedProviders: ["groq", "gemini", "openrouter"],
      routeModelId: "gpt-4o",
      lastError: "All providers rate limited",
      contextBudgetCap: 4096,
      fallbackChain: [
        { providerName: "groq", outcome: "failure", durationMs: 500 },
        { providerName: "gemini", outcome: "failure", durationMs: 600 },
        { providerName: "openrouter", outcome: "failure", durationMs: 700 },
      ],
    });

    expect(result).not.toBeNull();
    expect(result.safetyNet.activatedAt).toBeTruthy();
    expect(result.safetyNet.exhausted).toBe(true);
    expect(result.safetyNet.totalAttempts).toBe(3);
    expect(result.safetyNet.triedProviders).toEqual(["groq", "gemini", "openrouter"]);
    expect(result.safetyNet.lastError).toContain("rate limited");
    expect(result.safetyNet.fallbackChain).toHaveLength(3);
    expect(result.safetyNet.finalContextBudgetCap).toBe(4096);
  });

  it("truncates lastError to 500 chars", async () => {
    const { recordSafetyNetEvidence } = await import(
      "../../harness/ops/core/task-evidence/record-safety-net-evidence.mjs"
    );
    const longError = "x".repeat(1000);
    const result = recordSafetyNetEvidence(corrId, {
      triedProviders: ["test"],
      lastError: longError,
      fallbackChain: [],
    });
    expect(result.safetyNet.lastError.length).toBeLessThanOrEqual(500);
  });

  it("returns null for unknown correlationId", async () => {
    const { recordSafetyNetEvidence } = await import(
      "../../harness/ops/core/task-evidence/record-safety-net-evidence.mjs"
    );
    const result = recordSafetyNetEvidence("nonexistent-id-xyz987", {
      triedProviders: ["groq"],
      fallbackChain: [],
    });
    expect(result).toBeNull();
  });

  it("returns early for empty correlationId", async () => {
    const { recordSafetyNetEvidence } = await import(
      "../../harness/ops/core/task-evidence/record-safety-net-evidence.mjs"
    );
    const result = recordSafetyNetEvidence("", { triedProviders: [] });
    expect(result).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 5. queryRoutingEvidence — runtime
// ---------------------------------------------------------------------------

describe("queryRoutingEvidence — runtime", () => {
  it("returns { found: false } for unknown correlationId", async () => {
    const { queryRoutingEvidence } = await import(
      "../../harness/ops/core/task-evidence/query-routing-evidence.mjs"
    );
    const result = queryRoutingEvidence("completely-unknown-id-999");
    expect(result.found).toBe(false);
    expect(result.summary).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 6. Full evidence lifecycle — success path
// ---------------------------------------------------------------------------

describe("Full evidence lifecycle — success path", () => {
  const corrId = `test-lifecycle-ok-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  afterAll(() => {
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
  });

  it("create → record routing → record reductions → query reconstructs full decision", async () => {
    const { saveEvidence } = await import("../../harness/ops/core/task-evidence/save-evidence.mjs");
    const { getEvidencePath } = await import("../../harness/ops/core/task-evidence/get-evidence-path.mjs");
    const { recordProviderRoutingEvidence } = await import("../../harness/ops/core/task-evidence/record-provider-routing-evidence.mjs");
    const { recordContextReductionEvidence } = await import("../../harness/ops/core/task-evidence/record-context-reduction-evidence.mjs");
    const { recordProviderSelection } = await import("../../harness/ops/core/task-evidence/record-provider-selection.mjs");
    const { queryRoutingEvidence } = await import("../../harness/ops/core/task-evidence/query-routing-evidence.mjs");

    evidencePath = getEvidencePath(corrId);

    // Step 1: Create initial evidence record
    saveEvidence(corrId, { createdAt: new Date().toISOString(), correlationId: corrId });

    // Step 2: Record provider selection (as server.mjs does before invocation)
    recordProviderSelection(corrId, { providerName: "gemini", model: "gemini-2.5-pro" });

    // Step 3: Record routing evidence (as server.mjs does on success)
    recordProviderRoutingEvidence(corrId, {
      routeModelId: "gpt-4o",
      allowedProviders: ["groq", "gemini"],
      selectedProvider: "gemini",
      attempts: 2,
      triedProviders: ["groq", "gemini"],
      fallbackChain: [
        { providerName: "groq", attemptNumber: 1, outcome: "failure", durationMs: 800, errorType: "rate_limit", errorMessage: "429" },
        { providerName: "gemini", attemptNumber: 2, outcome: "success", durationMs: 2500 },
      ],
    });

    // Step 4: Record context reduction (groq's limit caused a budget cap)
    recordContextReductionEvidence(corrId, [
      { providerName: "groq", previousCap: null, newCap: 8192, reason: "reported_limit", reportedLimit: 8192 },
    ]);

    // Step 5: Query and verify full reconstruction
    const query = queryRoutingEvidence(corrId);
    expect(query.found).toBe(true);

    // Selection
    expect(query.summary.selection.providerName).toBe("gemini");

    // Routing
    expect(query.summary.routing.selectedProvider).toBe("gemini");
    expect(query.summary.routing.hasFallback).toBe(true);
    expect(query.summary.routing.attempts).toBe(2);
    expect(query.summary.routing.fallbackChain).toHaveLength(2);

    // Context reduction
    expect(query.summary.contextReduction.reductionCount).toBe(1);
    expect(query.summary.contextReduction.finalCap).toBe(8192);

    // Safety net — not activated
    expect(query.summary.safetyNet).toBeNull();

    // Human-readable explanation
    expect(query.summary.explanation).toContain("gemini");
    expect(query.summary.explanation).toContain("2 attempts");
    expect(query.summary.explanation).toContain("reduced");
  });
});

// ---------------------------------------------------------------------------
// 7. Full evidence lifecycle — failure/exhaustion path
// ---------------------------------------------------------------------------

describe("Full evidence lifecycle — failure/exhaustion path", () => {
  const corrId = `test-lifecycle-fail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  afterAll(() => {
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
  });

  it("create → record failure routing → record safety-net → record reductions → query shows exhaustion", async () => {
    const { saveEvidence } = await import("../../harness/ops/core/task-evidence/save-evidence.mjs");
    const { getEvidencePath } = await import("../../harness/ops/core/task-evidence/get-evidence-path.mjs");
    const { recordProviderRoutingEvidence } = await import("../../harness/ops/core/task-evidence/record-provider-routing-evidence.mjs");
    const { recordContextReductionEvidence } = await import("../../harness/ops/core/task-evidence/record-context-reduction-evidence.mjs");
    const { recordSafetyNetEvidence } = await import("../../harness/ops/core/task-evidence/record-safety-net-evidence.mjs");
    const { queryRoutingEvidence } = await import("../../harness/ops/core/task-evidence/query-routing-evidence.mjs");

    evidencePath = getEvidencePath(corrId);

    // Step 1: Create initial evidence record
    saveEvidence(corrId, { createdAt: new Date().toISOString(), correlationId: corrId });

    // Step 2: Record failure routing evidence (F2 — selectedProvider: null)
    const failureChain = [
      { providerName: "groq", attemptNumber: 1, outcome: "failure", durationMs: 100, errorType: "context_too_large", errorMessage: "context too large" },
      { providerName: "gemini", attemptNumber: 2, outcome: "failure", durationMs: 200, errorType: "rate_limit", errorMessage: "429" },
      { providerName: "openrouter", attemptNumber: 3, outcome: "failure", durationMs: 300, errorType: "server_error", errorMessage: "502 Bad Gateway" },
    ];
    recordProviderRoutingEvidence(corrId, {
      routeModelId: "gpt-4o",
      allowedProviders: ["groq", "gemini", "openrouter"],
      selectedProvider: null,
      attempts: 3,
      triedProviders: ["groq", "gemini", "openrouter"],
      fallbackChain: failureChain,
    });

    // Step 3: Record safety-net evidence (F3)
    recordSafetyNetEvidence(corrId, {
      triedProviders: ["groq", "gemini", "openrouter"],
      routeModelId: "gpt-4o",
      lastError: "502 Bad Gateway",
      contextBudgetCap: 4096,
      fallbackChain: failureChain,
    });

    // Step 4: Record context reduction that happened during cascade (F4)
    recordContextReductionEvidence(corrId, [
      { providerName: "groq", previousCap: null, newCap: 8192, reason: "reported_limit", reportedLimit: 8192 },
      { providerName: "gemini", previousCap: 8192, newCap: 4096, reason: "estimated_from_request", requestedTokens: 6800 },
    ]);

    // Step 5: Query and verify full reconstruction
    const query = queryRoutingEvidence(corrId);
    expect(query.found).toBe(true);

    // Routing shows failure
    expect(query.summary.routing.selectedProvider).toBeNull();
    expect(query.summary.routing.hasFallback).toBe(true);
    expect(query.summary.routing.attempts).toBe(3);
    expect(query.summary.routing.fallbackChain.every(
      (e: { outcome: string }) => e.outcome === "failure",
    )).toBe(true);

    // Safety net shows exhaustion
    expect(query.summary.safetyNet).not.toBeNull();
    expect(query.summary.safetyNet.totalAttempts).toBe(3);
    expect(query.summary.safetyNet.lastError).toContain("Bad Gateway");

    // Context reduction preserved despite failure
    expect(query.summary.contextReduction.reductionCount).toBe(2);
    expect(query.summary.contextReduction.finalCap).toBe(4096);

    // Human-readable explanation mentions exhaustion
    expect(query.summary.explanation).toContain("exhausted");
    expect(query.summary.explanation).toContain("reduced");
  });
});

// ---------------------------------------------------------------------------
// 8. Codebuff relay evidence path
// ---------------------------------------------------------------------------

describe("Codebuff relay evidence path", () => {
  const corrId = `test-codebuff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  afterAll(() => {
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
  });

  it("single-attempt Codebuff relay produces correct routing evidence shape", async () => {
    const { saveEvidence } = await import("../../harness/ops/core/task-evidence/save-evidence.mjs");
    const { getEvidencePath } = await import("../../harness/ops/core/task-evidence/get-evidence-path.mjs");
    const { recordProviderRoutingEvidence } = await import("../../harness/ops/core/task-evidence/record-provider-routing-evidence.mjs");
    const { queryRoutingEvidence } = await import("../../harness/ops/core/task-evidence/query-routing-evidence.mjs");

    evidencePath = getEvidencePath(corrId);
    saveEvidence(corrId, { createdAt: new Date().toISOString(), correlationId: corrId });

    // Simulate Codebuff relay evidence (single-attempt, no fallback)
    recordProviderRoutingEvidence(corrId, {
      routeModelId: "gpt-4o",
      allowedProviders: ["codebuff-paid", "groq", "gemini"],
      selectedProvider: "codebuff-paid",
      attempts: 1,
      triedProviders: ["codebuff-paid"],
      fallbackChain: [
        { providerName: "codebuff-paid", model: "codebuff/base", attemptNumber: 1, outcome: "success", durationMs: 5200 },
      ],
    });

    const query = queryRoutingEvidence(corrId);
    expect(query.found).toBe(true);
    expect(query.summary.routing.selectedProvider).toBe("codebuff-paid");
    expect(query.summary.routing.hasFallback).toBe(false);
    expect(query.summary.routing.attempts).toBe(1);
    expect(query.summary.routing.fallbackChain).toHaveLength(1);
    expect(query.summary.routing.fallbackChain[0].outcome).toBe("success");

    // No context reduction or safety net
    expect(query.summary.contextReduction).toBeNull();
    expect(query.summary.safetyNet).toBeNull();

    // Explanation should mention first attempt success
    expect(query.summary.explanation).toContain("codebuff-paid");
    expect(query.summary.explanation).toContain("first attempt");
  });
});

// ---------------------------------------------------------------------------
// 9. Evidence edge cases
// ---------------------------------------------------------------------------

describe("Evidence edge cases", () => {
  it("saveEvidence creates a JSON file on disk", async () => {
    const { saveEvidence } = await import("../../harness/ops/core/task-evidence/save-evidence.mjs");
    const { getEvidencePath } = await import("../../harness/ops/core/task-evidence/get-evidence-path.mjs");

    const corrId = `test-edge-${Date.now()}`;
    const ePath = getEvidencePath(corrId);
    try {
      saveEvidence(corrId, { createdAt: new Date().toISOString(), test: true });
      expect(fs.existsSync(ePath)).toBe(true);
      const loaded = JSON.parse(fs.readFileSync(ePath, "utf-8"));
      expect(loaded.test).toBe(true);
    } finally {
      if (fs.existsSync(ePath)) fs.unlinkSync(ePath);
    }
  });

  it("updateEvidenceRecord returns null for missing record", async () => {
    const { updateEvidenceRecord } = await import(
      "../../harness/ops/core/task-evidence/update-evidence-record.mjs"
    );
    const result = updateEvidenceRecord("does-not-exist-123", { foo: "bar" });
    expect(result).toBeNull();
  });

  it("subsequent evidence updates merge correctly without overwriting earlier sections", async () => {
    const { saveEvidence } = await import("../../harness/ops/core/task-evidence/save-evidence.mjs");
    const { getEvidencePath } = await import("../../harness/ops/core/task-evidence/get-evidence-path.mjs");
    const { recordProviderRoutingEvidence } = await import("../../harness/ops/core/task-evidence/record-provider-routing-evidence.mjs");
    const { recordSafetyNetEvidence } = await import("../../harness/ops/core/task-evidence/record-safety-net-evidence.mjs");

    const corrId = `test-merge-${Date.now()}`;
    const ePath = getEvidencePath(corrId);
    try {
      saveEvidence(corrId, { createdAt: new Date().toISOString() });

      // First update: routing
      recordProviderRoutingEvidence(corrId, {
        routeModelId: "test",
        selectedProvider: null,
        attempts: 1,
        triedProviders: ["test"],
        fallbackChain: [{ providerName: "test", attemptNumber: 1, outcome: "failure", durationMs: 100 }],
      });

      // Second update: safety-net (should merge, not overwrite routing)
      recordSafetyNetEvidence(corrId, {
        triedProviders: ["test"],
        lastError: "failed",
        fallbackChain: [],
      });

      const loaded = JSON.parse(fs.readFileSync(ePath, "utf-8"));
      // Both sections should be present
      expect(loaded.providerRouting).toBeDefined();
      expect(loaded.providerRouting.selectedProvider).toBeNull();
      expect(loaded.safetyNet).toBeDefined();
      expect(loaded.safetyNet.exhausted).toBe(true);
    } finally {
      if (fs.existsSync(ePath)) fs.unlinkSync(ePath);
    }
  });

  it("recordProviderSelection records selection data", async () => {
    const { saveEvidence } = await import("../../harness/ops/core/task-evidence/save-evidence.mjs");
    const { getEvidencePath } = await import("../../harness/ops/core/task-evidence/get-evidence-path.mjs");
    const { recordProviderSelection } = await import("../../harness/ops/core/task-evidence/record-provider-selection.mjs");

    const corrId = `test-selection-${Date.now()}`;
    const ePath = getEvidencePath(corrId);
    try {
      saveEvidence(corrId, { createdAt: new Date().toISOString() });
      const result = recordProviderSelection(corrId, { providerName: "gemini", model: "gemini-2.5-pro" });
      expect(result).not.toBeNull();
      expect(result.providerSelection.providerName).toBe("gemini");
      expect(result.providerSelection.model).toBe("gemini-2.5-pro");
      expect(result.providerSelection.selectedAt).toBeTruthy();
    } finally {
      if (fs.existsSync(ePath)) fs.unlinkSync(ePath);
    }
  });
});
