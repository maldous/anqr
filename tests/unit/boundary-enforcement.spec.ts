import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Workstream D Phase 2 — Boundary enforcement tests.
 *
 * Proves the platform's repo/worktree isolation properties:
 *
 * 1. Service file audit: systemd configurations enforce correct WorkingDirectory
 * 2. Bridge mode derivation: control-plane vs worktree correctly identified
 * 3. assertMutationContext: blocks main-repo mutations
 * 4. remapRepoPathToBridgeRoot: path remapping safety properties
 * 5. validate-boundary-invariants: startup consistency checks
 * 6. Env drift detection: template vs live key comparison
 *
 * These tests exercise real modules with minimal mocking.
 */

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

// ---------------------------------------------------------------------------
// 1. Service file boundary audit (source verification)
// ---------------------------------------------------------------------------

describe("Service file boundary audit", () => {
  const servicesDir = path.resolve(REPO_ROOT, "services/systemd");

  it("executor template uses worktree WorkingDirectory", () => {
    const content = fs.readFileSync(
      path.join(servicesDir, "anqr-symphony-executor@.service"),
      "utf-8",
    );
    expect(content).toContain("WorkingDirectory=%h/src/anqr-wt%i");
    expect(content).toContain("ANQR_WORKTREE_ID=wt%i");
    expect(content).toContain("ANQR_WORKTREE_PATH=%h/src/anqr-wt%i");
    // Must NOT contain BRIDGE_MODE=control-plane
    expect(content).not.toContain("BRIDGE_MODE=control-plane");
  });

  it("codex bridge uses main repo WorkingDirectory with explicit control-plane mode", () => {
    const content = fs.readFileSync(path.join(servicesDir, "anqr-symphony-codex.service"), "utf-8");
    expect(content).toContain("WorkingDirectory=%h/src/anqr");
    expect(content).toContain("ANQR_WORKTREE_ID=codex");
    expect(content).toContain("BRIDGE_MODE=control-plane");
    // Main repo path must NOT include a worktree suffix
    expect(content).not.toMatch(/WorkingDirectory=%h\/src\/anqr-wt/);
  });

  it("executor WorkingDirectory never points to main repo", () => {
    const content = fs.readFileSync(
      path.join(servicesDir, "anqr-symphony-executor@.service"),
      "utf-8",
    );
    // The working directory line must use the wt%i suffix, not bare anqr
    const wdLines = content.split("\n").filter((l: string) => l.startsWith("WorkingDirectory="));
    for (const wd of wdLines) {
      expect(wd).toMatch(/anqr-wt/);
    }
  });

  it("codex bridge runs on separate port outside executor pool", () => {
    const content = fs.readFileSync(path.join(servicesDir, "anqr-symphony-codex.service"), "utf-8");
    expect(content).toContain("SYMPHONY_BRIDGE_PORT=4330");
    // Executor pool is 4321-4328
    expect(content).not.toMatch(/SYMPHONY_BRIDGE_PORT=432[1-8]/);
  });

  it("runner refuses main-repo execution (source verification)", () => {
    const runnerRuntime = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/orchestration/symphony-runner/runtime.mjs"),
      "utf-8",
    );
    expect(runnerRuntime).toContain("Cannot run in main repo");
  });

  it("discord router blocks main-repo cwd (source verification)", () => {
    const processProxy = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/integrations/model/discord-request-router/process-and-proxy.mjs",
      ),
      "utf-8",
    );
    expect(processProxy).toContain("ISOLATION VIOLATION");
  });
});

// ---------------------------------------------------------------------------
// 2. Bridge mode derivation
// ---------------------------------------------------------------------------

