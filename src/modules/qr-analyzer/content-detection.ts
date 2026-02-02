/**
 * QR Content Type Detection
 * Re-exports from the canonical content module
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANALYZER');

export { detectContentType } from './analyzer-content';
export type { ContentType, ContentTypeDetails } from './types';
