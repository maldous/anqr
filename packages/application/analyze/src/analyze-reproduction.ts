import { createLogger } from "@/domain/logging";
import type { QRAnalysisResult } from "@/contracts/analyze";
import { getStringToBytes, setStringToBytes } from "@/domain/qr/encode";
import { nowMs } from "./formatters";
import {
  computeCanvasSizing,
  computeMarginModules,
  drawCanvasError,
  logReproductionResult,
  renderQRToCanvas,
  resolveColors,
  runMatrixDiagnostics,
} from "./reproduction-canvas";
import {
  buildEncoderInput,
  createQRWithFallback,
  resolveEffectiveMode,
  resolveFinalVersion,
  resolveReproductionParams,
} from "./reproduction-encode";

const log = createLogger("ANALYZE");
const ENABLE_ANALYZE_MATRIX_DIAGNOSTICS =
  import.meta.env.DEV && import.meta.env.VITE_ANALYZE_MATRIX_DIAGNOSTICS === "1";

export function reproduceQRCode(params: {
  result: QRAnalysisResult;
  canvas: HTMLCanvasElement;
  analysisSource: string | null;
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined;
  qrState: {
    version: number;
    maskPattern: "auto" | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    encodingMode: string;
    borderModulesExtra?: number;
  };
  renderState: { fgColor: string; bgColor: string; bgTransparent: boolean; modulePx: number };
}) {
  const { result, canvas, analysisSource, generatedCanvas, qrState, renderState } = params;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { encodeMs: null, renderMs: null, actualVersionUsed: null };

  const { ecc, isGeneratorSource, versionToUse, maskToUse, modeToUse } = resolveReproductionParams(
    result,
    analysisSource,
    generatedCanvas,
    qrState,
  );
  const encoderInput = buildEncoderInput(result, modeToUse);
  const versionToUseFinal = resolveFinalVersion(result.version, versionToUse);
  if (versionToUseFinal === null) {
    drawCanvasError(canvas, ctx, "#fff3cd", "#856404", [
      "Cannot reproduce:",
      "Version not detected",
      "by decoder",
    ]);
    return { encodeMs: null, renderMs: null, actualVersionUsed: null };
  }

  const prevStringToBytes = getStringToBytes();
  const needsIdentityBytes = encoderInput.kind === "bytes";
  if (needsIdentityBytes) {
    setStringToBytes((s: string) => {
      const out: number[] = Array.from({ length: s.length });
      for (let i = 0; i < s.length; i += 1) out[i] = s.codePointAt(i)! & 0xff;
      return out;
    });
  }

  const effectiveMode = resolveEffectiveMode(encoderInput.kind, result.encodingMode, modeToUse);
  const encodeStartMs = nowMs();
  let qrResult;
  try {
    qrResult = createQRWithFallback(
      encoderInput.data,
      ecc,
      versionToUseFinal,
      effectiveMode,
      maskToUse,
    );
  } finally {
    if (needsIdentityBytes) setStringToBytes(prevStringToBytes);
  }

  const { qr, actualVersionUsed } = qrResult;
  const encodeMs = Math.round((nowMs() - encodeStartMs) * 100) / 100;
  const moduleCount = qr.getModuleCount();
  const actualVersion = (moduleCount - 17) / 4;
  const marginModules = computeMarginModules(
    isGeneratorSource,
    generatedCanvas,
    moduleCount,
    renderState.modulePx,
    result.quietZone?.top,
  );
  const { modulePx, size } = computeCanvasSizing(
    isGeneratorSource,
    generatedCanvas,
    moduleCount,
    marginModules,
    renderState.modulePx,
  );
  canvas.width = size;
  canvas.height = size;

  const { fg, bg } = resolveColors(isGeneratorSource, renderState, result.detectedColors ?? null);
  const renderMs = renderQRToCanvas(ctx, qr, moduleCount, marginModules, modulePx, size, fg, bg);
  const diagnostics = ENABLE_ANALYZE_MATRIX_DIAGNOSTICS
    ? runMatrixDiagnostics(
        qr,
        result,
        moduleCount,
        isGeneratorSource,
        generatedCanvas,
        marginModules,
        modulePx,
      )
    : { regenVsDecoded: null, regenVsOriginal: null, bestShift: null };

  logReproductionResult({
    result,
    isGeneratorSource,
    encoderInput,
    ecc,
    versionToUseFinal,
    maskToUse,
    modeToUse,
    effectiveMode,
    actualVersion,
    moduleCount,
    marginModules,
    modulePx,
    size,
    diagnostics,
    qrState,
    log,
  });

  return { encodeMs, renderMs, actualVersionUsed };
}
