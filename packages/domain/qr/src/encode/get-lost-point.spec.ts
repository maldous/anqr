import { describe, it, expect, vi } from "vitest";
import { getLostPoint } from "./get-lost-point";
import type { QRCodeInstance } from "./types";

describe("getLostPoint", () => {
  it("should calculate penalty score by summing all penalty levels", () => {
    const mockQRCode: QRCodeInstance = {
      getModuleCount: vi.fn(() => 21),
      isDark: vi.fn((row, col) => (row + col) % 2 === 0),
      modules: [],
      moduleCount: 21,
    } as unknown as QRCodeInstance;

    const penalty = getLostPoint(mockQRCode);
    
    expect(penalty).toBeGreaterThan(0);
    expect(typeof penalty).toBe("number");
  });

  it("should return higher penalty for patterns with poor characteristics", () => {
    const uniformQRCode: QRCodeInstance = {
      getModuleCount: vi.fn(() => 21),
      isDark: vi.fn(() => true),
      modules: [],
      moduleCount: 21,
    } as unknown as QRCodeInstance;

    const penalty = getLostPoint(uniformQRCode);
    
    expect(penalty).toBeGreaterThan(1000);
  });

  it("should work with different module counts", () => {
    const sizes = [21, 25, 29, 33, 41];
    
    sizes.forEach(size => {
      const qrCode: QRCodeInstance = {
        getModuleCount: vi.fn(() => size),
        isDark: vi.fn((row, col) => (row + col) % 3 === 0),
        modules: [],
        moduleCount: size,
      } as unknown as QRCodeInstance;

      const penalty = getLostPoint(qrCode);
      expect(penalty).toBeGreaterThan(0);
      expect(Number.isFinite(penalty)).toBe(true);
    });
  });
});
