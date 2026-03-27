import { describe, it, expect, vi } from "vitest";
import { penaltyLevel3Vertical } from "./penalty-level3-vertical";
import type { QRCodeInstance } from "./types";

describe("penaltyLevel3Vertical", () => {
  it("should return 0 penalty when no finder-like pattern exists", () => {
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

    const result = penaltyLevel3Vertical(mockQR, 21);
    expect(result).toBe(0);
  });

  it("should detect vertical finder-like pattern (1:1:3:1:1)", () => {
    const mockQR: QRCodeInstance = {
      isDark: vi.fn((row: number, col: number) => {
        // Create pattern: dark, light, dark, dark, dark, light, dark at col 0
        if (col === 0 && row === 0) return true;
        if (col === 0 && row === 1) return false;
        if (col === 0 && row === 2) return true;
        if (col === 0 && row === 3) return true;
        if (col === 0 && row === 4) return true;
        if (col === 0 && row === 5) return false;
        if (col === 0 && row === 6) return true;
        return false;
      }),
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

    const result = penaltyLevel3Vertical(mockQR, 21);
    expect(result).toBeGreaterThanOrEqual(40); // At least one pattern = 40 points
  });

  it("should accumulate penalty for multiple patterns", () => {
    const mockQR: QRCodeInstance = {
      isDark: vi.fn((row: number, col: number) => {
        // Create two patterns in different columns
        if (col === 0 && [0, 2, 3, 4, 6].includes(row)) return true;
        if (col === 1 && [0, 2, 3, 4, 6].includes(row)) return true;
        return false;
      }),
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

    const result = penaltyLevel3Vertical(mockQR, 21);
    expect(result).toBeGreaterThanOrEqual(80); // At least two patterns = 80 points
  });
});
