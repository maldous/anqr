import { generateQRPh } from '@/modules/payload-generators';
import type { PayloadData } from './payload-data';

export function serializeQRPh(payload: PayloadData): string {
  const p = payload.qrph;
  if (!(p.accountNumber && p.merchantName)) return '';
  return generateQRPh({
    accountNumber: p.accountNumber,
    merchantName: p.merchantName,
    merchantCity: p.merchantCity,
    amount: p.amount,
    reference: p.reference,
  });
}
