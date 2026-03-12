import type { ECCLevel } from './bit-mapping';
import { calculateVersionForSlack } from './semantic-layout';
import { log } from './log-2';
import { resolveQArtVersion } from './resolve-q-art-version';
import { handleUserProvidedSuffix } from './handle-user-provided-suffix';
import { handleAutoSuffix } from './handle-auto-suffix';
import { resolvePrefixAndSuffixMode } from './resolve-prefix-and-suffix-mode';

export function resolveQArtSuffixConfig(config: {
  data: string;
  version: number;
  ecc: ECCLevel;
  suffix?: string;
  suffixMode: 'auto' | 'numeric' | 'byte';
  autoSuffix: boolean;
  minPadCodewords: number;
  forceVersion?: number;
  targetControlPercent: number;
  lockVersionToMinimum: boolean;
}): {
  resolvedSuffixMode: 'numeric' | 'byte';
  encodingSuffixMode: 'numeric' | 'byte';
  encodedData: string;
  actualSuffix: string;
  originalData: string;
  originalDataLength: number;
  versionToUse: number;
  versionWasUpgradedForQArt: boolean;
} {
  const {
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
  } = config;

  const prefixResult = resolvePrefixAndSuffixMode(data, suffixMode);
  let resolvedSuffixMode = prefixResult.resolvedSuffixMode;
  const encodingSuffixMode: 'numeric' | 'byte' = resolvedSuffixMode;
  const prefix = prefixResult.prefix;
  let originalData = prefix;
  let originalDataLength = originalData.length;

  let versionWasUpgradedForQArt = false;
  let encodedData = '';
  let actualSuffix = '';
  let versionToUse: number;

  // Determine the version to use
  const versionResult = resolveQArtVersion(forceVersion, version);
  versionToUse = versionResult.versionToUse;
  versionWasUpgradedForQArt = versionResult.versionWasUpgradedForQArt;

  // Handle suffix generation
  if (suffix !== undefined) {
    const userSuffixResult = handleUserProvidedSuffix(
      suffix,
      resolvedSuffixMode,
      prefix,
      data,
      originalDataLength
    );
    resolvedSuffixMode = userSuffixResult.resolvedSuffixMode;
    actualSuffix = userSuffixResult.actualSuffix;
    encodedData = userSuffixResult.encodedData;
    originalData = userSuffixResult.originalData;
    originalDataLength = userSuffixResult.originalDataLength;
  } else if (autoSuffix) {
    const autoResult = handleAutoSuffix(
      data,
      ecc,
      prefix,
      resolvedSuffixMode,
      originalDataLength,
      versionToUse,
      targetControlPercent,
      lockVersionToMinimum
    );
    actualSuffix = autoResult.actualSuffix;
    encodedData = autoResult.encodedData;
    if (versionToUse === 0) {
      versionToUse = autoResult.optimalVersion;
    }
  } else {
    encodedData = data;
    resolvedSuffixMode = 'byte';
    originalData = data;
    originalDataLength = data.length;
    if (versionToUse === 0) {
      versionToUse = calculateVersionForSlack(data.length, ecc, minPadCodewords);
    }
    log.warn('No suffix - only padding codewords controllable (limited QR-Art control)', {
      originalDataLength,
      versionToUse,
      minPadCodewords,
      note: 'Set autoSuffix=true for better image quality',
    });
  }

  return {
    resolvedSuffixMode,
    encodingSuffixMode,
    encodedData,
    actualSuffix,
    originalData,
    originalDataLength,
    versionToUse,
    versionWasUpgradedForQArt,
  };
}
