import { QRMode } from '../../../modules/qr-encoder/types';
import { getLengthInBits } from '../encode/utils';
import { type ECCLevel, getRSBlockInfo } from './bit-mapping';
import type { OptimalVersionAndSuffix } from './rs-basis.types';
import { MIN_QART_VERSION } from './min-qart-version';
import { evaluateVersionCapacity, log } from './rs-basis._internal';

/**
 * Calculate the optimal QR version and suffix length to achieve a target control percentage.
 *
 * This function will automatically upgrade to a larger QR version if the minimum version
 * doesn't provide enough capacity for meaningful QR-Art control.
 *
 * Uses byte-mode encoding for the entire data (prefix + '#' + suffix).
 * Byte mode allows ANY bit pattern to decode as a valid byte, which is essential
 * for QR-Art: vectors can flip arbitrary bits without producing invalid encodings.
 * (Numeric mode would reject ~90% of vectors because 10-bit groups exceed 999.)
 *
 * The suffix uses URL-safe characters (A-Za-z0-9) with '#' as separator.
 *
 * The algorithm:
 * 1. Start with the minimum version that fits the data
 * 2. Calculate max suffix length using byte mode (8 bits/char)
 * 3. If control percentage is below minimum threshold, upgrade version and repeat
 * 4. Return the selected version with its FULL suffix capacity
 *
 * @param minVersion Minimum version (0 for auto, or user-specified minimum)
 * @param ecc Error correction level
 * @param dataLength Length of original data (without suffix)
 * @param minControlPercent Minimum control percentage required (default: 50%). Upgrade version if below this.
 * @returns Optimal version and suffix configuration (always uses FULL capacity)
 */
export function calculateOptimalVersionAndSuffix(
  minVersion: number,
  ecc: ECCLevel,
  dataLength: number,
  minControlPercent: number = 50,
  suffixMode: 'numeric' | 'byte' = 'byte'
): OptimalVersionAndSuffix {
  // Find the minimum version that can fit the data
  // Enforce MIN_QART_VERSION for reliable real-world scanning
  let startVersion = minVersion > 0 ? minVersion : 1;

  // Find smallest version that fits the data + '#' separator
  // Single byte-mode segment: mode(4) + charCount + (data + '#') * 8 + terminator(4)
  for (let v = startVersion; v <= 40; v++) {
    const blocks = getRSBlockInfo(v, ecc);
    const capacityBits = blocks.reduce((sum, b) => sum + b.dataCount, 0) * 8;
    const byteCharCountBits = getLengthInBits(QRMode.MODE_8BIT_BYTE, v);
    const minBitsNeeded = 4 + byteCharCountBits + (dataLength + 1) * 8 + 4;
    if (capacityBits >= minBitsNeeded) {
      startVersion = v;
      break;
    }
  }

  const originalVersion = startVersion;

  // Calculate control percentage for each version from startVersion upward
  // We look for the first version that achieves minimum threshold, then use its FULL capacity
  // Cap at version 15 to avoid unnecessarily large QR codes (can go higher if needed)
  const maxVersionToTry = Math.min(40, Math.max(startVersion + 10, 15));

  let selectedVersion = startVersion;
  let selectedSuffixLength = 0;
  let selectedControlPercent = 0;
  let selectedCapacity = 0;
  let selectedPaddingBytes = 0;
  let selectedSuffixBits = 0;
  let selectedPaddingBits = 0;

  let bestVersion = startVersion;
  let bestSuffixLength = 0;
  let bestControlPercent = 0;
  let bestCapacity = 0;
  let bestPaddingBytes = 0;
  let bestSuffixBits = 0;
  let bestPaddingBits = 0;

  for (let version = startVersion; version <= maxVersionToTry; version++) {
    const metrics = evaluateVersionCapacity(version, ecc, dataLength, suffixMode);
    if (!metrics) continue;

    const {
      controlPercent,
      actualSuffixLen,
      suffixCharCount,
      paddingBytes,
      suffixSafeBits,
      paddingBitsVal,
      totalDataBytes,
    } = metrics;

    log.debug('Evaluating version for QR-Art (suffix mode)', {
      version,
      totalDataBytes,
      suffixCharCount,
      actualSuffixLen,
      paddingBytes,
      controllableBits: metrics.controllableBits,
      suffixSafeBits,
      paddingBits: paddingBitsVal,
      controlPercent: `${controlPercent.toFixed(1)}%`,
      meetsThreshold: controlPercent >= minControlPercent,
    });

    if (controlPercent > bestControlPercent) {
      bestVersion = version;
      bestSuffixLength = actualSuffixLen;
      bestControlPercent = controlPercent;
      bestCapacity = totalDataBytes;
      bestPaddingBytes = paddingBytes;
      bestSuffixBits = suffixSafeBits;
      bestPaddingBits = paddingBitsVal;
    }

    if (controlPercent >= minControlPercent && selectedVersion === startVersion) {
      selectedVersion = version;
      selectedSuffixLength = actualSuffixLen;
      selectedControlPercent = controlPercent;
      selectedCapacity = totalDataBytes;
      selectedPaddingBytes = paddingBytes;
      selectedSuffixBits = suffixSafeBits;
      selectedPaddingBits = paddingBitsVal;

      log.info('Selected version meets minimum control threshold (suffix mode)', {
        version,
        controlPercent: `${controlPercent.toFixed(1)}%`,
        minThreshold: `${minControlPercent}%`,
        suffixLength: actualSuffixLen,
        suffixCharCount,
        paddingBytes,
        totalCapacity: totalDataBytes,
      });
      break;
    }
  }

  // If no version met threshold, use the best one found (highest control %)
  if (selectedSuffixLength === 0) {
    selectedVersion = bestVersion;
    selectedSuffixLength = bestSuffixLength;
    selectedControlPercent = bestControlPercent;
    selectedCapacity = bestCapacity;
    selectedPaddingBytes = bestPaddingBytes;
    selectedSuffixBits = bestSuffixBits;
    selectedPaddingBits = bestPaddingBits;

    log.warn('No version achieved minimum control threshold, using best available', {
      bestVersion,
      bestControlPercent: `${bestControlPercent.toFixed(1)}%`,
      minThreshold: `${minControlPercent}%`,
      suffixLength: bestSuffixLength,
      paddingBytes: bestPaddingBytes,
    });
  }

  const versionUpgraded = selectedVersion > originalVersion;

  log.info('Calculated optimal version and suffix for QR-Art (suffix mode)', {
    originalVersion,
    selectedVersion,
    versionUpgraded,
    suffixLength: selectedSuffixLength,
    paddingBytes: selectedPaddingBytes,
    expectedControlPercent: `${selectedControlPercent.toFixed(1)}%`,
    minControlPercent: `${minControlPercent}%`,
    thresholdAchieved: selectedControlPercent >= minControlPercent,
    totalCapacity: selectedCapacity,
    dataLength,
    ecc,
    encoding: suffixMode === 'numeric' ? 'mixed (byte + numeric)' : 'byte mode (single segment)',
    controllableBits: {
      suffix: selectedSuffixBits,
      padding: selectedPaddingBits,
      total: selectedSuffixBits + selectedPaddingBits,
    },
  });

  return {
    version: selectedVersion,
    suffixLength: selectedSuffixLength,
    totalCapacity: selectedCapacity,
    expectedControlPercent: selectedControlPercent,
    versionUpgraded,
    originalVersion,
    paddingBytes: selectedPaddingBytes,
    suffixBits: selectedSuffixBits,
    paddingBits: selectedPaddingBits,
  };
}
