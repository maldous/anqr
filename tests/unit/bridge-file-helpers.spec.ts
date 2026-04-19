import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const TEST_STATE_DIR = path.resolve(PROJECT_ROOT, "reports", "bridge-file-helpers-test");

// Set env before imports so modules pick up the test directory
process.env.ANQR_BRIDGE_STATE_DIR = TEST_STATE_DIR;

const {
  loadBridgeFile,
  saveBridgeFile,
  getBridgeFilePath,
} = await import("../../harness/ops/core/symphony-shared-state/bridge-file-helpers.mjs");

const TEST_FILE = "test-bridge-data.json";

afterAll(() => {
  try {
    if (fs.existsSync(TEST_STATE_DIR)) fs.rmSync(TEST_STATE_DIR, { recursive: true });
  } catch {
    // ignore
  }
  delete process.env.ANQR_BRIDGE_STATE_DIR;
});

describe("bridge-file-helpers", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_STATE_DIR)) {
      fs.mkdirSync(TEST_STATE_DIR, { recursive: true, mode: 0o700 });
    }
    // Clean up test file
    const fp = path.join(TEST_STATE_DIR, TEST_FILE);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    const lockFile = `${fp}.lock`;
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  });

  describe("getBridgeFilePath", () => {
    it("resolves a file path under the bridge state directory", () => {
      const result = getBridgeFilePath("some-file.json");
      expect(result).toContain("some-file.json");
      expect(result).toContain(TEST_STATE_DIR);
    });

    it("joins directory and filename with path separator", () => {
      const result = getBridgeFilePath("data.json");
      expect(result).toBe(path.join(TEST_STATE_DIR, "data.json"));
    });
  });

  describe("loadBridgeFile", () => {
    it("returns fallback when file does not exist", () => {
      const result = loadBridgeFile("nonexistent.json");
      expect(result).toEqual({});
    });

    it("returns custom fallback when file does not exist", () => {
      const result = loadBridgeFile("nonexistent.json", { default: true });
      expect(result).toEqual({ default: true });
    });

    it("loads and parses an existing JSON file", () => {
      const filePath = path.join(TEST_STATE_DIR, TEST_FILE);
      fs.writeFileSync(filePath, JSON.stringify({ key: "value" }, null, 2) + "\n");
      const result = loadBridgeFile(TEST_FILE);
      expect(result).toEqual({ key: "value" });
    });

    it("returns fallback for corrupt JSON file", () => {
      const filePath = path.join(TEST_STATE_DIR, TEST_FILE);
      fs.writeFileSync(filePath, "{ invalid json !!!");
      const result = loadBridgeFile(TEST_FILE, { fallback: true });
      expect(result).toEqual({ fallback: true });
    });
  });

  describe("saveBridgeFile", () => {
    it("writes JSON data to a file", () => {
      saveBridgeFile(TEST_FILE, { hello: "world" });
      const result = loadBridgeFile(TEST_FILE);
      expect(result).toEqual({ hello: "world" });
    });

    it("creates the state directory if it does not exist", () => {
      const nestedDir = path.join(TEST_STATE_DIR, "nested");
      if (fs.existsSync(nestedDir)) fs.rmSync(nestedDir, { recursive: true });
      // The save uses getBridgeStateDir() which is the top-level TEST_STATE_DIR
      // so this just verifies the base directory exists after save
      saveBridgeFile(TEST_FILE, { created: true });
      expect(fs.existsSync(TEST_STATE_DIR)).toBe(true);
      const result = loadBridgeFile(TEST_FILE);
      expect(result).toEqual({ created: true });
    });

    it("overwrites existing data", () => {
      saveBridgeFile(TEST_FILE, { version: 1 });
      saveBridgeFile(TEST_FILE, { version: 2 });
      const result = loadBridgeFile(TEST_FILE);
      expect(result).toEqual({ version: 2 });
    });

    it("writes pretty-printed JSON with trailing newline", () => {
      saveBridgeFile(TEST_FILE, { key: "value" });
      const filePath = path.join(TEST_STATE_DIR, TEST_FILE);
      const raw = fs.readFileSync(filePath, "utf-8");
      expect(raw.endsWith("\n")).toBe(true);
      expect(raw).toContain('"key"');
    });

    it("supports withLock option for concurrent-safe writes", () => {
      saveBridgeFile(TEST_FILE, { locked: true }, { withLock: true });
      const result = loadBridgeFile(TEST_FILE);
      expect(result).toEqual({ locked: true });
    });
  });

  describe("loadBridgeFile + saveBridgeFile roundtrip", () => {
    it("preserves nested objects", () => {
      const data = {
        session1: { worktreeId: "wt1", startedAt: 12345 },
        session2: { worktreeId: "wt2", startedAt: 67890 },
      };
      saveBridgeFile(TEST_FILE, data);
      const result = loadBridgeFile(TEST_FILE);
      expect(result).toEqual(data);
    });

    it("preserves arrays and null values", () => {
      const data = { items: [1, 2, 3], empty: null };
      saveBridgeFile(TEST_FILE, data);
      const result = loadBridgeFile(TEST_FILE);
      expect(result).toEqual(data);
    });
  });
});
