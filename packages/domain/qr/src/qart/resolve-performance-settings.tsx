import type { QArtPerformanceSettings } from "./q-art-performance-settings";
import type { QArtPerformanceProfile } from "./generate.types";

export function resolvePerformanceSettings(
  profile: QArtPerformanceProfile,
): QArtPerformanceSettings {
  if (profile === "quality") {
    return {
      supersampleLevel: 3,
      maxCandidateFraction: 1,
      maxDarkSpeckleArea: 2,
      maxLightHoleArea: 2,
    };
  }

  return {
    supersampleLevel: 1,
    maxCandidateFraction: 0.25,
    maxDarkSpeckleArea: 2,
    maxLightHoleArea: 2,
  };
}
