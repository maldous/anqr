export interface PromptPayParams {
  type: "mobile" | "id" | "ewallet" | "billpay";
  value: string;
  amount?: number;
  merchantName?: string;
  merchantCity?: string;
  ref1?: string;
  ref2?: string;
  ref3?: string;
  mcc?: string;
  countryCode?: string;
}
