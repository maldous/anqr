import { generateJPQR } from "@/modules/payload-generators";
import type { PayloadData } from "./payload-data";

export function serializeJPQR(payload: PayloadData): string {
  const j = payload.jpqr;
  if (!j.merchantName) return "";
  return generateJPQR({
    storeId: j.storeId,
    merchantName: j.merchantName,
    merchantCity: j.merchantCity,
    amount: j.amount,
  });
}
