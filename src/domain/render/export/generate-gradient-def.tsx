import type { VectorGradient } from "../../../modules/exporter/types";

/**
 * Generate gradient definition for SVG
 */
export function generateGradientDef(gradient: VectorGradient, id: string): string {
  if (gradient.type === "none" || !gradient.stops?.length) return "";

  const stops = gradient.stops
    .map((s) => `<stop offset="${s.pos * 100}%" stop-color="${s.color}"/>`)
    .join("");

  switch (gradient.type) {
    case "linear": {
      const angle = gradient.angle ?? 0;
      const rad = (angle * Math.PI) / 180;
      const x1 = 50 - Math.cos(rad) * 50;
      const y1 = 50 - Math.sin(rad) * 50;
      const x2 = 50 + Math.cos(rad) * 50;
      const y2 = 50 + Math.sin(rad) * 50;
      return `<linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`;
    }
    case "radial":
    case "conic":
      return `<radialGradient id="${id}" cx="50%" cy="50%" r="70%">${stops}</radialGradient>`;
    default:
      return "";
  }
}
