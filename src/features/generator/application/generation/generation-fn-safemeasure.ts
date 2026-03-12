/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Safe performance.measure wrapper.
 */

export function safeMeasure(name: string, startMark: string, endMark: string): number | null {
  if (typeof performance === 'undefined') return null;
  try {
    performance.measure(name, startMark, endMark);
    const entries = performance.getEntriesByName(name, 'measure');
    const duration = entries[entries.length - 1]?.duration ?? null;
    performance.clearMeasures(name);
    return duration;
  } catch {
    return null;
  }
}
