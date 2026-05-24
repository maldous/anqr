import {
  AlertTriangle,
  Binary,
  Check,
  Code2,
  Database,
  Eye,
  Grid3x3,
  Image as ImageIcon,
  Layers,
  Ruler,
  Shield,
  Type,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DynamicTestId } from "../../../lib/dynamic-testid";
import type { QRAnalysisResult } from "@/contracts/analyze";
import { WCAGBadge } from "./wcag-badge";
import { CONTENT_TYPE_ICONS } from "./content-type-icons";

export const SummaryBar = ({ result }: Readonly<{ result: QRAnalysisResult }>) => {
  const { t } = useTranslation();
  if (!result.success) return null;

  const badgeBase =
    "inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md font-medium text-center flex-1 min-w-[65px] shadow-sm";

  return (
    <div
      className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border rounded-lg shadow-sm py-2 px-3 mb-4 animate-in slide-in-from-top duration-300"
      data-testid={DynamicTestId.resolve("analyze-summary-bar", "analyze-summary-bar")}
    >
      <div className="flex flex-wrap items-stretch gap-1.5 text-xs">
        {result.version !== null && (
          <span className={`${badgeBase} bg-primary/10 text-primary`}>
            <Grid3x3 className="w-3 h-3" />V{result.version}
          </span>
        )}
        {result.eccLevel && (
          <span className={`${badgeBase} bg-blue-500/10 text-blue-700 dark:text-blue-400`}>
            <Shield className="w-3 h-3" />
            ECC-{result.eccLevel}
          </span>
        )}
        {result.maskPattern !== null && (
          <span className={`${badgeBase} bg-indigo-500/10 text-indigo-700 dark:text-indigo-400`}>
            <Layers className="w-3 h-3" />
            {t("analyze.maskShort", "Mask {{n}}", { n: result.maskPattern })}
          </span>
        )}
        {result.encodingMode && result.encodingMode !== "unknown" && (
          <span
            className={`${badgeBase} bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 capitalize`}
          >
            <Code2 className="w-3 h-3" />
            {result.encodingMode}
          </span>
        )}
        {result.contentType && (
          <span className={`${badgeBase} bg-purple-500/10 text-purple-700 dark:text-purple-400`}>
            {CONTENT_TYPE_ICONS[result.contentType.type]}
            {result.contentType.label}
          </span>
        )}
        {result.detectedColors && (
          <span className={`${badgeBase} bg-muted`}>
            <Eye className="w-3 h-3" />
            <WCAGBadge ratio={result.detectedColors.contrastRatio} size="sm" />
          </span>
        )}
        <span className={`${badgeBase} bg-muted text-muted-foreground`}>
          <Grid3x3 className="w-3 h-3" />
          {result.moduleCount}×{result.moduleCount}
        </span>
        {result.payload && (
          <span className={`${badgeBase} bg-muted text-muted-foreground`}>
            <Type className="w-3 h-3" />
            {t("analyze.nChars", "{{count}} chars", { count: result.payload.length })}
          </span>
        )}
        {result.payloadBytes && result.payloadBytes.length > 0 && (
          <span className={`${badgeBase} bg-muted text-muted-foreground`}>
            <Binary className="w-3 h-3" />
            {t("analyze.nBytes", "{{count}} bytes", { count: result.payloadBytes.length })}
          </span>
        )}
        {typeof result.decoderMetadata?.totalByteLength === "number" &&
          result.decoderMetadata.totalByteLength > 0 && (
            <span className={`${badgeBase} bg-muted text-muted-foreground`}>
              <Database className="w-3 h-3" />
              {t("analyze.decShort", "Dec {{n}}", {
                n: result.decoderMetadata.totalByteLength,
              })}
            </span>
          )}
        {typeof result.erasures === "number" && result.erasures >= 0 && (
          <span className={`${badgeBase} bg-amber-500/10 text-amber-700 dark:text-amber-400`}>
            <AlertTriangle className="w-3 h-3" />
            {t("analyze.erasuresN", "Erasures {{n}}", { n: result.erasures })}
          </span>
        )}
        {typeof result.orientation === "number" && (
          <span className={`${badgeBase} bg-muted text-muted-foreground`}>
            <Ruler className="w-3 h-3" />
            {result.orientation}°
          </span>
        )}
        {result.quietZone && (
          <span
            className={`${badgeBase} ${result.quietZone.adequate ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}
          >
            {result.quietZone.adequate ? (
              <Check className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
            {t("safety.quietZone", "Quiet Zone")}
          </span>
        )}
        {result.imageProperties && (
          <span className={`${badgeBase} bg-muted text-muted-foreground`}>
            <ImageIcon className="w-3 h-3" />
            {result.imageProperties.width}×{result.imageProperties.height}
          </span>
        )}
      </div>
    </div>
  );
};
