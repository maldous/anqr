import { describe, it, expect } from "vitest";
import type { QRSafetyOptions } from "./qr-safety-options.contract";

describe("qr-safety-options.contract", () => {
  describe("QRSafetyOptions interface", () => {
    it("should accept valid safety options", () => {
      const options: QRSafetyOptions = {
        mode: "strict",
        minModulePx: 3,
        minQuietZoneModules: 4,
        lockFinders: true,
        lockTiming: true,
        lockAlign: true,
        lockFormat: true,
        lockVersion: true,
        maxOverlayIntensityByEcc: {
          L: 0.3,
          M: 0.5,
          Q: 0.7,
          H: 0.9,
        },
      };
      expect(options.mode).toBe("strict");
      expect(options.minModulePx).toBe(3);
      expect(options.minQuietZoneModules).toBe(4);
    });

    it("should support all lock flags", () => {
      const allLocked: QRSafetyOptions = {
        mode: "strict",
        minModulePx: 4,
        minQuietZoneModules: 4,
        lockFinders: true,
        lockTiming: true,
        lockAlign: true,
        lockFormat: true,
        lockVersion: true,
        maxOverlayIntensityByEcc: { L: 0.1, M: 0.2, Q: 0.3, H: 0.4 },
      };
      expect(allLocked.lockFinders).toBe(true);
      expect(allLocked.lockTiming).toBe(true);
      expect(allLocked.lockAlign).toBe(true);
      expect(allLocked.lockFormat).toBe(true);
      expect(allLocked.lockVersion).toBe(true);
    });

    it("should support maxOverlayIntensityByEcc for all ECC levels", () => {
      const options: QRSafetyOptions = {
        mode: "off",
        minModulePx: 2,
        minQuietZoneModules: 2,
        lockFinders: false,
        lockTiming: false,
        lockAlign: false,
        lockFormat: false,
        lockVersion: false,
        maxOverlayIntensityByEcc: {
          L: 0.2,
          M: 0.4,
          Q: 0.6,
          H: 0.8,
        },
      };
      expect(options.maxOverlayIntensityByEcc.L).toBe(0.2);
      expect(options.maxOverlayIntensityByEcc.M).toBe(0.4);
      expect(options.maxOverlayIntensityByEcc.Q).toBe(0.6);
      expect(options.maxOverlayIntensityByEcc.H).toBe(0.8);
    });
  });
});
