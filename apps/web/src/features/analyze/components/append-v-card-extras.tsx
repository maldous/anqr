import { FileText, Globe, Image as ImageIcon } from "lucide-react";
import i18n from "i18next";
import { parseVCardPayload } from "./payload-parsers";
import type { DetailEntry } from "./detail-entry";

export function appendVCardExtras(
  details: DetailEntry[],
  vcardData: ReturnType<typeof parseVCardPayload>,
): void {
  if (vcardData.birthday) {
    details.push({
      label: i18n.t("analyze.birthday", "Birthday"),
      value: vcardData.birthday,
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (vcardData.url) {
    details.push({
      label: i18n.t("analyze.website", "Website"),
      value: (
        <a
          href={String(vcardData.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          {String(vcardData.url)}
        </a>
      ),
      icon: <Globe className="w-3 h-3" />,
    });
  }
  if (vcardData.note) {
    details.push({
      label: i18n.t("analyze.notes", "Notes"),
      value: (
        <span className="text-xs">
          {String(vcardData.note).slice(0, 100)}
          {String(vcardData.note).length > 100 ? "..." : ""}
        </span>
      ),
      icon: <FileText className="w-3 h-3" />,
    });
  }
  if (vcardData.hasPhoto === "true") {
    details.push({
      label: i18n.t("analyze.photo", "Photo"),
      value: (
        <span className="text-green-600 dark:text-green-400">
          {i18n.t("analyze.embedded", "Embedded")}
        </span>
      ),
      icon: <ImageIcon className="w-3 h-3" />,
    });
  }
}
