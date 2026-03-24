import { describe, expect, it } from "vitest";
import type { DitherKind } from "./dither-kind.contract";

describe("DitherKind", () => {
  const kinds: DitherKind[] = [
    "none",
    "error_diffusion",
    "ordered_bayer",
    "ordered_clustered",
    "ordered_void_cluster",
    "blue_noise_threshold",
    "true_dither",
    "blue_noise",
    "white_noise",
    "gaussian_noise",
    "triangular_noise",
    "blue_noise_error_diffusion",
    "screened_blue_noise",
    "perceptual",
    "edge_aware",
    "adaptive_threshold",
    "temporal_blue_noise",
  ];

  kinds.forEach((kind) => {
    it(`should allow ${kind}`, () => {
      const ditherKind: DitherKind = kind;
      expect(ditherKind).toBe(kind);
    });
  });
});
