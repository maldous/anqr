/**
 * QR Generator Edge Detection Filters
 * Re-exports from overlay module (canonical source)
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('GENERATE');

export { cannyEdge as applyCannyEdge, sobelEdge as applySobelEdge } from '../overlay';
