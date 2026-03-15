import { snapResult } from './snap-result';

export function applyPixelSnap(x: number, y: number, pixelSnap: string): { x: number; y: number } {
  if (pixelSnap === 'floor') {
    snapResult.x = Math.floor(x);
    snapResult.y = Math.floor(y);
  } else if (pixelSnap === 'round') {
    snapResult.x = Math.round(x);
    snapResult.y = Math.round(y);
  } else if (pixelSnap === 'ceil') {
    snapResult.x = Math.ceil(x);
    snapResult.y = Math.ceil(y);
  } else {
    snapResult.x = x;
    snapResult.y = y;
  }
  return snapResult;
}
