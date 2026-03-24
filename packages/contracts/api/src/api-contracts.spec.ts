import { describe, it, expect } from "vitest";
import { qrApiQuerySchema } from "./qr-api-query.contract";
import { qrApiSuccessSchema } from "./qr-api-success.contract";
import { qrApiErrorSchema } from "./qr-api-error.contract";
import { qrApiContract } from "./qr-api.contract";

describe("contracts/api", () => {
  describe("qrApiQuerySchema", () => {
    describe("valid inputs", () => {
      it("accepts minimal input with only data", () => {
        const result = qrApiQuerySchema.safeParse({ data: "https://anqr.app" });
        expect(result.success).toBe(true);
      });

      it("accepts full input with all fields", () => {
        const result = qrApiQuerySchema.safeParse({
          data: "https://anqr.app",
          size: 512,
          errorCorrection: "H",
          foreground: "000000",
          background: "ffffff",
          format: "png",
          margin: 4,
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.data).toBe("https://anqr.app");
          expect(result.data.size).toBe(512);
          expect(result.data.errorCorrection).toBe("H");
          expect(result.data.foreground).toBe("000000");
          expect(result.data.background).toBe("ffffff");
          expect(result.data.format).toBe("png");
          expect(result.data.margin).toBe(4);
        }
      });

      it("accepts svg format", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", format: "svg" });
        expect(result.success).toBe(true);
      });

      it("accepts all error correction levels", () => {
        for (const level of ["L", "M", "Q", "H"] as const) {
          const result = qrApiQuerySchema.safeParse({ data: "test", errorCorrection: level });
          expect(result.success).toBe(true);
        }
      });
    });

    describe("boundary values", () => {
      it("accepts data with exactly 1 character", () => {
        const result = qrApiQuerySchema.safeParse({ data: "x" });
        expect(result.success).toBe(true);
      });

      it("accepts data with exactly 4096 characters", () => {
        const result = qrApiQuerySchema.safeParse({ data: "a".repeat(4096) });
        expect(result.success).toBe(true);
      });

      it("rejects data exceeding 4096 characters", () => {
        const result = qrApiQuerySchema.safeParse({ data: "a".repeat(4097) });
        expect(result.success).toBe(false);
      });

      it("accepts size at minimum boundary (50)", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", size: 50 });
        expect(result.success).toBe(true);
      });

      it("accepts size at maximum boundary (4096)", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", size: 4096 });
        expect(result.success).toBe(true);
      });

      it("rejects size below minimum (49)", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", size: 49 });
        expect(result.success).toBe(false);
      });

      it("rejects size above maximum (4097)", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", size: 4097 });
        expect(result.success).toBe(false);
      });

      it("accepts margin at minimum boundary (0)", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", margin: 0 });
        expect(result.success).toBe(true);
      });

      it("accepts margin at maximum boundary (20)", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", margin: 20 });
        expect(result.success).toBe(true);
      });

      it("rejects margin above maximum (21)", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", margin: 21 });
        expect(result.success).toBe(false);
      });
    });

    describe("coercion", () => {
      it("coerces size from string to number", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", size: "256" });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.size).toBe(256);
          expect(typeof result.data.size).toBe("number");
        }
      });

      it("coerces margin from string to number", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", margin: "4" });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.margin).toBe(4);
          expect(typeof result.data.margin).toBe("number");
        }
      });

      it("rejects non-numeric size string", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", size: "abc" });
        expect(result.success).toBe(false);
      });
    });

    describe("unicode and special characters", () => {
      it("accepts unicode data", () => {
        const result = qrApiQuerySchema.safeParse({ data: "\u4F60\u597D\u4E16\u754C" });
        expect(result.success).toBe(true);
      });

      it("accepts emoji in data", () => {
        const result = qrApiQuerySchema.safeParse({ data: "Hello \uD83D\uDE00" });
        expect(result.success).toBe(true);
      });

      it("accepts mixed-case hex foreground", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", foreground: "aAbBcC" });
        expect(result.success).toBe(true);
      });

      it("accepts all-lowercase hex", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", foreground: "abcdef" });
        expect(result.success).toBe(true);
      });

      it("accepts all-uppercase hex", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", foreground: "ABCDEF" });
        expect(result.success).toBe(true);
      });
    });

    describe("invalid inputs", () => {
      it("rejects missing data field", () => {
        const result = qrApiQuerySchema.safeParse({});
        expect(result.success).toBe(false);
      });

      it("rejects empty data string", () => {
        const result = qrApiQuerySchema.safeParse({ data: "" });
        expect(result.success).toBe(false);
      });

      it("rejects non-integer size", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", size: 100.5 });
        expect(result.success).toBe(false);
      });

      it("rejects invalid error correction level", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", errorCorrection: "X" });
        expect(result.success).toBe(false);
      });

      it("rejects foreground with hash prefix", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", foreground: "#000000" });
        expect(result.success).toBe(false);
      });

      it("rejects foreground with invalid hex characters", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", foreground: "zzzzzz" });
        expect(result.success).toBe(false);
      });

      it("rejects foreground with wrong length (3-digit shorthand)", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", foreground: "000" });
        expect(result.success).toBe(false);
      });

      it("rejects background with 8-digit hex (alpha channel)", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", background: "ffffffFF" });
        expect(result.success).toBe(false);
      });

      it("rejects invalid format", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", format: "webp" });
        expect(result.success).toBe(false);
      });

      it("rejects negative margin", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test", margin: -1 });
        expect(result.success).toBe(false);
      });
    });

    describe("optional fields", () => {
      it("omits optional fields from output when absent", () => {
        const result = qrApiQuerySchema.safeParse({ data: "test" });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.size).toBeUndefined();
          expect(result.data.errorCorrection).toBeUndefined();
          expect(result.data.foreground).toBeUndefined();
          expect(result.data.background).toBeUndefined();
          expect(result.data.format).toBeUndefined();
          expect(result.data.margin).toBeUndefined();
        }
      });
    });
  });

  describe("qrApiSuccessSchema", () => {
    const validSuccess = {
      ok: true,
      data: {
        format: "png" as const,
        mimeType: "image/png",
        encoding: "base64" as const,
        content: "iVBORw0KGgo=",
      },
    };

    it("accepts a valid success response", () => {
      const result = qrApiSuccessSchema.safeParse(validSuccess);
      expect(result.success).toBe(true);
    });

    it("accepts svg format in success response", () => {
      const result = qrApiSuccessSchema.safeParse({
        ...validSuccess,
        data: { ...validSuccess.data, format: "svg", mimeType: "image/svg+xml" },
      });
      expect(result.success).toBe(true);
    });

    it("rejects when ok is false", () => {
      const result = qrApiSuccessSchema.safeParse({ ...validSuccess, ok: false });
      expect(result.success).toBe(false);
    });

    it("rejects when ok is missing", () => {
      const { ok: _, ...rest } = validSuccess;
      const result = qrApiSuccessSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("rejects when data.content is empty", () => {
      const result = qrApiSuccessSchema.safeParse({
        ...validSuccess,
        data: { ...validSuccess.data, content: "" },
      });
      expect(result.success).toBe(false);
    });

    it("rejects when data.mimeType is empty", () => {
      const result = qrApiSuccessSchema.safeParse({
        ...validSuccess,
        data: { ...validSuccess.data, mimeType: "" },
      });
      expect(result.success).toBe(false);
    });

    it("rejects wrong encoding value", () => {
      const result = qrApiSuccessSchema.safeParse({
        ...validSuccess,
        data: { ...validSuccess.data, encoding: "utf-8" },
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid format in data", () => {
      const result = qrApiSuccessSchema.safeParse({
        ...validSuccess,
        data: { ...validSuccess.data, format: "webp" },
      });
      expect(result.success).toBe(false);
    });

    it("rejects when data object is missing", () => {
      const result = qrApiSuccessSchema.safeParse({ ok: true });
      expect(result.success).toBe(false);
    });
  });

  describe("qrApiErrorSchema", () => {
    it("accepts a minimal error with only message", () => {
      const result = qrApiErrorSchema.safeParse({ error: "Bad request" });
      expect(result.success).toBe(true);
    });

    it("accepts a full error with all fields", () => {
      const result = qrApiErrorSchema.safeParse({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        status: 422,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.error).toBe("Validation failed");
        expect(result.data.code).toBe("VALIDATION_ERROR");
        expect(result.data.status).toBe(422);
      }
    });

    describe("boundary values", () => {
      it("accepts status at minimum boundary (400)", () => {
        const result = qrApiErrorSchema.safeParse({ error: "err", status: 400 });
        expect(result.success).toBe(true);
      });

      it("accepts status at maximum boundary (599)", () => {
        const result = qrApiErrorSchema.safeParse({ error: "err", status: 599 });
        expect(result.success).toBe(true);
      });

      it("rejects status below 400", () => {
        const result = qrApiErrorSchema.safeParse({ error: "err", status: 399 });
        expect(result.success).toBe(false);
      });

      it("rejects status at 600", () => {
        const result = qrApiErrorSchema.safeParse({ error: "err", status: 600 });
        expect(result.success).toBe(false);
      });
    });

    describe("invalid inputs", () => {
      it("rejects missing error field", () => {
        const result = qrApiErrorSchema.safeParse({});
        expect(result.success).toBe(false);
      });

      it("rejects empty error string", () => {
        const result = qrApiErrorSchema.safeParse({ error: "" });
        expect(result.success).toBe(false);
      });

      it("rejects empty code string", () => {
        const result = qrApiErrorSchema.safeParse({ error: "err", code: "" });
        expect(result.success).toBe(false);
      });

      it("rejects non-integer status", () => {
        const result = qrApiErrorSchema.safeParse({ error: "err", status: 404.5 });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("qrApiContract", () => {
    it("defines a generateQR route", () => {
      expect(qrApiContract.generateQR).toBeDefined();
    });

    it("uses GET method", () => {
      expect(qrApiContract.generateQR.method).toBe("GET");
    });

    it("has the correct path", () => {
      expect(qrApiContract.generateQR.path).toBe("/api/contract/qr");
    });

    it("includes a summary", () => {
      expect(qrApiContract.generateQR.summary).toBe("Generate a QR code image");
    });

    it("defines 200, 400, and 500 response schemas", () => {
      const responses = qrApiContract.generateQR.responses;
      expect(responses[200]).toBeDefined();
      expect(responses[400]).toBeDefined();
      expect(responses[500]).toBeDefined();
    });

    it("uses the query schema for request validation", () => {
      const query = qrApiContract.generateQR.query;
      expect(query).toBeDefined();
      const result = query!.safeParse({ data: "test" });
      expect(result.success).toBe(true);
    });

    it("defines exactly 3 response status codes", () => {
      const responses = qrApiContract.generateQR.responses;
      expect(Object.keys(responses).sort()).toEqual(["200", "400", "500"]);
    });
  });

  describe("schema key completeness", () => {
    it("qrApiQuerySchema has exactly 7 fields", () => {
      const result = qrApiQuerySchema.safeParse({
        data: "x",
        size: 100,
        errorCorrection: "H",
        foreground: "000000",
        background: "ffffff",
        format: "png",
        margin: 4,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.data)).toHaveLength(7);
      }
    });

    it("qrApiSuccessSchema data has exactly 4 fields", () => {
      const result = qrApiSuccessSchema.parse({
        ok: true,
        data: {
          format: "png",
          mimeType: "image/png",
          encoding: "base64",
          content: "abc=",
        },
      });
      expect(Object.keys(result.data)).toHaveLength(4);
    });

    it("qrApiErrorSchema accepts status codes across the 4xx-5xx range", () => {
      for (const status of [400, 401, 403, 404, 422, 429, 500, 502, 503, 599]) {
        const result = qrApiErrorSchema.safeParse({ error: "err", status });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("round-trip serialization", () => {
    it("query schema parse output re-parses identically", () => {
      const input = {
        data: "https://anqr.app",
        size: 256,
        errorCorrection: "M" as const,
        foreground: "1a2b3c",
        background: "f0f0f0",
        format: "png" as const,
        margin: 2,
      };
      const first = qrApiQuerySchema.parse(input);
      const serialized = JSON.parse(JSON.stringify(first));
      const second = qrApiQuerySchema.parse(serialized);
      expect(second).toEqual(first);
    });

    it("success schema parse output re-parses identically", () => {
      const input = {
        ok: true,
        data: {
          format: "png" as const,
          mimeType: "image/png",
          encoding: "base64" as const,
          content: "iVBORw0KGgo=",
        },
      };
      const first = qrApiSuccessSchema.parse(input);
      const serialized = JSON.parse(JSON.stringify(first));
      const second = qrApiSuccessSchema.parse(serialized);
      expect(second).toEqual(first);
    });

    it("error schema parse output re-parses identically", () => {
      const input = { error: "Not found", code: "NOT_FOUND", status: 404 };
      const first = qrApiErrorSchema.parse(input);
      const serialized = JSON.parse(JSON.stringify(first));
      const second = qrApiErrorSchema.parse(serialized);
      expect(second).toEqual(first);
    });
  });

  describe("index re-exports", () => {
    it("exports all expected runtime values", async () => {
      const mod = await import("./index");
      expect(mod.qrApiContract).toBeDefined();
      expect(mod.qrApiQuerySchema).toBeDefined();
      expect(mod.qrApiSuccessSchema).toBeDefined();
      expect(mod.qrApiErrorSchema).toBeDefined();
    });
  });
});
