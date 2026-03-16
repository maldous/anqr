import { payloadCategoryCalendar } from "./payload-category-calendar";
import { payloadCategoryContact } from "./payload-category-contact";
import { payloadCategoryCore } from "./payload-category-core";
import { payloadCategoryEnterprise } from "./payload-category-enterprise";
import { payloadCategoryLocationNetwork } from "./payload-category-location-network";
import { payloadCategoryMarketing } from "./payload-category-marketing";
import { payloadCategoryPayments } from "./payload-category-payments";
import { payloadCategorySocialMessaging } from "./payload-category-social-messaging";

export const PAYLOAD_CATEGORY_KEYS = [
  payloadCategoryCore,
  payloadCategoryContact,
  payloadCategoryLocationNetwork,
  payloadCategoryCalendar,
  payloadCategorySocialMessaging,
  payloadCategoryPayments,
  payloadCategoryMarketing,
  payloadCategoryEnterprise,
] as const;
