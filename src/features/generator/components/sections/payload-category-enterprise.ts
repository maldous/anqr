import { payloadCategory } from "./payload-category";

export const payloadCategoryEnterprise = payloadCategory("payload.enterprise", "professional", [
  ["gs1_digital_link", "payload.gs1DigitalLink"],
  ["app_link", "payload.appLink"],
  ["custom", "payload.custom"],
]);
