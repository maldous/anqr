import { describe, it, expect, vi, beforeEach } from "vitest";
import { runValidation } from "../../scripts/ops/core/symphony-validation.mjs";

describe("symphony-validation heartbeat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call heartbeat during validation when provided", async () => {
    const heartbeatMock = vi.fn(() => ({ ok: true }));
    const projectRoot = process.cwd();

    // Run validation with heartbeat callback
    await runValidation(projectRoot, [], { heartbeat: heartbeatMock });

    // Heartbeat should have been called (at least once per validation check)
    expect(heartbeatMock).toHaveBeenCalled();
    expect(heartbeatMock.mock.calls.length).toBeGreaterThan(0);
  });

  it("should abort validation when heartbeat fails", async () => {
    const heartbeatMock = vi.fn(() => ({ ok: false, reason: "lease_expired" }));
    const projectRoot = process.cwd();

    // Run validation with failing heartbeat
    const result = await runValidation(projectRoot, [], { heartbeat: heartbeatMock });

    // Validation should fail due to heartbeat failure
    expect(result.heartbeatFailed).toBe(true);
    expect(result.passed).toBe(false);
  });

  it("should work without heartbeat callback (backwards compatibility)", async () => {
    const projectRoot = process.cwd();

    // Run validation without heartbeat callback
    const result = await runValidation(projectRoot, []);

    // Should complete successfully (assuming validation passes)
    expect(result.heartbeatFailed).toBe(false);
  });
});
