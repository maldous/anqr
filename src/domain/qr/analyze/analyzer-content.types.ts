// Types
export interface ImageProperties {
  width: number;
  height: number;
  aspectRatio: number;
  estimatedQrSizePx: number;
}

export interface DominantColor {
  color: string;
  percentage: number;
  rgb: { r: number; g: number; b: number };
}

export interface ColorInfo {
  dominantColors: DominantColor[];
  averageColor: string;
  contrastRatio: number;
}

export interface UrlDetails {
  protocol: string;
  host: string;
  pathname: string;
  hasUtmParams: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export type ContentType =
  | 'url'
  | 'wifi'
  | 'vcard'
  | 'mecard'
  | 'email'
  | 'tel'
  | 'sms'
  | 'geo'
  | 'crypto_bitcoin'
  | 'crypto_ethereum'
  | 'crypto_other'
  | 'epc_sepa'
  | 'upi'
  | 'emv_qr'
  | 'swiss_qr_bill'
  | 'calendar_event'
  | 'otp_auth'
  | 'plain_text'
  | 'unknown';

export interface ContentAnalysis {
  type: ContentType;
  raw: string;
}
