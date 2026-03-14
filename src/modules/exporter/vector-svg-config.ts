import type { VectorAlignmentStyle } from './vector-alignment-style';
import type { VectorFinderStyle } from './vector-finder-style';
import type { VectorGradient } from './vector-gradient';
import type { VectorModuleStyle } from './vector-module-style';
import type { VectorTimingStyle } from './vector-timing-style';

export interface VectorSvgConfig {
  moduleSize?: number;
  margin?: number;
  fgColor?: string;
  bgColor?: string;
  filename?: string;
  moduleStyle?: VectorModuleStyle;
  cornerRadius?: number;
  finderStyle?: VectorFinderStyle;
  eyeOuterStyle?: VectorFinderStyle;
  eyeInnerStyle?: VectorFinderStyle;
  alignmentStyle?: VectorAlignmentStyle;
  timingStyle?: VectorTimingStyle;
  gradient?: VectorGradient;
  metadata?: {
    title?: string;
    author?: string;
    copyright?: string;
    description?: string;
    creationTime?: boolean;
    software?: string;
  };
}
