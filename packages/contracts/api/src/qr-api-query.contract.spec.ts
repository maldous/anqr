import { describe, it, expect } from "vitest";
import { qrApiQuerySchema, type QrApiQuery } from "./qr-api-query.contract";

describe("contracts/api/qr-api-query", () => {
  describe("QrApiQuery", () => {
    it("accepts minimal query with only data", () => {
      const query: QrApiQuery = {
        data: "https://example.com",
      };
      expect(query.data).toBe("https://example.com");
    });

    it("accepts query with all optional fields", () => {
      const query: QrApiQuery = {
        data: "test",
        size: 400,
        errorCorrection: "H",
        foreground: "000000",
        background: "ffffff",
        format: "svg",
        margin: 4,
      };
      expect(query.format).toBe("svg");
    });
  });

  describe("qrApiQuerySchema", () => {
    it("parses minimal valid query", () => {
      const result = qrApiQuerySchema.parse({ data: "hello" });
      expect(result.data).toBe("hello");
    });

    it("parses query with all fields", () => {
      const result = qrApiQuerySchema.parse({
        data: "https://example.com",
        size: 800,
        errorCorrection: "Q",
        foreground: "1a1a1a",
        background: "f0f0f0",
        format: "png",
        margin: 6,
      });
      expect(result.size).toBe(800);
    });

    it("rejects empty data", () => {
      const result = qrApiQuerySchema.safeParse({ data: "" });
      expect(result.success).toBe(false);
    });

    it("rejects data exceeding 4096 characters", () => {
      const result = qrApiQuerySchema.safeParse({ data: "x".repeat(4097) });
      expect(result.success).toBe(false);
    });

    it("accepts data at exactly 4096 characters", () => {
      const result = qrApiQuerySchema.parse({ data: "x".repeat(4096) });
      expect(result.data.length).toBe(4096);
    });

    it("rejects size below 50", () => {
      const result = qrApiQuerySchema.safeParse({ data: "test", size: 49 });
      expect(result.success).toBe(false);
    });

    it("rejects size above 4096", () => {
      const result = qrApiQuerySchema.safeParse({ data: "test", size: 4097 });
      expect(result.success).toBe(false);
    });

    it("accepts size boundaries", () => {
      expect(qrApiQuerySchema.parse({ data: "x", size: 50 }).size).toBe(50);
      expect(qrApiQuerySchema.parse({ data: "x", size: 4096 }).size).toBe(4096);
    });

    it("coerces string size to number", () => {
      const result = qrApiQuerySchema.parse({ data: "x", size: "400" as any });
      expect(result.size).toBe(400);
    });

    it("accepts all error correction levels", () => {
      for (const ec of ["L", "M", "Q", "H"] as const) {
        const result = qrApiQuerySchema.parse({ data: "x", errorCorrection: ec });
        expect(result.errorCorrection).toBe(ec);
      }
    });

    it("rejects invalid error correction level", () => {
      const result = qrApiQuerySchema.safeParse({ data: "x", errorCorrection: "X" });
      expect(result.success).toBe(false);
    });

    it("accepts valid hex colors", () => {
      const result = qrApiQuerySchema.parse({
        data: "x",
        foreground: "aaBBcc",
        background: "112233",
      });
      expect(result.foreground).toBe("aaBBcc");
    });

    it("rejects hex colors with # prefix", () => {
      const result = qrApiQuerySchema.safeParse({ data: "x", foreground: "#000000" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid hex characters", () => {
      const result = qrApiQuerySchema.safeParse({ data: "x", foreground: "gggggg" });
      expect(result.success).toBe(false);
    });

    it("rejects hex colors with wrong length", () => {
      expect(qrApiQuerySchema.safeParse({ data: "x", foreground: "fff" }).success).toBe(false);
      expect(qrApiQuerySchema.safeParse({ data: "x", foreground: "fffffff" }).success).toBe(false);
    });

    it("accepts both format options", () => {
      expect(qrApiQuerySchema.parse({ data: "x", format: "png" }).format).toBe("png");
      expect(qrApiQuerySchema.parse({ data: "x", format: "svg" }).format).toBe("svg");
    });

    it("rejects invalid format", () => {
      // L8: format enum expanded to png/webp/gif/svg. Pick a value
      // that isn't supported — "jpg" is the natural mismatch.
      const result = qrApiQuerySchema.safeParse({ data: "x", format: "jpg" });
      expect(result.success).toBe(false);
    });

    it("accepts every supported format", () => {
      for (const format of ["png", "webp", "gif", "svg"] as const) {
        const result = qrApiQuerySchema.safeParse({ data: "x", format });
        expect(result.success, `format=${format} should parse`).toBe(true);
      }
    });

    it("accepts margin range 0-20", () => {
      expect(qrApiQuerySchema.parse({ data: "x", margin: 0 }).margin).toBe(0);
      expect(qrApiQuerySchema.parse({ data: "x", margin: 20 }).margin).toBe(20);
    });

    it("rejects margin below 0", () => {
      const result = qrApiQuerySchema.safeParse({ data: "x", margin: -1 });
      expect(result.success).toBe(false);
    });

    it("rejects margin above 20", () => {
      const result = qrApiQuerySchema.safeParse({ data: "x", margin: 21 });
      expect(result.success).toBe(false);
    });

    it("coerces string margin to number", () => {
      const result = qrApiQuerySchema.parse({ data: "x", margin: "4" as any });
      expect(result.margin).toBe(4);
    });
  });
});
