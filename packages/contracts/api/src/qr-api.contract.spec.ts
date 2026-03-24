import { describe, expect, it } from "vitest";
import { qrApiContract } from "./qr-api.contract";

describe("qrApiContract", () => {
  it("should define generateQR endpoint", () => {
    expect(qrApiContract.generateQR).toBeDefined();
  });

  it("should use GET method", () => {
    expect(qrApiContract.generateQR.method).toBe("GET");
  });

  it("should use correct path", () => {
    expect(qrApiContract.generateQR.path).toBe("/api/contract/qr");
  });

  it("should have query schema", () => {
    expect(qrApiContract.generateQR.query).toBeDefined();
  });

  it("should have 200 response schema", () => {
    expect(qrApiContract.generateQR.responses[200]).toBeDefined();
  });

  it("should have 400 response schema", () => {
    expect(qrApiContract.generateQR.responses[400]).toBeDefined();
  });

  it("should have 500 response schema", () => {
    expect(qrApiContract.generateQR.responses[500]).toBeDefined();
  });

  it("should have summary", () => {
    expect(qrApiContract.generateQR.summary).toBe("Generate a QR code image");
  });
});
