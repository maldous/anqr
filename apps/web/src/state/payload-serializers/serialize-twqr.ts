import { generateTWQR } from "@/domain/payload/generators";
import type { PayloadData } from "./payload-data";

export function serializeTWQR(payload: PayloadData): string {
  const t = payload.twqr;
  if (!t.merchantName) return "";
  return generateTWQR({
    merchantId: t.merchantId,
    merchantName: t.merchantName,
    merchantCity: t.merchantCity,
    taxId: t.taxId,
    amount: t.amount,
  });
}
