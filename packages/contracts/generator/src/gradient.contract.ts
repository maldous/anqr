import type { GradientStop } from "./gradient-stop.contract";
import type { GradientType } from "./gradient-type.contract";

export interface GradientUpdate {
  type: GradientType;
  stops?: GradientStop[];
  angle?: number;
}
