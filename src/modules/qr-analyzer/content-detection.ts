/**
 * QR Content Type Detection
 */

import type { ContentType, ContentTypeDetails } from './types';

// Re-export canonical implementation from content module
export { detectContentType } from './content';

/** @deprecated Use detectContentType from './content/content' instead */
export function detectContentTypeWrapper(payload: string): ContentTypeDetails {
  const trimmed = payload.trim();
  const lower = trimmed.toLowerCase();

  // URL detection
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    const details: ContentTypeDetails = {
      type: 'url',
      label: 'URL',
      url: trimmed,
      protocol: lower.startsWith('https://') ? 'HTTPS' : 'HTTP',
    };

    // Check for UTM parameters
    try {
      const url = new URL(trimmed);
      const utmSource = url.searchParams.get('utm_source');
      const utmMedium = url.searchParams.get('utm_medium');
      const utmCampaign = url.searchParams.get('utm_campaign');

      if (utmSource || utmMedium || utmCampaign) {
        details.hasUtmParams = true;
        details.utmSource = utmSource || undefined;
        details.utmMedium = utmMedium || undefined;
        details.utmCampaign = utmCampaign || undefined;
      }
    } catch {
      // Invalid URL, ignore UTM detection
    }

    return details;
  }

  // WiFi
  if (lower.startsWith('wifi:')) {
    const ssidMatch = trimmed.match(/S:([^;]*)/i);
    const authMatch = trimmed.match(/T:([^;]*)/i);
    return {
      type: 'wifi',
      label: 'WiFi Network',
      wifiSsid: ssidMatch?.[1] || undefined,
      wifiAuth: authMatch?.[1]?.toUpperCase() || undefined,
    };
  }

  // vCard
  if (lower.startsWith('begin:vcard')) {
    const fnMatch = trimmed.match(/FN:([^\r\n]*)/i);
    return {
      type: 'vcard',
      label: 'vCard Contact',
      contactName: fnMatch?.[1] || undefined,
    };
  }

  // MeCard
  if (lower.startsWith('mecard:')) {
    const nameMatch = trimmed.match(/N:([^;]*)/i);
    return {
      type: 'mecard',
      label: 'MeCard Contact',
      contactName: nameMatch?.[1] || undefined,
    };
  }

  // Email
  if (lower.startsWith('mailto:')) {
    const email = trimmed.slice(7).split('?')[0];
    return {
      type: 'email',
      label: 'Email',
      emailAddress: email || undefined,
    };
  }

  // Phone
  if (lower.startsWith('tel:')) {
    return {
      type: 'tel',
      label: 'Phone Number',
      phoneNumber: trimmed.slice(4) || undefined,
    };
  }

  // SMS
  if (lower.startsWith('sms:') || lower.startsWith('smsto:')) {
    const phone = trimmed.replace(/^smsto?:/i, '').split('?')[0];
    return {
      type: 'sms',
      label: 'SMS',
      phoneNumber: phone || undefined,
    };
  }

  // Geo
  if (lower.startsWith('geo:')) {
    return {
      type: 'geo',
      label: 'Geographic Location',
    };
  }

  // Bitcoin
  if (lower.startsWith('bitcoin:')) {
    const address = trimmed.slice(8).split('?')[0];
    const amountMatch = trimmed.match(/amount=([^&]*)/i);
    return {
      type: 'crypto_bitcoin',
      label: 'Bitcoin Payment',
      cryptoCurrency: 'BTC',
      cryptoAddress: address || undefined,
      amount: amountMatch?.[1] || undefined,
    };
  }

  // Ethereum
  if (lower.startsWith('ethereum:')) {
    const address = trimmed.slice(9).split(/[?@/]/)[0];
    return {
      type: 'crypto_ethereum',
      label: 'Ethereum Payment',
      cryptoCurrency: 'ETH',
      cryptoAddress: address || undefined,
    };
  }

  // Other crypto
  const cryptoSchemes = ['litecoin:', 'dogecoin:', 'dash:', 'monero:'];
  for (const scheme of cryptoSchemes) {
    if (lower.startsWith(scheme)) {
      const currency = scheme.slice(0, -1).toUpperCase();
      return {
        type: 'crypto_other',
        label: `${currency} Payment`,
        cryptoCurrency: currency,
        cryptoAddress: trimmed.slice(scheme.length).split('?')[0] || undefined,
      };
    }
  }

  // EPC/SEPA
  if (lower.startsWith('bcd')) {
    return {
      type: 'epc_sepa',
      label: 'SEPA Payment',
    };
  }

  // UPI
  if (lower.startsWith('upi://')) {
    return {
      type: 'upi',
      label: 'UPI Payment',
    };
  }

  // Swiss QR Bill
  if (lower.startsWith('spc')) {
    return {
      type: 'swiss_qr_bill',
      label: 'Swiss QR Bill',
    };
  }

  // Calendar Event
  if (lower.startsWith('begin:vcalendar') || lower.startsWith('begin:vevent')) {
    return {
      type: 'calendar_event',
      label: 'Calendar Event',
    };
  }

  // OTP Auth
  if (lower.startsWith('otpauth://')) {
    return {
      type: 'otp_auth',
      label: '2FA/OTP Setup',
    };
  }

  // EMV QR (starts with 00 and has CRC at end)
  if (/^0002\d{2}/.test(trimmed) && /6304[A-F0-9]{4}$/i.test(trimmed)) {
    return {
      type: 'emv_qr',
      label: 'EMV Payment QR',
    };
  }

  // Plain text
  return {
    type: 'plain_text',
    label: 'Plain Text',
  };
}
