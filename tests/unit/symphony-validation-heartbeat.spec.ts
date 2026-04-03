import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "node:events";

vi.mock("node:child_process", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:child_process")>();

  function fakeSpawn() {
    const child = Object.assign(new EventEmitter(), {
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
      pid: 9999,
      kill: vi.fn(),
    });
    process.nextTick(() => {
      child.emit("close", 0);
    });
    return child;
  }

  return {
    ...original,
    execFileSync: vi.fn(() => ""),
    spawn: vi.fn(fakeSpawn),
  };
});

import { runValidation } from "../../scripts/ops/core/symphony-validation.mjs";

describe("symphony-validation heartbeat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies child_process mock is active", async () => {
    const cp = await import("node:child_process");
    expect(vi.isMockFunction(cp.execFileSync)).toBe(true);
    expect(vi.isMockFunction(cp.spawn)).toBe(true);
    expect(cp.execFileSync("anything")).toBe("");
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
