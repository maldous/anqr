export interface PayNowParams {
  type: "mobile" | "uen" | "nric";
  value: string;
  amount?: number;
  reference?: string;
  editable: boolean;
  expiryDate?: string;
  merchantName?: string;
  merchantCity?: string;
}
