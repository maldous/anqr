export type DitherKind =
  | "error_diffusion"
  | "ordered_bayer"
  | "ordered_clustered"
  | "ordered_void_cluster"
  | "blue_noise_threshold"
  | "true_dither"
  | "blue_noise"
  | "white_noise"
  | "gaussian_noise"
  | "triangular_noise"
  | "blue_noise_error_diffusion"
  | "screened_blue_noise"
  | "perceptual"
  | "edge_aware"
  | "adaptive_threshold"
  | "temporal_blue_noise";

export type DiffusionKernel =
  | "floyd_steinberg"
  | "jarvis_judice_ninke"
  | "stucki"
  | "burkes"
  | "sierra"
  | "sierra_2"
  | "sierra_lite"
  | "atkinson";

export type OrderedMatrix = "bayer2" | "bayer4" | "bayer8" | "clustered_dot" | "void_cluster";
