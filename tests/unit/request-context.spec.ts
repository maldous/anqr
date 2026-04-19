import { describe, it, expect, afterEach } from "vitest";

// Use module namespace object to preserve live bindings for `let` exports
const bridge = await import(
  "../../harness/ops/integrations/model/symphony-openai-bridge/index.mjs"
);

afterEach(() => {
  bridge.setCurrentRequestId(null);
});

describe("requestContextStorage", () => {
  it("is an AsyncLocalStorage instance", () => {
    expect(bridge.requestContextStorage).toBeDefined();
    expect(typeof bridge.requestContextStorage.run).toBe("function");
    expect(typeof bridge.requestContextStorage.getStore).toBe("function");
  });

  it("returns undefined when no store is active", () => {
    expect(bridge.requestContextStorage.getStore()).toBeUndefined();
  });
});

describe("withRequestContext", () => {
  it("provides context inside the callback via getRequestContext", async () => {
    const ctx = {
      requestId: "req-1",
      sessionKey: "discord:g:c",
      worktreeId: "wt1",
    };
    const result = await bridge.withRequestContext(ctx, () => {
      return bridge.getRequestContext();
    });
    expect(result).toEqual(ctx);
  });

  it("provides requestId via getCurrentRequestId inside callback", async () => {
    const result = await bridge.withRequestContext(
      { requestId: "req-abc", sessionKey: null, worktreeId: null },
      () => bridge.getCurrentRequestId()
    );
    expect(result).toBe("req-abc");
  });

  it("restores context after callback completes", async () => {
    await bridge.withRequestContext(
      { requestId: "inner", sessionKey: null, worktreeId: null },
      () => {
        expect(bridge.getCurrentRequestId()).toBe("inner");
      }
    );
    expect(bridge.requestContextStorage.getStore()).toBeUndefined();
  });

  it("supports nested contexts (inner overrides outer)", async () => {
    const result = await bridge.withRequestContext(
      { requestId: "outer", sessionKey: null, worktreeId: null },
      async () => {
        return bridge.withRequestContext(
          { requestId: "inner", sessionKey: null, worktreeId: null },
          () => bridge.getCurrentRequestId()
        );
      }
    );
    expect(result).toBe("inner");
  });

  it("restores outer context after inner callback", async () => {
    const result = await bridge.withRequestContext(
      { requestId: "outer", sessionKey: "discord:g:c", worktreeId: "wt1" },
      async () => {
        await bridge.withRequestContext(
          { requestId: "inner", sessionKey: null, worktreeId: null },
          () => {
            // inner context active
          }
        );
        return bridge.getCurrentRequestId();
      }
    );
    expect(result).toBe("outer");
  });

  it("returns the callback result", async () => {
    const val = await bridge.withRequestContext(
      { requestId: "r", sessionKey: null, worktreeId: null },
      () => 42
    );
    expect(val).toBe(42);
  });
});

describe("getCurrentRequestId", () => {
  it("returns null when no context is set", () => {
    expect(bridge.getCurrentRequestId()).toBeNull();
  });

  it("returns the module-global currentRequestId as fallback", () => {
    bridge.setCurrentRequestId("global-req-1");
    expect(bridge.getCurrentRequestId()).toBe("global-req-1");
  });

  it("prefers async-local store over module-global", async () => {
    bridge.setCurrentRequestId("global-req-2");
    const result = await bridge.withRequestContext(
      { requestId: "async-req", sessionKey: null, worktreeId: null },
      () => bridge.getCurrentRequestId()
    );
    expect(result).toBe("async-req");
  });

  it("falls back to module-global when async-local has no requestId", async () => {
    bridge.setCurrentRequestId("global-req-3");
    const result = await bridge.withRequestContext(
      { sessionKey: null, worktreeId: null } as { requestId?: never; sessionKey: null; worktreeId: null },
      () => bridge.getCurrentRequestId()
    );
    expect(result).toBe("global-req-3");
  });
});

describe("getRequestContext", () => {
  it("returns null when no context is set", () => {
    expect(bridge.getRequestContext()).toBeNull();
  });

  it("returns the full async-local store context", async () => {
    const ctx = {
      requestId: "req-full",
      sessionKey: "linear:ANQ-1",
      worktreeId: "wt99",
    };
    const result = await bridge.withRequestContext(ctx, () =>
      bridge.getRequestContext()
    );
    expect(result).toEqual(ctx);
  });

  it("returns synthetic context from module-global when no async-local store", () => {
    bridge.setCurrentRequestId("synthetic-req");
    const ctx = bridge.getRequestContext();
    expect(ctx).toEqual({
      requestId: "synthetic-req",
      sessionKey: null,
      worktreeId: null,
    });
  });

  it("prefers async-local store over synthetic context", async () => {
    bridge.setCurrentRequestId("synthetic-req-2");
    const result = await bridge.withRequestContext(
      {
        requestId: "async-req-2",
        sessionKey: "discord:g:c",
        worktreeId: "wt5",
      },
      () => bridge.getRequestContext()
    );
    expect(result).toEqual({
      requestId: "async-req-2",
      sessionKey: "discord:g:c",
      worktreeId: "wt5",
    });
  });
});

describe("setCurrentRequestId / currentRequestId", () => {
  it("sets and reads the module-global via live binding", () => {
    bridge.setCurrentRequestId("test-id");
    expect(bridge.currentRequestId).toBe("test-id");
  });

  it("resets to null", () => {
    bridge.setCurrentRequestId("test-id-2");
    bridge.setCurrentRequestId(null);
    expect(bridge.currentRequestId).toBeNull();
  });
});
