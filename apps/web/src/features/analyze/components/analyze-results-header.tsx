import { Capacitor } from "@capacitor/core";
import { AlertTriangle, CheckCircle, Download, Info, Upload, XCircle } from "lucide-react";
import type React from "react";
import type { useTranslation } from "react-i18next";
import { Button } from "../../../../../../packages/ui/web/src/primitives/button";
import type { QRAnalysisResult } from "../../../../../../packages/domain/analyze/src/qr-analyzer/types";

export function AnalyzeResultsHeader({
  result,
  handleExportJSON,
  handleFileUpload,
  isLoading,
  t,
}: Readonly<{
  result: QRAnalysisResult;
  handleExportJSON: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  t: ReturnType<typeof useTranslation>["t"];
}>) {
  if (result.success) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 shadow-sm">
        <CheckCircle className="w-5 h-5 shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm">
            {t("analyze.success", "QR Code Analyzed Successfully")}
          </p>
          {result.confidence && (
            <p className="text-xs opacity-80">
              {t("analyze.confidence", "Confidence")}:{" "}
              <span className="font-medium capitalize">{result.confidence}</span>
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportJSON}
          className="gap-1.5 text-green-700 dark:text-green-400 hover:bg-green-500/10"
        >
          <Download className="w-4 h-4" />
          <span className={Capacitor.isNativePlatform() ? "inline" : "hidden sm:inline"}>
            {t("analyze.exportJson", "Export JSON")}
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {result.errorType === "cors_blocked" ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-amber-500/20 bg-amber-500/10">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-amber-700 dark:text-amber-300">
                {t("analyze.corsBlocked", "Image Access Blocked")}
              </p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {t(
                "analyze.corsExplanation",
                "The server hosting this image prevents other websites from accessing it directly (CORS policy). This is a security feature, not an error.",
              )}
            </p>
            <div className="rounded-md bg-muted/50 p-3 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                {t("analyze.howToFix", "How to fix this:")}
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                <li>{t("analyze.corsStep1", "Go to the website with the QR code image")}</li>
                <li>
                  {t("analyze.corsStep2", 'Right-click the image and select "Save image as..."')}
                </li>
                <li>{t("analyze.corsStep3", "Come back here and upload the saved file")}</li>
              </ol>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />
              <Button size="sm" variant="default" className="gap-2" asChild>
                <span>
                  <Upload className="w-4 h-4" />
                  {t("analyze.uploadInstead", "Upload Image Instead")}
                </span>
              </Button>
            </label>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-medium">
              {result.errorType === "no_qr_detected"
                ? t("analyze.noQrDetected", "No QR Code Found")
                : t("analyze.failed", "Analysis Failed")}
            </p>
            <p className="text-sm opacity-90 whitespace-pre-wrap">
              {result.errorType === "no_qr_detected"
                ? t("analyze.noCodeDetectedInImage", "No QR code detected in image")
                : result.error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
