export function ditherPatchSignature(patch: {
  darkMinOccupancy?: number;
  lightMaxOccupancy?: number;
  optimizeIterations?: number;
  overlayIntensity?: number;
  qrBitBiasStrength?: number;
  qrFirstMode?: boolean;
  preserveFinders?: boolean;
}): string {
  return JSON.stringify({
    d: patch.darkMinOccupancy ?? null,
    l: patch.lightMaxOccupancy ?? null,
    i: patch.optimizeIterations ?? null,
    o: patch.overlayIntensity ?? null,
    b: patch.qrBitBiasStrength ?? null,
    q: patch.qrFirstMode ?? null,
    f: patch.preserveFinders ?? null,
  });
}
