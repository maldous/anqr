/**
 * Payload Generator Utilities
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('PAYLOAD');

/**
 * Validate phone number for vCard compatibility.
 * Android requires TEL to look like an actual phone number with digits.
 */
export function isValidPhone(tel: string): boolean {
  // Must have at least 3 digits to be considered a valid phone number
  const digits = tel.replaceAll(/\D/g, '');
  return digits.length >= 3;
}

/**
 * Validate email for vCard compatibility.
 * Android requires EMAIL to contain @.
 */
export function isValidEmail(email: string): boolean {
  return email.includes('@') && email.length >= 3;
}

/**
 * Validate URL for vCard compatibility.
 * Android requires URL to be a valid http(s):// URL.
 */
export function isValidUrl(url: string): boolean {
  return /^https?:\/\/.+/i.test(url);
}

/**
 * Validate URL with custom scheme (for webcal://, myapp://, etc.)
 */
export function isValidUrlWithScheme(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\/.+/i.test(url);
}

/**
 * Check if a string is non-empty (after trimming)
 */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate latitude (-90 to 90)
 */
export function isValidLatitude(lat: number): boolean {
  return !Number.isNaN(lat) && lat >= -90 && lat <= 90;
}

/**
 * Validate longitude (-180 to 180)
 */
export function isValidLongitude(lon: number): boolean {
  return !Number.isNaN(lon) && lon >= -180 && lon <= 180;
}

/**
 * Validate SSID (1-32 characters, non-empty)
 */
export function isValidSSID(ssid: string): boolean {
  const len = ssid.length;
  return len >= 1 && len <= 32;
}

/**
 * Validate IBAN (alphanumeric, 15-34 characters)
 * Basic format check only - does not validate checksum
 */
export function isValidIBAN(iban: string): boolean {
  const cleaned = iban.replaceAll(/\s/g, '').toUpperCase();
  return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(cleaned);
}

/**
 * Validate crypto wallet address based on type
 */
export function isValidCryptoAddress(address: string, type: string): boolean {
  if (!address || address.length < 10) return false;

  switch (type.toLowerCase()) {
    case 'bitcoin':
      // Legacy (1...), P2SH (3...), Bech32 (bc1...)
      return (
        /^(1|3)[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || /^bc1[a-z0-9]{39,59}$/i.test(address)
      );
    case 'ethereum':
      // 0x followed by 40 hex characters
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case 'litecoin':
      // Legacy (L..., M...), Bech32 (ltc1...)
      return (
        /^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(address) || /^ltc1[a-z0-9]{39,59}$/i.test(address)
      );
    default:
      // Generic: at least 20 alphanumeric characters
      return /^[a-zA-Z0-9]{20,}$/.test(address);
  }
}

/**
 * Validate GTIN (8, 12, 13, or 14 digits)
 */
export function isValidGTIN(gtin: string): boolean {
  const cleaned = gtin.replaceAll(/\s/g, '');
  return /^\d{8}$|^\d{12,14}$/.test(cleaned);
}

/**
 * Validate ISO 3166-1 alpha-2 country code (2 uppercase letters)
 */
export function isValidCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code.toUpperCase());
}

/**
 * Validate UPI VPA format (user@provider)
 */
export function isValidUpiVpa(vpa: string): boolean {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(vpa);
}

/**
 * Validate Ethereum address (0x + 40 hex chars)
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate Lightning invoice (starts with lnbc, lntb, lnbcrt, etc.)
 */
export function isValidLightningInvoice(invoice: string): boolean {
  return /^ln(bc|tb|bcrt)[a-z0-9]+$/i.test(invoice.toLowerCase());
}

/**
 * Validate PayPal.Me username (alphanumeric, 4-20 chars)
 */
export function isValidPayPalUsername(username: string): boolean {
  return /^[a-zA-Z0-9]{4,20}$/.test(username);
}

/**
 * Validate Cash App $cashtag (alphanumeric, 1-20 chars)
 */
export function isValidCashtag(cashtag: string): boolean {
  const cleaned = cashtag.replace(/^\$/, '');
  return /^[a-zA-Z][a-zA-Z0-9]{0,19}$/.test(cleaned);
}

