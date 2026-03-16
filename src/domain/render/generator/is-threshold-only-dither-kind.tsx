export function isThresholdOnlyDitherKind(ditherKind: string): boolean {
  switch (ditherKind) {
    case "blue_noise":
    case "blue_noise_threshold":
    case "white_noise":
    case "gaussian_noise":
    case "triangular_noise":
    case "ordered_bayer":
    case "ordered_clustered":
    case "ordered_void_cluster":
    case "true_dither":
    case "temporal_blue_noise":
    case "adaptive_threshold":
      return true;
    default:
      return false;
  }
}
