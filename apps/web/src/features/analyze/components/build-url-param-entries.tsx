import { ChevronRight, Settings } from "lucide-react";
import i18n from "i18next";
import type { DetailEntry } from "./detail-entry";

export function buildUrlParamEntries(
  params: Array<{ key: string; value: string }> | undefined,
): DetailEntry[] {
  if (!params || params.length === 0) return [];
  const entries: DetailEntry[] = [
    {
      label: i18n.t("analyze.queryParameters", "Query Parameters"),
      value: (
        <span className="font-medium">
          {i18n.t("analyze.nParameters", "{{count}} parameter(s)", { count: params.length })}
        </span>
      ),
      icon: <Settings className="w-3 h-3" />,
    },
  ];
  for (const param of params.slice(0, 5)) {
    entries.push({
      label: `  └ ${param.key}`,
      value: <span className="font-mono text-xs truncate max-w-[150px] block">{param.value}</span>,
      icon: <ChevronRight className="w-3 h-3 text-muted-foreground" />,
    });
  }
  if (params.length > 5) {
    entries.push({
      label: "",
      value: (
        <span className="text-xs text-muted-foreground">
          {i18n.t("analyze.andNMore", "...and {{count}} more", { count: params.length - 5 })}
        </span>
      ),
    });
  }
  return entries;
}
