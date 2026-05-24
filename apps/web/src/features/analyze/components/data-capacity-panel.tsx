import { AlertTriangle, Database } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CollapsibleSection } from "./collapsible-section";
import { DetailRow } from "./detail-row";
import { ProgressBar } from "./progress-bar";
import { capacityBadgeClass } from "@/application/analyze";
import type { QRAnalysisResult } from "@/contracts/analyze";

export function DataCapacityPanel({
  dataCapacity,
}: Readonly<{
  dataCapacity: NonNullable<QRAnalysisResult["dataCapacity"]>;
}>) {
  const { t } = useTranslation();
  return (
    <CollapsibleSection
      title={t("analyze.dataCapacity", "Data Capacity")}
      icon={<Database className="w-4 h-4" />}
      badge={
        dataCapacity.overflow ? (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {t("analyze.detectionMismatch", "Detection mismatch")}
          </span>
        ) : (
          <span
            className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${capacityBadgeClass(
              dataCapacity.percentage,
            )}`}
          >
            {t("analyze.percentUsed", "{{percent}}% used", { percent: dataCapacity.percentage })}
          </span>
        )
      }
    >
      {dataCapacity.overflow ? (
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {t(
                "analyze.payloadExceedsCapacity",
                "Payload ({{used}} bytes) exceeds detected capacity ({{total}} bytes). Version or ECC detection may be inaccurate.",
                { used: dataCapacity.used, total: dataCapacity.total },
              )}
            </span>
          </div>
          <DetailRow
            label={t("analyze.payloadSize", "Payload Size")}
            value={`${dataCapacity.used} bytes`}
            icon={<Database className="w-3.5 h-3.5" />}
          />
          <DetailRow
            label={t("analyze.detectedCapacity", "Detected Capacity")}
            value={`${dataCapacity.total} bytes`}
            icon={<Database className="w-3.5 h-3.5" />}
          />
        </div>
      ) : (
        <ProgressBar
          value={dataCapacity.used}
          max={dataCapacity.total}
          label={t("analyze.byteModeCapacity", "Byte Mode Capacity")}
        />
      )}
    </CollapsibleSection>
  );
}
