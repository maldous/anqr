import {ContentTypeDetails, url} from './shared';
import { parseUrlDetails } from './parseUrlDetails';

export function detectContentType(payload: string): ContentTypeDetails {
  if (!payload || payload.length === 0) {
    return { type: 'unknown', label: 'Unknown' };
  }

  const trimmed = payload.trim();
  const upper = trimmed.toUpperCase();

  // WiFi configuration: WIFI:T:WPA;S:ssid;P:password;;
  if (upper.startsWith('WIFI:')) {
    const ssidMatch = trimmed.match(/S:([^;]*)/i);
    const authMatch = trimmed.match(/T:([^;]*)/i);
    return {
      type: 'wifi',
      label: 'WiFi Network',
      wifiSsid: ssidMatch?.[1] || undefined,
      wifiAuth: authMatch?.[1] || undefined,
    };
  }

  // vCard: BEGIN:VCARD
  if (upper.startsWith('BEGIN:VCARD')) {
    const fnMatch = trimmed.match(/FN:([^\r\n]*)/i);
    return {
      type: 'vcard',
      label: 'vCard Contact',
      contactName: fnMatch?.[1] || undefined,
    };
  }

  // MeCard: MECARD:
  if (upper.startsWith('MECARD:')) {
    const nameMatch = trimmed.match(/N:([^;]*)/i);
    return {
      type: 'mecard',
      label: 'MeCard Contact',
      contactName: nameMatch?.[1] || undefined,
    };
  }

  // Calendar event: BEGIN:VEVENT or BEGIN:VCALENDAR
  if (upper.startsWith('BEGIN:VEVENT') || upper.startsWith('BEGIN:VCALENDAR')) {
    return {
      type: 'calendar_event',
      label: 'Calendar Event',
    };
  }

  // Swiss QR-bill: SPC (Swiss Payment Code)
  if (upper.startsWith('SPC\n') || upper.startsWith('SPC\r\n')) {
    return {
      type: 'swiss_qr_bill',
      label: 'Swiss QR-bill',
    };
  }

  // EPC/SEPA: BCD format
  if (upper.startsWith('BCD\n') || upper.startsWith('BCD\r\n')) {
    return {
      type: 'epc_sepa',
      label: 'SEPA Bank Transfer',
    };
  }

  // EMV QR code: starts with payload format indicator 000201
  if (trimmed.startsWith('00020101')) {
    return {
      type: 'emv_qr',
      label: 'EMV Payment QR',
    };
  }

  // OTP Auth: otpauth://
  if (trimmed.startsWith('otpauth://')) {
    return {
      type: 'otp_auth',
      label: 'Authenticator Code',
      protocol: 'otpauth',
    };
  }

  // UPI: upi://pay
  if (trimmed.startsWith('upi://')) {
    const paMatch = trimmed.match(/pa=([^&]*)/i);
    const amMatch = trimmed.match(/am=([^&]*)/i);
    return {
      type: 'upi',
      label: 'UPI Payment',
      protocol: 'upi',
      cryptoAddress: paMatch?.[1] || undefined,
      amount: amMatch?.[1] || undefined,
    };
  }

  // Bitcoin: bitcoin:
  if (trimmed.startsWith('bitcoin:')) {
    const addressMatch = trimmed.match(/bitcoin:([^?]*)/i);
    const amountMatch = trimmed.match(/amount=([^&]*)/i);
    return {
      type: 'crypto_bitcoin',
      label: 'Bitcoin Payment',
      cryptoCurrency: 'Bitcoin',
      cryptoAddress: addressMatch?.[1] || undefined,
      amount: amountMatch?.[1] || undefined,
    };
  }

  // Ethereum: ethereum:
  if (trimmed.startsWith('ethereum:')) {
    const addressMatch = trimmed.match(/ethereum:([^?@/]*)/i);
    return {
      type: 'crypto_ethereum',
      label: 'Ethereum Payment',
      cryptoCurrency: 'Ethereum',
      cryptoAddress: addressMatch?.[1] || undefined,
    };
  }

  // Lightning: lightning:
  if (trimmed.startsWith('lightning:') || upper.startsWith('LNBC') || upper.startsWith('LNTB')) {
    return {
      type: 'crypto_other',
      label: 'Lightning Network',
      cryptoCurrency: 'Lightning',
    };
  }

  // Other crypto (litecoin, dogecoin, etc.)
  const cryptoMatch = trimmed.match(/^(litecoin|dogecoin|dash|monero|ripple|xrp):/i);
  if (cryptoMatch) {
    const currency = cryptoMatch[1];
    return {
      type: 'crypto_other',
      label: `${currency.charAt(0).toUpperCase() + currency.slice(1)} Payment`,
      cryptoCurrency: currency,
    };
  }

  // Email: mailto:
  if (trimmed.startsWith('mailto:')) {
    const emailMatch = trimmed.match(/mailto:([^?]*)/i);
    return {
      type: 'email',
      label: 'Email Address',
      emailAddress: emailMatch?.[1] || undefined,
    };
  }

  // Telephone: tel:
  if (trimmed.startsWith('tel:')) {
    const phoneMatch = trimmed.match(/tel:([^?]*)/i);
    return {
      type: 'tel',
      label: 'Phone Number',
      phoneNumber: phoneMatch?.[1] || undefined,
    };
  }

  // SMS: sms: or smsto:
  if (trimmed.startsWith('sms:') || trimmed.startsWith('smsto:')) {
    const phoneMatch = trimmed.match(/sms(?:to)?:([^?]*)/i);
    return {
      type: 'sms',
      label: 'SMS Message',
      phoneNumber: phoneMatch?.[1] || undefined,
    };
  }

  // Geo location: geo:
  if (trimmed.startsWith('geo:')) {
    return {
      type: 'geo',
      label: 'Geographic Location',
      protocol: 'geo',
    };
  }

  // URL: http:// or https://
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const urlObj = parseUrlDetails(trimmed);
    return {
      type: 'url',
      label: 'Website URL',
      url: trimmed,
      protocol: trimmed.startsWith('https://') ? 'https' : 'http',
      ...urlObj,
    };
  }

  // Fallback: check if it looks like a URL without protocol
  if (/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}/.test(trimmed)) {
    return {
      type: 'url',
      label: 'Website URL (no protocol)',
      url: trimmed,
    };
  }

  // Default to plain text
  return {
    type: 'plain_text',
    label: 'Plain Text',
  };
}

