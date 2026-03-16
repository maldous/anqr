export interface AusPayNetForm {
  payId: string;
  payIdType: "EMAIL" | "MOBILE" | "ABN" | "ORG";
  merchantName: string;
  amount: string;
}
