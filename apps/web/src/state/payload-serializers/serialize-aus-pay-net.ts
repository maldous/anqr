import { generateAusPayNet } from "@/modules/payload-generators";
import type { PayloadData } from "./payload-data";

export function serializeAusPayNet(payload: PayloadData): string {
  const a = payload.auspaynet;
  if (!(a.payId || (a.bsb && a.accountNumber))) return "";
  return generateAusPayNet({
    payId: a.payId,
    payIdType: a.payIdType,
    bsb: a.bsb,
    accountNumber: a.accountNumber,
    merchantName: a.merchantName,
    merchantCity: a.merchantCity,
    amount: a.amount,
    reference: a.reference,
  });
}
