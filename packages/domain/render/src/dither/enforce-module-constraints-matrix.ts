import type { QRCodeObject } from "@/modules/qr-generator/cache";
import type { QRGeneratorConfig } from "@/modules/qr-generator/types";
import { shouldLockModule } from "../overlay/should-lock-module";

export function enforceModuleConstraints(
  qr: QRCodeObject,
  matrix: boolean[][],
  moduleCount: number,
  version: number,
  config: QRGeneratorConfig,
): void {
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const qrIsDark = qr.isDark(row, col);
      if (shouldLockModule(row, col, moduleCount, version, config)) {
        matrix[row][col] = qrIsDark;
      }
    }
  }
}
