import type { QRGeneratorConfig } from '../../../../modules/qr-generator/types';
import type { DitherDotParams } from '../scaled-render-types';

export function computeDitherDotParams(
  config: QRGeneratorConfig,
  subPixelSize: number
): DitherDotParams {
  const defaultDotMin = subPixelSize * 0.14;
  const defaultDotMax = subPixelSize * 0.62;
  const dotMinRadiusPx = Math.max(
    0.02,
    Math.min(subPixelSize * 0.42, config.dotMinRadiusPx ?? defaultDotMin)
  );
  const dotMaxRadiusPx = Math.max(
    dotMinRadiusPx + Math.max(0.01, subPixelSize * 0.08),
    Math.min(subPixelSize * 0.78, config.dotMaxRadiusPx ?? defaultDotMax)
  );
  const qrFirstLightBoost = config.qrFirstMode ? 1.3 : 1;
  return {
    dotMinRadiusPx,
    dotMaxRadiusPx,
    lightGrainDensity: Math.max(
      0,
      Math.min(0.025, (config.lightGrainDensity ?? 0.004) * qrFirstLightBoost)
    ),
    lightGrainAlpha: Math.max(
      0,
      Math.min(0.1, (config.lightGrainAlpha ?? 0.05) * (config.qrFirstMode ? 1.15 : 1))
    ),
    seed: config.seed ?? 1337,
  };
}
