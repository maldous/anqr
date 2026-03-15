/**
 * Tiny typed-array pool used by QR-Art hot paths to reduce GC churn.
 * Kept intentionally small and size-bounded to avoid memory growth.
 */

export { acquireUint8Buffer } from './acquire-uint8-buffer-from-pool';
export { clearQArtBufferPool } from './reset-uint8-buffer-pool';
export { releaseUint8Buffer } from './release-uint8-buffer-to-pool';
