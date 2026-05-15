import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const TEST_STATE_DIR = path.resolve(PROJECT_ROOT, "reports", "session-state-crud-test");

// Set env before imports so modules pick up the test directory
process.env.ANQR_BRIDGE_STATE_DIR = TEST_STATE_DIR;

const { updateSessionProvider } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/update-session-provider.mjs"
);

const { getSessionProvider } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/get-session-provider.mjs"
);

const { clearSessionProvider } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/clear-session-provider.mjs"
);

const { setSessionMessages } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/set-session-messages.mjs"
);

const { getSessionMessages } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/get-session-messages.mjs"
);

const { clearSessionMessages } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/clear-session-messages.mjs"
);

const { verifySessionMessages } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/verify-session-messages.mjs"
);

const SESSION_ID = "discord:test-guild:test-channel";

function cleanupStateFile() {
  try {
    const file = path.join(TEST_STATE_DIR, "session-state.json");
    if (fs.existsSync(file)) fs.unlinkSync(file);
    const lockFile = `${file}.lock`;
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  } catch {
    // ignore
  }
}

afterAll(() => {
  try {
    if (fs.existsSync(TEST_STATE_DIR)) fs.rmSync(TEST_STATE_DIR, { recursive: true });
  } catch {
    // ignore
  }
  delete process.env.ANQR_BRIDGE_STATE_DIR;
});

