/**
 * Payload Generator Utilities
 */

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
 * Format date for iCalendar (YYYYMMDD or YYYYMMDDTHHmmss)
 */
export function formatICalDate(dateStr: string, includeTime = true): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

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
