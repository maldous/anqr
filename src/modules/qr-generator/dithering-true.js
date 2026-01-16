/**
 * QR Generator True Dithering Module
 * Applies true dithering to QR matrix based on overlay brightness
 */

/**
 * Apply true dithering to QR matrix based on overlay brightness
 */
export function applyTrueDither(
  qr,
  overlayData,
  config,
  extremeMode,
  isStructuralModule,
  isFinderPattern,
  isEccSafeToModifyFn,
  hashStringFn,
  createSeededRandomFn
) {
  const moduleCount = qr.getModuleCount();
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  // ECC-aware mode tracking
  const eccAware = config.eccAwareEnabled === true;
  let totalModifiedCount = 0;

  // Create a seeded PRNG for deterministic output
  // Seed from content hash + config to ensure same settings = same output
  const seed = config.seed ?? hashStringFn(config.content || '');
  const seededRandom = createSeededRandomFn(seed);

  // Create modifiable pattern - start with original QR
  const modifiedPattern = [];

  for (let row = 0; row < moduleCount; row++) {
    modifiedPattern[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      modifiedPattern[row][col] = qr.isDark(row, col);
    }
  }

  // Count total data modules for ECC budget calculation
  let totalDataModules = 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!isStructuralModule(row, col, moduleCount, version)) {
        totalDataModules++;
      }
    }
  }

  // In extreme mode, flip ALL non-finder modules to match image
  // In normal dither mode, respect error correction limits
  if (extremeMode) {
    // Extreme: flip everything except finder patterns
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Only protect finder patterns (corners)
        if (isFinderPattern(row, col, moduleCount)) continue;

        const brightness = overlayData[row]?.[col] ?? 0.5;
        const intensity = config.overlayIntensity / 100;

        // Desired state based on image
        const desiredDark = brightness < 0.5;

        // ECC-aware check
        if (eccAware && desiredDark !== modifiedPattern[row][col]) {
          if (
            !isEccSafeToModifyFn(
              row,
              col,
              moduleCount,
              version,
              config,
              totalModifiedCount,
              totalDataModules
            )
          ) {
            continue; // Skip this modification
          }
          totalModifiedCount++;
        }

        // Apply with intensity blend using seeded PRNG for determinism
        if (intensity >= 1 || seededRandom() < intensity) {
          modifiedPattern[row][col] = desiredDark;
        }
      }
    }
  } else {
    // Safe dither: respect error correction limits
    const ecCapacity = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };
    const maxFlipRatio = ecCapacity[config.errorCorrection] || 0.25;
    const intensity = config.overlayIntensity / 100;

    let dataModuleCount = 0;
    const flipCandidates = [];

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (isStructuralModule(row, col, moduleCount, version)) continue;
        dataModuleCount++;

        const currentState = qr.isDark(row, col);
        const brightness = overlayData[row]?.[col] ?? 0.5;
        const desiredState = brightness < 0.5;

        if (currentState !== desiredState) {
          flipCandidates.push({
            row,
            col,
            score: Math.abs(brightness - 0.5),
            desiredState,
          });
        }
      }
    }

    // Sort by visual importance and flip up to limit
    flipCandidates.sort((a, b) => b.score - a.score);
    const maxFlips = Math.floor(dataModuleCount * maxFlipRatio * intensity);

    for (let i = 0; i < Math.min(flipCandidates.length, maxFlips); i++) {
      const c = flipCandidates[i];
      modifiedPattern[c.row][c.col] = c.desiredState;
    }
  }

  return modifiedPattern;
}
