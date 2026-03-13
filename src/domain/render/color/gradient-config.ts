import type { GradientStop } from './gradient.types';
import type { GradientType } from './gradient-type';

export interface GradientConfig {
  type: GradientType;
  angle?: number;
  stops: GradientStop[];
}
