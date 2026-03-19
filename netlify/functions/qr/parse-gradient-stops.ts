import type { GradientStop } from "@/contracts/generator";

export function parseGradientStops(stopsParam: string): GradientStop[] {
  const parts = stopsParam.split(",");
  const stops: GradientStop[] = [];

  for (let i = 0; i < parts.length - 1; i += 2) {
    const color = `#${parts[i]}`;
    const pos = Number.parseFloat(parts[i + 1]);
    if (!Number.isNaN(pos)) {
      stops.push({ color, pos });
    }
  }

  return stops.length > 0
    ? stops
    : [
        { color: "#000000", pos: 0 },
        { color: "#000000", pos: 1 },
      ];
}
