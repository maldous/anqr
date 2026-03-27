import { describe, it, expect } from "vitest";
import { penaltyLevel2Blocks } from "./penalty-level2-blocks";
import { qrcode } from "./encoder";

describe("penaltyLevel2Blocks", () => {
  it("calculates penalty for 2x2 blocks", () => {
    const qr = qrcode(1, "L");
    qr.addData("TEST");
    qr.make();
    const penalty = penaltyLevel2Blocks(qr, qr.getModuleCount());
    expect(typeof penalty).toBe("number");
    expect(penalty).toBeGreaterThanOrEqual(0);
  });

  it("returns consistent results", () => {
    const qr = qrcode(2, "M");
    qr.addData("CONSISTENT");
    qr.make();
    const moduleCount = qr.getModuleCount();
    const p1 = penaltyLevel2Blocks(qr, moduleCount);
    const p2 = penaltyLevel2Blocks(qr, moduleCount);
    expect(p1).toBe(p2);
  });

  it("handles different QR versions", () => {
    const qr1 = qrcode(1, "L");
    qr1.addData("A");
    qr1.make();
    const p1 = penaltyLevel2Blocks(qr1, qr1.getModuleCount());

    const qr2 = qrcode(5, "H");
    qr2.addData("ABCDEFGH");
    qr2.make();
    const p2 = penaltyLevel2Blocks(qr2, qr2.getModuleCount());

    expect(typeof p1).toBe("number");
    expect(typeof p2).toBe("number");
  });
});
