export interface QRISHelper {
  merchantId: string;
  nmid?: string;
  merchantCriteria?: '00' | '01' | '02' | '03';
  merchantName: string;
  merchantCity: string;
  postalCode?: string;
  amount?: number;
  feeType?: 'FIXED' | 'PERCENT';
  feeAmount?: number;
  terminalLabel?: string;
}
