import type { DiffusionKernel, DitherKind, OrderedMatrix } from "@/modules/dither-algorithms";

export interface OverlayDitherOptions {
  enabled?: boolean;
  kind?: DitherKind;
  strength?: number;
  kernel?: DiffusionKernel;
  matrix?: OrderedMatrix;
  levels?: number;
  serpentine?: boolean;
}
