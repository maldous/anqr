import { ChevronRight, MapPin } from "lucide-react";
import { parseGeoPayload } from "./payload-parsers";
import type { DetailEntry } from "./detail-entry";

export function buildGeoDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const geoData = parseGeoPayload(payload);

  if (geoData.latitude !== null && geoData.longitude !== null) {
    details.push({
      label: "Latitude",
      value: (
        <span className="font-mono text-xs">
          {Number(geoData.latitude).toFixed(6)}° {geoData.latHemisphere}
        </span>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
    details.push({
      label: "Longitude",
      value: (
        <span className="font-mono text-xs">
          {Number(geoData.longitude).toFixed(6)}° {geoData.lonHemisphere}
        </span>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }

  if (geoData.latDms && geoData.lonDms) {
    details.push({
      label: "DMS Format",
      value: (
        <span className="font-mono text-xs">
          {geoData.latDms}, {geoData.lonDms}
        </span>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }

  if (geoData.altitude !== null) {
    details.push({
      label: "Altitude",
      value: `${geoData.altitude}m`,
      icon: <MapPin className="w-3 h-3" />,
    });
  }

  if (geoData.uncertainty !== null) {
    details.push({
      label: "Uncertainty",
      value: `±${geoData.uncertainty}m`,
      icon: <MapPin className="w-3 h-3" />,
    });
  }

  if (geoData.googleMapsUrl) {
    details.push({
      label: "Google Maps",
      value: (
        <a
          href={String(geoData.googleMapsUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Open in Google Maps <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }
  if (geoData.appleMapsUrl) {
    details.push({
      label: "Apple Maps",
      value: (
        <a
          href={String(geoData.appleMapsUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Open in Apple Maps <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }
  if (geoData.osmUrl) {
    details.push({
      label: "OpenStreetMap",
      value: (
        <a
          href={String(geoData.osmUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Open in OpenStreetMap <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }
  return details;
}
