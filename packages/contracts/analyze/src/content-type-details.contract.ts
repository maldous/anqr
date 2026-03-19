import type { ContentType } from "./content-type.contract";

export interface ContentTypeDetails {
  type: ContentType;
  label: string;
  url?: string;
  protocol?: string;
  wifiSsid?: string;
  wifiAuth?: string;
  contactName?: string;
  phoneNumber?: string;
  emailAddress?: string;
  cryptoCurrency?: string;
  cryptoAddress?: string;
  amount?: string;
  hasUtmParams?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
