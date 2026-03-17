import type { FullQArtConfig, FullQArtResult } from "./generate.types";
import { checkBalancedMaskEarlyExit } from "./check-balanced-mask-early-exit";
import { log } from "./log";
import { prepareBestMaskConfig } from "./prepare-best-mask-config";
import { generateFullQArt } from "./generate-full-q-art";

export async function generateFullQArtBestMask(
  config: Omit<FullQArtConfig, "maskPattern">,
): Promise<FullQArtResult> {
  let bestResult: FullQArtResult | null = null;
  const performanceProfile = config.performanceProfile ?? "quality";
  let masksWithoutMeaningfulGain = 0;
  let lastBestMatch = -1;

  const { resolvedSuffixMode, sharedVersion, sharedSuffix } = prepareBestMaskConfig(config);

  for (let mask = 0; mask < 8; mask++) {
    const result = await generateFullQArt({
      ...config,
      forceVersion: sharedVersion,
      suffix: sharedSuffix,
      suffixMode: resolvedSuffixMode,
      autoSuffix: false,
      maskPattern: mask,
      strictSuffix: config.strictSuffix ?? true,
      onProgress: (stage, percent) => {
        config.onProgress?.(`Mask ${mask}: ${stage}`, (mask * 100 + percent) / 8);
      },
    });

    if (result.success) {
      if (!bestResult || result.matchPercentage > bestResult.matchPercentage) {
        bestResult = result;
      }
    }

    if (performanceProfile !== "balanced" || !bestResult) continue;

    const earlyExit = checkBalancedMaskEarlyExit(
      bestResult,
      lastBestMatch,
      masksWithoutMeaningfulGain,
      mask,
    );
    masksWithoutMeaningfulGain = earlyExit.masksWithoutMeaningfulGain;
    lastBestMatch = bestResult.matchPercentage;
    if (earlyExit.shouldExit) break;
  }

  if (!bestResult) {
    return {
      success: false,
      error: "All mask patterns failed",
      matrix: [],
      moduleCount: 0,
      version: 0,
      maskPattern: 0,
      matchingPixels: 0,
      totalControllable: 0,
      matchPercentage: 0,
      encodedData:
        resolvedSuffixMode === "numeric"
          ? `${config.data.split("#")[0]}#${sharedSuffix}`
          : config.data + sharedSuffix,
      originalData: config.data,
      suffix: sharedSuffix,
    };
  }

  log.info("Best mask pattern selected", {
    maskPattern: bestResult.maskPattern,
    matchPercentage: `${bestResult.matchPercentage.toFixed(1)}%`,
  });

  return bestResult;
}
