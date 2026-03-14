import { createQRInstance } from '@/modules/qr-encoder';

export function buildRegenMatrix(
  qr: ReturnType<typeof createQRInstance>,
  moduleCount: number
): boolean[][] {
  return Array.from({ length: moduleCount }, (_, row) =>
    Array.from({ length: moduleCount }, (_, col) => qr.isDark(row, col))
  );
}
