// ============================================
// GRADIENT TYPES
// ============================================

export interface GradientStop {
  pos: number;
  color: string;
}

export type GradientType = 'none' | 'linear' | 'radial' | 'conic';

export interface GradientConfig {
  type: GradientType;
  angle?: number;
  stops: GradientStop[];
}
