import type { GradientStop } from "./gradient-stop.contract";
import type { GradientType } from "./gradient-type.contract";

export interface GradientConfig {
  type: GradientType;
  angle?: number;
  stops: GradientStop[];
}
