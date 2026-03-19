import type { InterstitialRuntime } from "./generator-runtime.types";
import { requireGeneratorRuntime } from "./require-generator-runtime";

export function getInterstitialRuntime(): InterstitialRuntime {
  return requireGeneratorRuntime().interstitials;
}
