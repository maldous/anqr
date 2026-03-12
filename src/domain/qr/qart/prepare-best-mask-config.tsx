import { calculateOptimalVersionAndSuffix } from './rs-basis';
import { log } from './log-2';
import { resolveSharedSuffix } from './resolve-shared-suffix';
import type { FullQArtConfig } from './generate.types';

export function prepareBestMaskConfig(config: Omit<FullQArtConfig, 'maskPattern'>): {
  resolvedSuffixMode: 'numeric' | 'byte';
  sharedVersion: number;
  sharedSuffix: string;
} {
  const targetControlPercent = config.targetControlPercent ?? 100;
  const resolvedSuffixMode: 'numeric' | 'byte' =
    config.suffixMode === 'numeric'
      ? 'numeric'
      : config.suffixMode === 'byte'
        ? 'byte'
        : /^https?:\/\//i.test(config.data)
          ? 'numeric'
          : 'byte';

  const requestedVersion = config.forceVersion ?? config.version;
  const controlTarget =
    config.lockVersionToMinimum || (requestedVersion ?? 0) > 0 ? 0 : targetControlPercent;

  const optimalConfig = calculateOptimalVersionAndSuffix(
    requestedVersion,
    config.ecc,
    config.data.length,
    controlTarget,
    resolvedSuffixMode
  );

  const sharedVersion = config.forceVersion ?? optimalConfig.version;
  const sharedSuffix = resolveSharedSuffix(
    config,
    resolvedSuffixMode,
    optimalConfig.suffixLength,
    sharedVersion
  );

  log.info('Pre-selected version and DETERMINISTIC suffix for mask comparison (HYBRID mode)', {
    sharedVersion,
    originalDataLength: config.data.length,
    suffixLength: sharedSuffix.length,
    paddingBytes: optimalConfig.paddingBytes,
    expectedControlPercent: `${optimalConfig.expectedControlPercent.toFixed(1)}%`,
    encoding:
      resolvedSuffixMode === 'numeric' ? 'mixed (byte + numeric)' : 'byte mode (single segment)',
    lockVersionToMinimum: config.lockVersionToMinimum,
    note: 'Each mask will use the same DETERMINISTIC suffix for fair comparison',
  });

  return { resolvedSuffixMode, sharedVersion, sharedSuffix };
}
