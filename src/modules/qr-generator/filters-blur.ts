/**
 * QR Generator Blur Filters
 * Re-exports from overlay module (canonical source)
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('GENERATE');

export { blur as applyBoxBlur } from '../overlay';
