import type { FullQArtConfig, FullQArtResult } from './generate.types';
import { generateFullQArtBestMask } from './generate-full-q-art-best-mask';

/**
 * Generate QR-Art with optimal settings (best mask, rotation, etc.)
 */
export async function generateFullQArtOptimal(
  config: Omit<FullQArtConfig, 'maskPattern'>
): Promise<FullQArtResult> {
  const attempts = Math.max(1, Math.min(8, Math.floor(config.searchAttempts ?? 1)));
  if (attempts === 1) {
    return generateFullQArtBestMask(config);
  }

  let bestResult: FullQArtResult | null = null;
  let lastFailure: FullQArtResult | null = null;
  const baseSearchSeed = config.searchSeed ?? 0;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const attemptSeed = (baseSearchSeed + Math.imul(attempt + 1, 0x9e3779b1)) >>> 0;
    const result = await generateFullQArtBestMask({
      ...config,
      searchAttempts: 1,
      searchSeed: attemptSeed,
      onProgress: (stage, percent) => {
        const scaledPercent = Math.trunc((attempt * 100 + percent) / attempts);
        config.onProgress?.(`Attempt ${attempt + 1}/${attempts}: ${stage}`, scaledPercent);
      },
    });

    if (result.success) {
      if (!bestResult || result.matchPercentage > bestResult.matchPercentage) {
        bestResult = result;
      }
    } else {
      lastFailure = result;
    }
  }

  if (bestResult) {
    config.onProgress?.('Complete', 100);
    return bestResult;
  }

  return (
    lastFailure ?? {
      success: false,
      error: 'All search attempts failed',
      matrix: [],
      moduleCount: 0,
      version: 0,
      maskPattern: 0,
      matchingPixels: 0,
      totalControllable: 0,
      matchPercentage: 0,
      encodedData: config.data,
      originalData: config.data,
      suffix: '',
    }
  );
}
