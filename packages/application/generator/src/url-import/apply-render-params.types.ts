export interface GradientUpdate {
  type: "none" | "linear" | "radial" | "conic";
  stops?: Array<{ pos: number; color: string }>;
  angle?: number;
}
