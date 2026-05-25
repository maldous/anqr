import { describe, it, expect } from "vitest";
import type { ContentType } from "./content-type.contract";

describe("contracts/analyze/content-type", () => {
  describe("ContentType", () => {
    it("accepts all content type values", () => {
      const types: ContentType[] = [
        "url",
        "wifi",
        "vcard",
        "mecard",
        "email",
        "tel",
        "sms",
        "geo",
        "crypto_bitcoin",
        "crypto_ethereum",
        "crypto_other",
        "epc_sepa",
        "upi",
        "emv_qr",
        "swiss_qr_bill",
        "calendar_event",
        "otp_auth",
        "plain_text",
        "unknown",
      ];
      expect(new Set(types).size).toBe(19);
    });

    it("accepts crypto content types", () => {
      const types: ContentType[] = ["crypto_bitcoin", "crypto_ethereum", "crypto_other"];
      expect(types).toHaveLength(3);
    });

    it("accepts payment content types", () => {
      const types: ContentType[] = ["epc_sepa", "upi", "emv_qr", "swiss_qr_bill"];
      expect(types).toHaveLength(4);
    });
  });
});
