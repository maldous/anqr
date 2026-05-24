import { MapPin } from "lucide-react";
import i18n from "i18next";
import type { DetailEntry } from "./detail-entry";

export function appendVCardAddressEntries(details: DetailEntry[], addresses: string[]): void {
  for (const addr of addresses) {
    details.push({
      label: i18n.t("analyze.streetAddress", "Address"),
      value: <span className="text-xs">{addr}</span>,
      icon: <MapPin className="w-3 h-3" />,
    });
  }
}
