import { Grid3x3, Ruler, ScanLine, Square } from "lucide-react";
import type { TFunction } from "i18next";
import type { QRAnalysisResult } from "@/contracts/analyze";
import { CollapsibleSection } from "./collapsible-section";
import { DetailRow } from "./detail-row";
import { StatusBadge } from "./status-badge";

export const SpatialAnalysisSection = ({
  estimatedModulePx,
  geometry,
  quietZone,
  t,
}: Readonly<{
  estimatedModulePx: number | null;
  geometry: QRAnalysisResult["geometry"];
  quietZone: QRAnalysisResult["quietZone"];
  t: TFunction;
}>) => {
  return (
    <CollapsibleSection
      title={t("analyze.spatialAnalysis", "Spatial Analysis")}
      icon={<Ruler className="w-4 h-4" />}
      testId="analyze-section-spatial-analysis"
    >
      <div className="space-y-2">
        {estimatedModulePx !== null && (
          <DetailRow
            label={t("analyze.moduleSize", "Module Size")}
            value={`~${estimatedModulePx} px`}
            icon={<Square className="w-3.5 h-3.5" />}
          />
        )}
        {estimatedModulePx !== null && (
          <DetailRow
            label={t("analyze.scanModuleSize", "Scan Module Size")}
            value={
              <StatusBadge
                status={estimatedModulePx >= 3}
                trueLabel={t("analyze.scanSafe", "Scan-safe")}
                falseLabel={t("analyze.tooSmall", "Too small")}
              />
            }
            icon={<ScanLine className="w-3.5 h-3.5" />}
          />
        )}
        {geometry && (
          <>
            <DetailRow
              label={t("analyze.rotation", "Rotation")}
              value={`${geometry.estimatedRotationDeg.toFixed(1)}°`}
              icon={<Ruler className="w-3.5 h-3.5" />}
            />
            <DetailRow
              label={t("analyze.boundingBox", "Bounding Box")}
              value={`${Math.round(geometry.boundingBox.width)} × ${Math.round(geometry.boundingBox.height)} px`}
              icon={<Grid3x3 className="w-3.5 h-3.5" />}
            />
          </>
        )}
        {quietZone && (
          <>
            <DetailRow
              label={t("safety.quietZone", "Quiet Zone")}
              value={
                <StatusBadge
                  status={quietZone.adequate}
                  trueLabel={t("analyze.adequate", "Adequate")}
                  falseLabel={t("analyze.insufficient", "Insufficient")}
                />
              }
              icon={<Square className="w-3.5 h-3.5" />}
            />
            <div className="grid grid-cols-4 gap-1 text-center mt-2">
              <div className="p-2 rounded bg-muted/50">
                <div className="text-sm font-mono">{quietZone.top}</div>
                <div className="text-[10px] text-muted-foreground">
                  {t("analyze.top", "Top")}
                </div>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <div className="text-sm font-mono">{quietZone.right}</div>
                <div className="text-[10px] text-muted-foreground">
                  {t("analyze.right", "Right")}
                </div>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <div className="text-sm font-mono">{quietZone.bottom}</div>
                <div className="text-[10px] text-muted-foreground">
                  {t("analyze.bottom", "Bottom")}
                </div>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <div className="text-sm font-mono">{quietZone.left}</div>
                <div className="text-[10px] text-muted-foreground">
                  {t("analyze.left", "Left")}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  );
};