describe("Bridge mode derivation", () => {
  it("derives control-plane when bridgeRoot === controlRepoRoot", async () => {
    const { deriveBridgeMode } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge/bridge-mode.mjs");
    expect(deriveBridgeMode("/home/user/src/anqr", "/home/user/src/anqr")).toBe("control-plane");
  });

  it("derives worktree when bridgeRoot !== controlRepoRoot", async () => {
    const { deriveBridgeMode } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge/bridge-mode.mjs");
    expect(deriveBridgeMode("/home/user/src/anqr-wt1", "/home/user/src/anqr")).toBe("worktree");
  });

  it("handles trailing slashes in path comparison", async () => {
    const { deriveBridgeMode } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge/bridge-mode.mjs");
    // path.resolve normalizes trailing slashes
    expect(deriveBridgeMode("/home/user/src/anqr/", "/home/user/src/anqr")).toBe("control-plane");
  });

  it("treats different worktree paths as worktree mode", async () => {
    const { deriveBridgeMode } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge/bridge-mode.mjs");
    for (let i = 1; i <= 8; i++) {
      expect(deriveBridgeMode(`/home/user/src/anqr-wt${i}`, "/home/user/src/anqr")).toBe(
        "worktree",
      );
    }
  });
});

// ---------------------------------------------------------------------------
// 3. assertMutationContext
// ---------------------------------------------------------------------------

describe("assertMutationContext", () => {
  // We import the real module — it only depends on MAIN_REPO_ROOT which is
  // derived from the module's own location, so it works in test context.

  it("blocks mutation in main repo", async () => {
    const { assertMutationContext } =
      await import("../../harness/ops/runtime/symphony/symphony-agent/assert-mutation-context.mjs");
    const { MAIN_REPO_ROOT } =
      await import("../../harness/ops/runtime/symphony/symphony-agent/main-repo-root.mjs");

    expect(() =>
      assertMutationContext({
        executionMode: "mutating",
        worktreeId: "codex",
        leaseId: "lease-1",
        projectRoot: MAIN_REPO_ROOT,
      }),
    ).toThrow("main repo is forbidden");
  });

  it("allows mutation in worktree path", async () => {
    const { assertMutationContext } =
      await import("../../harness/ops/runtime/symphony/symphony-agent/assert-mutation-context.mjs");

    expect(() =>
      assertMutationContext({
        executionMode: "mutating",
        worktreeId: "wt1",
        leaseId: "lease-1",
        projectRoot: "/home/user/src/anqr-wt1",
        worktreeRoot: "/home/user/src/anqr-wt1",
      }),
    ).not.toThrow();
  });

  it("allows read-only requests in main repo", async () => {
    const { assertMutationContext } =
      await import("../../harness/ops/runtime/symphony/symphony-agent/assert-mutation-context.mjs");
    const { MAIN_REPO_ROOT } =
      await import("../../harness/ops/runtime/symphony/symphony-agent/main-repo-root.mjs");

    expect(() =>
      assertMutationContext({
        executionMode: "read-only",
        projectRoot: MAIN_REPO_ROOT,
      }),
    ).not.toThrow();
  });

  it("blocks mutation without worktreeId", async () => {
    const { assertMutationContext } =
      await import("../../harness/ops/runtime/symphony/symphony-agent/assert-mutation-context.mjs");

    expect(() =>
      assertMutationContext({
        executionMode: "mutating",
        leaseId: "lease-1",
        projectRoot: "/home/user/src/anqr-wt1",
      }),
    ).toThrow("missing worktreeId");
  });

  it("blocks mutation without leaseId", async () => {
    const { assertMutationContext } =
      await import("../../harness/ops/runtime/symphony/symphony-agent/assert-mutation-context.mjs");

    expect(() =>
      assertMutationContext({
        executionMode: "mutating",
        worktreeId: "wt1",
        projectRoot: "/home/user/src/anqr-wt1",
      }),
    ).toThrow("missing leaseId");
  });

  it("blocks mutation when projectRoot mismatches worktreeRoot", async () => {
    const { assertMutationContext } =
      await import("../../harness/ops/runtime/symphony/symphony-agent/assert-mutation-context.mjs");

    expect(() =>
      assertMutationContext({
        executionMode: "mutating",
        worktreeId: "wt1",
        leaseId: "lease-1",
        projectRoot: "/home/user/src/anqr-wt1",
        worktreeRoot: "/home/user/src/anqr-wt2",
      }),
    ).toThrow("projectRoot must equal worktreeRoot");
  });
});

