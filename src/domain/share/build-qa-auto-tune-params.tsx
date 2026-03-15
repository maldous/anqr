import type { ShareConfig } from './types';

export function buildQAAutoTuneParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.qaContrastCheck) params.set('qaContrast', '1');
  if (config.qaSimulateBlur && config.qaSimulateBlur !== 0)
    params.set('qaBlur', config.qaSimulateBlur.toString());
  if (config.qaSimulateNoise && config.qaSimulateNoise !== 0)
    params.set('qaNoise', config.qaSimulateNoise.toString());
  if (config.qaSimulateRotation && config.qaSimulateRotation !== 0)
    params.set('qaRot', config.qaSimulateRotation.toString());
  if (config.qaShowHeatmap) params.set('qaHeatmap', '1');
  if (config.autoPickVersion === false) params.set('autoVer', '0');
  if (config.autoPickEcc) params.set('autoEcc', '1');
  if (config.autoReduceIntensity) params.set('autoReduce', '1');
}
