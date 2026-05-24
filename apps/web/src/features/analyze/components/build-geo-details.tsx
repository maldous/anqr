import { ChevronRight, MapPin } from "lucide-react";
import i18n from "i18next";
import { parseGeoPayload } from "./payload-parsers";
import type { DetailEntry } from "./detail-entry";

export function buildGeoDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const geoData = parseGeoPayload(payload);

  if (geoData.latitude !== null && geoData.longitude !== null) {
    details.push(
      {
        label: i18n.t("analyze.latitude", "Latitude"),
        value: (
          <span className="font-mono text-xs">
            {Number(geoData.latitude).toFixed(6)}° {geoData.latHemisphere}
          </span>
        ),
        icon: <MapPin className="w-3 h-3" />,
      },
      {
        label: i18n.t("analyze.longitude", "Longitude"),
        value: (
          <span className="font-mono text-xs">
            {Number(geoData.longitude).toFixed(6)}° {geoData.lonHemisphere}
          </span>
        ),
        icon: <MapPin className="w-3 h-3" />,
      },
    );
  }

  if (geoData.latDms && geoData.lonDms) {
    details.push({
      label: i18n.t("analyze.dmsFormat", "DMS Format"),
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
      label: i18n.t("analyze.altitude", "Altitude"),
      value: `${geoData.altitude}m`,
      icon: <MapPin className="w-3 h-3" />,
    });
  }

  if (geoData.uncertainty !== null) {
    details.push({
      label: i18n.t("analyze.uncertainty", "Uncertainty"),
      value: `±${geoData.uncertainty}m`,
      icon: <MapPin className="w-3 h-3" />,
    });
  }

  if (geoData.googleMapsUrl) {
    details.push({
      label: i18n.t("analyze.googleMaps", "Google Maps"),
      value: (
        <a
          href={String(geoData.googleMapsUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {i18n.t("analyze.openInGoogleMaps", "Open in Google Maps")} <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }
  if (geoData.appleMapsUrl) {
    details.push({
      label: i18n.t("analyze.appleMaps", "Apple Maps"),
      value: (
        <a
          href={String(geoData.appleMapsUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {i18n.t("analyze.openInAppleMaps", "Open in Apple Maps")} <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }
  if (geoData.osmUrl) {
    details.push({
      label: i18n.t("analyze.openStreetMap", "OpenStreetMap"),
      value: (
        <a
          href={String(geoData.osmUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {i18n.t("analyze.openInOpenStreetMap", "Open in OpenStreetMap")} <ChevronRight className="w-3 h-3" />
        </a>
      ),
      icon: <MapPin className="w-3 h-3" />,
    });
  }
  return details;
}
