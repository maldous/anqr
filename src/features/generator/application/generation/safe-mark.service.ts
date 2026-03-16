/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Safe performance.mark wrapper.
 */

export function safeMark(name: string): void {
  if (typeof performance === "undefined") return;
  try {
    performance.mark(name);
  } catch {
    // Ignore performance API failures
  }
}
