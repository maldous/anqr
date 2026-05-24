import { MessageSquare, Phone, Type } from "lucide-react";
import i18n from "i18next";
import { parseSmsPayload } from "./payload-parsers";
import type { DetailEntry } from "./detail-entry";

export function buildSmsDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const smsData = parseSmsPayload(payload);

  if (smsData.number) {
    details.push({
      label: i18n.t("analyze.recipient", "Recipient"),
      value: (
        <a
          href={`tel:${String(smsData.number).replaceAll(/[^+\d]/g, "")}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {smsData.number}
        </a>
      ),
      icon: <Phone className="w-3 h-3" />,
    });
  }

  if (smsData.body) {
    details.push({
      label: i18n.t("analyze.message", "Message"),
      value: <span className="text-xs">{smsData.body}</span>,
      icon: <MessageSquare className="w-3 h-3" />,
    });
  }

  if (smsData.charCount) {
    details.push({
      label: i18n.t("analyze.characterCount", "Character Count"),
      value: i18n.t("analyze.nCharacters", "{{count}} characters", {
        count: Number(smsData.charCount),
      }),
      icon: <Type className="w-3 h-3" />,
    });
  }

  if (smsData.segmentCount) {
    const count = Number(smsData.segmentCount);
    details.push({
      label: i18n.t("analyze.smsSegments", "SMS Segments"),
      value: (
        <span className={count > 1 ? "text-amber-600 dark:text-amber-400" : ""}>
          {i18n.t("analyze.nSegments", "{{count}} segment(s)", { count })}
          {count > 1 && i18n.t("analyze.mayCostMore", " (may cost more)")}
        </span>
      ),
      icon: <MessageSquare className="w-3 h-3" />,
    });
  }
  return details;
}
