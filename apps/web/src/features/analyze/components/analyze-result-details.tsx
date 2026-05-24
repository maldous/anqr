import {
  ArrowRight,
  Check,
  Database,
  Fingerprint,
  Image as ImageIcon,
  QrCode,
  Settings,
} from "lucide-react";
import type React from "react";
import type { useTranslation } from "react-i18next";
import { Button } from "@/ui/web";
import { DynamicTestId } from "../../../lib/dynamic-testid";
import { AnalyzeCapacityGrid } from "./analyze-capacity-grid";
import { AnalyzeDataGrid } from "./analyze-data-grid";
import { CollapsibleSection } from "./collapsible-section";
import { ColorsWcagSection } from "./colors-wcag-section";
import { CONTENT_TYPE_ICONS } from "./content-type-icons";
import { CopyButton } from "./copy-button";
import { DataCapacityPanel } from "./data-capacity-panel";
import { DecoderMetadataPanel } from "./decoder-metadata-panel";
import { DetailRow } from "./detail-row";
import { EncodingPanel } from "./encoding-panel";
import { FormatImagePanel } from "./format-image-panel";
import { QrStructurePanel } from "./qr-structure-panel";
import { SpatialAnalysisSection } from "./spatial-analysis-section";
import { StatusBadge } from "./status-badge";
import { SummaryBar } from "./summary-bar";
import { TimingsSection } from "./timings-section";
import { buildContentTypeDetails } from "./content-renderers.types";
import type { QRAnalysisResult } from "@/contracts/analyze";

export function AnalyzeResultDetails({
  result,
  originalImageUrl,
  reproducedCanvasRef,
  combinedTimings,
  imported,
  handleImportToGenerator,
  t,
}: Readonly<{
  result: QRAnalysisResult;
  originalImageUrl: string | null;
  reproducedCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  combinedTimings: Record<string, number | null | undefined>;
  imported: boolean;
  handleImportToGenerator: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}>) {
  return (
    <>
      <SummaryBar result={result} />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("analyze.original", "Original")}</span>
            {result.imageProperties && (
              <span className="text-xs text-muted-foreground ml-auto">
                {result.imageProperties.width} x {result.imageProperties.height}
              </span>
            )}
          </div>
          <div className="aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden">
            {originalImageUrl ? (
              <img
                src={originalImageUrl}
                alt={t("analyze.originalQrCode", "Original QR Code")}
                data-testid={DynamicTestId.resolve(
                  "analyze-original-image",
                  "analyze-original-image",
                )}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-muted-foreground text-sm">{t("analyze.noImage", "No image")}</div>
            )}
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("analyze.reproduced", "Reproduced")}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {t("analyze.fromExtractedSettings", "From Extracted Settings")}
            </span>
          </div>
          <div className="aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden">
            <canvas
              ref={reproducedCanvasRef}
              data-testid={DynamicTestId.resolve(
                "analyze-reproduced-canvas",
                "analyze-reproduced-canvas",
              )}
              className="max-w-full max-h-full object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>
      </div>

      {result.payload && (
        <div className="border rounded-lg p-4 bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {t("analyze.payloadContent", "Payload Content")}
            </span>
            <span className="text-xs text-muted-foreground ml-auto mr-2">
              {result.payload.length} chars
              {result.payloadBytes && ` · ${result.payloadBytes.length} bytes`}
            </span>
            <CopyButton text={result.payload} label={t("common.copy", "Copy")} />
          </div>
          <pre className="text-sm font-mono bg-muted/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
            {result.payload}
          </pre>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {result.contentType && (
            <CollapsibleSection
              title={t("analyze.contentAnalysis", "Content Analysis")}
              icon={CONTENT_TYPE_ICONS[result.contentType.type] || <QrCode className="w-4 h-4" />}
              badge={
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {result.contentType.label}
                </span>
              }
            >
              <div className="space-y-2">
                <DetailRow
                  label={t("analyze.contentType", "Content Type")}
                  value={result.contentType.label}
                  icon={<Fingerprint className="w-3.5 h-3.5" />}
                />
                {buildContentTypeDetails(result.contentType, result.payload || "").map((detail) => (
                  <DetailRow
                    key={detail.label}
                    label={detail.label}
                    value={detail.value}
                    icon={detail.icon}
                  />
                ))}
              </div>
            </CollapsibleSection>
          )}

          <QrStructurePanel
            version={result.version}
            moduleCount={result.moduleCount}
            eccLevel={result.eccLevel}
            maskPattern={result.maskPattern}
          />

          <EncodingPanel
            encodingMode={result.encodingMode}
            payloadBytes={result.payloadBytes}
            errorsCorrected={result.errorsCorrected}
          />

          {result.dataCapacity && <DataCapacityPanel dataCapacity={result.dataCapacity} />}

          {result.structuralAnalysis && (
            <CollapsibleSection
              title={t("analyze.structuralPatterns", "Structural Patterns")}
              icon={<Settings className="w-4 h-4" />}
              testId="analyze-section-structural-patterns"
            >
              <div className="space-y-2">
                <DetailRow
                  label={t("analyze.finderPatterns", "Finder Patterns")}
                  value={
                    <StatusBadge
                      status={result.structuralAnalysis.hasFinderPatterns}
                      trueLabel={t("analyze.detected", "Detected")}
                      falseLabel={t("analyze.missing", "Missing")}
                    />
                  }
                />
                <DetailRow
                  label={t("analyze.timingPatterns", "Timing Patterns")}
                  value={
                    <StatusBadge
                      status={result.structuralAnalysis.hasTimingPatterns}
                      trueLabel={t("analyze.detected", "Detected")}
                      falseLabel={t("analyze.missing", "Missing")}
                    />
                  }
                />
                <DetailRow
                  label={t("analyze.alignmentPatterns", "Alignment Patterns")}
                  value={
                    result.structuralAnalysis.hasAlignmentPatterns ? (
                      <span className="text-sm">
                        {result.structuralAnalysis.alignmentPatternCount} expected
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A (v1)</span>
                    )
                  }
                />
              </div>
            </CollapsibleSection>
          )}
        </div>

        <AnalyzeCapacityGrid result={result} />

        <div className="grid md:grid-cols-2 gap-4">
          {result.decoderMetadata && (
            <DecoderMetadataPanel decoderMetadata={result.decoderMetadata} />
          )}
          <FormatImagePanel result={result} t={t} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <TimingsSection combinedTimings={combinedTimings} t={t} />
          {result.detectedColors && (
            <ColorsWcagSection
              detectedColors={result.detectedColors}
              dominantColors={result.dominantColors}
            />
          )}
          <SpatialAnalysisSection
            estimatedModulePx={result.estimatedModulePx}
            geometry={result.geometry}
            quietZone={result.quietZone}
            t={t}
          />
        </div>

        <AnalyzeDataGrid result={result} />
      </div>

      <Button
        size="lg"
        className="w-full gap-2 shadow-md"
        onClick={handleImportToGenerator}
        disabled={imported}
      >
        {imported ? (
          <>
            <Check className="w-5 h-5" />
            {t("analyze.imported", "Imported!")}
          </>
        ) : (
          <>
            <ArrowRight className="w-5 h-5" />
            {t("analyze.importToGenerator", "Import to Generator")}
          </>
        )}
      </Button>
    </>
  );
}