describe("session-state CRUD", () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_STATE_DIR)) {
      fs.mkdirSync(TEST_STATE_DIR, { recursive: true, mode: 0o700 });
    }
    cleanupStateFile();
  });

  describe("updateSessionProvider + getSessionProvider", () => {
    it("creates a new session with provider info", () => {
      updateSessionProvider(SESSION_ID, {
        name: "openai",
        mode: "free-cloud",
        tier: "free-cloud",
      });
      const session = getSessionProvider(SESSION_ID);
      expect(session).not.toBeNull();
      expect(session!.provider).toBe("openai");
      expect(session!.turnCount).toBe(1);
    });

    it("increments turn count when same provider is updated", () => {
      updateSessionProvider(SESSION_ID, {
        name: "openai",
        mode: "free-cloud",
        tier: "free-cloud",
      });
      updateSessionProvider(SESSION_ID, {
        name: "openai",
        mode: "free-cloud",
        tier: "free-cloud",
      });
      const session = getSessionProvider(SESSION_ID);
      expect(session!.turnCount).toBe(2);
    });

    it("resets turn count when provider changes", () => {
      updateSessionProvider(SESSION_ID, {
        name: "openai",
        mode: "free-cloud",
        tier: "free-cloud",
      });
      updateSessionProvider(SESSION_ID, {
        name: "anthropic",
        mode: "paid",
        tier: "paid",
      });
      const session = getSessionProvider(SESSION_ID);
      expect(session!.provider).toBe("anthropic");
      expect(session!.turnCount).toBe(1);
    });

    it("preserves messages when provider changes", () => {
      updateSessionProvider(SESSION_ID, {
        name: "openai",
        mode: "free-cloud",
        tier: "free-cloud",
      });
      setSessionMessages(SESSION_ID, [{ role: "user", content: "hello" }]);
      updateSessionProvider(SESSION_ID, {
        name: "anthropic",
        mode: "paid",
        tier: "paid",
      });
      const msgs = getSessionMessages(SESSION_ID);
      expect(msgs).not.toBeNull();
      expect(msgs!.length).toBe(1);
      expect(msgs![0].content).toBe("hello");
    });

    it("does nothing for null/empty sessionId", () => {
      expect(() => updateSessionProvider(null as unknown as string, { name: "test" })).not.toThrow();
      expect(() => updateSessionProvider("", { name: "test" })).not.toThrow();
    });

    it("getSessionProvider returns null for nonexistent session", () => {
      expect(getSessionProvider("nonexistent-session")).toBeNull();
    });

    it("getSessionProvider returns null for null sessionId", () => {
      expect(getSessionProvider(null as unknown as string)).toBeNull();
    });
  });

  describe("clearSessionProvider", () => {
    it("clears provider but preserves messages", () => {
      updateSessionProvider(SESSION_ID, {
        name: "openai",
        mode: "free-cloud",
        tier: "free-cloud",
      });
      setSessionMessages(SESSION_ID, [{ role: "user", content: "keep me" }]);
      clearSessionProvider(SESSION_ID);
      const session = getSessionProvider(SESSION_ID);
      expect(session).not.toBeNull();
      expect(session!.messages).toBeDefined();
      expect(session!.messages.length).toBe(1);
    });

    it("does nothing for null/empty sessionId", () => {
      clearSessionProvider(null as unknown as string);
      clearSessionProvider("");
    });
  });

  describe("setSessionMessages + getSessionMessages", () => {
    it("stores and retrieves messages", () => {
      updateSessionProvider(SESSION_ID, {
        name: "openai",
        mode: "free-cloud",
        tier: "free-cloud",
      });
      const messages = [
        { role: "user", content: "hello" },
        { role: "assistant", content: "hi" },
      ];
      setSessionMessages(SESSION_ID, messages);
      const retrieved = getSessionMessages(SESSION_ID);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.length).toBe(2);
      expect(retrieved![0].content).toBe("hello");
      expect(retrieved![1].content).toBe("hi");
    });

    it("returns a deep copy — external mutation does not affect stored data", () => {
      updateSessionProvider(SESSION_ID, {
        name: "openai",
        mode: "free-cloud",
        tier: "free-cloud",
      });
      setSessionMessages(SESSION_ID, [{ role: "user", content: "original" }]);
      const copy = getSessionMessages(SESSION_ID);
      copy![0].content = "mutated";
      const reFetched = getSessionMessages(SESSION_ID);
      expect(reFetched![0].content).toBe("original");
    });

    it("getSessionMessages returns null for nonexistent session", () => {
      expect(getSessionMessages("nonexistent")).toBeNull();
    });

    it("getSessionMessages returns null for null sessionId", () => {
      expect(getSessionMessages(null as unknown as string)).toBeNull();
    });

    it("does nothing for null/empty sessionId", () => {
      setSessionMessages(null as unknown as string, []);
      setSessionMessages("", []);
    });
  });

  describe("clearSessionMessages", () => {
    it("removes messages and messageHash from session", () => {
      updateSessionProvider(SESSION_ID, {
        name: "openai",
        mode: "free-cloud",
        tier: "free-cloud",
      });
      setSessionMessages(SESSION_ID, [{ role: "user", content: "bye" }]);
      clearSessionMessages(SESSION_ID);
      expect(getSessionMessages(SESSION_ID)).toBeNull();
    });

    it("does nothing for null/empty sessionId", () => {
      clearSessionMessages(null as unknown as string);
      clearSessionMessages("");
    });
  });

  describe("verifySessionMessages", () => {
    it("returns false for null sessionId", () => {
      expect(verifySessionMessages(null as unknown as string, [])).toBe(false);
    });

    it("returns false for empty sessionId", () => {
      expect(verifySessionMessages("", [])).toBe(false);
    });

    it("returns false for nonexistent session", () => {
      expect(
        verifySessionMessages("nonexistent-session", [{ role: "user", content: "hi" }])
      ).toBe(false);
    });

    it("returns true when messages match stored hash", () => {
      updateSessionProvider(SESSION_ID, {
        name: "openai",
        mode: "free-cloud",
        tier: "free-cloud",
      });
      const messages = [{ role: "user", content: "verify me" }];
      setSessionMessages(SESSION_ID, messages);
      expect(verifySessionMessages(SESSION_ID, messages)).toBe(true);
    });

    it("returns false when messages do not match stored hash", () => {
      updateSessionProvider(SESSION_ID, {
        name: "openai",
        mode: "free-cloud",
        tier: "free-cloud",
      });
      setSessionMessages(SESSION_ID, [{ role: "user", content: "original" }]);
      expect(
        verifySessionMessages(SESSION_ID, [{ role: "user", content: "tampered" }])
      ).toBe(false);
    });
  });
});
