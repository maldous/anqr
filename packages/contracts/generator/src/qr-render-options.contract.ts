import type { AlignmentStyle } from "./alignment-style.contract";
import type { FinderStyle } from "./finder-style.contract";
import type { FrameStyle } from "./frame-style.contract";
import type { GapMode } from "./gap-mode.contract";
import type { GradientUpdate } from "./gradient.contract";
import type { ModuleStyle } from "./module-style.contract";
import type { TimingStyle } from "./timing-style.contract";

export interface QRRenderOptions {
  modulePx: number;
  crispEdges: boolean;
  pixelSnap: "floor" | "round" | "ceil";
  moduleGapPercent: number;
  gapMode: GapMode;
  moduleStyle: ModuleStyle;
  finderStyle: FinderStyle;
  alignmentStyle: AlignmentStyle;
  timingStyle: TimingStyle;
  cornerRadius: number;
  dotRotationDeg: number;
  eyeOuterStyle: FinderStyle;
  eyeInnerStyle: FinderStyle;
  eyeScale: number;
  frameStyle: FrameStyle;
  frameText: string;
  fgColor: string;
  bgColor: string;
  bgTransparent: boolean;
  palette: string[];
  paletteMode: string;
  gradient: GradientUpdate;
  perModuleColorMode: string;
  contrastGuard: boolean;
  minContrastRatio: number;
}
