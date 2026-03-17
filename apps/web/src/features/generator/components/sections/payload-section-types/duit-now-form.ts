export interface DuitNowForm {
  proxyType: "NRIC" | "MOBILE" | "PASSPORT" | "ARMY" | "BUSINESS" | "OTHERS";
  proxyValue: string;
  merchantName: string;
  amount: string;
}
