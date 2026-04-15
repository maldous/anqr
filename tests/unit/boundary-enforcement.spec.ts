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
// 5. validate-boundary-invariants
// ---------------------------------------------------------------------------

describe("validate-boundary-invariants (source verification)", () => {
  it("module exists and exports validateBoundaryInvariants", () => {
    const modulePath = path.resolve(
      REPO_ROOT,
      "harness/ops/integrations/model/symphony-openai-bridge/validate-boundary-invariants.mjs",
    );
    expect(fs.existsSync(modulePath)).toBe(true);
    const source = fs.readFileSync(modulePath, "utf-8");
    expect(source).toContain("export function validateBoundaryInvariants");
  });

  it("checks IS_WORKTREE_BRIDGE consistency with BRIDGE_MODE", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/integrations/model/symphony-openai-bridge/validate-boundary-invariants.mjs",
      ),
      "utf-8",
    );
    expect(source).toContain("IS_WORKTREE_BRIDGE");
    expect(source).toContain("BRIDGE_MODE");
  });

  it("logs control-plane ADR-0008 warning", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/integrations/model/symphony-openai-bridge/validate-boundary-invariants.mjs",
      ),
      "utf-8",
    );
    expect(source).toContain("ADR-0008");
    expect(source).toContain("control-plane");
  });

  it("bridge server.mjs calls validateBoundaryInvariants at startup", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/integrations/model/symphony-openai-bridge/server.mjs"),
      "utf-8",
    );
    expect(source).toContain("validateBoundaryInvariants()");
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
// 8. Startup environment validation (Workstream E Phase 2)
// ---------------------------------------------------------------------------

describe("Startup environment validation", () => {
  it("validate-startup-env module exists and exports validateStartupEnv", () => {
    const modulePath = path.resolve(
      REPO_ROOT,
      "harness/ops/integrations/model/symphony-openai-bridge/validate-startup-env.mjs",
    );
    expect(fs.existsSync(modulePath)).toBe(true);
    const source = fs.readFileSync(modulePath, "utf-8");
    expect(source).toContain("export function validateStartupEnv");
  });

  it("checks provider tokens", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/integrations/model/symphony-openai-bridge/validate-startup-env.mjs",
      ),
      "utf-8",
    );
    expect(source).toContain("GROQ_TOKEN");
    expect(source).toContain("GEMINI_TOKEN");
    expect(source).toContain("OPENROUTER_TOKEN");
  });

  it("checks ANQR_WORKTREE_ID for worktree bridges", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/integrations/model/symphony-openai-bridge/validate-startup-env.mjs",
      ),
      "utf-8",
    );
    expect(source).toContain("ANQR_WORKTREE_ID");
    expect(source).toContain("IS_WORKTREE_BRIDGE");
  });

  it("server.mjs calls validateStartupEnv at startup", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/integrations/model/symphony-openai-bridge/server.mjs"),
      "utf-8",
    );
    expect(source).toContain("validateStartupEnv()");
  });
});

// ---------------------------------------------------------------------------
// 9. Critical EnvironmentFile enforcement (Workstream E Phase 3)
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
