// ---------------------------------------------------------------------------
// 7. Geo coordinate parser with DMS conversion
// ---------------------------------------------------------------------------
export function parseGeoPayload(payload: string): Record<string, string | number | null> {
  const result: Record<string, string | number | null> = {
    latitude: null,
    longitude: null,
    altitude: null,
    uncertainty: null,
    latDms: null,
    lonDms: null,
    latHemisphere: null,
    lonHemisphere: null,
    googleMapsUrl: null,
    appleMapsUrl: null,
    osmUrl: null,
  };

  const match = payload.match(/^geo:([\d.-]+),([\d.-]+)(?:,([\d.-]+))?(?:\?.*u=([\d.]+))?/i);
  if (!match) return result;

  const lat = Number.parseFloat(match[1]);
  const lon = Number.parseFloat(match[2]);
  result.latitude = lat;
  result.longitude = lon;
  result.altitude = match[3] ? Number.parseFloat(match[3]) : null;
  result.uncertainty = match[4] ? Number.parseFloat(match[4]) : null;

  // Determine hemispheres
  result.latHemisphere = lat >= 0 ? 'N' : 'S';
  result.lonHemisphere = lon >= 0 ? 'E' : 'W';

  // Convert to DMS
  const toDms = (decimal: number): string => {
    const abs = Math.abs(decimal);
    const deg = Math.floor(abs);
    const minFloat = (abs - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = ((minFloat - min) * 60).toFixed(2);
    return `${deg}° ${min}' ${sec}"`;
  };

  result.latDms = `${toDms(lat)} ${result.latHemisphere}`;
  result.lonDms = `${toDms(lon)} ${result.lonHemisphere}`;

  // Generate map URLs
  result.googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
  result.appleMapsUrl = `https://maps.apple.com/?ll=${lat},${lon}`;
  result.osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`;

  return result;
}
