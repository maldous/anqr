import { type ECCLevel, qrcode } from '../qr-encoder';
import { getModuleCount } from './pixel-mapping';
import { createSeededRandom } from './create-seeded-random';
import { evaluateQRMatch } from './evaluate-qr-match';
import { fragmentSearchLog as log } from './fragment-search-log';
import { generateRandomFragment } from './generate-random-fragment';
import { getAlignmentPositionsForVersion } from './get-alignment-positions-for-version';
import { isEvalStructuralModule } from './is-eval-structural-module';
import { tryFragmentCandidate } from './try-fragment-candidate';
import type { FragmentSearchConfig, FragmentSearchResult, FragmentSearchState } from './types';
export { evaluateQRMatch } from './evaluate-qr-match';

export async function searchBestFragment(
  config: FragmentSearchConfig
): Promise<FragmentSearchResult> {
  const {
    baseUrl,
    targetImage,
    iterations,
    fragmentLength,
    seed,
    version,
    ecc,
    maskPattern,
    onProgress,
  } = config;
  const rng = createSeededRandom(seed);
  const state: FragmentSearchState = {
    targets: null,
    importance: null,
    cachedModuleCount: 0,
    bestFragment: '',
    bestScore: -1,
    bestMatchingModules: 0,
    bestTotalControllable: 0,
  };

  const batchSize = 50;
  const totalBatches = Math.ceil(iterations / batchSize);
  log.debug('Starting fragment search', { iterations, fragmentLength, baseUrl });

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, iterations);
    for (let i = batchStart; i < batchEnd; i++) {
      const fragment = generateRandomFragment(fragmentLength, rng);
      try {
        tryFragmentCandidate(baseUrl, fragment, version, ecc, maskPattern, targetImage, state, i);
      } catch (err) {
        log.trace('Fragment caused encoding error', { fragment, error: err });
      }
    }
    if (onProgress) onProgress(Math.round(((batch + 1) / totalBatches) * 100));
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const result: FragmentSearchResult = {
    fragment: state.bestFragment,
    url: `${baseUrl}#${state.bestFragment}`,
    score: state.bestScore,
    matchingModules: state.bestMatchingModules,
    totalControllable: state.bestTotalControllable,
    matchPercentage:
      state.bestTotalControllable > 0
        ? (state.bestMatchingModules / state.bestTotalControllable) * 100
        : 0,
  };

  log.info('Fragment search complete', {
    bestFragment: state.bestFragment,
    score: `${(state.bestScore * 100).toFixed(1)}%`,
    matchPercentage: `${result.matchPercentage.toFixed(1)}%`,
    iterations,
  });

  return result;
}

export const qArtFragmentModuleCount = getModuleCount;
