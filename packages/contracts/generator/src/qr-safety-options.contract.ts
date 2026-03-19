import type { ECCLevel } from "./ecc-level.contract";
import type { SafetyMode } from "./safety-mode.contract";

export interface QRSafetyOptions {
  mode: SafetyMode;
  minModulePx: number;
  minQuietZoneModules: number;
  lockFinders: boolean;
  lockTiming: boolean;
  lockAlign: boolean;
  lockFormat: boolean;
  lockVersion: boolean;
  maxOverlayIntensityByEcc: Record<ECCLevel, number>;
}
