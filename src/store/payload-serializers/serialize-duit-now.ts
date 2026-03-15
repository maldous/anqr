import { generateDuitNow } from '@/modules/payload-generators';
import type { PayloadData } from './payload-data';

export function serializeDuitNow(payload: PayloadData): string {
  const d = payload.duitnow;
  if (!(d.proxyValue && d.merchantName)) return '';
  return generateDuitNow({
    proxyType: d.proxyType,
    proxyValue: d.proxyValue,
    merchantName: d.merchantName,
    merchantCity: d.merchantCity,
    amount: d.amount,
    reference: d.reference,
  });
}
