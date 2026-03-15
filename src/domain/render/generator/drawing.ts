/**
 * QR Generator Drawing Module
 * Re-exports from split module files
 */

import { createLogger } from '../../../infra/logging/logger';

const _log = createLogger('GENERATE');

// Frames
export { drawCenterLogo, drawFrame, drawFrameBackground } from './drawing-frames';
// Gradients
export { createGradientFill } from './drawing-gradients';
// Halftone
export { drawHalftoneModule } from './drawing-halftone';
// Patterns
export {
  drawAlignmentPattern,
  drawFinderPatternComplete,
  drawTimingModule,
} from './drawing-patterns';
// Primitives
export { drawFinderModule, drawModule, roundRect } from './drawing-primitives';
