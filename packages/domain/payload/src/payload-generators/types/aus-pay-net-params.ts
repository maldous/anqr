export interface AusPayNetParams {
  payId?: string;
  payIdType?: "EMAIL" | "MOBILE" | "ABN" | "ORG";
  bsb?: string;
  accountNumber?: string;
  merchantName?: string;
  merchantCity?: string;
  amount?: number;
  reference?: string;
}
