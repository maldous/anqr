import { describe, expect, it } from "vitest";
import type { PayloadKind } from "./payload-kind.contract";

describe("PayloadKind", () => {
  const kinds: PayloadKind[] = [
    "plain_text",
    "url",
    "tel",
    "email",
    "sms",
    "geo",
    "vcard",
    "mecard",
    "bizcard",
    "wifi",
    "app_link",
    "event",
    "event_rsvp",
    "calendar_subscription",
    "social_profile",
    "messaging_link",
    "epc_sepa",
    "upi",
    "paynow",
    "promptpay",
    "pix",
    "crypto",
    "swiss_qr_bill",
    "lightning",
    "ethereum_eip681",
    "qris",
    "duitnow",
    "bharatqr",
    "vietqr",
    "qrph",
    "twqr",
    "hkqr",
    "jpqr",
    "auspaynet",
    "paypal_me",
    "cashapp",
    "emv_generic",
    "gs1_digital_link",
    "short_link",
    "utm_link",
    "custom",
  ];

  kinds.forEach((kind) => {
    it(`should allow ${kind}`, () => {
      const payloadKind: PayloadKind = kind;
      expect(payloadKind).toBe(kind);
    });
  });
});
