import type { QRGeneratorConfig } from "../generator-types";

export function applyPaletteColor(
  row: number,
  col: number,
  moduleCount: number,
  brightness: number,
  palette: string[],
  config: QRGeneratorConfig,
): string {
  if (!palette || palette.length === 0) return config.fgColor;

  const paletteMode = config.paletteMode || "position";

  switch (paletteMode) {
    case "brightness": {
      const idx = Math.floor((1 - brightness) * (palette.length - 0.01));
      return palette[Math.max(0, Math.min(palette.length - 1, idx))];
    }
    case "diagonal": {
      const diag = (row + col) / (moduleCount * 2);
      const idx = Math.floor(diag * palette.length) % palette.length;
      return palette[idx];
    }
    case "radial": {
      const cx = moduleCount / 2;
      const cy = moduleCount / 2;
      const dist = Math.hypot(row - cy, col - cx);
      const maxDist = Math.hypot(cx, cy);
      const idx = Math.floor((dist / maxDist) * palette.length) % palette.length;
      return palette[idx];
    }
    case "random": {
      const hash = ((row * 31 + col) * 17) % palette.length;
      return palette[hash];
    }
    case "row": {
      const idx = Math.floor((row / moduleCount) * palette.length) % palette.length;
      return palette[idx];
    }
    case "column": {
      const idx = Math.floor((col / moduleCount) * palette.length) % palette.length;
      return palette[idx];
    }
    default: {
      const linearPos = row * moduleCount + col;
      const idx = linearPos % palette.length;
      return palette[idx];
    }
  }
}
