import { registerPlugin } from '@capacitor/core';
import type { MediaStoreWriterPlugin } from './media-store.types';

// Lazy-loaded plugin instance to avoid circular dependency initialization issues
// The plugin is only registered when first used, not at module load time
let _mediaStoreWriter: MediaStoreWriterPlugin | null = null;

export function getMediaStoreWriter(): MediaStoreWriterPlugin {
  _mediaStoreWriter ??= registerPlugin<MediaStoreWriterPlugin>('MediaStoreWriter');
  return _mediaStoreWriter;
}

export { _mediaStoreWriter };
