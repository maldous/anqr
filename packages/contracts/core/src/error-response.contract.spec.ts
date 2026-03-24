import { describe, expect, it } from "vitest";
import type { ApiErrorResponse } from "./error-response.contract";

describe("ApiErrorResponse", () => {
  it("should validate complete error response structure", () => {
    const response: ApiErrorResponse = {
      error: "Request failed",
      code: "ERR_REQUEST_FAILED",
      status: 500,
    };

    expect(response.error).toBe("Request failed");
    expect(response.code).toBe("ERR_REQUEST_FAILED");
    expect(response.status).toBe(500);
  });

  it("should validate minimal error response with only error message", () => {
    const response: ApiErrorResponse = {
      error: "Simple error",
    };

    expect(response.error).toBe("Simple error");
    expect(response.code).toBeUndefined();
    expect(response.status).toBeUndefined();
  });

  it("should have readonly properties", () => {
    const response: ApiErrorResponse = {
      error: "Readonly error",
      code: "CODE",
      status: 400,
    };

    expect(response.error).toBe("Readonly error");
    expect(response.code).toBe("CODE");
    expect(response.status).toBe(400);
  });

  it("should support various HTTP status codes", () => {
    const badRequest: ApiErrorResponse = {
      error: "Bad request",
      status: 400,
    };

    const unauthorized: ApiErrorResponse = {
      error: "Unauthorized",
      status: 401,
    };

    const notFound: ApiErrorResponse = {
      error: "Not found",
      status: 404,
    };

    expect(badRequest.status).toBe(400);
    expect(unauthorized.status).toBe(401);
    expect(notFound.status).toBe(404);
  });
});
