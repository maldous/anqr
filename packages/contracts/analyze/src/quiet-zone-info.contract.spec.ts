import { describe, it, expect } from "vitest";
import type { QuietZoneInfo } from "./quiet-zone-info.contract";

describe("contracts/analyze/quiet-zone-info", () => {
  describe("QuietZoneInfo", () => {
    it("accepts adequate quiet zone (all sides >= 4 modules)", () => {
      const qzInfo: QuietZoneInfo = {
        top: 4,
        right: 4,
        bottom: 4,
        left: 4,
        adequate: true,
      };
      expect(qzInfo.adequate).toBe(true);
    });

    it("accepts inadequate quiet zone", () => {
      const qzInfo: QuietZoneInfo = {
        top: 2,
        right: 2,
        bottom: 2,
        left: 2,
        adequate: false,
      };
      expect(qzInfo.adequate).toBe(false);
    });

    it("accepts uneven quiet zone sizes", () => {
      const qzInfo: QuietZoneInfo = {
        top: 6,
        right: 4,
        bottom: 5,
        left: 3,
        adequate: false,
      };
      expect(qzInfo.top).toBe(6);
      expect(qzInfo.left).toBe(3);
    });

    it("accepts zero quiet zone", () => {
      const qzInfo: QuietZoneInfo = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        adequate: false,
      };
      expect(qzInfo.adequate).toBe(false);
    });

    it("accepts large quiet zone", () => {
      const qzInfo: QuietZoneInfo = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
        adequate: true,
      };
      expect(qzInfo.adequate).toBe(true);
    });
  });
});
