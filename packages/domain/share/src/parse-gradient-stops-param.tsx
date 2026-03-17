export function parseGradientStopsParam(
  raw: string | null,
): Array<{ color: string; pos: number }> | undefined {
  if (!raw) return undefined;
  const parts = raw.split(",");
  const stops: Array<{ color: string; pos: number }> = [];
  for (let i = 0; i < parts.length - 1; i += 2) {
    stops.push({ color: `#${parts[i]}`, pos: Number.parseFloat(parts[i + 1]) });
  }
  return stops.length > 0 ? stops : undefined;
}
