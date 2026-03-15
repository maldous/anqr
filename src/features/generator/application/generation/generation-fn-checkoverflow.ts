/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Check if content changed since last overflow.
 */

export function checkOverflowContentChanged(
  lastOverflowContent: string | null,
  currentContent: string | undefined
): boolean {
  return lastOverflowContent !== null && lastOverflowContent !== currentContent;
}
