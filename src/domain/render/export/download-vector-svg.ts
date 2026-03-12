import { Capacitor } from '@capacitor/core';
import type { VectorSvgConfig } from '../../../modules/exporter/types';
import { downloadUrl } from '../../../modules/exporter/utils';
import { exportVectorSvg } from './export-vector-svg';

/**
 * Download QR matrix as true vector SVG
 */
export function downloadVectorSvg(matrix: boolean[][], config: VectorSvgConfig = {}): void {
  const result = exportVectorSvg(matrix, config);
  downloadUrl(result.url, result.filename, result.blob);
  if (!Capacitor.isNativePlatform()) {
    URL.revokeObjectURL(result.url);
  }
}
