/**
 * Regression test for Codebuff shared client cwd isolation (Finding F1)
 *
 * Validates that `getSharedClient()` keys the shared client by BOTH
 * `costMode` AND `cwd`, preventing cross-worktree isolation leaks.
 *
 * Background: External review (2026-03-31) found that the shared
 * CodebuffClient was keyed by `costMode` only. Requests for one worktree
 * could silently reuse a client created with a different cwd, leaking
 * execution into the wrong directory.
 *
 * Run: npx vitest run scripts/ops/integrations/model/codebuff-cwd-isolation.spec.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Track CodebuffClient constructor calls to verify cwd isolation
const clientConstructorCalls: Array<{ cwd: string }> = [];
let clientInstanceCounter = 0;

// Mock @codebuff/sdk before any imports — use a real class so `new` works
vi.mock("@codebuff/sdk", () => {
  class MockCodebuffClient {
    _testId: number;
    _cwd: string;
    constructor(opts: { cwd: string }) {
      clientConstructorCalls.push({ cwd: opts.cwd });
      clientInstanceCounter++;
      this._testId = clientInstanceCounter;
      this._cwd = opts.cwd;
    }
  }
  return { CodebuffClient: MockCodebuffClient };
});

// Mock logger
vi.mock("../../lib/logger.mjs", () => ({
  createLogger: () => ({
    logInfo: vi.fn(),
    logWarn: vi.fn(),
    logError: vi.fn(),
    logDebug: vi.fn(),
  }),
}));

describe("Codebuff cwd isolation (F1 regression)", () => {
  let getSharedClient: (apiKey: string, costMode: string, cwd: string) => unknown;
  let resetSharedClient: () => void;

  beforeEach(async () => {
    // Reset tracking state
    clientConstructorCalls.length = 0;
    clientInstanceCounter = 0;

    // Dynamic import to get the actual module functions
    // vi.mock hoisting ensures mocks are applied before import
    const mod = await import("./codebuff-direct.mjs");
    getSharedClient = mod.getSharedClient;
    resetSharedClient = mod.resetSharedClient;

    // Clear the shared client before each test
    resetSharedClient();
    clientConstructorCalls.length = 0;
    clientInstanceCounter = 0;
  });

  it("should return cached client when costMode AND cwd both match", () => {
    const client1 = getSharedClient("key1", "paid", "/home/user/src/anqr-wt5") as { _cwd: string };
    const client2 = getSharedClient("key1", "paid", "/home/user/src/anqr-wt5") as { _cwd: string };

    expect(client1).toBe(client2);
    expect(client1._cwd).toBe("/home/user/src/anqr-wt5");
    expect(clientConstructorCalls).toHaveLength(1);
  });

  it("should create a NEW client when cwd changes (same costMode)", () => {
    const client1 = getSharedClient("key1", "paid", "/home/user/src/anqr-wt5");
    const client2 = getSharedClient("key1", "paid", "/home/user/src/anqr-wt6");

    expect(client1).not.toBe(client2);
    expect(clientConstructorCalls).toHaveLength(2);
    expect(clientConstructorCalls[0].cwd).toBe("/home/user/src/anqr-wt5");
    expect(clientConstructorCalls[1].cwd).toBe("/home/user/src/anqr-wt6");
  });

  it("should create a NEW client when costMode changes (same cwd)", () => {
    const client1 = getSharedClient("key1", "paid", "/home/user/src/anqr-wt5");
    const client2 = getSharedClient("key1", "free", "/home/user/src/anqr-wt5");

    expect(client1).not.toBe(client2);
    expect(clientConstructorCalls).toHaveLength(2);
  });

  it("should never cross-contaminate when alternating between two worktree directories", () => {
    const cwdA = "/home/user/src/anqr-wt5";
    const cwdB = "/home/user/src/anqr-wt6";

    for (let i = 0; i < 10; i++) {
      const clientA = getSharedClient("key1", "paid", cwdA) as { _cwd: string };
      expect(clientA._cwd).toBe(cwdA);

      const clientB = getSharedClient("key1", "paid", cwdB) as { _cwd: string };
      expect(clientB._cwd).toBe(cwdB);

      // The two clients must be different instances
      expect(clientA).not.toBe(clientB);
    }

    // 20 alternating calls = 20 new clients (each cwd change recreates)
    expect(clientConstructorCalls).toHaveLength(20);
  });

  it("should never cross-contaminate when alternating between main repo and worktree", () => {
    const mainCwd = "/home/user/src/anqr";
    const wtCwd = "/home/user/src/anqr-wt7";

    for (let i = 0; i < 5; i++) {
      const mainClient = getSharedClient("key1", "paid", mainCwd) as { _cwd: string };
      expect(mainClient._cwd).toBe(mainCwd);

      const wtClient = getSharedClient("key1", "paid", wtCwd) as { _cwd: string };
      expect(wtClient._cwd).toBe(wtCwd);
    }

    expect(clientConstructorCalls).toHaveLength(10);
  });

  it("should clear cache on resetSharedClient", () => {
    const client1 = getSharedClient("key1", "paid", "/home/user/src/anqr-wt5");
    resetSharedClient();
    const client2 = getSharedClient("key1", "paid", "/home/user/src/anqr-wt5");

    expect(client1).not.toBe(client2);
    expect(clientConstructorCalls).toHaveLength(2);
  });
});
