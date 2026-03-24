import { describe, it, expect } from "vitest";
import type { QRLocation } from "./qr-location.contract";

describe("contracts/analyze/qr-location", () => {
  describe("QRLocation", () => {
    it("accepts valid QR location with all four corners", () => {
      const location: QRLocation = {
        topLeftCorner: { x: 10, y: 10 },
        topRightCorner: { x: 100, y: 10 },
        bottomLeftCorner: { x: 10, y: 100 },
        bottomRightCorner: { x: 100, y: 100 },
      };
      expect(location.topLeftCorner.x).toBe(10);
      expect(location.bottomRightCorner.y).toBe(100);
    });

    it("accepts square QR code location", () => {
      const location: QRLocation = {
        topLeftCorner: { x: 0, y: 0 },
        topRightCorner: { x: 50, y: 0 },
        bottomLeftCorner: { x: 0, y: 50 },
        bottomRightCorner: { x: 50, y: 50 },
      };
      const width = location.topRightCorner.x - location.topLeftCorner.x;
      const height = location.bottomLeftCorner.y - location.topLeftCorner.y;
      expect(width).toBe(height);
    });

    it("accepts rotated QR code location", () => {
      const location: QRLocation = {
        topLeftCorner: { x: 50, y: 10 },
        topRightCorner: { x: 90, y: 50 },
        bottomLeftCorner: { x: 10, y: 50 },
        bottomRightCorner: { x: 50, y: 90 },
      };
      expect(location.topLeftCorner.x).toBe(50);
    });

    it("accepts fractional pixel coordinates", () => {
      const location: QRLocation = {
        topLeftCorner: { x: 10.5, y: 10.5 },
        topRightCorner: { x: 100.3, y: 10.7 },
        bottomLeftCorner: { x: 10.2, y: 100.8 },
        bottomRightCorner: { x: 100.1, y: 100.9 },
      };
      expect(location.topLeftCorner.x).toBe(10.5);
    });
  });
});
