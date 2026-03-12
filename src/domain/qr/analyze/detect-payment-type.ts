import type { ContentType } from './analyzer-content.types';

export function detectPaymentType(lower: string, trimmed: string): ContentType | null {
  if (lower.startsWith('bcd')) return 'epc_sepa';
  if (lower.startsWith('upi://')) return 'upi';
  if (lower.startsWith('spc')) return 'swiss_qr_bill';
  if (/^0002\d{2}/.test(trimmed) && /6304[A-F0-9]{4}$/i.test(trimmed)) return 'emv_qr';
  return null;
}
