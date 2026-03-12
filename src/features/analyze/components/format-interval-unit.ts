export function formatIntervalUnit(singular: string, plural: string, interval: number): string {
  return interval === 1 ? singular : `Every ${interval} ${plural}`;
}
