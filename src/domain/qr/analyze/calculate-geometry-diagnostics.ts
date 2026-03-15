import type { QRLocationCorners } from './decoder-types';

export function calculateGeometryDiagnostics(location: QRLocationCorners) {
  const corners = [
    location.topLeftCorner,
    location.topRightCorner,
    location.bottomLeftCorner,
    location.bottomRightCorner,
  ];
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const topEdgePx = Math.hypot(
    location.topRightCorner.x - location.topLeftCorner.x,
    location.topRightCorner.y - location.topLeftCorner.y
  );
  const leftEdgePx = Math.hypot(
    location.bottomLeftCorner.x - location.topLeftCorner.x,
    location.bottomLeftCorner.y - location.topLeftCorner.y
  );
  const estimatedRotationDeg =
    (Math.atan2(
      location.topRightCorner.y - location.topLeftCorner.y,
      location.topRightCorner.x - location.topLeftCorner.x
    ) *
      180) /
    Math.PI;

  return {
    corners: {
      topLeft: location.topLeftCorner,
      topRight: location.topRightCorner,
      bottomLeft: location.bottomLeftCorner,
      bottomRight: location.bottomRightCorner,
    },
    boundingBox: {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    },
    topEdgePx,
    leftEdgePx,
    estimatedRotationDeg,
  };
}
