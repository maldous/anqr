import { generateVietQR } from '@/modules/payload-generators';
import type { PayloadData } from './payload-data';

export function serializeVietQR(payload: PayloadData): string {
  const v = payload.vietqr;
  if (!(v.bankBin && v.accountNumber)) return '';
  return generateVietQR({
    bankBin: v.bankBin,
    accountNumber: v.accountNumber,
    accountName: v.accountName,
    serviceCode: v.serviceCode,
    amount: v.amount,
    description: v.description,
  });
}
