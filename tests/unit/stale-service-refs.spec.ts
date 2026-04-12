import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const RUNTIME_FILES = [
  "harness/ops/orchestration/symphony-control/get-enabled-timers.mjs",
  "harness/ops/orchestration/symphony-control/enable-all-timers.mjs",
  "harness/ops/orchestration/symphony-control/disable-all-timers.mjs",
  "harness/ops/tools/verify-webhook-system/main.mjs",
  "harness/ops/tools/startup-recovery/main.mjs",
  "harness/ops/orchestration/symphony-control/get-timer-status.mjs",
];

const STALE_PATTERNS = [
  "anqr-linear-runner@",
  "anqr-queue-feeder",
];

describe("stale service reference audit", () => {
  for (const filePath of RUNTIME_FILES) {
    const fullPath = resolve(filePath);
    if (!existsSync(fullPath)) continue;

    const source = readFileSync(fullPath, "utf-8");

    for (const pattern of STALE_PATTERNS) {
      it(`${filePath} does not reference stale unit ${pattern}`, () => {
        expect(source).not.toContain(pattern);
      });
    }
  }

  it("anqr-linear-reconciler.service exists", () => {
    expect(existsSync(resolve("services/systemd/anqr-linear-reconciler.service"))).toBe(true);
  });
});
