import type { PayloadData } from './payload-data';

export function serializeSms(payload: PayloadData): string {
  let sms = `sms:${payload.sms.number}`;
  if (payload.sms.body) sms += `?body=${encodeURIComponent(payload.sms.body)}`;
  return sms;
}
