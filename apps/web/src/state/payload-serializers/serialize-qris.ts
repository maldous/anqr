import { generateQRIS } from "../../../../../packages/domain/payload/src/payload-generators";
import type { PayloadData } from "./payload-data";

export function serializeQRIS(payload: PayloadData): string {
  const q = payload.qris;
  if (!q.merchantName) return "";
  return generateQRIS({
    merchantID: q.merchantId,
    nmid: q.nmid,
    merchantCriteria: q.merchantCriteria,
    merchantName: q.merchantName,
    merchantCity: q.merchantCity,
    postalCode: q.postalCode,
    amount: q.amount,
    feeType: q.feeType,
    feeAmount: q.feeAmount,
    terminalLabel: q.terminalLabel,
  });
}
