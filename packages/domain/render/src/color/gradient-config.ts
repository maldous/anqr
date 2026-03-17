import type { GradientStop } from "./gradient-stop";
import type { GradientType } from "./gradient.types";

export interface GradientConfig {
  type: GradientType;
  angle?: number;
  stops: GradientStop[];
}
