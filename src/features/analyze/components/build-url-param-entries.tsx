import { ChevronRight, Settings } from "lucide-react";
import type { DetailEntry } from "./detail-entry";

export function buildUrlParamEntries(
  params: Array<{ key: string; value: string }> | undefined,
): DetailEntry[] {
  if (!params || params.length === 0) return [];
  const entries: DetailEntry[] = [
    {
      label: "Query Parameters",
      value: <span className="font-medium">{params.length} parameter(s)</span>,
      icon: <Settings className="w-3 h-3" />,
    },
  ];
  params.slice(0, 5).forEach((param) => {
    entries.push({
      label: `  └ ${param.key}`,
      value: <span className="font-mono text-xs truncate max-w-[150px] block">{param.value}</span>,
      icon: <ChevronRight className="w-3 h-3 text-muted-foreground" />,
    });
  });
  if (params.length > 5) {
    entries.push({
      label: "",
      value: <span className="text-xs text-muted-foreground">...and {params.length - 5} more</span>,
    });
  }
  return entries;
}
