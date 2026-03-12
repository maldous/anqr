import type { QRGeneratorConfig } from './types';

export function buildStrictConstraintConfig(
  config: QRGeneratorConfig,
  scanGateActive: boolean,
  intensity: number
): QRGeneratorConfig {
  return {
    ...config,
    darkMinOccupancy: Math.max(
      config.darkMinOccupancy ?? 0,
      (scanGateActive ? 0.56 : 0.52) + intensity * 0.08
    ),
    lightMaxOccupancy: Math.min(
      config.lightMaxOccupancy ?? 1,
      (scanGateActive ? 0.44 : 0.48) - intensity * 0.08
    ),
    optimizeIterations: Math.max(config.optimizeIterations ?? 0, scanGateActive ? 10 : 8),
  };
}
