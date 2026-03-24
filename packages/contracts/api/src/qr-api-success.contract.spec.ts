import { describe, expect, it } from "vitest";
import { qrApiSuccessSchema, type QrApiSuccess } from "./qr-api-success.contract";

describe("qrApiSuccessSchema", () => {
  it("should validate a valid success response", () => {
    const valid: QrApiSuccess = {
      ok: true,
      data: {
        format: "png",
        mimeType: "image/png",
        encoding: "base64",
        content: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      },
    };

    expect(() => qrApiSuccessSchema.parse(valid)).not.toThrow();
  });

  it("should validate SVG format", () => {
    const valid: QrApiSuccess = {
      ok: true,
      data: {
        format: "svg",
        mimeType: "image/svg+xml",
        encoding: "base64",
        content: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==",
      },
    };

    expect(() => qrApiSuccessSchema.parse(valid)).not.toThrow();
  });

  it("should reject ok: false", () => {
    const invalid = {
      ok: false,
      data: {
        format: "png",
        mimeType: "image/png",
        encoding: "base64",
        content: "test",
      },
    };

    expect(() => qrApiSuccessSchema.parse(invalid)).toThrow();
  });

  it("should reject invalid format", () => {
    const invalid = {
      ok: true,
      data: {
        format: "jpeg",
        mimeType: "image/jpeg",
        encoding: "base64",
        content: "test",
      },
    };

    expect(() => qrApiSuccessSchema.parse(invalid)).toThrow();
  });

  it("should reject empty mimeType", () => {
    const invalid = {
      ok: true,
      data: {
        format: "png",
        mimeType: "",
        encoding: "base64",
        content: "test",
      },
    };

    expect(() => qrApiSuccessSchema.parse(invalid)).toThrow();
  });

  it("should reject non-base64 encoding", () => {
    const invalid = {
      ok: true,
      data: {
        format: "png",
        mimeType: "image/png",
        encoding: "utf8",
        content: "test",
      },
    };

    expect(() => qrApiSuccessSchema.parse(invalid)).toThrow();
  });

  it("should reject empty content", () => {
    const invalid = {
      ok: true,
      data: {
        format: "png",
        mimeType: "image/png",
        encoding: "base64",
        content: "",
      },
    };

    expect(() => qrApiSuccessSchema.parse(invalid)).toThrow();
  });

  it("should reject missing data field", () => {
    const invalid = {
      ok: true,
    };

    expect(() => qrApiSuccessSchema.parse(invalid)).toThrow();
  });
});
