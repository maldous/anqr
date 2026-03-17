import type { HSLA } from "@/modules/core/types";

/** Parse hsl() or hsla() string */
export function parseHslString(str: string): HSLA {
  const hslRegex = /hsla?\((\d+),\s*([\d.]+)%?,\s*([\d.]+)%?(?:,\s*([\d.]+))?\)/;
  const match = hslRegex.exec(str);
  if (match) {
    return {
      h: Number.parseInt(match[1], 10),
      s: Number.parseFloat(match[2]),
      l: Number.parseFloat(match[3]),
      a: match[4] === undefined ? 1 : Number.parseFloat(match[4]),
    };
  }
  return { h: 0, s: 0, l: 0, a: 1 };
}
