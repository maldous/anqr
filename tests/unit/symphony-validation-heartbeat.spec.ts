import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock node:child_process with inline EventEmitter + default export spread.
// The default export is required for Vitest's ESM module interop to work
// correctly with symphony-validation.mjs's static imports.
vi.mock("node:child_process", async (importOriginal) => {
  const orig = await importOriginal<typeof import("node:child_process")>();

  class E {
    _h: Record<string, ((...args: unknown[]) => void)[]> = {};
    on(e: string, fn: (...args: unknown[]) => void) {
      (this._h[e] ??= []).push(fn);
      return this;
    }
    emit(e: string, ...a: unknown[]) {
      (this._h[e] || []).forEach((f) => f(...a));
      return true;
    }
  }

  const mocks = {
    execFileSync: vi.fn(() => ""),
    spawn: vi.fn(() => {
      const child = Object.assign(new E(), {
        stdout: new E(),
        stderr: new E(),
        pid: 9999,
        kill: vi.fn(),
      });
      process.nextTick(() => child.emit("close", 0));
      return child;
    }),
  };

  return {
    ...orig,
    ...mocks,
    default: { ...orig.default, ...mocks },
  };
});

import { runValidation } from "../../scripts/ops/core/symphony-validation.mjs";

describe("symphony-validation heartbeat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call heartbeat during validation when provided", { timeout: 30_000 }, async () => {
    const heartbeatMock = vi.fn(() => ({ ok: true }));
    const projectRoot = process.cwd();

    await runValidation(projectRoot, [], { heartbeat: heartbeatMock });

    expect(heartbeatMock).toHaveBeenCalled();
    expect(heartbeatMock.mock.calls.length).toBeGreaterThan(0);
  });

  it("should abort validation when heartbeat fails", { timeout: 30_000 }, async () => {
    const heartbeatMock = vi.fn(() => ({ ok: false, reason: "lease_expired" }));
    const projectRoot = process.cwd();

    const result = await runValidation(projectRoot, [], { heartbeat: heartbeatMock });

    expect(result.heartbeatFailed).toBe(true);
    expect(result.passed).toBe(false);
  });

  it("should work without heartbeat callback (backwards compatibility)", { timeout: 30_000 }, async () => {
    const projectRoot = process.cwd();

    const result = await runValidation(projectRoot, []);

    expect(result.heartbeatFailed).toBe(false);
  });
});