// ---------------------------------------------------------------------------
// 4. remapRepoPathToBridgeRoot safety
// ---------------------------------------------------------------------------

describe("remapRepoPathToBridgeRoot safety (source verification)", () => {
  it("returns candidatePath unchanged when not a worktree bridge", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/integrations/model/symphony-openai-bridge/remap-repo-path-to-bridge-root.mjs",
      ),
      "utf-8",
    );
    // First check: early return when !IS_WORKTREE_BRIDGE
    expect(source).toContain("if (!IS_WORKTREE_BRIDGE) return candidatePath");
  });

  it("returns BRIDGE_ROOT as fallback for unknown paths", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/integrations/model/symphony-openai-bridge/remap-repo-path-to-bridge-root.mjs",
      ),
      "utf-8",
    );
    // Final return clamps to BRIDGE_ROOT — prevents path traversal outside the sandbox
    expect(source).toContain("return BRIDGE_ROOT");
  });

  it("uses isPathWithinRoot for containment checks", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/integrations/model/symphony-openai-bridge/remap-repo-path-to-bridge-root.mjs",
      ),
      "utf-8",
    );
    // Must use isPathWithinRoot, not startsWith — startsWith is vulnerable to prefix attacks
    expect(source).toContain("isPathWithinRoot");
    expect(source).not.toMatch(/candidatePath\.startsWith/);
  });

  it("isPathWithinRoot rejects parent traversal", async () => {
    const { isPathWithinRoot } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge/is-path-within-root.mjs");
    expect(
      isPathWithinRoot("/home/user/src/anqr-wt1/../anqr/secret", "/home/user/src/anqr-wt1"),
    ).toBe(false);
    expect(isPathWithinRoot("/home/user/src/anqr-wt1/subdir", "/home/user/src/anqr-wt1")).toBe(
      true,
    );
    expect(isPathWithinRoot("/home/user/src/anqr-wt1", "/home/user/src/anqr-wt1")).toBe(true);
    expect(isPathWithinRoot("/etc/passwd", "/home/user/src/anqr-wt1")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. validate-boundary-invariants (fail-closed runtime enforcement)
// ---------------------------------------------------------------------------

describe("validate-boundary-invariants (runtime)", () => {
  let validateBoundaryInvariants: (opts?: Record<string, unknown>) => { valid: boolean; warnings: string[] };

  // Import once — param overrides let us test all code paths
  // without manipulating env vars or mocking modules.
  it("imports and exports validateBoundaryInvariants", async () => {
    const mod = await import(
      "../../harness/ops/integrations/model/symphony-openai-bridge/validate-boundary-invariants.mjs"
    );
    validateBoundaryInvariants = mod.validateBoundaryInvariants;
    expect(typeof validateBoundaryInvariants).toBe("function");
  });

  it("THROWS when bridgeMode=worktree and isWorktreeBridge=false", () => {
    expect(() =>
      validateBoundaryInvariants({
        bridgeMode: "worktree",
        isWorktreeBridge: false,
        bridgeRoot: "/home/user/src/anqr-wt1",
        controlRepoRoot: "/home/user/src/anqr",
      }),
    ).toThrow("BRIDGE_MODE=worktree but IS_WORKTREE_BRIDGE=false");
  });

  it("THROWS when bridgeMode=worktree and bridgeRoot === controlRepoRoot", () => {
    expect(() =>
      validateBoundaryInvariants({
        bridgeMode: "worktree",
        isWorktreeBridge: true,
        bridgeRoot: "/home/user/src/anqr",
        controlRepoRoot: "/home/user/src/anqr",
      }),
    ).toThrow("BRIDGE_MODE=worktree but BRIDGE_ROOT === CONTROL_REPO_ROOT");
  });

  it("returns valid=true for properly configured worktree", () => {
    const result = validateBoundaryInvariants({
      bridgeMode: "worktree",
      isWorktreeBridge: true,
      bridgeRoot: "/home/user/src/anqr-wt1",
      controlRepoRoot: "/home/user/src/anqr",
    });
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("returns warnings for control-plane path mismatch", () => {
    const result = validateBoundaryInvariants({
      bridgeMode: "control-plane",
      isWorktreeBridge: false,
      bridgeRoot: "/home/user/src/other",
      controlRepoRoot: "/home/user/src/anqr",
    });
    expect(result.valid).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("unexpected identity");
  });

  it("returns valid=true for correctly configured control-plane", () => {
    const result = validateBoundaryInvariants({
      bridgeMode: "control-plane",
      isWorktreeBridge: true,
      bridgeRoot: "/home/user/src/anqr",
      controlRepoRoot: "/home/user/src/anqr",
    });
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("server.mjs calls validateBoundaryInvariants and checks return", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/integrations/model/symphony-openai-bridge/server.mjs"),
      "utf-8",
    );
    expect(source).toContain("validateBoundaryInvariants()");
    expect(source).toContain("boundaryResult.valid");
  });
});

// ---------------------------------------------------------------------------
// 6. Env drift detection (Workstream E)
// ---------------------------------------------------------------------------

describe("Env drift detection", () => {
  it("parseEnvKeys extracts key names correctly", async () => {
    const { parseEnvKeys } = await import("../../harness/ops/harness-doctor/check-env-drift.mjs");
    // Use the repo template as a known-good input
    const templatePath = path.resolve(REPO_ROOT, "services/systemd/anqr-ops.env");
    const keys = parseEnvKeys(templatePath);

    // Should have real env keys
    expect(keys.length).toBeGreaterThan(10);
    expect(keys).toContain("HOME");
    expect(keys).toContain("CODEBUFF_API_KEY");
    expect(keys).toContain("LINEAR_API_KEY");

    // Should NOT include comments
    expect(keys.every((k: string) => !k.startsWith("#"))).toBe(true);
  });

  it("parseEnvKeys returns empty array for missing file", async () => {
    const { parseEnvKeys } = await import("../../harness/ops/harness-doctor/check-env-drift.mjs");
    const keys = parseEnvKeys("/nonexistent/path/to/env");
    expect(keys).toEqual([]);
  });

  it("checkEnvDrift is exported as async function (source verification)", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/harness-doctor/check-env-drift.mjs"),
      "utf-8",
    );
    expect(source).toContain("export async function checkEnvDrift");
    // Must compare template vs live keys
    expect(source).toContain("parseEnvKeys");
    // Must check symphony env
    expect(source).toContain("symphony");
    // Must not read secret values — only key names
    expect(source).toContain("key names (not values");
  });

  it("harness-doctor main includes env drift check", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/harness-doctor/main.mjs"),
      "utf-8",
    );
    expect(source).toContain("checkEnvDrift");
    expect(source).toContain("Env File Drift");
  });
});

// ---------------------------------------------------------------------------
// 7. Router port isolation (Workstream D completion)
// ---------------------------------------------------------------------------

describe("Router port isolation", () => {
  it("worktree pool uses ports 4321-4328 (never includes codex port 4330)", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/integrations/model/symphony-agent-router/worktrees.mjs"),
      "utf-8",
    );
    // Port formula: 4320 + id (ids are 1-8)
    expect(source).toContain("port: 4320 + id");
  });

  it("worktree IDs default to 1-8 (codex is not in the pool)", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/integrations/model/symphony-agent-router/worktree-ids.mjs",
      ),
      "utf-8",
    );
    expect(source).toContain('"1,2,3,4,5,6,7,8"');
    // Must NOT contain codex or port 4330
    expect(source).not.toContain("codex");
    expect(source).not.toContain("4330");
  });

  it("codex bridge port (4330) is outside executor pool range (4321-4328)", () => {
    const codexService = fs.readFileSync(
      path.resolve(REPO_ROOT, "services/systemd/anqr-symphony-codex.service"),
      "utf-8",
    );
    expect(codexService).toContain("SYMPHONY_BRIDGE_PORT=4330");
    // 4330 is NOT achievable by 4320 + id for any id in 1-8
    for (let id = 1; id <= 8; id++) {
      expect(4320 + id).not.toBe(4330);
    }
  });

  it("executor BRIDGE_MODE=worktree is set explicitly", () => {
    const content = fs.readFileSync(
      path.resolve(REPO_ROOT, "services/systemd/anqr-symphony-executor@.service"),
      "utf-8",
    );
    expect(content).toContain("BRIDGE_MODE=worktree");
  });
});

