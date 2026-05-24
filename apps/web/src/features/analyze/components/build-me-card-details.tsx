import { FileText, Globe, Mail, MapPin, Phone } from "lucide-react";
import i18n from "i18next";
import { parseMeCardPayload } from "./payload-parsers";
import type { DetailEntry } from "./detail-entry";

export function buildMeCardDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const mecardData = parseMeCardPayload(payload);

  if (mecardData.name) {
    details.push({
      label: i18n.t("analyze.name", "Name"),
      value: <span className="font-medium">{mecardData.name}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (mecardData.organization) {
    details.push({
      label: i18n.t("analyze.organization", "Organization"),
      value: mecardData.organization,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (mecardData.phone) {
    details.push({
      label: i18n.t("analyze.phone", "Phone"),
      value: (
        <a
          href={`tel:${String(mecardData.phone).replaceAll(/[^+\d]/g, "")}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {mecardData.phone}
        </a>
      ),
      icon: <Phone className="w-3 h-3" />,
    });
  }
  if (mecardData.email) {
    details.push({
      label: i18n.t("analyze.email", "Email"),
      value: (
        <a
          href={`mailto:${mecardData.email}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {mecardData.email}
        </a>
      ),
      icon: <Mail className="w-3 h-3" />,
    });
  }
  if (mecardData.address) {
    details.push({
      label: i18n.t("analyze.streetAddress", "Address"),
      value: <span className="text-xs">{mecardData.address}</span>,
      icon: <MapPin className="w-3 h-3" />,
    });
  }
  if (mecardData.birthday) {
    details.push({
      label: i18n.t("analyze.birthday", "Birthday"),
      value: mecardData.birthday,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (mecardData.url) {
    details.push({
      label: i18n.t("analyze.website", "Website"),
      value: (
        <a
          href={String(mecardData.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          {mecardData.url}
        </a>
      ),
      icon: <Globe className="w-3 h-3" />,
    });
  }
  if (mecardData.note) {
    details.push({
      label: i18n.t("analyze.notes", "Notes"),
      value: <span className="text-xs">{mecardData.note}</span>,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  return details;
}
