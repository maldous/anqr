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
