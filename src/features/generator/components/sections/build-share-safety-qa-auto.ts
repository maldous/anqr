import type { StoreState } from './share-config-store-state.type';

export function buildShareSafetyQaAuto(
  safety: StoreState['safety'],
  qa: StoreState['qa'],
  auto: StoreState['auto'],
  watermark: StoreState['watermark'],
  metadata: StoreState['metadata']
) {
  return {
    safetyMode: safety.mode === 'off' ? undefined : safety.mode,
    safetyMinModulePx:
      safety.mode !== 'off' && safety.minModulePx !== 2 ? safety.minModulePx : undefined,
    safetyMinQuietZone:
      safety.mode !== 'off' && safety.minQuietZoneModules !== 4
        ? safety.minQuietZoneModules
        : undefined,
    lockFinders: safety.mode !== 'off' && !safety.lockFinders ? false : undefined,
    lockTiming: safety.mode !== 'off' && !safety.lockTiming ? false : undefined,
    lockAlign: safety.mode !== 'off' && !safety.lockAlign ? false : undefined,
    lockFormat: safety.mode !== 'off' && !safety.lockFormat ? false : undefined,
    lockVersion: safety.mode !== 'off' && !safety.lockVersion ? false : undefined,
    qaContrastCheck: qa.contrastCheck ? true : undefined,
    qaSimulateBlur: qa.simulateBlurPx === 0 ? undefined : qa.simulateBlurPx,
    qaSimulateNoise: qa.simulateNoise === 0 ? undefined : qa.simulateNoise,
    qaSimulateRotation: qa.simulateRotationDeg === 0 ? undefined : qa.simulateRotationDeg,
    qaShowHeatmap: qa.showHeatmap ? true : undefined,
    autoPickVersion: auto.pickVersion === false ? false : undefined,
    autoPickEcc: auto.pickEcc ? true : undefined,
    autoReduceIntensity: auto.reduceIntensityUntilSafe ? true : undefined,
    watermarkEnabled: watermark.enabled ? true : undefined,
    watermarkKind: watermark.enabled && watermark.kind !== 'text' ? watermark.kind : undefined,
    watermarkText:
      watermark.enabled && watermark.kind === 'text' && watermark.text ? watermark.text : undefined,
    watermarkPosition:
      watermark.enabled && watermark.position !== 'center' ? watermark.position : undefined,
    watermarkOpacity: watermark.enabled && watermark.opacity !== 50 ? watermark.opacity : undefined,
    watermarkBlend: watermark.enabled && watermark.blend !== 'normal' ? watermark.blend : undefined,
    metaTitle: metadata.title || undefined,
    metaAuthor: metadata.author || undefined,
    metaCopyright: metadata.copyright || undefined,
    metaLicense: metadata.license || undefined,
    metaDescription: metadata.description || undefined,
    metaCreationTime: metadata.creationTime ? true : undefined,
    metaCustomKv: metadata.customKv.length > 0 ? JSON.stringify(metadata.customKv) : undefined,
  };
}
