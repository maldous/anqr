import { generatePayPalMe } from "@/modules/payload-generators";
import type { PayloadData } from "./payload-data";

export function serializePayPalMe(payload: PayloadData): string {
  const pp = payload.paypalMe;
  if (!pp.username) return "";
  return generatePayPalMe({
    username: pp.username,
    amount: pp.amount,
    currencyCode: pp.currencyCode,
  });
}
