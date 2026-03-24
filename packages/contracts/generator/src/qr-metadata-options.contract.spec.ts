import { describe, it, expect } from "vitest";
import type { QRMetadataOptions } from "./qr-metadata-options.contract";

describe("qr-metadata-options.contract", () => {
  describe("QRMetadataOptions interface", () => {
    it("should accept valid metadata options", () => {
      const options: QRMetadataOptions = {
        title: "My QR Code",
        author: "John Doe",
        copyright: "© 2024",
        license: "MIT",
        description: "QR code for example.com",
        creationTime: true,
        customKv: [
          { k: "project", v: "ANQR" },
          { k: "version", v: "1.0" },
        ],
      };
      expect(options.title).toBe("My QR Code");
      expect(options.author).toBe("John Doe");
      expect(options.customKv).toHaveLength(2);
    });

    it("should support empty metadata", () => {
      const options: QRMetadataOptions = {
        title: "",
        author: "",
        copyright: "",
        license: "",
        description: "",
        creationTime: false,
        customKv: [],
      };
      expect(options.creationTime).toBe(false);
      expect(options.customKv).toHaveLength(0);
    });

    it("should support custom key-value pairs", () => {
      const options: QRMetadataOptions = {
        title: "Test",
        author: "",
        copyright: "",
        license: "",
        description: "",
        creationTime: false,
        customKv: [
          { k: "app", v: "qr-generator" },
          { k: "env", v: "production" },
          { k: "timestamp", v: "2024-01-01T00:00:00Z" },
        ],
      };
      expect(options.customKv).toHaveLength(3);
      expect(options.customKv[0].k).toBe("app");
      expect(options.customKv[0].v).toBe("qr-generator");
    });
  });
});
