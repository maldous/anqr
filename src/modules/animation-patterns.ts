/**
 * Animation Patterns Module
 * @deprecated Import from './animation' instead
 *
 * Generates animated QR code effects from static images
 */

export {
  generatePatternFrames,
  interpolateFrames,
  type AnimationPattern,
  type InterpolationMode,
} from './animation/internal/patterns';

export default {
  generatePatternFrames,
  interpolateFrames,
};

import { generatePatternFrames, interpolateFrames } from './animation/internal/patterns';
