import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const TEST_STATE_DIR = path.resolve(PROJECT_ROOT, "reports", "request-rehydration-test");

// Set env before imports so modules pick up the test directory
process.env.ANQR_BRIDGE_STATE_DIR = TEST_STATE_DIR;

const {
  persistInflightRequest,
  completeInflightRequest,
  getInflightRequest,
  scanStaleInflightRequests,
  getAllInflightRequests,
  INFLIGHT_TTL_MS,
} = await import("../../harness/ops/core/symphony-shared-state/request-rehydration.mjs");

function cleanupTestDir() {
  try {
    const file = path.join(TEST_STATE_DIR, "inflight-requests.json");
    if (fs.existsSync(file)) fs.unlinkSync(file);
    const lockFile = path.join(TEST_STATE_DIR, "inflight-requests.json.lock");
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  } catch {
    // ignore
  }
}

afterAll(() => {
  try {
    cleanupTestDir();
    if (fs.existsSync(TEST_STATE_DIR)) fs.rmSync(TEST_STATE_DIR, { recursive: true });
  } catch {
    // ignore
  }
  delete process.env.ANQR_BRIDGE_STATE_DIR;
});

describe("request-rehydration", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_STATE_DIR)) {
      fs.mkdirSync(TEST_STATE_DIR, { recursive: true, mode: 0o700 });
    }
    cleanupTestDir();
  });

  describe("persistInflightRequest", () => {
    it("persists an in-flight request", () => {
      persistInflightRequest("req-1", {
        sessionKey: "discord:g:c",
        worktreeId: "wt1",
        providerName: "openai",
        model: "gpt-4",
      });
      const record = getInflightRequest("req-1");
      expect(record).not.toBeNull();
      expect(record!.sessionKey).toBe("discord:g:c");
      expect(record!.worktreeId).toBe("wt1");
      expect(record!.providerName).toBe("openai");
      expect(record!.startedAt).toBeDefined();
    });

    it("uses provided startedAt if given", () => {
      const ts = Date.now() - 1000;
      persistInflightRequest("req-2", { sessionKey: "linear:ANQ-1", startedAt: ts });
      const record = getInflightRequest("req-2");
      expect(record).not.toBeNull();
      expect(record!.startedAt).toBe(ts);
    });

    it("does nothing for null/empty requestId", () => {
      persistInflightRequest("", { sessionKey: "test" });
      persistInflightRequest(null as unknown as string, { sessionKey: "test" });
    });
  });

  describe("completeInflightRequest", () => {
    it("removes an in-flight request", () => {
      persistInflightRequest("req-3", { sessionKey: "discord:g:c" });
      completeInflightRequest("req-3");
      expect(getInflightRequest("req-3")).toBeNull();
    });

    it("does nothing for non-existent request", () => {
      completeInflightRequest("req-nonexistent");
    });

    it("does nothing for null/empty requestId", () => {
      completeInflightRequest("");
      completeInflightRequest(null as unknown as string);
    });
  });

  describe("getInflightRequest", () => {
    it("returns null for non-existent request", () => {
      expect(getInflightRequest("nope")).toBeNull();
    });

    it("returns null for null requestId", () => {
      expect(getInflightRequest(null as unknown as string)).toBeNull();
    });
  });

  describe("scanStaleInflightRequests", () => {
    it("returns empty array when no stale requests exist", () => {
      persistInflightRequest("req-fresh", { sessionKey: "discord:g:c" });
      const stale = scanStaleInflightRequests();
      expect(stale).toEqual([]);
    });

    it("cleans up and returns stale requests", async () => {
      persistInflightRequest("req-stale", { sessionKey: "discord:g:c", worktreeId: "wt1" });
      // Backdate the timestamp
      const { loadBridgeFile, saveBridgeFile } =
        await import("../../harness/ops/core/symphony-shared-state/bridge-file-helpers.mjs");
      const state = loadBridgeFile("inflight-requests.json");
      state["req-stale"].startedAt = Date.now() - INFLIGHT_TTL_MS - 1000;
      saveBridgeFile("inflight-requests.json", state);

      const stale = scanStaleInflightRequests();
      expect(stale).toHaveLength(1);
      expect(stale[0].requestId).toBe("req-stale");
      expect(stale[0].sessionKey).toBe("discord:g:c");
      expect(getInflightRequest("req-stale")).toBeNull();
    });

    it("preserves fresh requests while cleaning stale ones", async () => {
      persistInflightRequest("req-fresh2", { sessionKey: "discord:g2:c2" });
      persistInflightRequest("req-stale2", { sessionKey: "discord:g3:c3" });
      const { loadBridgeFile, saveBridgeFile } =
        await import("../../harness/ops/core/symphony-shared-state/bridge-file-helpers.mjs");
      const state = loadBridgeFile("inflight-requests.json");
      state["req-stale2"].startedAt = Date.now() - INFLIGHT_TTL_MS - 1000;
      saveBridgeFile("inflight-requests.json", state);

      const stale = scanStaleInflightRequests();
      expect(stale).toHaveLength(1);
      expect(getInflightRequest("req-fresh2")).not.toBeNull();
    });
  });

  describe("getAllInflightRequests", () => {
    it("returns empty object when no records exist", () => {
      expect(getAllInflightRequests()).toEqual({});
    });

    it("returns all active records", () => {
      persistInflightRequest("req-a", { sessionKey: "discord:g1:c1" });
      persistInflightRequest("req-b", { sessionKey: "linear:ANQ-50" });
      const all = getAllInflightRequests();
      expect(Object.keys(all)).toHaveLength(2);
      expect(all["req-a"].sessionKey).toBe("discord:g1:c1");
      expect(all["req-b"].sessionKey).toBe("linear:ANQ-50");
    });
  });

  describe("INFLIGHT_TTL_MS", () => {
    it("is 10 minutes", () => {
      expect(INFLIGHT_TTL_MS).toBe(10 * 60 * 1000);
    });
  });
});
