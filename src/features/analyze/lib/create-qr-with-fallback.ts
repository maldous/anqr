import type { ECCLevel } from '@/modules/qr-analyzer';
import { createQRInstance, optimizeSegments } from '@/modules/qr-encoder';
import type { ValidEncoderMode } from './reproduction-types';
import { buildMaskPatternOption } from './build-mask-pattern-option';

export function createQRWithFallback(
  data: string,
  ecc: ECCLevel,
  version: number,
  effectiveMode: ValidEncoderMode | undefined,
  maskToUse: number | undefined
) {
  try {
    return {
      qr: createQRInstance(data, ecc, version, {
        ...(effectiveMode ? { mode: effectiveMode } : {}),
        ...buildMaskPatternOption(maskToUse),
      }),
      actualVersionUsed: version,
    };
  } catch (encoderError) {
    const errorMessage =
      encoderError instanceof Error ? encoderError.message : String(encoderError);
    if (!errorMessage.includes('overflow')) {
      throw encoderError;
    }

    const segments = optimizeSegments(data);
    const canUseMixed =
      segments.length > 1 || (segments.length === 1 && segments[0].mode !== 'byte');
    if (canUseMixed) {
      try {
        return {
          qr: createQRInstance(data, ecc, version, {
            mode: 'mixed',
            ...buildMaskPatternOption(maskToUse),
          }),
          actualVersionUsed: version,
        };
      } catch {
        // fall through
      }
    }

    for (let nextVersion = version + 1; nextVersion <= 40; nextVersion += 1) {
      try {
        return {
          qr: createQRInstance(data, ecc, nextVersion, {
            mode: 'mixed',
            ...buildMaskPatternOption(maskToUse),
          }),
          actualVersionUsed: nextVersion,
        };
      } catch {
        // try next
      }
    }

    throw new Error(`Data too large: cannot fit in any QR version (1-40) with ECC ${ecc}`);
  }
}
