export type DiffusionKernel =
  | "floyd_steinberg"
  | "atkinson"
  | "jarvis_judice_ninke"
  | "stucki"
  | "burkes"
  | "sierra"
  | "sierra_2"
  | "sierra_lite"
  | "two_row_sierra";

export type DitherKind =
  | "none"
  | "error_diffusion"
  | "floyd_steinberg"
  | "atkinson"
  | "sierra"
  | "stucki"
  | "burkes"
  | "ordered_bayer"
  | "ordered_clustered"
  | "ordered_void_cluster"
  | "blue_noise"
  | "blue_noise_threshold"
  | "blue_noise_error_diffusion"
  | "screened_blue_noise"
  | "white_noise"
  | "gaussian_noise"
  | "triangular_noise"
  | "perceptual"
  | "edge_aware"
  | "adaptive_threshold"
  | "temporal_blue_noise"
  | "true_dither";

export type { OrderedMatrix } from "@/domain/share";
