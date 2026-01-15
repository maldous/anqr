import {hist} from '../shared';
import { buildHistogramFromLuma } from '../luma/buildHistogramFromLuma';
import { otsuThresholdFromHistogram } from '../luma/otsuThresholdFromHistogram';

export function otsuThresholdFromLuma(luma: Uint8Array): number {
  const hist = buildHistogramFromLuma(luma);
  return otsuThresholdFromHistogram(hist, luma.length);
}

