import type { ContentType } from './analyzer-content.types';
import { detectCryptoType, detectPaymentType } from './analyzer-content._internal';

/**
 * Detect content type from payload
 */
export function detectContentType(payload: string): ContentType {
  const trimmed = payload.trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith('http://') || lower.startsWith('https://')) return 'url';
  if (lower.startsWith('wifi:')) return 'wifi';
  if (lower.startsWith('begin:vcard')) return 'vcard';
  if (lower.startsWith('mecard:')) return 'mecard';
  if (lower.startsWith('mailto:')) return 'email';
  if (lower.startsWith('tel:')) return 'tel';
  if (lower.startsWith('sms:') || lower.startsWith('smsto:')) return 'sms';
  if (lower.startsWith('geo:')) return 'geo';
  const cryptoType = detectCryptoType(lower);
  if (cryptoType) return cryptoType;
  const paymentType = detectPaymentType(lower, trimmed);
  if (paymentType) return paymentType;
  if (lower.startsWith('begin:vcalendar') || lower.startsWith('begin:vevent'))
    return 'calendar_event';
  if (lower.startsWith('otpauth://')) return 'otp_auth';

  return 'plain_text';
}
