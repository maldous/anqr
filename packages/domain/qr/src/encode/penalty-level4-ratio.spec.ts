import { describe, it, expect, vi } from "vitest";
import { penaltyLevel4Ratio } from "./penalty-level4-ratio";
import type { QRCodeInstance } from "./types";

describe("penaltyLevel4Ratio", () => {
  it("should return 0 penalty when ratio is exactly 50%", () => {
    const moduleCount = 10;
    let callCount = 0;
    const mockQR: QRCodeInstance = {
      isDark: vi.fn(() => {
        // Exactly 50% dark modules
        return callCount++ < 50;
      }),
      getModuleCount: vi.fn(() => moduleCount),
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

    const result = penaltyLevel4Ratio(mockQR, moduleCount);
    expect(result).toBe(0);
  });

  it("should return penalty when all modules are dark", () => {
    const mockQR: QRCodeInstance = {
      isDark: vi.fn(() => true),
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

    const result = penaltyLevel4Ratio(mockQR, 21);
    expect(result).toBeGreaterThan(0);
    expect(result).toBe(100); // 100% dark = 50% deviation / 5 * 10 = 100
  });

  it("should return penalty when all modules are light", () => {
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

    const result = penaltyLevel4Ratio(mockQR, 21);
    expect(result).toBeGreaterThan(0);
    expect(result).toBe(100); // 0% dark = 50% deviation / 5 * 10 = 100
  });

  it("should calculate penalty based on deviation from 50%", () => {
    const moduleCount = 10;
    let callCount = 0;
    const mockQR: QRCodeInstance = {
      isDark: vi.fn(() => {
        // 60% dark modules
        return callCount++ < 60;
      }),
      getModuleCount: vi.fn(() => moduleCount),
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

    const result = penaltyLevel4Ratio(mockQR, moduleCount);
    // 60% dark = 10% deviation / 5 * 10 = 20
    expect(result).toBe(20);
  });
});
