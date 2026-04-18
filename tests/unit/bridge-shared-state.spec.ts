import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const TEST_STATE_DIR = path.resolve(PROJECT_ROOT, "reports", "bridge-shared-state-test");

// Set env before imports so modules pick up the test directory
process.env.ANQR_BRIDGE_STATE_DIR = TEST_STATE_DIR;

// Top-level dynamic imports (Vitest ESM supports top-level await)
const { loadBridgeFile, saveBridgeFile, getBridgeFilePath } =
  await import("../../harness/ops/core/symphony-shared-state/bridge-file-helpers.mjs");
const { withBridgeLock } =
  await import("../../harness/ops/core/symphony-shared-state/with-bridge-lock.mjs");
const { setSessionSource } =
  await import("../../harness/ops/integrations/model/symphony-session-state/set-session-source.mjs");
const { loadSessionState, saveSessionState } =
  await import("../../harness/ops/integrations/model/symphony-session-state/index.mjs");

function cleanupTestDir() {
  try {
    if (fs.existsSync(TEST_STATE_DIR)) {
      fs.rmSync(TEST_STATE_DIR, { recursive: true, force: true });
    }
  } catch {
    // ignore
  }
}

describe("bridge-file-helpers", () => {
  beforeEach(() => {
    cleanupTestDir();
    fs.mkdirSync(TEST_STATE_DIR, { recursive: true, mode: 0o700 });
  });

  it("loadBridgeFile returns fallback for missing file", () => {
    const result = loadBridgeFile("nonexistent.json", { default: true });
    expect(result).toEqual({ default: true });
  });

  it("loadBridgeFile returns empty object by default", () => {
    const result = loadBridgeFile("nonexistent.json");
    expect(result).toEqual({});
  });

  it("saveBridgeFile + loadBridgeFile round-trips data", () => {
    const data = { sessions: { "discord:g1:c1": { provider: "groq" } } };
    saveBridgeFile("test-data.json", data);
    const loaded = loadBridgeFile("test-data.json");
    expect(loaded).toEqual(data);
  });

  it("saveBridgeFile creates directory if missing", () => {
    const nestedDir = path.join(TEST_STATE_DIR, "nested", "deep");
    process.env.ANQR_BRIDGE_STATE_DIR = nestedDir;
    try {
      saveBridgeFile("test-data.json", { created: true });
      expect(fs.existsSync(path.join(nestedDir, "test-data.json"))).toBe(true);
    } finally {
      process.env.ANQR_BRIDGE_STATE_DIR = TEST_STATE_DIR;
      fs.rmSync(nestedDir, { recursive: true, force: true });
    }
  });

  it("getBridgeFilePath resolves under bridge state dir", () => {
    const filePath = getBridgeFilePath("session-state.json");
    expect(filePath).toBe(path.join(TEST_STATE_DIR, "session-state.json"));
  });
});

describe("with-bridge-lock", () => {
  beforeEach(() => {
    cleanupTestDir();
    fs.mkdirSync(TEST_STATE_DIR, { recursive: true, mode: 0o700 });
  });

  it("runs function under lock and returns result", () => {
    const result = withBridgeLock("lock-test.json", () => {
      return 42;
    });
    expect(result).toBe(42);
  });

  it("read-modify-write under lock is atomic", () => {
    saveBridgeFile("lock-test.json", { counter: 0 });

    withBridgeLock("lock-test.json", () => {
      const state = loadBridgeFile("lock-test.json");
      state.counter++;
      saveBridgeFile("lock-test.json", state);
    });

    const result = loadBridgeFile("lock-test.json");
    expect(result.counter).toBe(1);
  });

  it("releases lock after function completes", () => {
    withBridgeLock("lock-test.json", () => {
      // no-op
    });
    // Second lock should succeed (first was released)
    const result = withBridgeLock("lock-test.json", () => "second");
    expect(result).toBe("second");
  });

  it("propagates errors from fn and still releases lock", () => {
    try {
      withBridgeLock("lock-test.json", () => {
        throw new Error("test error");
      });
    } catch (e: any) {
      expect(e.message).toBe("test error");
    }
    // Lock should be released — second acquisition should work
    const result = withBridgeLock("lock-test.json", () => "recovered");
    expect(result).toBe("recovered");
  });
});

describe("set-session-source", () => {
  beforeEach(() => {
    cleanupTestDir();
    fs.mkdirSync(TEST_STATE_DIR, { recursive: true, mode: 0o700 });
  });

  it("creates stub session with source when session does not exist", () => {
    setSessionSource("discord:g1:c1", {
      type: "discord",
      discordGuildId: "g1",
      discordChannelId: "c1",
    });

    const state = loadSessionState();
    expect(state["discord:g1:c1"]).toBeDefined();
    expect(state["discord:g1:c1"].source).toEqual({
      type: "discord",
      discordGuildId: "g1",
      discordChannelId: "c1",
    });
    expect(state["discord:g1:c1"].lastUsed).toBeGreaterThan(0);
  });

  it("adds source to existing session record", () => {
    // Create an existing session without source
    const state: Record<string, any> = {
      "linear:ANQ-1": {
        provider: "groq",
        mode: "chat",
        turnCount: 3,
        lastUsed: Date.now(),
      },
    };
    saveSessionState(state);

    setSessionSource("linear:ANQ-1", {
      type: "linear",
      linearIssueIdentifier: "ANQ-1",
    });

    const updated = loadSessionState();
    expect(updated["linear:ANQ-1"].source).toEqual({
      type: "linear",
      linearIssueIdentifier: "ANQ-1",
    });
    // Existing fields preserved
    expect(updated["linear:ANQ-1"].provider).toBe("groq");
    expect(updated["linear:ANQ-1"].turnCount).toBe(3);
  });

  it("no-ops when sessionId is null", () => {
    setSessionSource(null as any, { type: "header" });
    const state = loadSessionState();
    expect(Object.keys(state).length).toBe(0);
  });

  it("no-ops when source is null", () => {
    setSessionSource("discord:g:c", null as any);
    const state = loadSessionState();
    expect(Object.keys(state).length).toBe(0);
  });
});

afterAll(() => {
  cleanupTestDir();
  delete process.env.ANQR_BRIDGE_STATE_DIR;
});
