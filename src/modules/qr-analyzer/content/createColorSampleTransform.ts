import {x, y} from './shared';
export function createColorSampleTransform(
  location: QRLocation,
  moduleCount: number
): (col: number, row: number) => { x: number; y: number }

