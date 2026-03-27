import { describe, it, expect, vi } from "vitest";
import { penaltyLevel3Horizontal } from "./penalty-level3-horizontal";
import type { QRCodeInstance } from "./types";

describe("penaltyLevel3Horizontal", () => {
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

    const result = penaltyLevel3Horizontal(mockQR, 21);
    expect(result).toBe(0);
  });

  it("should detect horizontal finder-like pattern (1:1:3:1:1)", () => {
    const mockQR: QRCodeInstance = {
      isDark: vi.fn((row: number, col: number) => {
        // Create pattern: dark, light, dark, dark, dark, light, dark at row 0
        if (row === 0 && col === 0) return true;
        if (row === 0 && col === 1) return false;
        if (row === 0 && col === 2) return true;
        if (row === 0 && col === 3) return true;
        if (row === 0 && col === 4) return true;
        if (row === 0 && col === 5) return false;
        if (row === 0 && col === 6) return true;
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

    const result = penaltyLevel3Horizontal(mockQR, 21);
    expect(result).toBeGreaterThanOrEqual(40); // At least one pattern = 40 points
  });

  it("should accumulate penalty for multiple patterns", () => {
    const mockQR: QRCodeInstance = {
      isDark: vi.fn((row: number, col: number) => {
        // Create two patterns in different rows
        if (row === 0 && [0, 2, 3, 4, 6].includes(col)) return true;
        if (row === 1 && [0, 2, 3, 4, 6].includes(col)) return true;
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

    const result = penaltyLevel3Horizontal(mockQR, 21);
    expect(result).toBeGreaterThanOrEqual(80); // At least two patterns = 80 points
  });
});
