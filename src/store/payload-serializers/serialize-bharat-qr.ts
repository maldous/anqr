import { generateBharatQR } from '@/modules/payload-generators';
import type { PayloadData } from './payload-data';

export function serializeBharatQR(payload: PayloadData): string {
  const b = payload.bharatqr;
  if (!b.merchantName) return '';
  return generateBharatQR({
    merchantVPA: b.merchantVPA,
    merchantPAN: b.merchantPAN,
    merchantID: b.merchantID,
    merchantName: b.merchantName,
    merchantCity: b.merchantCity,
    mcc: b.mcc,
    amount: b.amount,
    gstDetails: b.gstDetails,
    invoiceNumber: b.invoiceNumber,
    referenceNumber: b.referenceNumber,
    terminalId: b.terminalId,
  });
}
