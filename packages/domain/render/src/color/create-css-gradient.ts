import type { GradientConfig } from "./gradient-config";

/**
 * Create CSS gradient string from config
 */
export function createCssGradient(config: GradientConfig): string {
  if (config.type === "none" || !config.stops || config.stops.length === 0) {
    return "transparent";
  }

  const stopsStr = config.stops.map((s) => `${s.color} ${s.pos * 100}%`).join(", ");

  switch (config.type) {
    case "linear":
      return `linear-gradient(${config.angle ?? 0}deg, ${stopsStr})`;
    case "radial":
      return `radial-gradient(circle, ${stopsStr})`;
    case "conic":
      return `conic-gradient(from ${config.angle ?? 0}deg, ${stopsStr})`;
    default:
      return "transparent";
  }
}
