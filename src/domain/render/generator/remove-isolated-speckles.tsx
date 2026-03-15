import type { QRCodeInstance, QRGeneratorConfig } from './types';
import { pixelIndex } from './pixel-index';
import { shouldLockModule } from './should-lock-module';
import { countSameNeighbors } from './count-same-neighbors';

export function removeIsolatedSpeckles(
  qr: QRCodeInstance,
  matrixBits: Uint8Array,
  scaledSize: number,
  moduleCount: number,
  scale: number,
  version: number,
  config: QRGeneratorConfig
): void {
  const copy = matrixBits.slice();
  for (let y = 1; y < scaledSize - 1; y++) {
    for (let x = 1; x < scaledSize - 1; x++) {
      const mr = Math.floor(y / scale);
      const mc = Math.floor(x / scale);
      if (
        mr < 0 ||
        mc < 0 ||
        mr >= moduleCount ||
        mc >= moduleCount ||
        shouldLockModule(mr, mc, moduleCount, version, config)
      ) {
        continue;
      }
      const currentIdx = pixelIndex(x, y, scaledSize);
      const current = copy[currentIdx];
      if (countSameNeighbors(copy, x, y, scaledSize, current) <= 1) {
        matrixBits[currentIdx] = qr.isDark(mr, mc) ? 1 : 0;
      }
    }
  }
}
