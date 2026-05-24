import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CapacityByModeTable } from "./capacity-by-mode-table";
import { CollapsibleSection } from "./collapsible-section";
import { EncodingEfficiency } from "./encoding-efficiency";
import type { QRAnalysisResult } from "@/contracts/analyze";

export function AnalyzeCapacityGrid({ result }: Readonly<{ result: QRAnalysisResult }>) {
  const { t } = useTranslation();
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {result.version !== null && result.eccLevel && (
        <CollapsibleSection
          title={t("analyze.capacityByMode", "Capacity by Mode")}
          icon={<BarChart3 className="w-4 h-4" />}
        >
          <CapacityByModeTable
            version={result.version}
            eccLevel={result.eccLevel}
            currentBytes={result.payloadBytes?.length}
          />
        </CollapsibleSection>
      )}
      {result.payload && (
        <CollapsibleSection
          title={t("analyze.encodingEfficiency", "Encoding Efficiency")}
          icon={<BarChart3 className="w-4 h-4" />}
        >
          <EncodingEfficiency
            payload={result.payload}
            payloadBytes={result.payloadBytes}
            encodingMode={result.encodingMode}
          />
        </CollapsibleSection>
      )}
    </div>
  );
}
