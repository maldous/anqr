import type { RGB } from "@/modules/core/types";
import type { GradientStop } from "./gradient.types";
import { getGradientColor } from "./get-gradient-color";

/**
 * Get gradient color at position (simplified interface)
 */
export function getGradientColorAt(stops: GradientStop[], position: number): RGB {
  return getGradientColor({ type: "linear", stops }, position);
}
