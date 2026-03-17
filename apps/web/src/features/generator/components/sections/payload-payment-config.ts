import type { PayloadKind } from "../../../../state/qr-store";
import { GLOBAL_PAYMENT_METHODS } from "./global-payment-methods.const";
import { LANGUAGE_PAYMENT_MAP } from "./language-payment-map.const";

export function getAvailablePayments(tier: string, currentLang: string): PayloadKind[] {
  if (tier === "professional") {
    return [
      "epc_sepa",
      "swiss_qr_bill",
      "upi",
      "paynow",
      "promptpay",
      "pix",
      "qris",
      "duitnow",
      "bharatqr",
      "vietqr",
      "qrph",
      "twqr",
      "hkqr",
      "jpqr",
      "auspaynet",
      "crypto",
      "lightning",
      "ethereum_eip681",
      "paypal_me",
      "cashapp",
      "emv_generic",
    ];
  }

  if (tier === "advanced") {
    const baseLang = currentLang.split("-")[0];
    const langSpecific = LANGUAGE_PAYMENT_MAP[currentLang] || LANGUAGE_PAYMENT_MAP[baseLang] || [];
    return [...new Set([...langSpecific, ...GLOBAL_PAYMENT_METHODS])];
  }

  return [];
}
