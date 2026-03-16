import { payloadCategory } from "./payload-category";

export const payloadCategoryContact = payloadCategory("payload.contact", "advanced", [
  ["tel", "payload.tel"],
  ["email", "payload.email"],
  ["sms", "payload.smsMms"],
  ["vcard", "payload.vcard"],
  ["mecard", "payload.mecard"],
  ["bizcard", "payload.bizcard"],
]);
