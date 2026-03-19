import type { VectorModuleStyle } from "../exporter/types";

/**
 * Generate SVG path for a single module with styling
 */
export function generateModulePath(
  x: number,
  y: number,
  size: number,
  style: VectorModuleStyle,
  cornerRadius: number,
): string {
  const r = (cornerRadius / 100) * (size / 2);

  switch (style) {
    case "rounded": {
      if (r <= 0) return `M${x},${y}h${size}v${size}h${-size}Z`;
      return (
        `M${x + r},${y}` +
        `h${size - 2 * r}` +
        `a${r},${r} 0 0 1 ${r},${r}` +
        `v${size - 2 * r}` +
        `a${r},${r} 0 0 1 ${-r},${r}` +
        `h${-(size - 2 * r)}` +
        `a${r},${r} 0 0 1 ${-r},${-r}` +
        `v${-(size - 2 * r)}` +
        `a${r},${r} 0 0 1 ${r},${-r}Z`
      );
    }
    case "dots": {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const radius = (size / 2) * 0.85;
      return (
        `M${cx - radius},${cy}` +
        `a${radius},${radius} 0 1 0 ${radius * 2},0` +
        `a${radius},${radius} 0 1 0 ${-radius * 2},0Z`
      );
    }
    case "diamond": {
      const half = size / 2;
      return `M${x + half},${y}l${half},${half}l${-half},${half}l${-half},${-half}Z`;
    }
    case "connected": {
      return `M${x},${y}h${size}v${size}h${-size}Z`;
    }
    default:
      return `M${x},${y}h${size}v${size}h${-size}Z`;
  }
}
