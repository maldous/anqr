import { describe, it, expect, vi } from "vitest";
import { penaltyLevel3FinderLike } from "./penalty-level3-finder-like";
import type { QRCodeInstance } from "./types";

describe("penaltyLevel3FinderLike", () => {
  it("should return sum of horizontal and vertical finder-like penalties", () => {
    const mockQR: QRCodeInstance = {
      isDark: vi.fn((row: number, col: number) => (row + col) % 2 === 0),
      getModuleCount: vi.fn(() => 21),
      make: vi.fn(),
      addData: vi.fn(),
      createTableTag: vi.fn(() => ""),
      createSvgTag: vi.fn(() => ""),
      createDataURL: vi.fn(() => ""),
      createImgTag: vi.fn(() => ""),
      createASCII: vi.fn(() => ""),
      renderTo2dContext: vi.fn(),
      getDataCache: vi.fn(() => []),
    };

    const result = penaltyLevel3FinderLike(mockQR, 21);
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("should handle small QR codes", () => {
    const mockQR: QRCodeInstance = {
      isDark: vi.fn(() => false),
      getModuleCount: vi.fn(() => 21),
      make: vi.fn(),
      addData: vi.fn(),
      createTableTag: vi.fn(() => ""),
      createSvgTag: vi.fn(() => ""),
      createDataURL: vi.fn(() => ""),
      createImgTag: vi.fn(() => ""),
      createASCII: vi.fn(() => ""),
      renderTo2dContext: vi.fn(),
      getDataCache: vi.fn(() => []),
    };

    const result = penaltyLevel3FinderLike(mockQR, 21);
    expect(result).toBe(0);
  });
});
