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
