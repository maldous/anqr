import type { SmsHelper } from './types';

/** Generate SMS URI */
export function generateSms(params: SmsHelper): string {
  let sms = `sms:${params.number}`;
  if (params.body) {
    sms += `?body=${encodeURIComponent(params.body)}`;
  }
  return sms;
}
