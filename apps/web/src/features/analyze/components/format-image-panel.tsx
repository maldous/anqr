import {
  Database,
  FileImage,
  Grid3x3,
  Image as ImageIcon,
  Info,
  QrCode,
  Ratio,
} from "lucide-react";
import type { useTranslation } from "react-i18next";
import { CollapsibleSection } from "./collapsible-section";
import { DetailRow } from "./detail-row";
import { ECC_DESCRIPTIONS } from "./ecc-descriptions";
import type { QRAnalysisResult } from "../../../../../../packages/domain/analyze/src/qr-analyzer/types";

export function FormatImagePanel({
  result,
  t,
}: Readonly<{
  result: QRAnalysisResult;
  t: ReturnType<typeof useTranslation>["t"];
}>) {
  return (
    <div className="space-y-4">
      <CollapsibleSection
        title={t("analyze.formatInformation", "Format Information")}
        icon={<Info className="w-4 h-4" />}
      >
        <div className="space-y-2">
          <DetailRow
            label="Module Count"
            value={`${result.moduleCount} × ${result.moduleCount}`}
            icon={<Grid3x3 className="w-3.5 h-3.5" />}
          />
          {result.version !== null && (
            <DetailRow
              label="Data Modules"
              value={`~${result.moduleCount ** 2 - (result.version > 6 ? 67 : 49) - (result.version > 1 ? 25 * (Math.floor(result.version / 7) + 2) ** 2 : 0)}`}
              icon={<Database className="w-3.5 h-3.5" />}
            />
          )}
          {result.eccLevel && (
            <DetailRow
              label="ECC Description"
              value={ECC_DESCRIPTIONS[result.eccLevel].description}
              icon={<Info className="w-3.5 h-3.5" />}
            />
          )}
        </div>
      </CollapsibleSection>

      {result.imageProperties && (
        <CollapsibleSection
          title={t("analyze.imageProperties", "Image Properties")}
          icon={<FileImage className="w-4 h-4" />}
        >
          <div className="space-y-2">
            <DetailRow
              label="Image Size"
              value={`${result.imageProperties.width} × ${result.imageProperties.height} px`}
              icon={<ImageIcon className="w-3.5 h-3.5" />}
            />
            <DetailRow
              label="Aspect Ratio"
              value={
                result.imageProperties.aspectRatio === 1
                  ? "1:1 (Square)"
                  : `${result.imageProperties.aspectRatio}:1`
              }
              icon={<Ratio className="w-3.5 h-3.5" />}
            />
            {result.imageProperties.estimatedQrSizePx > 0 && (
              <DetailRow
                label="QR Code Size"
                value={`~${result.imageProperties.estimatedQrSizePx} × ${result.imageProperties.estimatedQrSizePx} px`}
                icon={<QrCode className="w-3.5 h-3.5" />}
              />
            )}
            {result.imageProperties.estimatedQrSizePx > 0 && result.imageProperties.width > 0 && (
              <DetailRow
                label="QR Coverage"
                value={`${Math.round((result.imageProperties.estimatedQrSizePx / Math.min(result.imageProperties.width, result.imageProperties.height)) * 100)}% of image`}
                icon={<Grid3x3 className="w-3.5 h-3.5" />}
              />
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
