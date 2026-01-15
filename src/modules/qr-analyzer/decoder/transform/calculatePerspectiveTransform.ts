import {QRLocation, bottomLeft, center, col, location, of, patterns, row, topLeft, topRight, transform, u, v, x, y} from '../shared';
/**
 * Calculate perspective transform from QR quadrilateral to module coordinates
 * 
 * Our finder pattern detection returns centers of finder patterns.
 * The finder centers are at module coordinates (3.5, 3.5), (moduleCount-3.5, 3.5), etc.
 * 
 * KEY INSIGHT: Instead of extending corners outward (which amplifies detection errors),
 * we use the finder centers directly as anchor points and interpolate/extrapolate from there.
 * This keeps the most accurately detected positions as anchors.
 * 
 * The u,v coordinates map so that:
 * - (u=0, v=0) corresponds to the topLeft finder center (module 3.5, 3.5)
 * - (u=1, v=0) corresponds to the topRight finder center (module moduleCount-3.5, 3.5)
 * - (u=1, v=1) corresponds to the bottomRight finder center
 * - (u=0, v=1) corresponds to the bottomLeft finder center
 * 
 * Edge modules (like 0,0) will have negative u,v and use extrapolation.
 */
export function calculatePerspectiveTransform(
  location: QRLocation,
  moduleCount: number
): (col: number, row: number) => { x: number; y: number }

