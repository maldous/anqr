import type { DitherThresholdPattern } from "./dither-threshold-pattern";

export function resolveThresholdPattern(ditherKind: string): DitherThresholdPattern {
  switch (ditherKind) {
    case "white_noise":
      return "white_noise";
    case "gaussian_noise":
      return "gaussian_noise";
    case "triangular_noise":
      return "triangular_noise";
    case "ordered_bayer":
    case "ordered_clustered":
    case "ordered_void_cluster":
    case "true_dither":
      return "ordered";
    case "screened_blue_noise":
      return "screened_blue_noise";
    case "temporal_blue_noise":
      return "temporal_blue_noise";
    case "adaptive_threshold":
      return "adaptive_threshold";
    default:
      return "blue_noise";
  }
}
