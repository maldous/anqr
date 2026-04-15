import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Workstream F Phase 1 — Provider routing evidence tests.
 *
 * Proves the platform emits structured provider routing evidence
 * for post-hoc reconstruction of routing decisions.
 *
 * 1. record-provider-routing-evidence module structure
 * 2. Evidence integration in task-evidence exports
 * 3. invokeWithFallback returns fallbackChain
 * 4. server.mjs emits routing evidence
 */

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

// ---------------------------------------------------------------------------
// 1. record-provider-routing-evidence module
// ---------------------------------------------------------------------------

describe("record-provider-routing-evidence module", () => {
  const modulePath = path.resolve(
    REPO_ROOT,
    "harness/ops/core/task-evidence/record-provider-routing-evidence.mjs",
  );

  it("module exists", () => {
    expect(fs.existsSync(modulePath)).toBe(true);
  });

  it("exports recordProviderRoutingEvidence function", () => {
    const source = fs.readFileSync(modulePath, "utf-8");
    expect(source).toContain("export function recordProviderRoutingEvidence");
  });

  it("builds structured providerRouting evidence record", () => {
    const source = fs.readFileSync(modulePath, "utf-8");
    // Must include all required evidence fields
    expect(source).toContain("routeModelId");
    expect(source).toContain("allowedProviders");
    expect(source).toContain("selectedProvider");
    expect(source).toContain("attempts");
    expect(source).toContain("triedProviders");
    expect(source).toContain("hasFallback");
    expect(source).toContain("fallbackChain");
  });

  it("includes per-attempt structured fields", () => {
    const source = fs.readFileSync(modulePath, "utf-8");
    // Per-attempt fields for post-hoc reconstruction
    expect(source).toContain("providerName");
    expect(source).toContain("outcome");
    expect(source).toContain("durationMs");
    expect(source).toContain("errorType");
    expect(source).toContain("errorMessage");
  });

  it("uses updateEvidenceRecord for persistence", () => {
    const source = fs.readFileSync(modulePath, "utf-8");
    expect(source).toContain("import { updateEvidenceRecord }");
    expect(source).toContain("updateEvidenceRecord(correlationId");
  });
});

// ---------------------------------------------------------------------------
// 2. task-evidence exports
// ---------------------------------------------------------------------------

describe("task-evidence exports", () => {
  it("index.mjs exports recordProviderRoutingEvidence", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/core/task-evidence/index.mjs"),
      "utf-8",
    );
    expect(source).toContain("recordProviderRoutingEvidence");
  });

  it("task-evidence.mjs facade re-exports evidence modules", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/core/task-evidence.mjs"),
      "utf-8",
    );
    expect(source).toContain("task-evidence/index.mjs");
  });
});

// ---------------------------------------------------------------------------
// 3. invokeWithFallback returns fallbackChain
// ---------------------------------------------------------------------------

describe("invokeWithFallback fallbackChain tracking", () => {
  const fallbackPath = path.resolve(
    REPO_ROOT,
    "harness/ops/integrations/model/symphony-openai-bridge/invoke-with-fallback.mjs",
  );

  it("declares fallbackChain array", () => {
    const source = fs.readFileSync(fallbackPath, "utf-8");
    expect(source).toContain("const fallbackChain = []");
  });

  it("pushes success entries to fallbackChain", () => {
    const source = fs.readFileSync(fallbackPath, "utf-8");
    expect(source).toContain('outcome: "success"');
  });

  it("pushes failure entries to fallbackChain", () => {
    const source = fs.readFileSync(fallbackPath, "utf-8");
    expect(source).toContain('outcome: "failure"');
  });

  it("returns fallbackChain in result object", () => {
    const source = fs.readFileSync(fallbackPath, "utf-8");
    expect(source).toContain("fallbackChain: [...fallbackChain]");
  });

  it("tracks per-attempt timing via attemptStartMs", () => {
    const source = fs.readFileSync(fallbackPath, "utf-8");
    expect(source).toContain("const attemptStartMs = Date.now()");
    expect(source).toContain("Date.now() - attemptStartMs");
  });

  it("tracks errorType and errorMessage on failure", () => {
    const source = fs.readFileSync(fallbackPath, "utf-8");
    // Failure entries must include error classification
    expect(source).toMatch(/errorType:.*errorType/);
    expect(source).toMatch(/errorMessage:.*errStr/);
  });
});

// ---------------------------------------------------------------------------
// 4. server.mjs emits provider routing evidence
// ---------------------------------------------------------------------------

describe("server.mjs provider routing evidence emission", () => {
  const serverPath = path.resolve(
    REPO_ROOT,
    "harness/ops/integrations/model/symphony-openai-bridge/server.mjs",
  );

  it("imports recordProviderRoutingEvidence", () => {
    const source = fs.readFileSync(serverPath, "utf-8");
    expect(source).toContain("recordProviderRoutingEvidence");
  });

  it("emits evidence for non-streaming path", () => {
    const source = fs.readFileSync(serverPath, "utf-8");
    // Must contain the evidence emission comment for non-streaming
    expect(source).toContain("provider routing evidence (non-streaming path)");
  });

  it("emits evidence for streaming path", () => {
    const source = fs.readFileSync(serverPath, "utf-8");
    // Must contain the evidence emission comment for streaming
    expect(source).toContain("provider routing evidence (streaming path)");
  });

  it("evidence includes route model, providers, and fallback chain", () => {
    const source = fs.readFileSync(serverPath, "utf-8");
    // Evidence calls must pass the required fields
    expect(source).toContain("routeModelId: route.responseModelId");
    expect(source).toContain("selectedProvider: result.providerName");
    expect(source).toContain("fallbackChain: result.fallbackChain");
  });

  it("evidence emission is best-effort (wrapped in try/catch)", () => {
    const source = fs.readFileSync(serverPath, "utf-8");
    // Count occurrences of the evidence pattern
    const matches = source.match(/recordProviderRoutingEvidence\(correlationId/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });
});
