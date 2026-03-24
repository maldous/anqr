import { describe, it, expect } from "vitest";
import type { ScanResult } from "./scan-result.contract";

describe("contracts/analyze/scan-result", () => {
  describe("ScanResult", () => {
    it("accepts a valid scan result with data and location", () => {
      const result: ScanResult = {
        data: "https://example.com",
        location: {
          topLeftCorner: { x: 10, y: 10 },
          topRightCorner: { x: 100, y: 10 },
          bottomLeftCorner: { x: 10, y: 100 },
          bottomRightCorner: { x: 100, y: 100 },
        },
      };
      expect(result.data).toBe("https://example.com");
      expect(result.location?.topLeftCorner.x).toBe(10);
    });

    it("accepts null data when no QR is detected", () => {
      const result: ScanResult = {
        data: null,
        location: null,
      };
      expect(result.data).toBeNull();
      expect(result.location).toBeNull();
    });

    it("accepts optional binaryData field", () => {
      const binaryData = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const result: ScanResult = {
        data: "Hello",
        location: null,
        binaryData,
      };
      expect(result.binaryData).toEqual(binaryData);
    });

    it("accepts scan result without binaryData", () => {
      const result: ScanResult = {
        data: "test",
        location: null,
      };
      expect(result.binaryData).toBeUndefined();
    });

    it("accepts empty string as valid data", () => {
      const result: ScanResult = {
        data: "",
        location: null,
      };
      expect(result.data).toBe("");
    });
  });
});
