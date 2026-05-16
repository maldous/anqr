import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const TEST_STATE_DIR = path.resolve(PROJECT_ROOT, "reports", "active-job-ownership-test");

// Set env before imports so modules pick up the test directory
process.env.ANQR_BRIDGE_STATE_DIR = TEST_STATE_DIR;

const {
  acquireJobOwnership,
  releaseJobOwnership,
  getJobOwnership,
  hasActiveJob,
  cleanupStaleOwnership,
  getAllActiveOwnership,
  OWNERSHIP_TTL_MS,
} = await import("../../harness/ops/core/symphony-shared-state/active-job-ownership.mjs");

function cleanupTestDir() {
  try {
    const file = path.join(TEST_STATE_DIR, "active-job-ownership.json");
    if (fs.existsSync(file)) fs.unlinkSync(file);
    const lockFile = path.join(TEST_STATE_DIR, "active-job-ownership.json.lock");
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

describe("active-job-ownership", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_STATE_DIR)) {
      fs.mkdirSync(TEST_STATE_DIR, { recursive: true, mode: 0o700 });
    }
    cleanupTestDir();
  });

  describe("acquireJobOwnership", () => {
    it("acquires ownership for a session key", () => {
      acquireJobOwnership("discord:guild1:channel1", {
        worktreeId: "wt1",
        correlationId: "corr-1",
      });
      const record = getJobOwnership("discord:guild1:channel1");
      expect(record).not.toBeNull();
      expect(record!.worktreeId).toBe("wt1");
    });

    it("does nothing for null/empty session key", () => {
      acquireJobOwnership("", { worktreeId: "wt1" });
      acquireJobOwnership(null as unknown as string, { worktreeId: "wt1" });
      // Verify no ownership was created for null/empty keys
      expect(getAllActiveOwnership()).toEqual({});
    });
  });

  describe("releaseJobOwnership", () => {
    it("releases ownership for a session key", () => {
      acquireJobOwnership("discord:g:c", { worktreeId: "wt1" });
      releaseJobOwnership("discord:g:c");
      expect(getJobOwnership("discord:g:c")).toBeNull();
    });

    it("does nothing for non-existent ownership", () => {
      releaseJobOwnership("discord:nonexistent:c");
      // Verify no ownership records were affected
      expect(getAllActiveOwnership()).toEqual({});
    });

    it("does nothing for null/empty session key", () => {
      releaseJobOwnership("");
      releaseJobOwnership(null as unknown as string);
      // Verify no crash and no ownership records were affected
      expect(getAllActiveOwnership()).toEqual({});
    });
  });

  describe("hasActiveJob", () => {
    it("returns true when ownership exists", () => {
      acquireJobOwnership("discord:g:c", { worktreeId: "wt1" });
      expect(hasActiveJob("discord:g:c")).toBe(true);
    });

    it("returns false when no ownership exists", () => {
      expect(hasActiveJob("discord:nonexistent:c")).toBe(false);
    });
  });

  describe("getJobOwnership", () => {
    it("returns null for non-existent session key", () => {
      expect(getJobOwnership("discord:nope:c")).toBeNull();
    });

    it("returns null for null session key", () => {
      expect(getJobOwnership(null as unknown as string)).toBeNull();
    });

    it("includes all stored details", () => {
      acquireJobOwnership("discord:g:c", {
        worktreeId: "wt3",
        requestId: "req-99",
        correlationId: "corr-abc",
        channelId: "channel-xyz",
        guildId: "guild-abc",
      });
      const record = getJobOwnership("discord:g:c");
      expect(record).not.toBeNull();
      expect(record!.worktreeId).toBe("wt3");
      expect(record!.requestId).toBe("req-99");
      expect(record!.correlationId).toBe("corr-abc");
      expect(record!.channelId).toBe("channel-xyz");
      expect(record!.guildId).toBe("guild-abc");
    });

    it("does nothing for null/empty session key", () => {
      acquireJobOwnership("", { worktreeId: "wt1" });
      acquireJobOwnership(null as unknown as string, { worktreeId: "wt1" });
      // Verify no ownership was created for null/empty keys
      expect(getAllActiveOwnership()).toEqual({});
    });
  });

  describe("releaseJobOwnership", () => {
    it("releases ownership for a session key", () => {
      acquireJobOwnership("discord:g:c", { worktreeId: "wt1" });
      releaseJobOwnership("discord:g:c");
      expect(getJobOwnership("discord:g:c")).toBeNull();
    });

    it("does nothing for non-existent ownership", () => {
      releaseJobOwnership("discord:nonexistent:c");
      // Verify no ownership records were affected
      expect(getAllActiveOwnership()).toEqual({});
    });

    it("does nothing for null/empty session key", () => {
      releaseJobOwnership("");
      releaseJobOwnership(null as unknown as string);
      // Verify no crash and no ownership records were affected
      expect(getAllActiveOwnership()).toEqual({});
    });
  });

  describe("hasActiveJob", () => {
    it("returns true when ownership exists", () => {
      acquireJobOwnership("discord:g:c", { worktreeId: "wt1" });
      expect(hasActiveJob("discord:g:c")).toBe(true);
    });

    it("returns false when no ownership exists", () => {
      expect(hasActiveJob("discord:nonexistent:c")).toBe(false);
    });
  });

  describe("getJobOwnership", () => {
    it("returns null for non-existent session key", () => {
      expect(getJobOwnership("discord:nope:c")).toBeNull();
    });

    it("returns null for null session key", () => {
      expect(getJobOwnership(null as unknown as string)).toBeNull();
    });

    it("includes all stored details", () => {
      acquireJobOwnership("discord:g:c", {
        worktreeId: "wt3",
        requestId: "req-99",
        correlationId: "corr-abc",
        channelId: "channel-xyz",
        guildId: "guild-abc",
      });
      const record = getJobOwnership("discord:g:c");
      expect(record).not.toBeNull();
      expect(record!.worktreeId).toBe("wt3");
      expect(record!.requestId).toBe("req-99");
      expect(record!.correlationId).toBe("corr-abc");
      expect(record!.channelId).toBe("channel-xyz");
      expect(record!.guildId).toBe("guild-abc");
    });
  });

  describe("cleanupStaleOwnership", () => {
    it("returns 0 when no stale records exist", () => {
      acquireJobOwnership("discord:g:c", { worktreeId: "wt1" });
      const cleaned = cleanupStaleOwnership();
      expect(cleaned).toBe(0);
    });

    it("cleans up stale records and returns count", async () => {
      // Acquire, then manually backdate the startedAt timestamp
      acquireJobOwnership("discord:stale:c", { worktreeId: "wt1" });
      const { loadBridgeFile, saveBridgeFile } =
        await import("../../harness/ops/core/symphony-shared-state/bridge-file-helpers.mjs");
      const state = loadBridgeFile("active-job-ownership.json");
      state["discord:stale:c"].startedAt = Date.now() - OWNERSHIP_TTL_MS - 1000;
      saveBridgeFile("active-job-ownership.json", state);

      const cleaned = cleanupStaleOwnership();
      expect(cleaned).toBe(1);
      expect(hasActiveJob("discord:stale:c")).toBe(false);
    });
  });

  describe("getAllActiveOwnership", () => {
    it("returns empty object when no records exist", () => {
      expect(getAllActiveOwnership()).toEqual({});
    });

    it("returns all active records", () => {
      acquireJobOwnership("discord:g1:c1", { worktreeId: "wt1" });
      acquireJobOwnership("linear:ANQ-100", { worktreeId: "wt2" });
      const all = getAllActiveOwnership();
      expect(Object.keys(all)).toHaveLength(2);
      expect(all["discord:g1:c1"].worktreeId).toBe("wt1");
      expect(all["linear:ANQ-100"].worktreeId).toBe("wt2");
    });

    it("excludes stale records", async () => {
      acquireJobOwnership("discord:stale:c", { worktreeId: "wt1" });
      acquireJobOwnership("discord:fresh:c", { worktreeId: "wt2" });
      // Backdate stale
      const { loadBridgeFile, saveBridgeFile } =
        await import("../../harness/ops/core/symphony-shared-state/bridge-file-helpers.mjs");
      const state = loadBridgeFile("active-job-ownership.json");
      state["discord:stale:c"].startedAt = Date.now() - OWNERSHIP_TTL_MS - 1000;
      saveBridgeFile("active-job-ownership.json", state);

      const all = getAllActiveOwnership();
      expect(Object.keys(all)).toHaveLength(1);
      expect(all["discord:fresh:c"]).toBeDefined();
    });
  });

  describe("OWNERSHIP_TTL_MS", () => {
    it("is 5 minutes", () => {
      expect(OWNERSHIP_TTL_MS).toBe(5 * 60 * 1000);
    });
  });
});
