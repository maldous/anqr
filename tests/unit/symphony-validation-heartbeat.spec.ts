import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "node:events";

vi.mock("node:child_process", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:child_process")>();

  function fakeSpawn() {
    const child = new EventEmitter() as EventEmitter & {
      stdout: EventEmitter;
      stderr: EventEmitter;
      kill: () => void;
    };
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.kill = vi.fn();
    setTimeout(() => child.emit("close", 0), 5);
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

  it("should call heartbeat during validation when provided", async () => {
    const heartbeatMock = vi.fn(() => ({ ok: true }));
    const projectRoot = process.cwd();

    await runValidation(projectRoot, [], { heartbeat: heartbeatMock });

    expect(heartbeatMock).toHaveBeenCalled();
    expect(heartbeatMock.mock.calls.length).toBeGreaterThan(0);
  });

  it("should abort validation when heartbeat fails", async () => {
    const heartbeatMock = vi.fn(() => ({ ok: false, reason: "lease_expired" }));
    const projectRoot = process.cwd();

    const result = await runValidation(projectRoot, [], { heartbeat: heartbeatMock });

    expect(result.heartbeatFailed).toBe(true);
    expect(result.passed).toBe(false);
  });

  it("should work without heartbeat callback (backwards compatibility)", async () => {
    const projectRoot = process.cwd();

    const result = await runValidation(projectRoot, []);

    expect(result.heartbeatFailed).toBe(false);
  });
});
