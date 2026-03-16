import { Grid3x3, Ruler, ScanLine, Square } from "lucide-react";
import type { TFunction } from "i18next";
import type { QRAnalysisResult } from "@/modules/qr-analyzer";
import { CollapsibleSection } from "@/features/analyze/components/collapsible-section";
import { DetailRow } from "@/features/analyze/components/detail-row";
import { StatusBadge } from "@/features/analyze/components/status-badge";

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
            label="Module Size"
            value={`~${estimatedModulePx} px`}
            icon={<Square className="w-3.5 h-3.5" />}
          />
        )}
        {estimatedModulePx !== null && (
          <DetailRow
            label="Scan Module Size"
            value={
              <StatusBadge
                status={estimatedModulePx >= 3}
                trueLabel="Scan-safe"
                falseLabel="Too small"
              />
            }
            icon={<ScanLine className="w-3.5 h-3.5" />}
          />
        )}
        {geometry && (
          <>
            <DetailRow
              label="Rotation"
              value={`${geometry.estimatedRotationDeg.toFixed(1)}°`}
              icon={<Ruler className="w-3.5 h-3.5" />}
            />
            <DetailRow
              label="Bounding Box"
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
                  trueLabel="Adequate"
                  falseLabel="Insufficient"
                />
              }
              icon={<Square className="w-3.5 h-3.5" />}
            />
            <div className="grid grid-cols-4 gap-1 text-center mt-2">
              <div className="p-2 rounded bg-muted/50">
                <div className="text-sm font-mono">{quietZone.top}</div>
                <div className="text-[10px] text-muted-foreground">Top</div>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <div className="text-sm font-mono">{quietZone.right}</div>
                <div className="text-[10px] text-muted-foreground">Right</div>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <div className="text-sm font-mono">{quietZone.bottom}</div>
                <div className="text-[10px] text-muted-foreground">Bottom</div>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <div className="text-sm font-mono">{quietZone.left}</div>
                <div className="text-[10px] text-muted-foreground">Left</div>
              </div>
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  );
};
