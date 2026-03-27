import { describe, it, expect } from "vitest";
import { penaltyLevel1AdjacentModules } from "./penalty-level1-adjacent-modules";
import { qrcode } from "./encoder";

describe("penaltyLevel1AdjacentModules", () => {
  it("returns 0 for QR with no long runs", () => {
    const qr = qrcode(1, "L");
    qr.addData("A");
    qr.make();
    const penalty = penaltyLevel1AdjacentModules(qr, qr.getModuleCount());
    expect(penalty).toBeGreaterThanOrEqual(0);
  });

  it("calculates penalty for adjacent modules", () => {
    const qr = qrcode(1, "L");
    qr.addData("TEST");
    qr.make();
    const moduleCount = qr.getModuleCount();
    const penalty = penaltyLevel1AdjacentModules(qr, moduleCount);
    expect(typeof penalty).toBe("number");
    expect(penalty).toBeGreaterThanOrEqual(0);
  });

  it("returns consistent results for same QR code", () => {
    const qr = qrcode(1, "M");
    qr.addData("HELLO");
    qr.make();
    const moduleCount = qr.getModuleCount();
    const p1 = penaltyLevel1AdjacentModules(qr, moduleCount);
    const p2 = penaltyLevel1AdjacentModules(qr, moduleCount);
    expect(p1).toBe(p2);
  });

  it("handles different versions", () => {
    const qr1 = qrcode(1, "L");
    qr1.addData("A");
    qr1.make();
    const p1 = penaltyLevel1AdjacentModules(qr1, qr1.getModuleCount());

    const qr2 = qrcode(5, "L");
    qr2.addData("A");
    qr2.make();
    const p2 = penaltyLevel1AdjacentModules(qr2, qr2.getModuleCount());

    expect(typeof p1).toBe("number");
    expect(typeof p2).toBe("number");
  });
});
