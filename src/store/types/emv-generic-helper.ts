export interface EMVGenericHelper {
  merchantId: string;
  merchantName: string;
  merchantCity: string;
  countryCode: string;
  currencyCode: string;
  amount?: number;
  isStatic?: boolean;
  tipIndicator?: "none" | "prompt" | "fixed" | "percent";
  tipAmount?: number;
  tipPercent?: number;
  storeLabel?: string;
  customerLabel?: string;
  terminalLabel?: string;
  loyaltyNumber?: string;
  reference?: string;
  purposeOfTransaction?: string;
  postalCode?: string;
  mcc?: string;
}
