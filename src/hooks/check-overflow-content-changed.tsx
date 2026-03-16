export function checkOverflowContentChanged(
  lastOverflowContent: string | null,
  currentContent: string | undefined,
): boolean {
  return lastOverflowContent !== null && lastOverflowContent !== currentContent;
}