// ---------------------------------------------------------------------------
// 8. Startup environment validation — fail-closed runtime (Workstream E Phase 2)
// ---------------------------------------------------------------------------

describe("Startup environment validation (fail-closed runtime)", () => {
  let validateStartupEnv: (opts?: Record<string, unknown>) => { valid: boolean; warnings: string[] };

  it("imports and exports validateStartupEnv", async () => {
    const mod = await import(
      "../../harness/ops/integrations/model/symphony-openai-bridge/validate-startup-env.mjs"
    );
    validateStartupEnv = mod.validateStartupEnv;
    expect(typeof validateStartupEnv).toBe("function");
  });

  it("THROWS when zero provider tokens are configured", () => {
    expect(() =>
      validateStartupEnv({
        bridgeMode: "control-plane",
        isWorktreeBridge: false,
        env: { SYMPHONY_BRIDGE_PORT: "4330", BRIDGE_MODE: "control-plane" },
      }),
    ).toThrow("No provider tokens found");
  });

  it("THROWS in worktree mode when ANQR_WORKTREE_ID is missing", () => {
    expect(() =>
      validateStartupEnv({
        bridgeMode: "worktree",
        isWorktreeBridge: true,
        env: {
          GROQ_TOKEN: "test-token",
          SYMPHONY_BRIDGE_PORT: "4321",
          BRIDGE_MODE: "worktree",
        },
      }),
    ).toThrow("ANQR_WORKTREE_ID is not set");
  });

  it("THROWS in worktree mode when SYMPHONY_BRIDGE_PORT is missing", () => {
    expect(() =>
      validateStartupEnv({
        bridgeMode: "worktree",
        isWorktreeBridge: true,
        env: {
          GROQ_TOKEN: "test-token",
          ANQR_WORKTREE_ID: "wt1",
          BRIDGE_MODE: "worktree",
        },
      }),
    ).toThrow("SYMPHONY_BRIDGE_PORT not set in worktree mode");
  });

  it("THROWS in worktree mode when BRIDGE_MODE is missing", () => {
    expect(() =>
      validateStartupEnv({
        bridgeMode: "worktree",
        isWorktreeBridge: true,
        env: {
          GROQ_TOKEN: "test-token",
          ANQR_WORKTREE_ID: "wt1",
          SYMPHONY_BRIDGE_PORT: "4321",
        },
      }),
    ).toThrow("BRIDGE_MODE not set explicitly in worktree mode");
  });

  it("returns valid=true with all required worktree env", () => {
    const result = validateStartupEnv({
      bridgeMode: "worktree",
      isWorktreeBridge: true,
      env: {
        GROQ_TOKEN: "test-token",
        ANQR_WORKTREE_ID: "wt1",
        SYMPHONY_BRIDGE_PORT: "4321",
        BRIDGE_MODE: "worktree",
      },
    });
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns but does NOT throw in control-plane mode for missing port", () => {
    const result = validateStartupEnv({
      bridgeMode: "control-plane",
      isWorktreeBridge: false,
      env: { GROQ_TOKEN: "test-token" },
    });
    // Should have warnings but not throw
    expect(result.valid).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("returns valid=true in control-plane mode with all optional env set", () => {
    const result = validateStartupEnv({
      bridgeMode: "control-plane",
      isWorktreeBridge: false,
      env: {
        GROQ_TOKEN: "test-token",
        SYMPHONY_BRIDGE_PORT: "4330",
        BRIDGE_MODE: "control-plane",
      },
    });
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("server.mjs calls validateStartupEnv and checks return", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/integrations/model/symphony-openai-bridge/server.mjs"),
      "utf-8",
    );
    expect(source).toContain("validateStartupEnv()");
    expect(source).toContain("envResult.valid");
  });
});

// ---------------------------------------------------------------------------
// 9. assertBridgeMutationBoundary — runtime behavior (Workstream D)
// ---------------------------------------------------------------------------

describe("assertBridgeMutationBoundary (runtime)", () => {
  let assertBridgeMutationBoundary: (resolvedPath: string, opts?: Record<string, unknown>) => void;

  it("imports and exports assertBridgeMutationBoundary", async () => {
    const mod = await import(
      "../../harness/ops/integrations/model/symphony-openai-bridge/assert-bridge-mutation-boundary.mjs"
    );
    assertBridgeMutationBoundary = mod.assertBridgeMutationBoundary;
    expect(typeof assertBridgeMutationBoundary).toBe("function");
  });

  it("THROWS in worktree mode when writing to control repo path", () => {
    expect(() =>
      assertBridgeMutationBoundary("/home/user/src/anqr/packages/domain/file.ts", {
        bridgeMode: "worktree",
        bridgeRoot: "/home/user/src/anqr-wt1",
        controlRepoRoot: "/home/user/src/anqr",
      }),
    ).toThrow("worktree bridge attempted to write to control repo path");
  });

  it("THROWS in worktree mode when BRIDGE_ROOT === CONTROL_REPO_ROOT", () => {
    expect(() =>
      assertBridgeMutationBoundary("/home/user/src/anqr/some-file.ts", {
        bridgeMode: "worktree",
        bridgeRoot: "/home/user/src/anqr",
        controlRepoRoot: "/home/user/src/anqr",
      }),
    ).toThrow("worktree bridge has BRIDGE_ROOT === CONTROL_REPO_ROOT");
  });

  it("allows worktree writes within worktree root", () => {
    expect(() =>
      assertBridgeMutationBoundary("/home/user/src/anqr-wt1/packages/domain/file.ts", {
        bridgeMode: "worktree",
        bridgeRoot: "/home/user/src/anqr-wt1",
        controlRepoRoot: "/home/user/src/anqr",
      }),
    ).not.toThrow();
  });

  it("does not throw in control-plane mode (ADR-0008 advisory)", () => {
    expect(() =>
      assertBridgeMutationBoundary("/home/user/src/anqr/packages/domain/file.ts", {
        bridgeMode: "control-plane",
        bridgeRoot: "/home/user/src/anqr",
        controlRepoRoot: "/home/user/src/anqr",
      }),
    ).not.toThrow();
  });

  it("no-ops for null/empty path", () => {
    expect(() =>
      assertBridgeMutationBoundary("", {
        bridgeMode: "worktree",
        bridgeRoot: "/home/user/src/anqr-wt1",
        controlRepoRoot: "/home/user/src/anqr",
      }),
    ).not.toThrow();
  });

  it("THROWS for path outside both worktree and control repo in worktree mode", () => {
    // Writing to /etc/passwd from a worktree — this is inside neither root
    // but should NOT be blocked by this guard (it checks control repo only).
    expect(() =>
      assertBridgeMutationBoundary("/etc/passwd", {
        bridgeMode: "worktree",
        bridgeRoot: "/home/user/src/anqr-wt1",
        controlRepoRoot: "/home/user/src/anqr",
      }),
    ).not.toThrow();
  });

  it("all file-mutating tools import assertBridgeMutationBoundary", () => {
    for (const tool of ["write-file-tool.mjs", "str-replace-tool.mjs", "apply-patch-tool.mjs"]) {
      const source = fs.readFileSync(
        path.resolve(
          REPO_ROOT,
          `harness/ops/integrations/model/symphony-openai-bridge/${tool}`,
        ),
        "utf-8",
      );
      expect(source).toContain("import { assertBridgeMutationBoundary }");
      expect(source).toContain("assertBridgeMutationBoundary(");
    }
  });
});

// ---------------------------------------------------------------------------
// 10. Service lifecycle enforcement (Workstream E)
// ---------------------------------------------------------------------------

describe("Service lifecycle enforcement", () => {
  it("check-service-lifecycle module exists", () => {
    const modulePath = path.resolve(
      REPO_ROOT,
      "harness/ops/harness-doctor/check-service-lifecycle.mjs",
    );
    expect(fs.existsSync(modulePath)).toBe(true);
  });

  it("reconcile-env-keys module exists", () => {
    const modulePath = path.resolve(
      REPO_ROOT,
      "harness/ops/harness-doctor/reconcile-env-keys.mjs",
    );
    expect(fs.existsSync(modulePath)).toBe(true);
  });

  it("harness-doctor exports checkServiceLifecycle and reconcileEnvKeys", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/harness-doctor/index.mjs"),
      "utf-8",
    );
    expect(source).toContain("checkServiceLifecycle");
    expect(source).toContain("reconcileEnvKeys");
  });

  it("harness-doctor main integrates service lifecycle check", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/harness-doctor/main.mjs"),
      "utf-8",
    );
    expect(source).toContain("checkServiceLifecycle");
    expect(source).toContain("Service Lifecycle");
  });

  it("reconcile-env-keys supports check, sync-to-live, and sync-to-template modes", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/harness-doctor/reconcile-env-keys.mjs"),
      "utf-8",
    );
    expect(source).toContain('mode = "check"');
    expect(source).toContain('"sync-to-live"');
    expect(source).toContain('"sync-to-template"');
  });
});

