/**
 * Analyze Component
 * Premier QR Code analysis page - the most comprehensive QR analyzer available
 * Extracts and displays every possible detail from uploaded/captured QR codes
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdUnit } from "@/platform/ads/components/ad-unit";
import { type QRAnalysisResult } from "@/modules/qr-analyzer";
import { AnalyzeErrorDisplay } from "@/features/analyze/components/analyze-error-display";
import { AnalyzeHero } from "@/features/analyze/components/analyze-hero";
import { AnalyzeInputCards } from "@/features/analyze/components/analyze-input-cards";
import { AnalyzeResultDetails } from "@/features/analyze/components/analyze-result-details";
import { AnalyzeResultsHeader } from "@/features/analyze/components/analyze-results-header";
import { AnalyzeWarnings } from "@/features/analyze/components/analyze-warnings";
import { useQRStore } from "@/store/qr-store";
import {
  analyzeGeneratorCanvasRobustImpl,
  exportAnalysisJSON,
  importAnalysisToGenerator,
  type AnalysisSourceType,
  type AnalysisStateSetters,
  useAnalysisInputHandlers,
} from "@/features/analyze/lib/analyze-runtime";
import { useReproductionEffect } from "@/features/analyze/lib/reproduction-hook";

export function Analyze({
  onNavigate,
  generatedCanvas,
}: Readonly<{
  onNavigate?: (page: "editor" | "gallery" | "analyze") => void;
  generatedCanvas?: HTMLCanvasElement | OffscreenCanvas | null;
}>) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSource, setLoadingSource] = useState<AnalysisSourceType>(null);
  const [analysisSource, setAnalysisSource] = useState<AnalysisSourceType>(null);
  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);
  const [result, setResult] = useState<QRAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const reproducedCanvasRef = useRef<HTMLCanvasElement>(null);

  const qrState = useQRStore((s) => s.qr);
  const renderState = useQRStore((s) => s.render);

  const setPayloadText = useQRStore((s) => s.setPayloadText);
  const setPayloadKind = useQRStore((s) => s.setPayloadKind);
  const setPayloadUrl = useQRStore((s) => s.setPayloadUrl);
  const setQrEcc = useQRStore((s) => s.setQrEcc);
  const setQrVersion = useQRStore((s) => s.setQrVersion);
  const setQrMaskPattern = useQRStore((s) => s.setQrMaskPattern);
  const setQrEncodingMode = useQRStore((s) => s.setQrEncodingMode);
  const setRenderFgColor = useQRStore((s) => s.setRenderFgColor);
  const setRenderBgColor = useQRStore((s) => s.setRenderBgColor);

  const analyzeGeneratorCanvasRobust = useCallback(analyzeGeneratorCanvasRobustImpl, []);

  const reproState = useReproductionEffect(
    result,
    reproducedCanvasRef,
    analysisSource,
    generatedCanvas,
    qrState,
    renderState,
  );
  const { actualUsedVersion, uiTimings } = reproState;

  const settersWithUiTimings = useMemo<AnalysisStateSetters>(
    () => ({
      setIsLoading,
      setLoadingSource,
      setAnalysisSource,
      setError,
      setResult,
      setImported,
      setUiTimings: reproState.setUiTimings,
      setOriginalImageUrl,
    }),
    [reproState.setUiTimings],
  );

  const {
    handleFileUpload,
    handleUrlSubmit,
    handleCameraCapture,
    handleAnalyzeGenerator,
    urlInput,
    setUrlInput,
  } = useAnalysisInputHandlers(
    t,
    generatedCanvas,
    settersWithUiTimings,
    analyzeGeneratorCanvasRobust,
  );

  const combinedTimings = useMemo(
    () => ({ ...result?.timing, ...uiTimings }),
    [result?.timing, uiTimings],
  );

  const handleImportToGenerator = useCallback(() => {
    if (!(result?.success && result.payload)) return;
    importAnalysisToGenerator(
      result,
      actualUsedVersion,
      {
        setPayloadText,
        setPayloadKind,
        setPayloadUrl,
        setQrEcc,
        setQrVersion,
        setQrMaskPattern,
        setQrEncodingMode,
        setRenderFgColor,
        setRenderBgColor,
      },
      onNavigate,
    );
    setImported(true);
  }, [
    result,
    actualUsedVersion,
    setPayloadText,
    setPayloadKind,
    setPayloadUrl,
    setQrEcc,
    setQrVersion,
    setQrMaskPattern,
    setQrEncodingMode,
    setRenderFgColor,
    setRenderBgColor,
    onNavigate,
  ]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setUrlInput("");
    setImported(false);
    setAnalysisSource(null);
    reproState.setUiTimings({});
    if (originalImageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(originalImageUrl);
    }
    setOriginalImageUrl(null);
  }, [originalImageUrl, setUrlInput, reproState]);

  useEffect(() => {
    setHasAutoAnalyzed(false);
  }, []);

  useEffect(() => {
    if (generatedCanvas && !hasAutoAnalyzed && !result && !isLoading) {
      setHasAutoAnalyzed(true);
      handleAnalyzeGenerator();
    }
  }, [generatedCanvas, hasAutoAnalyzed, result, isLoading, handleAnalyzeGenerator]);

  const handleExportJSON = useCallback(() => {
    if (!result) return;
    exportAnalysisJSON({
      result,
      uiTimings,
      analysisSource,
      actualUsedVersion,
      setUiTimings: reproState.setUiTimings,
    });
  }, [result, actualUsedVersion, analysisSource, uiTimings, reproState]);

  return (
    <main className="flex-1 flex bg-background overflow-hidden">
      {/* Left Skyscraper Ad */}
      <div className="hidden lg:flex flex-col items-center justify-center w-[180px] min-h-[600px] bg-background flex-shrink-0 pl-3 pr-2">
        <AdUnit slot="static-left" width={160} height={600} format="vertical" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          <AnalyzeHero t={t} />

          <AnalyzeInputCards
            t={t}
            generatedCanvas={generatedCanvas}
            isLoading={isLoading}
            loadingSource={loadingSource}
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            handleAnalyzeGenerator={handleAnalyzeGenerator}
            handleFileUpload={handleFileUpload}
            handleUrlSubmit={handleUrlSubmit}
            handleCameraCapture={handleCameraCapture}
          />

          {error && !result && (
            <AnalyzeErrorDisplay error={error} handleReset={handleReset} t={t} />
          )}

          {result && (
            <div className="space-y-4">
              <AnalyzeResultsHeader
                result={result}
                handleExportJSON={handleExportJSON}
                handleFileUpload={handleFileUpload}
                isLoading={isLoading}
                t={t}
              />

              {result.warnings && result.warnings.length > 0 && (
                <AnalyzeWarnings warnings={result.warnings} />
              )}

              {result.success && (
                <AnalyzeResultDetails
                  result={result}
                  originalImageUrl={originalImageUrl}
                  reproducedCanvasRef={reproducedCanvasRef}
                  combinedTimings={combinedTimings}
                  imported={imported}
                  handleImportToGenerator={handleImportToGenerator}
                  t={t}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Skyscraper Ad */}
      <div className="hidden lg:flex flex-col items-center justify-center w-[180px] min-h-[600px] bg-background flex-shrink-0 pl-2 pr-3">
        <AdUnit slot="static-right" width={160} height={600} format="vertical" />
      </div>
    </main>
  );
}
