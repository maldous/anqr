export interface AnalysisWarning {
  type: "contrast" | "module_size" | "quiet_zone" | "overlay_intensity" | "style";
  message: string;
  severity: "low" | "medium" | "high";
}