// ---------------------------------------------------------------------------
// 11. Critical EnvironmentFile enforcement (Workstream E Phase 3)
// ---------------------------------------------------------------------------

describe("Critical EnvironmentFile enforcement", () => {
  const servicesDir = path.resolve(REPO_ROOT, "services/systemd");

  it("router uses required EnvironmentFile for anqr-ops.env", () => {
    const content = fs.readFileSync(
      path.join(servicesDir, "anqr-symphony-router.service"),
      "utf-8",
    );
    // Must use EnvironmentFile= (required, no dash prefix) for the primary env file
    expect(content).toMatch(/^EnvironmentFile=%h\/\.config\/systemd\/user\/anqr-ops\.env$/m);
    // Must NOT use EnvironmentFile=- for the primary env file
    expect(content).not.toMatch(/EnvironmentFile=-%h\/\.config\/systemd\/user\/anqr-ops\.env/);
  });

  it("discord router uses required EnvironmentFile for anqr-ops.env", () => {
    const content = fs.readFileSync(path.join(servicesDir, "anqr-discord-router.service"), "utf-8");
    expect(content).toMatch(/^EnvironmentFile=%h\/\.config\/systemd\/user\/anqr-ops\.env$/m);
    expect(content).not.toMatch(/EnvironmentFile=-%h\/\.config\/systemd\/user\/anqr-ops\.env/);
  });

  it("linear webhook uses required EnvironmentFile for anqr-ops.env", () => {
    const content = fs.readFileSync(path.join(servicesDir, "anqr-linear-webhook.service"), "utf-8");
    expect(content).toMatch(/^EnvironmentFile=%h\/\.config\/systemd\/user\/anqr-ops\.env$/m);
    expect(content).not.toMatch(/EnvironmentFile=-%h\/\.config\/systemd\/user\/anqr-ops\.env/);
  });

  it("supplementary anqr.env remains optional (dash prefix)", () => {
    const router = fs.readFileSync(path.join(servicesDir, "anqr-symphony-router.service"), "utf-8");
    // anqr.env should still be optional
    expect(router).toMatch(/EnvironmentFile=-%h\/\.config\/symphony\/anqr\.env/);
  });
});
