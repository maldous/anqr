import { describe, it, expect } from "vitest";
import type { QRAutoOptions } from "./qr-auto-options.contract";

describe("qr-auto-options.contract", () => {
  describe("QRAutoOptions interface", () => {
    it("should accept valid auto options", () => {
      const options: QRAutoOptions = {
        pickVersion: true,
        pickEcc: true,
        reduceIntensityUntilSafe: true,
      };
      expect(options.pickVersion).toBe(true);
      expect(options.pickEcc).toBe(true);
      expect(options.reduceIntensityUntilSafe).toBe(true);
    });

    it("should support disabled auto options", () => {
      const options: QRAutoOptions = {
        pickVersion: false,
        pickEcc: false,
        reduceIntensityUntilSafe: false,
      };
      expect(options.pickVersion).toBe(false);
      expect(options.pickEcc).toBe(false);
      expect(options.reduceIntensityUntilSafe).toBe(false);
    });

    it("should support partial auto options", () => {
      const options: QRAutoOptions = {
        pickVersion: true,
        pickEcc: false,
        reduceIntensityUntilSafe: true,
      };
      expect(options.pickVersion).toBe(true);
      expect(options.pickEcc).toBe(false);
      expect(options.reduceIntensityUntilSafe).toBe(true);
    });
  });
});
