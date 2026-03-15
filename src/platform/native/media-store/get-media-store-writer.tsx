import { registerPlugin } from '@capacitor/core';
import type { MediaStoreWriterPlugin } from './media-store.types';

let _mediaStoreWriter: MediaStoreWriterPlugin | null = null;

export function getMediaStoreWriter(): MediaStoreWriterPlugin {
  _mediaStoreWriter ??= registerPlugin<MediaStoreWriterPlugin>('MediaStoreWriter');
  return _mediaStoreWriter;
}
