import { describe, it, expect } from "vitest";
import type { ApiSuccess } from "./api-success.contract";

describe("api-success.contract", () => {
  describe("ApiSuccess interface", () => {
    it("should accept valid API success with data", () => {
      const success: ApiSuccess<string> = {
        ok: true,
        data: "QR code generated successfully",
      };
      expect(success.ok).toBe(true);
      expect(success.data).toBe("QR code generated successfully");
    });

    it("should have readonly ok field set to true", () => {
      const success: ApiSuccess<number> = {
        ok: true,
        data: 42,
      };
      expect(success.ok).toBe(true);
    });

    it("should support various data types", () => {
      const stringSuccess: ApiSuccess<string> = {
        ok: true,
        data: "result",
      };
      const numberSuccess: ApiSuccess<number> = {
        ok: true,
        data: 123,
      };
      const objectSuccess: ApiSuccess<{ id: string }> = {
        ok: true,
        data: { id: "qr-123" },
      };
      
      expect(stringSuccess.data).toBe("result");
      expect(numberSuccess.data).toBe(123);
      expect(objectSuccess.data.id).toBe("qr-123");
    });
  });
});
