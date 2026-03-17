import type { SafetyMode } from "./safety-mode";

export interface SafetyOptions {
  mode: SafetyMode;
  minModulePx: number;
  minQuietZoneModules: number;
  maxOverlayIntensity: number;
}
