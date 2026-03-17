import { generateHKQR } from "../../../../../packages/domain/payload/src/payload-generators";
import type { PayloadData } from "./payload-data";

export function serializeHKQR(payload: PayloadData): string {
  const h = payload.hkqr;
  if (!(h.fpsId || h.merchantName)) return "";
  return generateHKQR({
    fpsId: h.fpsId || undefined,
    merchantName: h.merchantName,
    merchantCity: h.merchantCity || undefined,
    amount: h.amount,
    reference: undefined,
  });
}
