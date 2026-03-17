export interface QRISParams {
  merchantPAN?: string;
  merchantID: string;
  merchantCriteria?: "00" | "01" | "02" | "03";
  merchantName: string;
  merchantCity: string;
  postalCode?: string;
  amount?: number;
  feeType?: "FIXED" | "PERCENT";
  feeAmount?: number;
  terminalLabel?: string;
  nmid?: string;
}
