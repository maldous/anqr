import { mapImageToTargetsSupersampled } from "../../domain/qr/qart/image-utils";
import { type ECCLevel, qrcode } from "../qr-encoder";
import { createLogger } from "../../infra/logging/logger";
import { evaluateQRMatch } from "./evaluate-qr-match";
import type { FragmentSearchState } from "./types";

const log = createLogger("QART");

export function tryFragmentCandidate(
  baseUrl: string,
  fragment: string,
  version: number,
  ecc: ECCLevel,
  maskPattern: number,
  targetImage: ImageData | HTMLCanvasElement | OffscreenCanvas,
  state: FragmentSearchState,
  iterationIndex: number,
): void {
  const testUrl = `${baseUrl}#${fragment}`;
  const qr = qrcode(version, ecc);
  qr.addData(testUrl);
  qr.make(maskPattern >= 0 ? maskPattern : undefined);
  const moduleCount = qr.getModuleCount();

  if (!state.targets || moduleCount !== state.cachedModuleCount) {
    const mapped = mapImageToTargetsSupersampled(targetImage, moduleCount);
    state.targets = mapped.targets;
    state.importance = mapped.importance;
    state.cachedModuleCount = moduleCount;
  }

  const actualVersion = version > 0 ? version : Math.ceil((moduleCount - 17) / 4);
  const { score, matchingModules, totalControllable } = evaluateQRMatch(
    (row, col) => qr.isDark(row, col),
    moduleCount,
    actualVersion,
    state.targets!,
    state.importance!,
  );

  if (score > state.bestScore) {
    state.bestScore = score;
    state.bestFragment = fragment;
    state.bestMatchingModules = matchingModules;
    state.bestTotalControllable = totalControllable;
    log.debug("New best fragment", {
      fragment,
      score: `${(score * 100).toFixed(1)}%`,
      iteration: iterationIndex,
    });
  }
}
