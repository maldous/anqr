import { Phone } from "lucide-react";
import i18n from "i18next";
import type { DetailEntry } from "./detail-entry";

export function appendVCardPhoneEntries(details: DetailEntry[], phones: string[]): void {
  for (const phone of phones) {
    const [type, number] = phone.includes(":")
      ? phone.split(": ")
      : [i18n.t("analyze.phone", "Phone"), phone];
    details.push({
      label: type,
      value: (
        <a
          href={`tel:${number.replaceAll(/[^+\d]/g, "")}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {number}
        </a>
      ),
      icon: <Phone className="w-3 h-3" />,
    });
  }
}
