import { BarChart3, Code2, Download, Palette, ScanLine, Settings, Timer } from "lucide-react";
import type { TFunction } from "i18next";
import { CollapsibleSection } from "./collapsible-section";
import { DetailRow } from "./detail-row";
import { formatMilliseconds, hasAnyTimingData } from "../../../../../../packages/application/analyze/src/formatters";

export const TimingsSection = ({
  combinedTimings,
  t,
}: Readonly<{
  combinedTimings: Record<string, number | null | undefined>;
  t: TFunction;
}>) => {
  if (!hasAnyTimingData(combinedTimings)) return null;
  return (
    <CollapsibleSection
      title={t("analyze.processingTimings", "Processing Timings")}
      icon={<Timer className="w-4 h-4" />}
      testId="analyze-section-processing-timings"
    >
      <div className="space-y-2">
        <DetailRow
          label="Decode Time"
          value={formatMilliseconds(combinedTimings.decodeMs)}
          icon={<ScanLine className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Total Analysis Time"
          value={formatMilliseconds(combinedTimings.totalAnalysisMs)}
          icon={<BarChart3 className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Encode Time"
          value={formatMilliseconds(combinedTimings.encodeMs)}
          icon={<Code2 className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Render Time"
          value={formatMilliseconds(combinedTimings.renderMs)}
          icon={<Palette className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Export Time"
          value={formatMilliseconds(combinedTimings.exportMs)}
          icon={<Download className="w-3.5 h-3.5" />}
        />
        {combinedTimings.decodeMs !== null &&
          combinedTimings.decodeMs !== undefined &&
          combinedTimings.totalAnalysisMs !== null &&
          combinedTimings.totalAnalysisMs !== undefined && (
            <DetailRow
              label="Non-Decode Overhead"
              value={formatMilliseconds(
                Math.max(0, combinedTimings.totalAnalysisMs - combinedTimings.decodeMs),
              )}
              icon={<Settings className="w-3.5 h-3.5" />}
            />
          )}
      </div>
    </CollapsibleSection>
  );
};
