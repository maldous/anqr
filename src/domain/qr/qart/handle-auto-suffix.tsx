import type { ECCLevel } from './bit-mapping';
import {
  calculateOptimalVersionAndSuffix,
  generateDeterministicNumericSuffix,
  generateDeterministicSuffix,
  hashStringToSeed,
} from './rs-basis';
import { log } from './log';

export function handleAutoSuffix(
  data: string,
  ecc: ECCLevel,
  prefix: string,
  resolvedSuffixMode: 'numeric' | 'byte',
  originalDataLength: number,
  versionToUse: number,
  targetControlPercent: number,
  lockVersionToMinimum: boolean
): { actualSuffix: string; encodedData: string; optimalVersion: number } {
  const controlTarget = lockVersionToMinimum || versionToUse > 0 ? 0 : targetControlPercent;
  const optimalConfig = calculateOptimalVersionAndSuffix(
    versionToUse,
    ecc,
    originalDataLength,
    controlTarget,
    resolvedSuffixMode
  );
  const seed = hashStringToSeed(data + optimalConfig.version.toString() + ecc);

  let actualSuffix: string;
  let encodedData: string;
  if (resolvedSuffixMode === 'numeric') {
    const suffixDigits = Math.max(0, optimalConfig.suffixLength);
    actualSuffix = generateDeterministicNumericSuffix(suffixDigits, seed);
    encodedData = prefix + actualSuffix;
  } else {
    const suffixCharCount = Math.max(0, optimalConfig.suffixLength - 1);
    actualSuffix = `#${generateDeterministicSuffix(suffixCharCount, seed)}`;
    encodedData = data + actualSuffix;
  }

  log.info('Auto-generated DETERMINISTIC suffix for HYBRID QR-Art', {
    originalDataLength,
    suffixLength: actualSuffix.length,
    suffixPreview: actualSuffix.slice(0, 30) + (actualSuffix.length > 30 ? '...' : ''),
    encoding:
      resolvedSuffixMode === 'numeric' ? 'mixed (byte + numeric)' : 'byte mode (single segment)',
    optimalVersion: optimalConfig.version,
    versionToUse,
    expectedControlPercent: `${optimalConfig.expectedControlPercent.toFixed(1)}%`,
    versionUpgraded: optimalConfig.versionUpgraded,
    paddingBytes: optimalConfig.paddingBytes,
    controllableBits: {
      suffix: optimalConfig.suffixBits,
      padding: optimalConfig.paddingBits,
      total: optimalConfig.suffixBits + optimalConfig.paddingBits,
    },
    seedUsed: seed,
    lockVersionToMinimum,
  });

  return { actualSuffix, encodedData, optimalVersion: optimalConfig.version };
}
