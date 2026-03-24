import { describe, it, expect } from "vitest";
import { qrApiErrorSchema, type QrApiError } from "./qr-api-error.contract";

describe("contracts/api/qr-api-error", () => {
  describe("QrApiError", () => {
    it("accepts error with all fields", () => {
      const error: QrApiError = {
        error: "Invalid input data",
        code: "INVALID_INPUT",
        status: 400,
      };
      expect(error.error).toBe("Invalid input data");
      expect(error.code).toBe("INVALID_INPUT");
      expect(error.status).toBe(400);
    });

    it("accepts error without optional fields", () => {
      const error: QrApiError = {
        error: "Internal server error",
      };
      expect(error.code).toBeUndefined();
      expect(error.status).toBeUndefined();
    });
  });

  describe("qrApiErrorSchema", () => {
    it("validates error with all fields", () => {
      const result = qrApiErrorSchema.parse({
        error: "Not found",
        code: "NOT_FOUND",
        status: 404,
      });
      expect(result.status).toBe(404);
    });

    it("validates error without optional fields", () => {
      const result = qrApiErrorSchema.parse({
        error: "Something went wrong",
      });
      expect(result.error).toBe("Something went wrong");
    });

    it("rejects empty error message", () => {
      const result = qrApiErrorSchema.safeParse({ error: "" });
      expect(result.success).toBe(false);
    });

    it("rejects status code below 400", () => {
      const result = qrApiErrorSchema.safeParse({
        error: "Error",
        status: 200,
      });
      expect(result.success).toBe(false);
    });

    it("rejects status code above 599", () => {
      const result = qrApiErrorSchema.safeParse({
        error: "Error",
        status: 600,
      });
      expect(result.success).toBe(false);
    });

    it("accepts all valid HTTP error status codes", () => {
      for (const status of [400, 404, 500, 503]) {
        const result = qrApiErrorSchema.parse({
          error: "Error",
          status,
        });
        expect(result.status).toBe(status);
      }
    });
  });
});
