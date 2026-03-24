import { describe, it, expect } from "vitest";
import type { QRCoreOptions } from "./qr-core-options.contract";

describe("qr-core-options.contract", () => {
  describe("QRCoreOptions interface", () => {
    it("should accept valid core QR options", () => {
      const options: QRCoreOptions = {
        version: 10,
        ecc: "H",
        encodingMode: "byte",
        maskPattern: "auto",
        characterEncoding: "utf8",
        quietZoneModules: 4,
        quietZoneMinEnforce: true,
        borderModulesExtra: 0,
      };
      expect(options.version).toBe(10);
      expect(options.ecc).toBe("H");
      expect(options.quietZoneModules).toBe(4);
    });

    it("should support automatic version selection", () => {
      const options: QRCoreOptions = {
        version: 0, // 0 means auto
        ecc: "M",
        encodingMode: "auto",
        maskPattern: "auto",
        characterEncoding: "default",
        quietZoneModules: 4,
        quietZoneMinEnforce: false,
        borderModulesExtra: 1,
      };
      expect(options.version).toBe(0);
      expect(options.maskPattern).toBe("auto");
    });

    it("should support all ECC levels", () => {
      const lowEcc: QRCoreOptions["ecc"] = "L";
      const mediumEcc: QRCoreOptions["ecc"] = "M";
      const quartileEcc: QRCoreOptions["ecc"] = "Q";
      const highEcc: QRCoreOptions["ecc"] = "H";
      
      expect(lowEcc).toBe("L");
      expect(mediumEcc).toBe("M");
      expect(quartileEcc).toBe("Q");
      expect(highEcc).toBe("H");
    });
  });
});
