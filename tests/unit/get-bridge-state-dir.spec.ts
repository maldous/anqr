import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// Save original env vars
const origBridge = process.env.ANQR_BRIDGE_STATE_DIR;
const origSymphony = process.env.ANQR_SYMPHONY_STATE_DIR;
const origXdg = process.env.XDG_RUNTIME_DIR;

// Track directories created by ensureBridgeStateDir tests for cleanup
const createdDirs: string[] = [];

afterAll(() => {
  // Restore original env vars
  if (origBridge !== undefined) process.env.ANQR_BRIDGE_STATE_DIR = origBridge;
  else delete process.env.ANQR_BRIDGE_STATE_DIR;
  if (origSymphony !== undefined) process.env.ANQR_SYMPHONY_STATE_DIR = origSymphony;
  else delete process.env.ANQR_SYMPHONY_STATE_DIR;
  if (origXdg !== undefined) process.env.XDG_RUNTIME_DIR = origXdg;
  else delete process.env.XDG_RUNTIME_DIR;
  // Clean up any directories created by ensureBridgeStateDir tests
  for (const dir of createdDirs) {
    try {
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
    } catch {
      // ignore
    }
  }
});

describe("get-bridge-state-dir", () => {
  beforeEach(() => {
    // Reset env to baseline before each test
    delete process.env.ANQR_BRIDGE_STATE_DIR;
    delete process.env.ANQR_SYMPHONY_STATE_DIR;
    delete process.env.XDG_RUNTIME_DIR;
  });

  afterEach(() => {
    // Clean up env after each test
    delete process.env.ANQR_BRIDGE_STATE_DIR;
    delete process.env.ANQR_SYMPHONY_STATE_DIR;
    delete process.env.XDG_RUNTIME_DIR;
  });

  describe("getBridgeStateDir", () => {
    it("prefers ANQR_BRIDGE_STATE_DIR when set", async () => {
      process.env.ANQR_BRIDGE_STATE_DIR = "/custom/bridge-state";
      process.env.ANQR_SYMPHONY_STATE_DIR = "/symphony/state";
      const { getBridgeStateDir } = await import(
        "../../harness/ops/core/symphony-shared-state/get-bridge-state-dir-impl.mjs"
      );
      expect(getBridgeStateDir()).toBe("/custom/bridge-state");
    });

    it("uses ANQR_SYMPHONY_STATE_DIR when ANQR_BRIDGE_STATE_DIR is not set", async () => {
      process.env.ANQR_SYMPHONY_STATE_DIR = "/symphony/state";
      const { getBridgeStateDir } = await import(
        "../../harness/ops/core/symphony-shared-state/get-bridge-state-dir-impl.mjs"
      );
      expect(getBridgeStateDir()).toBe("/symphony/state");
    });

    it("falls back to XDG_RUNTIME_DIR/anqr-bridge-state when no env override", async () => {
      process.env.XDG_RUNTIME_DIR = "/run/user/1000";
      const { getBridgeStateDir } = await import(
        "../../harness/ops/core/symphony-shared-state/get-bridge-state-dir-impl.mjs"
      );
      expect(getBridgeStateDir()).toBe(path.join("/run/user/1000", "anqr-bridge-state"));
    });

    it("falls back to /tmp/anqr-bridge-state when XDG_RUNTIME_DIR is not set", async () => {
      // All three env vars already deleted by beforeEach
      const { getBridgeStateDir } = await import(
        "../../harness/ops/core/symphony-shared-state/get-bridge-state-dir-impl.mjs"
      );
      expect(getBridgeStateDir()).toBe(path.join("/tmp", "anqr-bridge-state"));
    });
  });

  describe("ensureBridgeStateDir", () => {
    it("creates the directory and returns its path", async () => {
      const testDir = path.join(PROJECT_ROOT, "reports", "ensure-bridge-dir-test");
      process.env.ANQR_BRIDGE_STATE_DIR = testDir;
      createdDirs.push(testDir);

      const { ensureBridgeStateDir } = await import(
        "../../harness/ops/core/symphony-shared-state/ensure-bridge-state-dir.mjs"
      );
      const result = ensureBridgeStateDir();
      expect(result).toBe(testDir);
      expect(fs.existsSync(testDir)).toBe(true);
      const stat = fs.statSync(testDir);
      expect(stat.isDirectory()).toBe(true);
    });

    it("does not error if directory already exists", async () => {
      const testDir = path.join(PROJECT_ROOT, "reports", "ensure-bridge-dir-test2");
      process.env.ANQR_BRIDGE_STATE_DIR = testDir;
      createdDirs.push(testDir);
      fs.mkdirSync(testDir, { recursive: true, mode: 0o700 });

      const { ensureBridgeStateDir } = await import(
        "../../harness/ops/core/symphony-shared-state/ensure-bridge-state-dir.mjs"
      );
      const result = ensureBridgeStateDir();
      expect(result).toBe(testDir);
    });
  });
});
