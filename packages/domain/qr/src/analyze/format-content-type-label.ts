import type { ContentType } from "@/modules/qr-analyzer/types";

export function formatContentTypeLabel(type: ContentType): string {
  const labels: Record<ContentType, string> = {
    url: "URL",
    wifi: "WiFi Network",
    vcard: "vCard Contact",
    mecard: "MeCard Contact",
    email: "Email",
    tel: "Phone Number",
    sms: "SMS",
    geo: "Geographic Location",
    crypto_bitcoin: "Bitcoin Payment",
    crypto_ethereum: "Ethereum Payment",
    crypto_other: "Cryptocurrency",
    epc_sepa: "SEPA Payment",
    upi: "UPI Payment",
    emv_qr: "EMV Payment QR",
    swiss_qr_bill: "Swiss QR Bill",
    calendar_event: "Calendar Event",
    otp_auth: "2FA/OTP Setup",
    plain_text: "Plain Text",
    unknown: "Unknown",
  };
  return labels[type] || "Unknown";
}
