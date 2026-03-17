import { ChevronRight, Globe, Phone } from "lucide-react";
import { parseTelPayload } from "./payload-parsers";
import type { DetailEntry } from "./detail-entry";

export function buildTelDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const telData = parseTelPayload(payload);

  if (telData.country && telData.countryFlag) {
    details.push({
      label: "Country",
      value: (
        <span className="flex items-center gap-1">
          <span className="text-lg">{telData.countryFlag}</span>
          <span>{telData.country}</span>
        </span>
      ),
      icon: <Globe className="w-3 h-3" />,
    });
  }

  if (telData.countryCode) {
    details.push({
      label: "Country Code",
      value: <span className="font-mono text-xs font-medium">{telData.countryCode}</span>,
      icon: <Phone className="w-3 h-3" />,
    });
  }

  if (telData.number) {
    details.push({
      label: "Phone Number",
      value: (
        <a
          href={`tel:${telData.number}`}
          className="font-mono text-sm text-primary hover:underline font-medium"
        >
          {telData.formatted || telData.number}
        </a>
      ),
      icon: <Phone className="w-3 h-3" />,
    });
  }

  details.push({
    label: "Action",
    value: (
      <a
        href={`tel:${telData.number}`}
        className="text-xs text-primary hover:underline flex items-center gap-1"
      >
        <Phone className="w-3 h-3" /> Tap to call
      </a>
    ),
    icon: <ChevronRight className="w-3 h-3" />,
  });
  return details;
}