/**
 * Validate ISO 4217 currency code (3 digits)
 */
export function isValidCurrencyCode(code: string): boolean {
  return /^\d{3}$/.test(code);
}

/**
 * Validate amount format (positive number with up to 2 decimal places)
 */
export function isValidAmount(amount: string): boolean {
  if (!amount) return true; // Amount is often optional
  const num = Number.parseFloat(amount);
  return !Number.isNaN(num) && num >= 0;
}

/**
 * Validate Australian BSB (6 digits, often formatted as XXX-XXX)
 */
export function isValidBSB(bsb: string): boolean {
  const cleaned = bsb.replaceAll(/[-\s]/g, '');
  return /^\d{6}$/.test(cleaned);
}

/**
 * Validate Hong Kong FPS ID (7-9 digits)
 */
export function isValidFpsId(fpsId: string): boolean {
  const cleaned = fpsId.replaceAll(/\s/g, '');
  return /^\d{7,9}$/.test(cleaned);
}

/**
 * Validate Vietnam bank BIN (6-8 digits)
 */
export function isValidBankBin(bin: string): boolean {
  const cleaned = bin.replaceAll(/\s/g, '');
  return /^\d{6,8}$/.test(cleaned);
}

/**
 * Validate generic merchant ID (at least 1 non-empty character)
 */
export function isValidMerchantId(id: string): boolean {
  return id.trim().length >= 1;
}

/**
 * Validate generic account number (at least 4 digits)
 */
export function isValidAccountNumber(accNum: string): boolean {
  const digits = accNum.replaceAll(/\D/g, '');
  return digits.length >= 4;
}

/**
 * Validate Japan store ID (non-empty)
 */
export function isValidStoreId(storeId: string): boolean {
  return storeId.trim().length >= 1;
}

/**
 * Validate Australian Business Number (ABN - exactly 11 digits)
 */
export function isValidABN(abn: string): boolean {
  const cleaned = abn.replaceAll(/[\s-]/g, '');
  return /^\d{11}$/.test(cleaned);
}

/**
 * Validate DuitNow proxy value based on proxy type
 * - MOBILE: valid phone number
 * - NRIC: 12 digits (Malaysian IC)
 * - PASSPORT: non-empty
 * - ARMY: non-empty
 * - BUSINESS: non-empty
 * - OTHERS: non-empty
 */
export function isValidProxyValue(value: string, proxyType: string): boolean {
  if (!value || value.trim().length === 0) return false;

  switch (proxyType) {
    case 'MOBILE':
      // Valid phone number with at least 3 digits
      return isValidPhone(value);
    case 'NRIC':
      // Malaysian NRIC is 12 digits (without dashes)
      return /^\d{12}$/.test(value.replaceAll(/[-\s]/g, ''));
    default:
      // Just needs to be non-empty
      return value.trim().length >= 1;
  }
}

/**
 * Escape special characters for vCard/iCal format
 */
export function escapeValue(value: string): string {
  return value
    .replaceAll('\\', String.raw`\\`)
    .replaceAll(';', String.raw`\;`)
    .replaceAll(',', String.raw`\,`)
    .replaceAll('\n', String.raw`\n`);
}

/**
 * Format date for iCalendar (YYYYMMDD or YYYYMMDDTHHmmssZ)
 * Per RFC 5545, datetime should be in UTC with Z suffix or with TZID property
 * @param dateStr - ISO date string (from datetime-local input) or ISO 8601 format
 * @param includeTime - if true, include time component
 * @param useUtc - if true, convert to UTC and add Z suffix (default: true for RFC 5545 compliance)
 */
export function formatICalDate(dateStr: string, includeTime = true, useUtc = true): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  if (useUtc) {
    // Use UTC time with Z suffix for RFC 5545 compliance
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    if (!includeTime) return `${year}${month}${day}`;

    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  // Use local time without Z suffix (requires TZID property)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (!includeTime) return `${year}${month}${day}`;

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Calculate UTF-8 byte length of a string
 */
export function utf8ByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Calculate CRC16-CCITT (polynomial 0x1021, init 0xFFFF)
 */
export function crc16CCITT(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
