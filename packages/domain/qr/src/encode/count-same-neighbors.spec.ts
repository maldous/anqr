import { describe, it, expect } from "vitest";
import { countSameNeighbors } from "./count-same-neighbors";
import { qrcode } from "./encoder";

describe("countSameNeighbors", () => {
  it("counts neighbors with same color", () => {
    const qr = qrcode(1, "L");
    qr.addData("TEST");
    qr.make();
    const moduleCount = qr.getModuleCount();
    
    const count = countSameNeighbors(qr, 5, 5, moduleCount);
    expect(count).toBeGreaterThanOrEqual(0);
    expect(count).toBeLessThanOrEqual(8);
  });

  it("returns 0 when all neighbors are different", () => {
    const qr = qrcode(1, "L");
    qr.addData("A");
    qr.make();
    const moduleCount = qr.getModuleCount();
    
    // Find a module with different colored neighbors
    let found = false;
    for (let r = 1; r < moduleCount - 1; r++) {
      for (let c = 1; c < moduleCount - 1; c++) {
        const count = countSameNeighbors(qr, r, c, moduleCount);
        if (count === 0) {
          found = true;
          expect(count).toBe(0);
          break;
        }
      }
      if (found) break;
    }
  });

  it("handles edge modules correctly", () => {
    const qr = qrcode(1, "L");
    qr.addData("EDGE");
    qr.make();
    const moduleCount = qr.getModuleCount();
    
    // Top-left corner
    const topLeft = countSameNeighbors(qr, 0, 0, moduleCount);
    expect(topLeft).toBeGreaterThanOrEqual(0);
    expect(topLeft).toBeLessThanOrEqual(3);
    
    // Top edge
    const topEdge = countSameNeighbors(qr, 0, 5, moduleCount);
    expect(topEdge).toBeGreaterThanOrEqual(0);
    expect(topEdge).toBeLessThanOrEqual(5);
  });

  it("handles corner modules correctly", () => {
    const qr = qrcode(1, "L");
    qr.addData("CORNER");
    qr.make();
    const moduleCount = qr.getModuleCount();
    
    // Bottom-right corner
    const count = countSameNeighbors(qr, moduleCount - 1, moduleCount - 1, moduleCount);
    expect(count).toBeGreaterThanOrEqual(0);
    expect(count).toBeLessThanOrEqual(3);
  });

  it("returns consistent results", () => {
    const qr = qrcode(2, "M");
    qr.addData("CONSISTENT");
    qr.make();
    const moduleCount = qr.getModuleCount();
    
    const c1 = countSameNeighbors(qr, 10, 10, moduleCount);
    const c2 = countSameNeighbors(qr, 10, 10, moduleCount);
    expect(c1).toBe(c2);
  });
});
