import { generateCashApp } from "../../../../../packages/domain/payload/src/payload-generators";
import type { PayloadData } from "./payload-data";

export function serializeCashApp(payload: PayloadData): string {
  const ca = payload.cashapp;
  if (!ca.cashtag) return "";
  return generateCashApp({
    cashtag: ca.cashtag,
    amount: ca.amount,
  });
}
