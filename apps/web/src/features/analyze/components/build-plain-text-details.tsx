import { Binary, Settings, Type } from "lucide-react";
import i18n from "i18next";
import { analyzePlainText } from "./payload-parsers";
import type { DetailEntry } from "./detail-entry";

export function buildPlainTextDetails(payload: string): DetailEntry[] {
  const details: DetailEntry[] = [];
  const analysis = analyzePlainText(payload);
  details.push(
    {
      label: i18n.t("analyze.characterCount", "Character Count"),
      value: i18n.t("analyze.nCharacters", "{{count}} characters", {
        count: Number(analysis.charCount),
      }),
      icon: <Type className="w-3 h-3" />,
    },
    {
      label: i18n.t("analyze.wordCount", "Word Count"),
      value: i18n.t("analyze.nWords", "{{count}} words", { count: Number(analysis.wordCount) }),
      icon: <Type className="w-3 h-3" />,
    },
    {
      label: i18n.t("analyze.lineCount", "Line Count"),
      value: i18n.t("analyze.nLines", "{{count}} lines", { count: Number(analysis.lineCount) }),
      icon: <Type className="w-3 h-3" />,
    },
  );
  if (analysis.hasEmoji) {
    details.push({
      label: i18n.t("analyze.containsEmoji", "Contains Emoji"),
      value: <span className="text-amber-600 dark:text-amber-400">{i18n.t("analyze.yes", "Yes")}</span>,
      icon: <Type className="w-3 h-3" />,
    });
  }
  if (analysis.hasNonAscii) {
    details.push({
      label: i18n.t("analyze.containsNonAscii", "Contains Non-ASCII"),
      value: (
        <span className="text-blue-600 dark:text-blue-400">
          {i18n.t("analyze.yesUtf8", "Yes (UTF-8)")}
        </span>
      ),
      icon: <Binary className="w-3 h-3" />,
    });
  }
  details.push({
    label: i18n.t("analyze.encodingRecommendation", "Encoding Recommendation"),
    value: <span className="font-medium">{analysis.encodingRecommendation}</span>,
    icon: <Settings className="w-3 h-3" />,
  });
  return details;
}
