export function formatTelLine(tel: string, version: string): string {
  if (version === '4.0') {
    return `TEL;TYPE=voice:${tel}`;
  } else if (version === '2.1') {
    // vCard 2.1: use CELL for mobile compatibility
    return `TEL;CELL:${tel}`;
  } else {
    return `TEL:${tel}`;
  }
}
