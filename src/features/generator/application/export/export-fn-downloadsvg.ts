/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Download QR code as SVG format.
 */

import { createLogger } from "@/infra/logging/logger";
import type { ExporterModule } from "@/features/generator/application/export/export-shared-types";
import { expandPackedQArtMatrix } from "@/features/generator/application/generation/generation-fn-expandmatrix";

const log = createLogger("QR");

export async function downloadSvgFormat(params: {
  exporter: ExporterModule;
  exportCanvas: HTMLCanvasElement;
  exportConfig: Record<string, unknown>;
  svgTrueVector: boolean;
  qrMatrix: boolean[][] | null;
  qrPackedMatrixRef: { packed: Uint8Array; moduleCount: number } | null;
  outputWidthPx: number;
  outputFilename: string;
  quietZoneModules: number;
  borderModulesExtra: number;
  renderState: Record<string, unknown>;
  metadataState: Record<string, unknown>;
}): Promise<void> {
  if (!params.svgTrueVector) {
    await params.exporter.downloadSvg(params.exportCanvas, params.exportConfig);
    return;
  }
  let vectorMatrix = params.qrMatrix;
  if (!vectorMatrix && params.qrPackedMatrixRef) {
    const { packed, moduleCount } = params.qrPackedMatrixRef;
    vectorMatrix = expandPackedQArtMatrix(packed, moduleCount);
  }
  if (!vectorMatrix) {
    log.warn(
      "Vector SVG export requested but QR matrix is unavailable. " +
        "Falling back to raster SVG. This can happen with special render modes.",
    );
    await params.exporter.downloadSvg(params.exportCanvas, params.exportConfig);
    return;
  }
  const moduleCount = vectorMatrix.length;
  const totalMargin = params.quietZoneModules + params.borderModulesExtra;
  const svgModuleSize = Math.floor(params.outputWidthPx / (moduleCount + totalMargin * 2)) || 10;
  const rs = params.renderState;
  const ms = params.metadataState;
  const svgMetadata =
    ms.title || ms.author || ms.copyright || ms.description
      ? {
          title: (ms.title as string) || undefined,
          author: (ms.author as string) || undefined,
          copyright: (ms.copyright as string) || undefined,
          description: (ms.description as string) || undefined,
          creationTime: ms.creationTime as boolean,
          software: "ANQR - https://anqr.link",
        }
      : undefined;
  params.exporter.downloadVectorSvg(vectorMatrix, {
    moduleSize: svgModuleSize,
    margin: totalMargin,
    fgColor: rs.fgColor as string,
    bgColor: (rs.bgTransparent ? "transparent" : rs.bgColor) as string,
    filename: params.outputFilename,
    moduleStyle: rs.moduleStyle as string,
    cornerRadius: rs.cornerRadius as number,
    finderStyle: rs.finderStyle as string,
    eyeOuterStyle: rs.eyeOuterStyle as string,
    eyeInnerStyle: rs.eyeInnerStyle as string,
    alignmentStyle: rs.alignmentStyle as string,
    timingStyle: rs.timingStyle as string,
    gradient: rs.gradient,
    metadata: svgMetadata,
  } as Parameters<typeof params.exporter.downloadVectorSvg>[1]);
}
