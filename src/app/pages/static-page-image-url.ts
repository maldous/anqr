import { Capacitor } from '@capacitor/core';

export function getImageUrl(src: string): string {
  if (Capacitor.isNativePlatform() && src.startsWith('/')) {
    return `https://anqr.link${src}`;
  }
  return src;
}
