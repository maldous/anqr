import { describe, it, expect } from "vitest";
import type { ApiErrorDetail } from "./api-error-detail.contract";

describe("api-error-detail.contract", () => {
  describe("ApiErrorDetail interface", () => {
    it("should accept valid error details with all fields", () => {
      const error: ApiErrorDetail = {
        message: "Invalid input",
        code: "VALIDATION_ERROR",
        status: 400,
      };
      expect(error.message).toBe("Invalid input");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.status).toBe(400);
    });

    it("should accept error details with only message", () => {
      const error: ApiErrorDetail = {
        message: "Something went wrong",
      };
      expect(error.message).toBe("Something went wrong");
      expect(error.code).toBeUndefined();
      expect(error.status).toBeUndefined();
    });

    it("should support various HTTP status codes", () => {
      const badRequest: ApiErrorDetail = { message: "Bad request", status: 400 };
      const unauthorized: ApiErrorDetail = { message: "Unauthorized", status: 401 };
      const notFound: ApiErrorDetail = { message: "Not found", status: 404 };
      const serverError: ApiErrorDetail = { message: "Server error", status: 500 };
      
      expect(badRequest.status).toBe(400);
      expect(unauthorized.status).toBe(401);
      expect(notFound.status).toBe(404);
      expect(serverError.status).toBe(500);
    });
  });
});
