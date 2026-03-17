export interface UrlDetails {
  protocol: string;
  host: string;
  pathname: string;
  hasUtmParams: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
