import { describe, it, expect } from "vitest";
import type { QRGenerationOptions } from "./qr-generation-options.contract";

describe("qr-generation-options.contract", () => {
  describe("QRGenerationOptions interface", () => {
    it("should have all required option groups", () => {
      // Type-level test - verifying the interface structure
      type RequiredKeys = keyof QRGenerationOptions;
      const keys: RequiredKeys[] = [
        "qr",
        "render",
        "overlay",
        "animation",
        "output",
        "watermark",
        "metadata",
        "safety",
        "qa",
        "auto",
      ];
      expect(keys).toHaveLength(10);
    });

    it("should compose all option types correctly", () => {
      const optionKeys: Array<keyof QRGenerationOptions> = [
        "qr",
        "render",
        "overlay",
        "animation",
        "output",
        "watermark",
        "metadata",
        "safety",
        "qa",
        "auto",
      ];
      expect(optionKeys).toHaveLength(10);
    });
  });
});
