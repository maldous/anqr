import { MIN_QART_VERSION } from './rs-basis';
import type { FullQArtConfig, FullQArtResult } from './generate.types';
import { generateFullQArtCore } from './generate-full-q-art-core';
import { log } from './log';
import { resolvePerformanceSettings } from './resolve-performance-settings';
import { resolveQArtSuffixConfig } from './resolve-q-art-suffix-config';

export async function generateFullQArt(config: FullQArtConfig): Promise<FullQArtResult> {
  const {
    data,
    targetImage,
    version,
    ecc,
    maskPattern,
    onProgress,
    suffix,
    suffixMode = 'auto',
    autoSuffix = true, // Default to auto-generating suffix for better control
    minPadCodewords = 10, // Lower default since suffix provides most control
    forceVersion,
    targetControlPercent = 100,
    strictSuffix = true, // Default to true for real-world scannability
    lockVersionToMinimum = false,
    performanceProfile = 'quality',
  } = config;
  const performanceSettings = resolvePerformanceSettings(performanceProfile);

  const suffixConfig = resolveQArtSuffixConfig({
    data,
    version,
    ecc,
    suffix,
    suffixMode,
    autoSuffix,
    minPadCodewords,
    forceVersion,
    targetControlPercent,
    lockVersionToMinimum,
  });

  const {
    resolvedSuffixMode,
    encodingSuffixMode,
    encodedData,
    actualSuffix,
    originalData,
    originalDataLength,
    versionToUse,
    versionWasUpgradedForQArt,
  } = suffixConfig;

  // Log the encoding target (HYBRID mode)
  log.info('QR-Art encoding target (HYBRID STRATEGY)', {
    originalData: originalData.length > 50 ? `${originalData.slice(0, 50)}...` : originalData,
    originalDataLength,
    suffix: actualSuffix.length > 30 ? `${actualSuffix.slice(0, 30)}...` : actualSuffix,
    suffixLength: actualSuffix.length,
    fullEncodedLength: encodedData.length,
    versionToUse,
    versionWasUpgradedForQArt,
    minQArtVersion: MIN_QART_VERSION,
    ecc,
    strictSuffix,
    suffixMode: resolvedSuffixMode,
    strategy: 'HYBRID - original data protected, suffix + padding controllable',
    suffixPolicy: strictSuffix
      ? resolvedSuffixMode === 'numeric'
        ? 'STRICT - numeric suffix digits only'
        : 'STRICT - suffix must contain only URL-safe characters'
      : 'RELAXED - suffix can contain ANY byte values (max QArt control)',
  });

  try {
    return await generateFullQArtCore({
      data,
      targetImage,
      ecc,
      maskPattern,
      onProgress,
      performanceSettings,
      performanceProfile,
      resolvedSuffixMode,
      encodingSuffixMode,
      encodedData,
      actualSuffix,
      originalData,
      originalDataLength,
      versionToUse,
      strictSuffix,
      autoSuffix,
      suffix,
    });
  } catch (error) {
    log.error('QR-Art generation failed', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      matrix: [],
      moduleCount: 0,
      version: 0,
      maskPattern: 0,
      matchingPixels: 0,
      totalControllable: 0,
      matchPercentage: 0,
      encodedData: encodedData,
      originalData: data,
      suffix: actualSuffix,
    };
  }
}
