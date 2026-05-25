// Payload defaults extracted from qr-store.ts (L6 step 1 — see ADR mention
// in qr-store.ts header). Keeping defaults in a sibling chunk lets the
// store file stay focused on the state-machine surface (selectors +
// setters) rather than a wall of literal initial values. Other default
// blocks (render, overlay, animation, etc.) can follow the same pattern
// incrementally.
import type { PayloadData } from "../types/payload-data";

export const DEFAULT_PAYLOAD: PayloadData = {
  kind: "url",
  text: "https://anqr.link",
  url: { href: "https://anqr.link", forceHttps: false },
  tel: { number: "" },
  email: { to: "" },
  sms: { number: "" },
  geo: { lat: 0, lon: 0 },
  wifi: { ssid: "", auth: "WPA2", hidden: false },
  vcard: { version: "2.1" },
  mecard: {},
  event: {},
  crypto: { type: "bitcoin", address: "" },
  otpauth: { type: "totp" },
  // Additional content type defaults
  bizcard: {},
  messaging: { platform: "whatsapp", identifier: "" },
  socialProfile: { platform: "linkedin", username: "" },
  appLink: { platform: "universal" },
  gs1: { gtin: "", resolver: "id.gs1.org" },
  cloudLink: { service: "gdrive", url: "" },
  calendarSub: { url: "" },
  eventRsvp: {},
  // Payment helpers defaults
  swissQRBill: {
    creditorIBAN: "",
    creditorName: "",
    creditorAddressType: "S",
    creditorCountry: "CH",
    currency: "CHF",
    referenceType: "NON",
  },
  lightning: { invoice: "" },
  ethereum: { targetAddress: "" },
  qris: { merchantId: "", merchantName: "", merchantCity: "" },
  duitnow: { proxyType: "MOBILE", proxyValue: "", merchantName: "" },
  bharatqr: { merchantName: "", merchantCity: "" },
  vietqr: { bankBin: "", accountNumber: "" },
  qrph: { accountNumber: "", merchantName: "", merchantCity: "" },
  twqr: { merchantId: "", merchantName: "", merchantCity: "" },
  hkqr: { fpsId: "", merchantName: "" },
  jpqr: { storeId: "", merchantName: "" },
  auspaynet: { merchantName: "" },
  paypalMe: { username: "" },
  cashapp: { cashtag: "" },
  emvGeneric: {
    merchantId: "",
    merchantName: "",
    merchantCity: "",
    countryCode: "",
    currencyCode: "",
  },
  validate: false,
  normalizeNewlines: false,
  trim: true,
  maxLenGuard: true,
};
