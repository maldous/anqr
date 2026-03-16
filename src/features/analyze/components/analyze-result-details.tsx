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
import { Button } from "@/ui/primitives/button";
import { DynamicTestId } from "@/infra/testing/dynamic-testid";
import { AnalyzeCapacityGrid } from "@/features/analyze/components/analyze-capacity-grid";
import { AnalyzeDataGrid } from "@/features/analyze/components/analyze-data-grid";
import { CollapsibleSection } from "@/features/analyze/components/collapsible-section";
import { ColorsWcagSection } from "@/features/analyze/components/colors-wcag-section";
import { CONTENT_TYPE_ICONS } from "@/features/analyze/components/content-type-icons";
import { CopyButton } from "@/features/analyze/components/copy-button";
import { DataCapacityPanel } from "@/features/analyze/components/data-capacity-panel";
import { DecoderMetadataPanel } from "@/features/analyze/components/decoder-metadata-panel";
import { DetailRow } from "@/features/analyze/components/detail-row";
import { EncodingPanel } from "@/features/analyze/components/encoding-panel";
import { FormatImagePanel } from "@/features/analyze/components/format-image-panel";
import { QrStructurePanel } from "@/features/analyze/components/qr-structure-panel";
import { SpatialAnalysisSection } from "@/features/analyze/components/spatial-analysis-section";
import { StatusBadge } from "@/features/analyze/components/status-badge";
import { SummaryBar } from "@/features/analyze/components/summary-bar";
import { TimingsSection } from "@/features/analyze/components/timings-section";
import { buildContentTypeDetails } from "@/features/analyze/components/content-renderers.types";
import type { QRAnalysisResult } from "@/modules/qr-analyzer";

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
            <span className="text-sm font-medium">Original</span>
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
                alt="Original QR Code"
                data-testid={DynamicTestId.resolve(
                  "analyze-original-image",
                  "analyze-original-image",
                )}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-muted-foreground text-sm">No image</div>
            )}
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Reproduced</span>
            <span className="text-xs text-muted-foreground ml-auto">From Extracted Settings</span>
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
            <span className="text-sm font-medium">Payload Content</span>
            <span className="text-xs text-muted-foreground ml-auto mr-2">
              {result.payload.length} chars
              {result.payloadBytes && ` · ${result.payloadBytes.length} bytes`}
            </span>
            <CopyButton text={result.payload} label="Copy" />
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
              title="Content Analysis"
              icon={CONTENT_TYPE_ICONS[result.contentType.type] || <QrCode className="w-4 h-4" />}
              badge={
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {result.contentType.label}
                </span>
              }
            >
              <div className="space-y-2">
                <DetailRow
                  label="Content Type"
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
              title="Structural Patterns"
              icon={<Settings className="w-4 h-4" />}
              testId="analyze-section-structural-patterns"
            >
              <div className="space-y-2">
                <DetailRow
                  label="Finder Patterns"
                  value={
                    <StatusBadge
                      status={result.structuralAnalysis.hasFinderPatterns}
                      trueLabel="Detected"
                      falseLabel="Missing"
                    />
                  }
                />
                <DetailRow
                  label="Timing Patterns"
                  value={
                    <StatusBadge
                      status={result.structuralAnalysis.hasTimingPatterns}
                      trueLabel="Detected"
                      falseLabel="Missing"
                    />
                  }
                />
                <DetailRow
                  label="Alignment Patterns"
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
