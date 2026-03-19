import type { GradientStop } from "./gradient-stop.types";
import type { GradientType } from "./gradient-type.types";

export interface GradientConfig {
  type: GradientType;
  angle?: number;
  stops: GradientStop[];
}
