import { DynamicTestId } from '@/infra/testing/dynamic-testid';
/**
 * Analyze Component
 * Premier QR Code analysis page - the most comprehensive QR analyzer available
 * Extracts and displays every possible detail from uploaded/captured QR codes
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Binary,
  Camera as CameraIcon,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
  Code2,
  CreditCard,
  Database,
  Download,
  Eye,
  FileImage,
  FileText,
  Fingerprint,
  Globe,
  Grid3x3,
  Hash,
  Image as ImageIcon,
  Info,
  Layers,
  Link,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Palette,
  Phone,
  QrCode,
  Ratio,
  Ruler,
  ScanLine,
  Settings,
  Shield,
  Smartphone,
  Square,
  Timer,
  Type,
  Upload,
  Wallet,
  Wifi,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdUnit } from '@/platform/ads/components/AdUnit';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { createLogger } from '@/infra/logging/logger';
import { saveFileNative } from '@/platform/browser/io';
import {
  analyzeQRCode,
  analyzeQRFromFile,
  analyzeQRFromUrl,
  buildAnalysisExportData,
  type ContentType,
  type ECCLevel,
  type QRAnalysisResult,
} from '@/modules/qr-analyzer';
import { CollapsibleSection } from '@/features/analyze/components/collapsible-section';
import { CapacityByModeTable } from '@/features/analyze/components/capacity-by-mode-table';
import { ColorsWcagSection } from '@/features/analyze/components/colors-wcag-section';
import { ColorSwatch } from '@/features/analyze/components/color-swatch';
import { CopyButton } from '@/features/analyze/components/copy-button';
import { DecoderMetadataPanel } from '@/features/analyze/components/decoder-metadata-panel';
import { DetailRow } from '@/features/analyze/components/detail-row';
import { HexDumpView } from '@/features/analyze/components/hex-dump-view';
import { ModuleMatrixView } from '@/features/analyze/components/module-matrix-view';
import { ProgressBar } from '@/features/analyze/components/progress-bar';
import { SpatialAnalysisSection } from '@/features/analyze/components/spatial-analysis-section';
import { StatusBadge } from '@/features/analyze/components/status-badge';
import { SummaryBar } from '@/features/analyze/components/summary-bar';
import { TimingsSection } from '@/features/analyze/components/timings-section';
import { WCAGBadge } from '@/features/analyze/components/wcag-badge';
import {
  cloneCanvasLike,
  findBestMatrixShift,
  scanCachedFramesForQR,
  waitForAnimationReady,
  waitMs,
} from '@/features/analyze/lib/canvas-analysis-helpers';
import {
  capacityBadgeClass,
  formatDecoderErrors,
  formatDecoderErasures,
  formatDecoderMaskPattern,
  formatDecoderNumBits,
  formatDecoderOrientation,
  formatDecoderVersion,
  formatMilliseconds,
  formatRsErrorCorrection,
  hasAnyTimingData,
  nowMs,
  wcagComplianceClass,
} from '@/features/analyze/lib/formatters';
import {
  createQRInstance,
  getStringToBytes,
  optimizeSegments,
  setStringToBytes,
} from '@/modules/qr-encoder';
import { ECC_CAPACITIES_BYTE } from '@/modules/qr-spec';
import { useQRStore } from '@/store/qr-store';

import { buildContentTypeDetails } from '@/features/analyze/components/content-type-renderers';

const log = createLogger('ANALYZE');
const ENABLE_ANALYZE_MATRIX_DIAGNOSTICS =
  import.meta.env.DEV && import.meta.env.VITE_ANALYZE_MATRIX_DIAGNOSTICS === '1';

interface AnalyzeProps {
  onNavigate?: (page: 'editor' | 'gallery' | 'analyze') => void;
  generatedCanvas?: HTMLCanvasElement | OffscreenCanvas | null;
}

// Content type icons mapping
const CONTENT_TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  url: <Globe className="w-4 h-4" />,
  wifi: <Wifi className="w-4 h-4" />,
  vcard: <FileText className="w-4 h-4" />,
  mecard: <FileText className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  tel: <Phone className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
  geo: <MapPin className="w-4 h-4" />,
  crypto_bitcoin: <Wallet className="w-4 h-4" />,
  crypto_ethereum: <Wallet className="w-4 h-4" />,
  crypto_other: <Wallet className="w-4 h-4" />,
  epc_sepa: <CreditCard className="w-4 h-4" />,
  upi: <Smartphone className="w-4 h-4" />,
  emv_qr: <CreditCard className="w-4 h-4" />,
  swiss_qr_bill: <CreditCard className="w-4 h-4" />,
  calendar_event: <FileText className="w-4 h-4" />,
  otp_auth: <Lock className="w-4 h-4" />,
  plain_text: <Type className="w-4 h-4" />,
  unknown: <QrCode className="w-4 h-4" />,
};

// ECC level descriptions
const ECC_DESCRIPTIONS: Record<ECCLevel, { recovery: string; description: string }> = {
  L: { recovery: '~7%', description: 'Low - suitable for clean environments' },
  M: { recovery: '~15%', description: 'Medium - balanced protection' },
  Q: { recovery: '~25%', description: 'Quartile - good for logos' },
  H: { recovery: '~30%', description: 'High - maximum error recovery' },
};

// Mask pattern visual descriptions
const MASK_DESCRIPTIONS: Record<number, string> = {
  0: '(i + j) mod 2 = 0',
  1: 'i mod 2 = 0',
  2: 'j mod 3 = 0',
  3: '(i + j) mod 3 = 0',
  4: '(i/2 + j/3) mod 2 = 0',
  5: '(ij) mod 2 + (ij) mod 3 = 0',
  6: '((ij) mod 2 + (ij) mod 3) mod 2 = 0',
  7: '((i+j) mod 2 + (ij) mod 3) mod 2 = 0',
};

// Encoding Efficiency Component
interface EncodingEfficiencyProps {
  payload: string;
  payloadBytes?: Uint8Array;
  encodingMode: string | null;
}

function EncodingEfficiency({
  payload,
  payloadBytes,
  encodingMode,
}: Readonly<EncodingEfficiencyProps>) {
  const analysis = useMemo(() => {
    const numericChars = (payload.match(/\d/g) || []).length;
    const alphanumericChars = (payload.match(/[0-9A-Z $%*+\-./:]/gi) || []).length;
    const byteChars = payload.length;

    // Calculate potential bit savings
    // Numeric: 3.33 bits per char, Alphanumeric: 5.5 bits per char, Byte: 8 bits per char
    const _numericBits = numericChars * 3.33;
    const _alphanumericBits = alphanumericChars * 5.5;
    const byteBits = byteChars * 8;

    const numericPercentage = byteChars > 0 ? Math.round((numericChars / byteChars) * 100) : 0;
    const alphanumericPercentage =
      byteChars > 0 ? Math.round((alphanumericChars / byteChars) * 100) : 0;

    // Determine optimal mode
    let optimalMode = 'byte';
    if (numericPercentage === 100) optimalMode = 'numeric';
    else if (alphanumericPercentage === 100) optimalMode = 'alphanumeric';
    else if (numericPercentage > 50 || alphanumericPercentage > 50) optimalMode = 'mixed';

    return {
      numericChars,
      alphanumericChars,
      byteChars,
      numericPercentage,
      alphanumericPercentage,
      estimatedBits: Math.round(byteBits),
      optimalMode,
      bytesUsed: payloadBytes?.length ?? new TextEncoder().encode(payload).length,
    };
  }, [payload, payloadBytes]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-muted/50">
          <div className="text-lg font-bold text-primary">{analysis.numericPercentage}%</div>
          <div className="text-[10px] text-muted-foreground">Numeric</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {analysis.alphanumericPercentage}%
          </div>
          <div className="text-[10px] text-muted-foreground">Alphanumeric</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {analysis.bytesUsed}
          </div>
          <div className="text-[10px] text-muted-foreground">Bytes</div>
        </div>
      </div>

      <DetailRow
        label="Current Mode"
        value={<span className="capitalize">{encodingMode || 'Unknown'}</span>}
        icon={<Code2 className="w-3.5 h-3.5" />}
      />
      <DetailRow
        label="Optimal Mode"
        value={
          <span
            className={`capitalize ${
              analysis.optimalMode === encodingMode
                ? 'text-green-600 dark:text-green-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {analysis.optimalMode}
            {analysis.optimalMode === encodingMode && ' ✓'}
          </span>
        }
        icon={<BarChart3 className="w-3.5 h-3.5" />}
      />
      <DetailRow
        label="Character Count"
        value={`${analysis.byteChars} chars`}
        icon={<Type className="w-3.5 h-3.5" />}
      />
    </div>
  );
}

type ValidEncoderMode = 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'auto';

interface ReproductionParams {
  ecc: ECCLevel;
  isGeneratorSource: boolean;
  versionToUse: number | null;
  maskToUse: number | undefined;
  modeToUse: ValidEncoderMode | undefined;
}

function resolveReproductionParams(
  result: QRAnalysisResult,
  analysisSource: string | null,
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  qrState: {
    version: number;
    maskPattern: 'auto' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    encodingMode: string;
  }
): ReproductionParams {
  const ecc: ECCLevel = result.eccLevel || 'M';
  const isGeneratorSource = analysisSource === 'generator' && !!generatedCanvas;

  log.debug('STEP 1 - Detected params', {
    detectedVersion: result.version,
    detectedMaskPattern: result.maskPattern,
    detectedEcc: result.eccLevel,
    detectedEncodingMode: result.encodingMode,
    payloadLength: result.payload?.length ?? 0,
    payloadBytesLength: result.payloadBytes?.length ?? 0,
    payloadPreview: result.payload?.slice(0, 50),
    isGeneratorSource,
    storeVersion: qrState.version,
    storeMaskPattern: qrState.maskPattern,
    storeEncodingMode: qrState.encodingMode,
  });

  const versionToUse = isGeneratorSource ? (result.version ?? qrState.version) : result.version;

  const maskToUse =
    typeof result.maskPattern === 'number' && result.maskPattern >= 0 && result.maskPattern <= 7
      ? result.maskPattern
      : typeof qrState.maskPattern === 'number' && qrState.maskPattern >= 0
        ? qrState.maskPattern
        : undefined;

  const modeToUse = (() => {
    const m = isGeneratorSource ? qrState.encodingMode : result.encodingMode;
    if (m === 'numeric' || m === 'alphanumeric' || m === 'byte' || m === 'kanji' || m === 'auto')
      return m as ValidEncoderMode;
    return undefined;
  })();

  return { ecc, isGeneratorSource, versionToUse, maskToUse, modeToUse };
}

function buildEncoderInput(
  result: QRAnalysisResult,
  modeToUse: ValidEncoderMode | undefined
): { kind: 'bytes' | 'string'; data: string } {
  const bytes = result.payloadBytes;
  const wantsByte = modeToUse === 'byte' || result.encodingMode === 'byte';
  if (bytes?.length && wantsByte) {
    let s = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      const part = bytes.slice(i, i + chunk);
      s += String.fromCodePoint(...Array.from(part));
    }
    return { kind: 'bytes' as const, data: s };
  }
  return { kind: 'string' as const, data: result.payload! };
}

function resolveEffectiveMode(
  encoderInputKind: 'bytes' | 'string',
  resultEncodingMode: string | null,
  modeToUse: ValidEncoderMode | undefined
): ValidEncoderMode | undefined {
  if (encoderInputKind === 'bytes') {
    if (resultEncodingMode === 'byte') return 'byte';
    return undefined;
  }
  return modeToUse;
}

function resolveFinalVersion(
  resultVersion: number | null,
  versionToUse: number | null
): number | null {
  if (typeof resultVersion === 'number' && resultVersion >= 1 && resultVersion <= 40)
    return resultVersion;
  if (typeof versionToUse === 'number' && versionToUse >= 1 && versionToUse <= 40)
    return versionToUse;
  return null;
}

function buildMaskPatternOption(
  maskToUse: number | undefined
): { maskPattern: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 } | Record<string, never> {
  if (typeof maskToUse === 'number' && maskToUse >= 0 && maskToUse <= 7)
    return { maskPattern: maskToUse as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 };
  return {};
}

function tryCreateQRDirect(
  data: string,
  ecc: ECCLevel,
  version: number,
  effectiveMode: ValidEncoderMode | undefined,
  maskToUse: number | undefined
): ReturnType<typeof createQRInstance> | null {
  try {
    const qr = createQRInstance(data, ecc, version, {
      ...(effectiveMode ? { mode: effectiveMode } : {}),
      ...buildMaskPatternOption(maskToUse),
    });
    log.debug('STEP 3b - createQRInstance SUCCESS');
    return qr;
  } catch (err) {
    log.warn('STEP 3b - createQRInstance FAILED', {
      error: err instanceof Error ? err.message : String(err),
      requestedVersion: version,
      ecc,
      dataLength: data.length,
      mode: effectiveMode,
      maskPattern: maskToUse,
    });
    throw err;
  }
}

function tryMixedModeAtVersion(
  data: string,
  ecc: ECCLevel,
  version: number,
  maskToUse: number | undefined
): ReturnType<typeof createQRInstance> | null {
  const segments = optimizeSegments(data);
  const hasMixedModeOptimization =
    segments.length > 1 || (segments.length === 1 && segments[0].mode !== 'byte');

  if (!hasMixedModeOptimization) return null;

  log.debug('STEP 3c - Trying MIXED MODE encoding at original version', {
    segments: segments.map((s) => ({ mode: s.mode, len: s.data.length })),
    originalVersion: version,
  });

  try {
    const qr = createQRInstance(data, ecc, version, {
      mode: 'mixed',
      ...buildMaskPatternOption(maskToUse),
    });
    log.debug('STEP 3c - MIXED MODE SUCCESS at original version!', {
      version,
      segments: segments.map((s) => ({ mode: s.mode, len: s.data.length })),
    });
    return qr;
  } catch (mixedModeError) {
    log.debug('STEP 3c - Mixed mode failed, trying higher versions...', {
      error: mixedModeError instanceof Error ? mixedModeError.message : String(mixedModeError),
    });
    return null;
  }
}

function tryHigherVersions(
  data: string,
  ecc: ECCLevel,
  startVersion: number,
  maskToUse: number | undefined
): { qr: ReturnType<typeof createQRInstance>; version: number } {
  log.debug('STEP 3c - Trying higher versions due to overflow...');
  for (let tryVersion = startVersion + 1; tryVersion <= 40; tryVersion++) {
    try {
      const qr = createQRInstance(data, ecc, tryVersion, {
        mode: 'mixed',
        ...buildMaskPatternOption(maskToUse),
      });
      log.debug('STEP 3c - VERSION UPGRADE: Successfully encoded at version', {
        originalVersion: startVersion,
        newVersion: tryVersion,
        versionIncrease: tryVersion - startVersion,
        ecc,
        maskPattern: maskToUse,
        usedMixedMode: true,
      });
      return { qr, version: tryVersion };
    } catch {
      // Try next version
    }
  }
  throw new Error(`Data too large: cannot fit in any QR version (1-40) with ECC ${ecc}`);
}

function createQRWithFallback(
  data: string,
  ecc: ECCLevel,
  version: number,
  effectiveMode: ValidEncoderMode | undefined,
  maskToUse: number | undefined
): { qr: ReturnType<typeof createQRInstance>; actualVersionUsed: number } {
  try {
    const qr = tryCreateQRDirect(data, ecc, version, effectiveMode, maskToUse);
    return { qr: qr!, actualVersionUsed: version };
  } catch (encoderError) {
    const errorMessage =
      encoderError instanceof Error ? encoderError.message : String(encoderError);
    if (!errorMessage.includes('overflow')) throw encoderError;

    const mixedQr = tryMixedModeAtVersion(data, ecc, version, maskToUse);
    if (mixedQr) return { qr: mixedQr, actualVersionUsed: version };

    const upgraded = tryHigherVersions(data, ecc, version, maskToUse);
    return { qr: upgraded.qr, actualVersionUsed: upgraded.version };
  }
}

function computeMarginModules(
  isGeneratorSource: boolean,
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  moduleCount: number,
  renderStateModulePx: number,
  quietZoneTop: number | undefined
): number {
  if (isGeneratorSource && generatedCanvas) {
    const modulePxFromStore = Math.max(1, Math.floor(renderStateModulePx || 1));
    const totalModules = Math.round(generatedCanvas.width / modulePxFromStore);
    const inferred = Math.max(0, Math.floor((totalModules - moduleCount) / 2));
    log.debug('STEP 5 - Margin calculation (generator)', {
      renderStateModulePx,
      modulePxFromStore,
      canvasWidth: generatedCanvas.width,
      totalModulesInferred: totalModules,
      qrModuleCount: moduleCount,
      inferredMargin: inferred,
      calculation: `floor((${totalModules} - ${moduleCount}) / 2) = ${inferred}`,
    });
    return inferred;
  }
  const margin = Math.max(4, quietZoneTop ?? 4);
  log.debug('STEP 5 - Margin calculation (external)', { quietZoneTop, margin });
  return margin;
}

function computeCanvasSizing(
  isGeneratorSource: boolean,
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  moduleCount: number,
  marginModules: number,
  renderStateModulePx: number
): { modulePx: number; size: number } {
  if (isGeneratorSource && generatedCanvas) {
    const size = generatedCanvas.width;
    const totalModulesWithMargin = moduleCount + marginModules * 2;
    const modulePx = Math.max(1, Math.floor(size / totalModulesWithMargin));
    log.debug('STEP 6 - Canvas sizing (generator)', {
      canvasSize: size,
      moduleCount,
      marginModules,
      totalModulesWithMargin,
      calculatedModulePx: modulePx,
      renderStateModulePx,
      totalPixelsNeeded: totalModulesWithMargin * modulePx,
      willFit: totalModulesWithMargin * modulePx <= size,
    });
    return { modulePx, size };
  }
  const targetSize = 300;
  const totalModules = moduleCount + marginModules * 2;
  const modulePx = Math.max(3, Math.floor(targetSize / totalModules));
  const size = totalModules * modulePx;
  log.debug('STEP 6 - Canvas sizing (external)', {
    targetSize,
    moduleCount,
    marginModules,
    totalModules,
    calculatedModulePx: modulePx,
    calculatedSize: size,
  });
  return { modulePx, size };
}

function renderQRToCanvas(
  ctx: CanvasRenderingContext2D,
  qr: ReturnType<typeof createQRInstance>,
  moduleCount: number,
  marginModules: number,
  modulePx: number,
  size: number,
  fg: string,
  bg: string
): number {
  const renderStartMs = nowMs();
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = fg;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!qr.isDark(row, col)) continue;
      const x = (marginModules + col) * modulePx;
      const y = (marginModules + row) * modulePx;
      ctx.fillRect(x, y, modulePx, modulePx);
    }
  }
  return Math.round((nowMs() - renderStartMs) * 100) / 100;
}

function resolveColors(
  isGeneratorSource: boolean,
  renderState: { fgColor: string; bgColor: string; bgTransparent: boolean },
  detectedColors: { foreground: string; background: string } | null
): { fg: string; bg: string } {
  const fg = isGeneratorSource ? renderState.fgColor : detectedColors?.foreground || '#000000';
  const bg = isGeneratorSource
    ? renderState.bgTransparent
      ? '#ffffff'
      : renderState.bgColor
    : detectedColors?.background || '#ffffff';
  return { fg, bg };
}

function runMatrixDiagnostics(
  qr: ReturnType<typeof createQRInstance>,
  result: QRAnalysisResult,
  moduleCount: number,
  isGeneratorSource: boolean,
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  marginModules: number,
  modulePx: number
): {
  regenVsDecoded: {
    rows: number;
    cols: number;
    diffCount: number;
    diffPct: number;
    firstDiff: { row: number; col: number; a: boolean; b: boolean } | null;
  } | null;
  regenVsOriginal: {
    rows: number;
    cols: number;
    diffCount: number;
    diffPct: number;
    firstDiff: { row: number; col: number; a: boolean; b: boolean } | null;
  } | null;
  bestShift: { dr: number; dc: number; diffCount: number; diffPct: number } | null;
} {
  const buildRegenMatrix = (): boolean[][] => {
    const m: boolean[][] = new Array(moduleCount);
    for (let r = 0; r < moduleCount; r += 1) {
      const row: boolean[] = new Array(moduleCount);
      for (let c = 0; c < moduleCount; c += 1) row[c] = qr.isDark(r, c);
      m[r] = row;
    }
    return m;
  };

  const diffMatrices = (a: boolean[][], b: boolean[][]) => {
    const rows = Math.min(a.length, b.length);
    const cols = rows ? Math.min(a[0].length, b[0].length) : 0;
    let diffCount = 0;
    let firstDiff: { row: number; col: number; a: boolean; b: boolean } | null = null;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (a[r][c] === b[r][c]) continue;
        diffCount += 1;
        firstDiff ??= { row: r, col: c, a: a[r][c], b: b[r][c] };
      }
    }
    const total = rows * cols;
    return { rows, cols, diffCount, diffPct: total ? diffCount / total : 0, firstDiff };
  };

  const sampleOriginalMatrix = (): boolean[][] | null => {
    if (!(isGeneratorSource && generatedCanvas)) return null;
    const gctx =
      (generatedCanvas.getContext('2d', {
        willReadFrequently: true,
        desynchronized: true,
      } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null) ??
      (generatedCanvas.getContext('2d') as CanvasRenderingContext2D | null);
    if (!gctx) return null;
    const canvasWidth = generatedCanvas.width;
    const canvasHeight = generatedCanvas.height;
    if (canvasWidth <= 0 || canvasHeight <= 0) return null;
    const pixels = gctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
    const m: boolean[][] = new Array(moduleCount);
    for (let r = 0; r < moduleCount; r += 1) {
      const row: boolean[] = new Array(moduleCount);
      for (let c = 0; c < moduleCount; c += 1) {
        const x = Math.max(
          0,
          Math.min(canvasWidth - 1, Math.floor((marginModules + c + 0.5) * modulePx))
        );
        const y = Math.max(
          0,
          Math.min(canvasHeight - 1, Math.floor((marginModules + r + 0.5) * modulePx))
        );
        const pixelIndex = (y * canvasWidth + x) * 4;
        const lum = (pixels[pixelIndex] + pixels[pixelIndex + 1] + pixels[pixelIndex + 2]) / 3;
        const dark = pixels[pixelIndex + 3] > 16 && lum < 128;
        row[c] = dark;
      }
      m[r] = row;
    }
    return m;
  };

  const regenMatrix = buildRegenMatrix();
  const regenVsDecoded = result.moduleMatrix
    ? diffMatrices(result.moduleMatrix, regenMatrix)
    : null;
  const originalMatrix = sampleOriginalMatrix();
  const regenVsOriginal = originalMatrix ? diffMatrices(originalMatrix, regenMatrix) : null;
  const bestShift = originalMatrix
    ? findBestMatrixShift(originalMatrix, regenMatrix, moduleCount)
    : null;
  return { regenVsDecoded, regenVsOriginal, bestShift };
}

function drawCanvasError(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  bgColor: string,
  textColor: string,
  lines: string[]
): void {
  canvas.width = 200;
  canvas.height = 200;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = textColor;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  lines.forEach((line, i) => ctx.fillText(line, 100, 80 + i * 20));
}

function buildPayloadBytesHead(payloadBytes: Uint8Array | undefined): string | null {
  if (!payloadBytes?.length) return null;
  return Array.from(payloadBytes.slice(0, 16))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
}

function checkVersionMismatch(
  result: QRAnalysisResult,
  actualVersion: number,
  moduleCount: number
): void {
  if (result.version && actualVersion !== result.version) {
    log.warn('VERSION MISMATCH!', {
      detectedVersion: result.version,
      detectedModuleCount: result.moduleCount,
      producedVersion: actualVersion,
      producedModuleCount: moduleCount,
      expectedModuleCount: result.version * 4 + 17,
      diff: actualVersion - result.version,
    });
  }
}

function logFinalRenderSummary(
  result: QRAnalysisResult,
  actualVersion: number,
  moduleCount: number,
  marginModules: number,
  modulePx: number,
  size: number,
  isGeneratorSource: boolean
): void {
  log.debug('STEP 7 - Final render summary', {
    canvasSize: `${size}x${size}`,
    modulePx,
    moduleCount,
    actualVersion,
    detectedVersion: result.version,
    versionMismatch: result.version && actualVersion !== result.version,
    marginModules,
    totalPixelsUsed: (moduleCount + marginModules * 2) * modulePx,
    isGeneratorSource,
  });

  if (result.version && actualVersion !== result.version) {
    log.warn('FINAL WARNING: Version mismatch will cause visual discrepancy!', {
      expected: `Version ${result.version} (${result.version * 4 + 17}x${result.version * 4 + 17} modules)`,
      produced: `Version ${actualVersion} (${moduleCount}x${moduleCount} modules)`,
      sizeDiff: moduleCount - (result.version * 4 + 17),
    });
  }
}

interface LogReproductionResultParams {
  result: QRAnalysisResult;
  isGeneratorSource: boolean;
  encoderInput: { kind: 'bytes' | 'string'; data: string };
  ecc: ECCLevel;
  versionToUseFinal: number;
  maskToUse: number | undefined;
  modeToUse: ValidEncoderMode | undefined;
  effectiveMode: ValidEncoderMode | undefined;
  actualVersion: number;
  moduleCount: number;
  marginModules: number;
  modulePx: number;
  size: number;
  diagnostics: ReturnType<typeof runMatrixDiagnostics>;
  qrState: { borderModulesExtra?: number };
}

function logReproductionResult(params: LogReproductionResultParams): void {
  const {
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
  } = params;

  const payloadBytesHead = buildPayloadBytesHead(result.payloadBytes);
  const reproductionMismatch = actualVersion !== result.version;

  log.debug('Generated QR code', {
    strategy: isGeneratorSource ? 'exact' : 'detected_only',
    reproductionMismatch,
    encoderInputKind: encoderInput.kind,
    payloadPreview: (result.payload ?? '').slice(0, 80),
    payloadBytesLen: result.payloadBytes?.length ?? null,
    payloadBytesHead,
    ecc,
    detectedVersion: result.version,
    usedVersion: versionToUseFinal,
    detectedMaskPattern: result.maskPattern,
    usedMaskPattern: typeof maskToUse === 'number' ? maskToUse : null,
    usedMode: effectiveMode ?? null,
    actualVersion,
    moduleCount,
    marginModules,
    borderModulesExtra: isGeneratorSource ? qrState.borderModulesExtra || 0 : null,
    modulePx,
    canvasSize: size,
    matrix: diagnostics,
  });
  if (diagnostics.regenVsOriginal && diagnostics.regenVsOriginal.diffCount > 0) {
    log.warn('Matrix mismatch (original vs regenerated)', {
      ecc,
      version: { detected: result.version, used: versionToUseFinal, actual: actualVersion },
      mask: {
        detected: result.maskPattern,
        used: typeof maskToUse === 'number' ? maskToUse : null,
      },
      mode: { requested: modeToUse ?? null, effective: effectiveMode ?? null },
      encoderInputKind: encoderInput.kind,
      payloadBytesLen: result.payloadBytes?.length ?? null,
      payloadBytesHead,
      regenVsDecoded: diagnostics.regenVsDecoded,
      regenVsOriginal: diagnostics.regenVsOriginal,
      bestShift: diagnostics.bestShift,
    });
  }
}

interface ReproduceQRCodeParams {
  result: QRAnalysisResult;
  canvas: HTMLCanvasElement;
  analysisSource: string | null;
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined;
  qrState: {
    version: number;
    maskPattern: 'auto' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    encodingMode: string;
    borderModulesExtra?: number;
  };
  renderState: { fgColor: string; bgColor: string; bgTransparent: boolean; modulePx: number };
}

function reproduceQRCode(params: ReproduceQRCodeParams): {
  encodeMs: number | null;
  renderMs: number | null;
  actualVersionUsed: number | null;
} {
  const { result, canvas, analysisSource, generatedCanvas, qrState, renderState } = params;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { encodeMs: null, renderMs: null, actualVersionUsed: null };

  const { ecc, isGeneratorSource, versionToUse, maskToUse, modeToUse } = resolveReproductionParams(
    result,
    analysisSource,
    generatedCanvas,
    qrState
  );

  const encoderInput = buildEncoderInput(result, modeToUse);

  const encoderInputPreview =
    encoderInput.kind === 'bytes'
      ? `[bytes] len=${encoderInput.data.length}, first32codes=[${encoderInput.data
          .slice(0, 32)
          .split('')
          .map((c) => c.codePointAt(0)!)
          .join(',')}]`
      : `[string] len=${encoderInput.data.length}, first32="${encoderInput.data.slice(0, 32)}"`;
  log.debug('STEP 2 - Encoder input', {
    kind: encoderInput.kind,
    dataLength: encoderInput.data.length,
    preview: encoderInputPreview,
    modeToUse,
    wantsByte: modeToUse === 'byte' || result.encodingMode === 'byte',
    hasPayloadBytes: !!result.payloadBytes?.length,
  });

  const versionToUseFinal = resolveFinalVersion(result.version, versionToUse);

  if (versionToUseFinal === null) {
    log.error('CANNOT REPRODUCE: Version not detected by decoder');
    drawCanvasError(canvas, ctx, '#fff3cd', '#856404', [
      'Cannot reproduce:',
      'Version not detected',
      'by decoder',
    ]);
    return { encodeMs: null, renderMs: null, actualVersionUsed: null };
  }

  const prevStringToBytes = getStringToBytes();
  const needsIdentityBytes = encoderInput.kind === 'bytes';

  if (needsIdentityBytes) {
    setStringToBytes((s: string) => {
      const out: number[] = new Array(s.length);
      for (let i = 0; i < s.length; i += 1) out[i] = s.codePointAt(i)! & 0xff;
      return out;
    });
  }

  const effectiveMode = resolveEffectiveMode(encoderInput.kind, result.encodingMode, modeToUse);

  log.debug('STEP 3 - createQRInstance params', {
    dataLength: encoderInput.data.length,
    ecc,
    version: versionToUseFinal,
    mode: effectiveMode ?? 'auto (undefined)',
    maskPattern:
      typeof maskToUse === 'number' && maskToUse >= 0 && maskToUse <= 7
        ? maskToUse
        : 'auto (undefined)',
    needsIdentityBytes,
  });

  let qrResult: { qr: ReturnType<typeof createQRInstance>; actualVersionUsed: number };
  const encodeStartMs = nowMs();
  try {
    qrResult = createQRWithFallback(
      encoderInput.data,
      ecc,
      versionToUseFinal,
      effectiveMode,
      maskToUse
    );
  } finally {
    if (needsIdentityBytes) setStringToBytes(prevStringToBytes);
  }

  const { qr, actualVersionUsed } = qrResult;
  const encodeMs = Math.round((nowMs() - encodeStartMs) * 100) / 100;

  const moduleCount = qr.getModuleCount();
  const actualVersion = (moduleCount - 17) / 4;

  log.debug('STEP 4 - QR instance result', {
    moduleCount,
    actualVersion,
    requestedVersion: versionToUseFinal,
    actualVersionUsed,
    versionMatch: actualVersion === (result.version ?? actualVersion),
  });

  checkVersionMismatch(result, actualVersion, moduleCount);

  const marginModules = computeMarginModules(
    isGeneratorSource,
    generatedCanvas,
    moduleCount,
    renderState.modulePx,
    result.quietZone?.top
  );

  const { modulePx, size } = computeCanvasSizing(
    isGeneratorSource,
    generatedCanvas,
    moduleCount,
    marginModules,
    renderState.modulePx
  );

  canvas.width = size;
  canvas.height = size;

  logFinalRenderSummary(
    result,
    actualVersion,
    moduleCount,
    marginModules,
    modulePx,
    size,
    isGeneratorSource
  );

  const { fg, bg } = resolveColors(isGeneratorSource, renderState, result.detectedColors ?? null);
  const renderMs = renderQRToCanvas(ctx, qr, moduleCount, marginModules, modulePx, size, fg, bg);

  let diagnostics: ReturnType<typeof runMatrixDiagnostics> = {
    regenVsDecoded: null,
    regenVsOriginal: null,
    bestShift: null,
  };
  if (ENABLE_ANALYZE_MATRIX_DIAGNOSTICS) {
    diagnostics = runMatrixDiagnostics(
      qr,
      result,
      moduleCount,
      isGeneratorSource,
      generatedCanvas,
      marginModules,
      modulePx
    );
  }

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
  });

  return { encodeMs, renderMs, actualVersionUsed };
}

interface ImportToGeneratorSetters {
  setPayloadText: (v: string) => void;
  setPayloadKind: (v: 'url' | 'plain_text') => void;
  setPayloadUrl: (v: { href: string }) => void;
  setQrEcc: (v: 'L' | 'M' | 'Q' | 'H') => void;
  setQrVersion: (v: number) => void;
  setQrMaskPattern: (v: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  setQrEncodingMode: (v: 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji') => void;
  setRenderFgColor: (v: string) => void;
  setRenderBgColor: (v: string) => void;
}

function importAnalysisToGenerator(
  result: QRAnalysisResult,
  actualUsedVersion: number | null,
  setters: ImportToGeneratorSetters,
  onNavigate: ((page: 'editor' | 'gallery' | 'analyze') => void) | undefined
): void {
  if (!(result.success && result.payload)) return;

  if (result.payload.startsWith('http://') || result.payload.startsWith('https://')) {
    setters.setPayloadKind('url');
    setters.setPayloadUrl({ href: result.payload });
  } else {
    setters.setPayloadKind('plain_text');
  }
  setters.setPayloadText(result.payload);

  if (result.eccLevel) {
    setters.setQrEcc(result.eccLevel as 'L' | 'M' | 'Q' | 'H');
  }
  const versionToImport = actualUsedVersion ?? result.version;
  if (versionToImport !== null && versionToImport >= 1 && versionToImport <= 40) {
    setters.setQrVersion(versionToImport);
  }
  if (result.maskPattern !== null && result.maskPattern >= 0 && result.maskPattern <= 7) {
    setters.setQrMaskPattern(result.maskPattern as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7);
  }
  if (result.encodingMode && result.encodingMode !== 'unknown' && result.encodingMode !== 'mixed') {
    const modeMap: Record<string, 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji'> = {
      numeric: 'numeric',
      alphanumeric: 'alphanumeric',
      byte: 'byte',
      kanji: 'kanji',
    };
    if (modeMap[result.encodingMode]) {
      setters.setQrEncodingMode(modeMap[result.encodingMode]);
    }
  }

  if (result.detectedColors) {
    setters.setRenderFgColor(result.detectedColors.foreground);
    setters.setRenderBgColor(result.detectedColors.background);
  }

  setTimeout(() => {
    if (onNavigate) {
      onNavigate('editor');
    } else {
      globalThis.location.hash = '';
      globalThis.location.search = '';
      if (globalThis.location.pathname === '/' || globalThis.location.pathname === '') {
        globalThis.location.reload();
      } else {
        globalThis.location.href = '/';
      }
    }
  }, 500);
}

type AnalysisSourceType = 'file' | 'url' | 'camera' | 'generator' | null;

interface AnalysisStateSetters {
  setIsLoading: (v: boolean) => void;
  setLoadingSource: (v: AnalysisSourceType) => void;
  setAnalysisSource: (v: AnalysisSourceType) => void;
  setError: (v: string | null) => void;
  setResult: (v: QRAnalysisResult | null) => void;
  setImported: (v: boolean) => void;
  setUiTimings: (
    v: React.SetStateAction<{
      encodeMs?: number | null;
      renderMs?: number | null;
      exportMs?: number | null;
    }>
  ) => void;
  setOriginalImageUrl: (v: React.SetStateAction<string | null>) => void;
}

function resetAnalysisState(setters: AnalysisStateSetters): void {
  setters.setError(null);
  setters.setResult(null);
  setters.setImported(false);
  setters.setUiTimings({});
}

function useAnalysisInputHandlers(
  t: ReturnType<typeof useTranslation>['t'],
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  setters: AnalysisStateSetters,
  analyzeGeneratorCanvasRobust: (
    sourceCanvas: HTMLCanvasElement | OffscreenCanvas
  ) => Promise<QRAnalysisResult>
) {
  const [urlInput, setUrlInput] = useState('');

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setters.setIsLoading(true);
      setters.setLoadingSource('file');
      setters.setAnalysisSource('file');
      resetAnalysisState(setters);
      const imageUrl = URL.createObjectURL(file);
      setters.setOriginalImageUrl(imageUrl);
      try {
        const analysisResult = await analyzeQRFromFile(file);
        setters.setResult(analysisResult);
        if (!analysisResult.success) {
          setters.setError(
            analysisResult.error || t('analyze.genericError', 'Failed to analyze QR code')
          );
        }
      } catch (err) {
        setters.setError(
          err instanceof Error
            ? err.message
            : t('analyze.genericError', 'Failed to analyze QR code')
        );
      } finally {
        setters.setIsLoading(false);
        setters.setLoadingSource(null);
        e.target.value = '';
      }
    },
    [t, setters]
  );

  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) {
      setters.setError(t('analyze.urlRequired', 'Please enter a URL'));
      return;
    }
    setters.setIsLoading(true);
    setters.setLoadingSource('url');
    setters.setAnalysisSource('url');
    resetAnalysisState(setters);
    setters.setOriginalImageUrl(urlInput.trim());
    try {
      const analysisResult = await analyzeQRFromUrl(urlInput.trim());
      setters.setResult(analysisResult);
      if (!analysisResult.success) {
        setters.setError(
          analysisResult.error || t('analyze.genericError', 'Failed to analyze QR code')
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('analyze.loadFailed', 'Failed to load image');
      setters.setError(message);
    } finally {
      setters.setIsLoading(false);
      setters.setLoadingSource(null);
    }
  }, [urlInput, t, setters]);

  const handleCameraCapture = useCallback(async () => {
    setters.setIsLoading(true);
    setters.setLoadingSource('camera');
    setters.setAnalysisSource('camera');
    resetAnalysisState(setters);
    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera === 'denied') {
        const requested = await Camera.requestPermissions();
        if (requested.camera === 'denied') {
          setters.setError(t('camera.permissionDenied', 'Camera permission denied'));
          return;
        }
      }
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      if (!image.webPath) {
        setters.setError(t('analyze.cameraLoadFailed', 'Failed to load captured image'));
        return;
      }
      setters.setOriginalImageUrl(image.webPath);
      const response = await fetch(image.webPath);
      if (!response.ok) {
        throw new Error(`Camera image fetch failed: ${response.status}`);
      }
      const blob = await response.blob();
      const maxEdge = 1600;
      const { source, sourceWidth, sourceHeight } = await loadCameraImageFromBlob(blob);
      const sourceMaxEdge = Math.max(sourceWidth, sourceHeight);
      const scale = sourceMaxEdge > maxEdge ? maxEdge / sourceMaxEdge : 1;
      const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
      const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', {
        willReadFrequently: true,
      } as CanvasRenderingContext2DSettings | undefined);
      if (!ctx) {
        closeBitmapSource(source);
        setters.setError(t('analyze.cameraProcessError', 'Could not process image'));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
      closeBitmapSource(source);
      const analysisResult = analyzeQRCode(canvas);
      setters.setResult(analysisResult);
      setters.setAnalysisSource('camera');
      if (!analysisResult.success) {
        setters.setError(
          analysisResult.error || t('analyze.noCodeDetected', 'No QR code detected')
        );
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (!(errorMessage.includes('cancelled') || errorMessage.includes('User cancelled'))) {
        setters.setError(t('analyze.cameraFailed', 'Camera capture failed'));
      }
    } finally {
      setters.setIsLoading(false);
      setters.setLoadingSource(null);
    }
  }, [t, setters]);

  const handleAnalyzeGenerator = useCallback(async () => {
    if (!generatedCanvas) return;
    setters.setIsLoading(true);
    setters.setLoadingSource('generator');
    resetAnalysisState(setters);
    try {
      const canvasForDisplay =
        generatedCanvas instanceof HTMLCanvasElement
          ? generatedCanvas
          : cloneCanvasLike(generatedCanvas);
      if (typeof canvasForDisplay.toBlob === 'function') {
        const blob = await new Promise<Blob | null>((resolve) => {
          canvasForDisplay.toBlob((nextBlob) => resolve(nextBlob), 'image/png');
        });
        if (blob) {
          const objectUrl = URL.createObjectURL(blob);
          setters.setOriginalImageUrl((previous) => {
            if (typeof previous === 'string' && previous.startsWith('blob:')) {
              URL.revokeObjectURL(previous);
            }
            return objectUrl;
          });
        } else {
          setters.setOriginalImageUrl(canvasForDisplay.toDataURL('image/png'));
        }
      } else {
        setters.setOriginalImageUrl(canvasForDisplay.toDataURL('image/png'));
      }
      const analysisResult = await analyzeGeneratorCanvasRobust(generatedCanvas);
      setters.setResult(analysisResult);
      setters.setAnalysisSource('generator');
      if (!analysisResult.success) {
        setters.setError(
          analysisResult.error || t('analyze.noCodeDetected', 'No QR code detected')
        );
      }
    } catch (err) {
      setters.setError(
        err instanceof Error ? err.message : t('analyze.genericError', 'Failed to analyze QR code')
      );
    } finally {
      setters.setIsLoading(false);
      setters.setLoadingSource(null);
    }
  }, [generatedCanvas, t, analyzeGeneratorCanvasRobust, setters]);

  return {
    handleFileUpload,
    handleUrlSubmit,
    handleCameraCapture,
    handleAnalyzeGenerator,
    urlInput,
    setUrlInput,
  };
}

function loadCameraImageFromBlob(blob: Blob): Promise<{
  source: ImageBitmap | HTMLImageElement;
  sourceWidth: number;
  sourceHeight: number;
}> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(blob).then((bitmap) => ({
      source: bitmap,
      sourceWidth: bitmap.width,
      sourceHeight: bitmap.height,
    }));
  }
  const objectUrl = URL.createObjectURL(blob);
  return new Promise<{
    source: ImageBitmap | HTMLImageElement;
    sourceWidth: number;
    sourceHeight: number;
  }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ source: img, sourceWidth: img.naturalWidth, sourceHeight: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode camera image'));
    };
    img.src = objectUrl;
  });
}

function closeBitmapSource(source: ImageBitmap | HTMLImageElement): void {
  if ('close' in source && typeof source.close === 'function') {
    source.close();
  }
}

function useReproductionEffect(
  result: QRAnalysisResult | null,
  reproducedCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  analysisSource: AnalysisSourceType,
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  qrState: Parameters<typeof reproduceQRCode>[0]['qrState'],
  renderState: Parameters<typeof reproduceQRCode>[0]['renderState']
): {
  actualUsedVersion: number | null;
  uiTimings: { encodeMs?: number | null; renderMs?: number | null; exportMs?: number | null };
  setUiTimings: React.Dispatch<
    React.SetStateAction<{
      encodeMs?: number | null;
      renderMs?: number | null;
      exportMs?: number | null;
    }>
  >;
} {
  const [actualUsedVersion, setActualUsedVersion] = useState<number | null>(null);
  const [uiTimings, setUiTimings] = useState<{
    encodeMs?: number | null;
    renderMs?: number | null;
    exportMs?: number | null;
  }>({});

  useEffect(() => {
    if (!(result?.success && result.payload && reproducedCanvasRef.current)) return;
    const canvas = reproducedCanvasRef.current;
    try {
      const reproResult = reproduceQRCode({
        result,
        canvas,
        analysisSource,
        generatedCanvas,
        qrState,
        renderState,
      });
      setActualUsedVersion(reproResult.actualVersionUsed);
      setUiTimings((prev) => ({
        ...prev,
        encodeMs: reproResult.encodeMs,
        renderMs: reproResult.renderMs,
      }));
    } catch (err) {
      setUiTimings((prev) => ({ ...prev, encodeMs: null, renderMs: null }));
      log.error('Failed to generate QR code', { error: err });
      const ctx = canvas.getContext('2d');
      if (ctx) drawCanvasError(canvas, ctx, '#f5f5f5', '#999', ['Generation failed']);
    }
  }, [result, analysisSource, generatedCanvas, qrState, renderState, reproducedCanvasRef]);

  return { actualUsedVersion, uiTimings, setUiTimings };
}

interface AnalyzeHeroProps {
  t: ReturnType<typeof useTranslation>['t'];
}

function AnalyzeHero({ t }: Readonly<AnalyzeHeroProps>) {
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-2 shadow-lg shadow-primary/10">
        <ScanLine className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
        {t('analyze.title', 'QR Code Analyzer')}
      </h1>
      {!Capacitor.isNativePlatform() && (
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t(
            'analyze.description',
            'The most comprehensive QR code analyzer available. Extract every technical detail, visualize the module matrix, check WCAG compliance, and export analysis data for recreation.'
          )}
        </p>
      )}
    </div>
  );
}

interface AnalyzeInputCardsProps {
  t: ReturnType<typeof useTranslation>['t'];
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined;
  isLoading: boolean;
  loadingSource: AnalysisSourceType;
  urlInput: string;
  setUrlInput: (v: string) => void;
  handleAnalyzeGenerator: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUrlSubmit: () => void;
  handleCameraCapture: () => void;
}

interface GeneratorCardButtonProps {
  t: ReturnType<typeof useTranslation>['t'];
  isActive: boolean;
  isLoadingGenerator: boolean;
  handleAnalyzeGenerator: () => void;
  isLoading: boolean;
}

function GeneratorCardActive({
  t,
  isLoadingGenerator,
  handleAnalyzeGenerator,
  isLoading,
}: Omit<GeneratorCardButtonProps, 'isActive'>) {
  return (
    <button
      type="button"
      onClick={handleAnalyzeGenerator}
      disabled={isLoading}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all h-full shadow-sm ${
        isLoadingGenerator
          ? 'border-primary bg-primary/5'
          : 'border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10'
      }`}
    >
      {isLoadingGenerator ? (
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      ) : (
        <QrCode className="w-6 h-6 text-primary" />
      )}
      <div className="text-center">
        <p className="text-sm font-medium text-primary">
          {t('analyze.useCurrentQr', 'Current QR')}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {t('analyze.fromGenerator', 'From Generator')}
        </p>
      </div>
    </button>
  );
}

function GeneratorCardDisabled({ t }: Readonly<{ t: ReturnType<typeof useTranslation>['t'] }>) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border opacity-40 h-full shadow-sm">
      <QrCode className="w-6 h-6 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {t('analyze.useCurrentQr', 'Current QR')}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {t('analyze.noQrGenerated', 'Generate one first')}
        </p>
      </div>
    </div>
  );
}

interface FileUploadCardProps {
  t: ReturnType<typeof useTranslation>['t'];
  isLoading: boolean;
  isLoadingFile: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FileUploadCard({
  t,
  isLoading,
  isLoadingFile,
  handleFileUpload,
}: Readonly<FileUploadCardProps>) {
  return (
    <label className="relative group cursor-pointer">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isLoading}
      />
      <div
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all h-full shadow-sm ${
          isLoadingFile
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary hover:bg-primary/5'
        }`}
      >
        {isLoadingFile ? (
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        ) : (
          <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium">{t('analyze.uploadFile', 'Upload')}</p>
          <p className="text-[10px] text-muted-foreground">
            {t('analyze.uploadHint', 'Click or drop')}
          </p>
        </div>
      </div>
    </label>
  );
}

interface UrlInputCardProps {
  t: ReturnType<typeof useTranslation>['t'];
  isLoading: boolean;
  isLoadingUrl: boolean;
  urlInput: string;
  setUrlInput: (v: string) => void;
  handleUrlSubmit: () => void;
}

function UrlInputCard({
  t,
  isLoading,
  isLoadingUrl,
  urlInput,
  setUrlInput,
  handleUrlSubmit,
}: Readonly<UrlInputCardProps>) {
  return (
    <div
      className={`flex flex-col gap-2 p-4 rounded-lg border-2 transition-all h-full shadow-sm ${
        isLoadingUrl ? 'border-primary bg-primary/5' : 'border-border'
      }`}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Link className="w-4 h-4" />
        <span className="text-sm font-medium">{t('analyze.fromUrl', 'From URL')}</span>
      </div>
      <div className="flex gap-1.5">
        <Input
          type="url"
          placeholder="https://..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          disabled={isLoading}
          className="flex-1 h-8 text-xs"
        />
        <Button
          size="sm"
          onClick={handleUrlSubmit}
          disabled={isLoading || !urlInput.trim()}
          className="h-8 w-8 p-0"
        >
          {isLoadingUrl ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

interface CameraCardButtonProps {
  t: ReturnType<typeof useTranslation>['t'];
  isLoading: boolean;
  isLoadingCamera: boolean;
  handleCameraCapture: () => void;
}

function CameraCardButton({
  t,
  isLoading,
  isLoadingCamera,
  handleCameraCapture,
}: Readonly<CameraCardButtonProps>) {
  return (
    <button
      type="button"
      onClick={handleCameraCapture}
      disabled={isLoading}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all h-full shadow-sm ${
        isLoadingCamera
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary hover:bg-primary/5'
      }`}
    >
      {isLoadingCamera ? (
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      ) : (
        <CameraIcon className="w-6 h-6 text-muted-foreground" />
      )}
      <div className="text-center">
        <p className="text-sm font-medium">{t('analyze.captureCamera', 'Photo')}</p>
        <p className="text-[10px] text-muted-foreground">{t('analyze.cameraHint', 'Camera')}</p>
      </div>
    </button>
  );
}

function AnalyzeInputCards({
  t,
  generatedCanvas,
  isLoading,
  loadingSource,
  urlInput,
  setUrlInput,
  handleAnalyzeGenerator,
  handleFileUpload,
  handleUrlSubmit,
  handleCameraCapture,
}: Readonly<AnalyzeInputCardsProps>) {
  return (
    <div
      className={`grid gap-3 ${Capacitor.isNativePlatform() ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'}`}
    >
      {generatedCanvas ? (
        <GeneratorCardActive
          t={t}
          isLoadingGenerator={isLoading && loadingSource === 'generator'}
          handleAnalyzeGenerator={handleAnalyzeGenerator}
          isLoading={isLoading}
        />
      ) : (
        <GeneratorCardDisabled t={t} />
      )}
      <FileUploadCard
        t={t}
        isLoading={isLoading}
        isLoadingFile={isLoading && loadingSource === 'file'}
        handleFileUpload={handleFileUpload}
      />
      <UrlInputCard
        t={t}
        isLoading={isLoading}
        isLoadingUrl={isLoading && loadingSource === 'url'}
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        handleUrlSubmit={handleUrlSubmit}
      />
      {Capacitor.isNativePlatform() && (
        <CameraCardButton
          t={t}
          isLoading={isLoading}
          isLoadingCamera={isLoading && loadingSource === 'camera'}
          handleCameraCapture={handleCameraCapture}
        />
      )}
    </div>
  );
}

interface AnalyzeErrorDisplayProps {
  error: string;
  handleReset: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}

function AnalyzeErrorDisplay({ error, handleReset, t }: Readonly<AnalyzeErrorDisplayProps>) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive shadow-sm">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{t('analyze.error', 'Analysis Failed')}</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={handleReset}>
        {t('analyze.tryAgain', 'Try Again')}
      </Button>
    </div>
  );
}

interface AnalyzeResultsHeaderProps {
  result: QRAnalysisResult;
  handleExportJSON: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  t: ReturnType<typeof useTranslation>['t'];
}

function AnalyzeResultsHeader({
  result,
  handleExportJSON,
  handleFileUpload,
  isLoading,
  t,
}: Readonly<AnalyzeResultsHeaderProps>) {
  if (result.success) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 shadow-sm">
        <CheckCircle className="w-5 h-5 shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm">
            {t('analyze.success', 'QR Code Analyzed Successfully')}
          </p>
          {result.confidence && (
            <p className="text-xs opacity-80">
              {t('analyze.confidence', 'Confidence')}:{' '}
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
          <span className={Capacitor.isNativePlatform() ? 'inline' : 'hidden sm:inline'}>
            {t('analyze.exportJson', 'Export JSON')}
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {result.errorType === 'cors_blocked' ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-amber-500/20 bg-amber-500/10">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-amber-700 dark:text-amber-300">
                {t('analyze.corsBlocked', 'Image Access Blocked')}
              </p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {t(
                'analyze.corsExplanation',
                'The server hosting this image prevents other websites from accessing it directly (CORS policy). This is a security feature, not an error.'
              )}
            </p>
            <div className="rounded-md bg-muted/50 p-3 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                {t('analyze.howToFix', 'How to fix this:')}
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                <li>{t('analyze.corsStep1', 'Go to the website with the QR code image')}</li>
                <li>
                  {t('analyze.corsStep2', 'Right-click the image and select "Save image as..."')}
                </li>
                <li>{t('analyze.corsStep3', 'Come back here and upload the saved file')}</li>
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
                  {t('analyze.uploadInstead', 'Upload Image Instead')}
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
              {result.errorType === 'no_qr_detected'
                ? t('analyze.noQrDetected', 'No QR Code Found')
                : t('analyze.failed', 'Analysis Failed')}
            </p>
            <p className="text-sm opacity-90 whitespace-pre-wrap">
              {result.errorType === 'no_qr_detected'
                ? t('analyze.noCodeDetectedInImage', 'No QR code detected in image')
                : result.error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

async function analyzeGeneratorCanvasRobustImpl(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas
): Promise<QRAnalysisResult> {
  const currentFrameResult = analyzeQRCode(cloneCanvasLike(sourceCanvas));
  if (currentFrameResult.success) return currentFrameResult;

  let animationState = globalThis.__ANQR_STATE__;
  const isAnimatedSource = (animationState?.animationFrameCount ?? 0) > 1;
  if (isAnimatedSource && !animationState?.isAnimationReady) {
    animationState = await waitForAnimationReady(8);
  }

  const cachedFrames =
    animationState?.isAnimationReady && Array.isArray(animationState.animationFrames)
      ? animationState.animationFrames
      : [];

  const frameResult = scanCachedFramesForQR(cachedFrames, animationState?.currentFrame ?? 0);
  if (frameResult) return frameResult;

  if (isAnimatedSource) {
    await waitMs(90);
    const retryResult = analyzeQRCode(cloneCanvasLike(sourceCanvas));
    if (retryResult.success) {
      const warnings = [...(retryResult.warnings ?? [])];
      warnings.push('Analyzed using live animation frame retry');
      return { ...retryResult, warnings };
    }
  }

  return currentFrameResult;
}

interface ExportAnalysisJSONParams {
  result: QRAnalysisResult;
  uiTimings: { encodeMs?: number | null; renderMs?: number | null; exportMs?: number | null };
  analysisSource: AnalysisSourceType;
  actualUsedVersion: number | null;
  setUiTimings: React.Dispatch<
    React.SetStateAction<{
      encodeMs?: number | null;
      renderMs?: number | null;
      exportMs?: number | null;
    }>
  >;
}

function exportAnalysisJSON(params: ExportAnalysisJSONParams): void {
  const { result, uiTimings, analysisSource, actualUsedVersion, setUiTimings } = params;
  if (!result.success) return;
  const exportStartMs = nowMs();
  const exportData = buildAnalysisExportData(
    {
      ...result,
      timing: {
        ...result.timing,
        encodeMs: uiTimings.encodeMs ?? result.timing?.encodeMs ?? null,
        renderMs: uiTimings.renderMs ?? result.timing?.renderMs ?? null,
        exportMs: null,
      },
    },
    { source: analysisSource, actualUsedVersion }
  );
  const exportMs = Math.round((nowMs() - exportStartMs) * 100) / 100;
  exportData.analysis.timing = { ...exportData.analysis.timing, exportMs };
  exportData.diagnostics.summary.exportMs = exportMs;
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  setUiTimings((prev) => ({ ...prev, exportMs }));
  const filename = `qr-analysis-${Date.now()}.json`;
  if (Capacitor.isNativePlatform()) {
    void saveFileNative(filename, blob);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

interface AnalyzeWarningsProps {
  warnings: string[];
}

function AnalyzeWarnings({ warnings }: Readonly<AnalyzeWarningsProps>) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 shadow-sm">
      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
      <div className="text-sm text-amber-700 dark:text-amber-400">
        {warnings.map((warning) => (
          <p key={warning}>• {warning}</p>
        ))}
      </div>
    </div>
  );
}

interface AnalyzeResultDetailsProps {
  result: QRAnalysisResult;
  originalImageUrl: string | null;
  reproducedCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  combinedTimings: Record<string, number | null | undefined>;
  imported: boolean;
  handleImportToGenerator: () => void;
  handleExportJSON: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}

interface AnalyzeCapacityGridProps {
  result: QRAnalysisResult;
}

function AnalyzeCapacityGrid({ result }: Readonly<AnalyzeCapacityGridProps>) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {result.version !== null && result.eccLevel && (
        <CollapsibleSection title="Capacity by Mode" icon={<BarChart3 className="w-4 h-4" />}>
          <CapacityByModeTable
            version={result.version}
            eccLevel={result.eccLevel}
            currentBytes={result.payloadBytes?.length}
          />
        </CollapsibleSection>
      )}

      {result.payload && (
        <CollapsibleSection title="Encoding Efficiency" icon={<BarChart3 className="w-4 h-4" />}>
          <EncodingEfficiency
            payload={result.payload}
            payloadBytes={result.payloadBytes}
            encodingMode={result.encodingMode}
          />
        </CollapsibleSection>
      )}
    </div>
  );
}

interface AnalyzeVisualGridProps {
  result: QRAnalysisResult;
  combinedTimings: Record<string, number | null | undefined>;
  t: ReturnType<typeof useTranslation>['t'];
}

function _AnalyzeVisualGrid({ result, combinedTimings, t }: Readonly<AnalyzeVisualGridProps>) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {hasAnyTimingData(combinedTimings) ? (
        <CollapsibleSection
          title={t('analyze.processingTimings', 'Processing Timings')}
          icon={<Timer className="w-4 h-4" />}
          testId="analyze-section-processing-timings"
        >
          <div className="space-y-2">
            <DetailRow
              label="Decode Time"
              value={formatMilliseconds(combinedTimings.decodeMs)}
              icon={<ScanLine className="w-3.5 h-3.5" />}
            />
            <DetailRow
              label="Total Analysis Time"
              value={formatMilliseconds(combinedTimings.totalAnalysisMs)}
              icon={<BarChart3 className="w-3.5 h-3.5" />}
            />
            <DetailRow
              label="Encode Time"
              value={formatMilliseconds(combinedTimings.encodeMs)}
              icon={<Code2 className="w-3.5 h-3.5" />}
            />
            <DetailRow
              label="Render Time"
              value={formatMilliseconds(combinedTimings.renderMs)}
              icon={<Palette className="w-3.5 h-3.5" />}
            />
            <DetailRow
              label="Export Time"
              value={formatMilliseconds(combinedTimings.exportMs)}
              icon={<Download className="w-3.5 h-3.5" />}
            />
            {combinedTimings.decodeMs !== null &&
              combinedTimings.decodeMs !== undefined &&
              combinedTimings.totalAnalysisMs !== null &&
              combinedTimings.totalAnalysisMs !== undefined && (
                <DetailRow
                  label="Non-Decode Overhead"
                  value={formatMilliseconds(
                    Math.max(0, combinedTimings.totalAnalysisMs - combinedTimings.decodeMs)
                  )}
                  icon={<Settings className="w-3.5 h-3.5" />}
                />
              )}
          </div>
        </CollapsibleSection>
      ) : null}

      {result.detectedColors && (
        <CollapsibleSection
          title="Colors & WCAG Compliance"
          icon={<Palette className="w-4 h-4" />}
          badge={<WCAGBadge ratio={result.detectedColors.contrastRatio} size="sm" />}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <ColorSwatch color={result.detectedColors.foreground} label="Foreground" />
              <div className="flex flex-col items-center">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">contrast</span>
              </div>
              <ColorSwatch color={result.detectedColors.background} label="Background" />
            </div>

            {result.dominantColors && result.dominantColors.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Dominant Palette
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {result.dominantColors.map((entry, idx) => (
                    <div key={`${entry.color}-${idx}`} className="p-2 rounded-md bg-muted/50">
                      <ColorSwatch
                        color={entry.color}
                        label={`#${idx + 1} • ${entry.percentage}%`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-muted/50 space-y-2 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">WCAG Compliance</span>
                <WCAGBadge ratio={result.detectedColors.contrastRatio} size="md" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div
                  className={`p-2 rounded ${wcagComplianceClass(
                    result.detectedColors.contrastRatio,
                    3
                  )}`}
                >
                  <div className="font-bold">AA-Large</div>
                  <div className="text-[10px]">≥3:1</div>
                </div>
                <div
                  className={`p-2 rounded ${wcagComplianceClass(
                    result.detectedColors.contrastRatio,
                    4.5
                  )}`}
                >
                  <div className="font-bold">AA</div>
                  <div className="text-[10px]">≥4.5:1</div>
                </div>
                <div
                  className={`p-2 rounded ${wcagComplianceClass(
                    result.detectedColors.contrastRatio,
                    7
                  )}`}
                >
                  <div className="font-bold">AAA</div>
                  <div className="text-[10px]">≥7:1</div>
                </div>
              </div>
            </div>

            <DetailRow
              label="Contrast Ratio"
              value={`${result.detectedColors.contrastRatio.toFixed(2)}:1`}
              icon={<Eye className="w-3.5 h-3.5" />}
            />
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title={t('analyze.spatialAnalysis', 'Spatial Analysis')}
        icon={<Ruler className="w-4 h-4" />}
        testId="analyze-section-spatial-analysis"
      >
        <div className="space-y-2">
          {result.estimatedModulePx !== null && (
            <DetailRow
              label="Module Size"
              value={`~${result.estimatedModulePx} px`}
              icon={<Square className="w-3.5 h-3.5" />}
            />
          )}
          {result.estimatedModulePx !== null && (
            <DetailRow
              label="Scan Module Size"
              value={
                <StatusBadge
                  status={result.estimatedModulePx >= 3}
                  trueLabel="Scan-safe"
                  falseLabel="Too small"
                />
              }
              icon={<ScanLine className="w-3.5 h-3.5" />}
            />
          )}
          {result.geometry && (
            <>
              <DetailRow
                label="Rotation"
                value={`${result.geometry.estimatedRotationDeg.toFixed(1)}°`}
                icon={<Ruler className="w-3.5 h-3.5" />}
              />
              <DetailRow
                label="Bounding Box"
                value={`${Math.round(result.geometry.boundingBox.width)} × ${Math.round(result.geometry.boundingBox.height)} px`}
                icon={<Grid3x3 className="w-3.5 h-3.5" />}
              />
            </>
          )}
          {result.quietZone && (
            <>
              <DetailRow
                label={t('safety.quietZone', 'Quiet Zone')}
                value={
                  <StatusBadge
                    status={result.quietZone.adequate}
                    trueLabel="Adequate"
                    falseLabel="Insufficient"
                  />
                }
                icon={<Square className="w-3.5 h-3.5" />}
              />
              <div className="grid grid-cols-4 gap-1 text-center mt-2">
                <div className="p-2 rounded bg-muted/50">
                  <div className="text-sm font-mono">{result.quietZone.top}</div>
                  <div className="text-[10px] text-muted-foreground">Top</div>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <div className="text-sm font-mono">{result.quietZone.right}</div>
                  <div className="text-[10px] text-muted-foreground">Right</div>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <div className="text-sm font-mono">{result.quietZone.bottom}</div>
                  <div className="text-[10px] text-muted-foreground">Bottom</div>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <div className="text-sm font-mono">{result.quietZone.left}</div>
                  <div className="text-[10px] text-muted-foreground">Left</div>
                </div>
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}

interface AnalyzeDataGridProps {
  result: QRAnalysisResult;
}

function _AnalyzeDataGrid({ result }: Readonly<AnalyzeDataGridProps>) {
  return (
    <div className="grid md:grid-cols-1 gap-4">
      {result.payloadBytes && result.payloadBytes.length > 0 && (
        <CollapsibleSection
          title="Binary Data (Hex Dump)"
          icon={<Binary className="w-4 h-4" />}
          badge={
            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-muted">
              {result.payloadBytes.length} bytes
            </span>
          }
        >
          <HexDumpView bytes={result.payloadBytes} maxRows={8} />
        </CollapsibleSection>
      )}

      {result.moduleMatrix && result.moduleMatrix.length > 0 && (
        <CollapsibleSection
          title="Module Matrix"
          icon={<Grid3x3 className="w-4 h-4" />}
          testId="analyze-section-module-matrix"
          badge={
            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-muted">
              {result.moduleMatrix.length}×{result.moduleMatrix.length}
            </span>
          }
        >
          <ModuleMatrixView
            matrix={result.moduleMatrix}
            version={result.version}
            fgColor={result.detectedColors?.foreground}
            bgColor={result.detectedColors?.background}
          />
        </CollapsibleSection>
      )}

      {result.debugLog && (
        <CollapsibleSection
          title="Debug Log"
          icon={<Settings className="w-4 h-4" />}
          defaultOpen={false}
        >
          <pre className="text-xs font-mono bg-muted/50 p-3 rounded-lg overflow-x-auto max-h-64 whitespace-pre-wrap break-all">
            {result.debugLog}
          </pre>
        </CollapsibleSection>
      )}
    </div>
  );
}

function FormatImagePanel({
  result,
  t,
}: Readonly<{
  result: QRAnalysisResult;
  t: ReturnType<typeof useTranslation>['t'];
}>) {
  return (
    <div className="space-y-4">
      <CollapsibleSection
        title={t('analyze.formatInformation', 'Format Information')}
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
          title={t('analyze.imageProperties', 'Image Properties')}
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
                  ? '1:1 (Square)'
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

function DataCapacityPanel({
  dataCapacity,
}: Readonly<{
  dataCapacity: NonNullable<QRAnalysisResult['dataCapacity']>;
}>) {
  return (
    <CollapsibleSection
      title="Data Capacity"
      icon={<Database className="w-4 h-4" />}
      badge={
        dataCapacity.overflow ? (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Detection mismatch
          </span>
        ) : (
          <span
            className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${capacityBadgeClass(
              dataCapacity.percentage
            )}`}
          >
            {dataCapacity.percentage}% used
          </span>
        )
      }
    >
      {dataCapacity.overflow ? (
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Payload ({dataCapacity.used} bytes) exceeds detected capacity ({dataCapacity.total}{' '}
              bytes). Version or ECC detection may be inaccurate.
            </span>
          </div>
          <DetailRow
            label="Payload Size"
            value={`${dataCapacity.used} bytes`}
            icon={<Database className="w-3.5 h-3.5" />}
          />
          <DetailRow
            label="Detected Capacity"
            value={`${dataCapacity.total} bytes`}
            icon={<Database className="w-3.5 h-3.5" />}
          />
        </div>
      ) : (
        <ProgressBar
          value={dataCapacity.used}
          max={dataCapacity.total}
          label="Byte Mode Capacity"
        />
      )}
    </CollapsibleSection>
  );
}

function QrStructurePanel({
  version,
  moduleCount,
  eccLevel,
  maskPattern,
}: Readonly<{
  version: number | null;
  moduleCount: number;
  eccLevel: ECCLevel | null;
  maskPattern: number | null;
}>) {
  return (
    <CollapsibleSection
      title="QR Structure"
      icon={<Grid3x3 className="w-4 h-4" />}
      testId="analyze-section-qr-structure"
    >
      <div className="space-y-2">
        <DetailRow
          label="Version"
          value={version === null ? '—' : `${version} (${moduleCount}×${moduleCount} modules)`}
          icon={<Hash className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Error Correction"
          value={
            eccLevel ? (
              <div className="text-right">
                <div>Level {eccLevel}</div>
                <div className="text-xs text-muted-foreground">
                  {ECC_DESCRIPTIONS[eccLevel].recovery} recovery
                </div>
              </div>
            ) : (
              '—'
            )
          }
          icon={<Shield className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Mask Pattern"
          value={
            maskPattern === null ? (
              '—'
            ) : (
              <div className="text-right">
                <div>Pattern {maskPattern}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {MASK_DESCRIPTIONS[maskPattern]}
                </div>
              </div>
            )
          }
          icon={<Layers className="w-3.5 h-3.5" />}
        />
      </div>
    </CollapsibleSection>
  );
}

function EncodingPanel({
  encodingMode,
  payloadBytes,
  errorsCorrected,
}: Readonly<{
  encodingMode: string | null;
  payloadBytes: Uint8Array | undefined;
  errorsCorrected: number | null;
}>) {
  return (
    <CollapsibleSection
      title="Encoding"
      icon={<Binary className="w-4 h-4" />}
      testId="analyze-section-encoding"
      badge={
        errorsCorrected !== null && errorsCorrected > 0 ? (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {errorsCorrected} error
            {errorsCorrected === 1 ? '' : 's'} corrected
          </span>
        ) : null
      }
    >
      <div className="space-y-2">
        <DetailRow
          label="Mode"
          value={<span className="capitalize">{encodingMode || 'Unknown'}</span>}
          icon={<Type className="w-3.5 h-3.5" />}
        />
        {payloadBytes && (
          <DetailRow
            label="Raw Bytes"
            value={`${payloadBytes.length} bytes`}
            icon={<Database className="w-3.5 h-3.5" />}
          />
        )}
        <DetailRow
          label="RS Error Correction"
          value={formatRsErrorCorrection(errorsCorrected)}
          icon={<Shield className="w-3.5 h-3.5" />}
        />
      </div>
    </CollapsibleSection>
  );
}

function AnalyzeResultDetails({
  result,
  originalImageUrl,
  reproducedCanvasRef,
  combinedTimings,
  imported,
  handleImportToGenerator,
  handleExportJSON: _handleExportJSON,
  t,
}: Readonly<AnalyzeResultDetailsProps>) {
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
                {result.imageProperties.width} × {result.imageProperties.height}
              </span>
            )}
          </div>
          <div className="aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden">
            {originalImageUrl ? (
              <img
                src={originalImageUrl}
                alt="Original QR Code"
                data-testid={DynamicTestId.resolve(
                  'analyze-original-image',
                  'analyze-original-image'
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
                'analyze-reproduced-canvas',
                'analyze-reproduced-canvas'
              )}
              className="max-w-full max-h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
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
                {buildContentTypeDetails(result.contentType, result.payload || '').map((detail) => (
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

        <div className="grid md:grid-cols-1 gap-4">
          {result.payloadBytes && result.payloadBytes.length > 0 && (
            <CollapsibleSection
              title="Binary Data (Hex Dump)"
              icon={<Binary className="w-4 h-4" />}
              badge={
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-muted">
                  {result.payloadBytes.length} bytes
                </span>
              }
            >
              <HexDumpView bytes={result.payloadBytes} maxRows={8} />
            </CollapsibleSection>
          )}

          {result.moduleMatrix && result.moduleMatrix.length > 0 && (
            <CollapsibleSection
              title="Module Matrix"
              icon={<Grid3x3 className="w-4 h-4" />}
              testId="analyze-section-module-matrix"
              badge={
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-muted">
                  {result.moduleMatrix.length}×{result.moduleMatrix.length}
                </span>
              }
            >
              <ModuleMatrixView
                matrix={result.moduleMatrix}
                version={result.version}
                fgColor={result.detectedColors?.foreground}
                bgColor={result.detectedColors?.background}
              />
            </CollapsibleSection>
          )}

          {result.debugLog && (
            <CollapsibleSection
              title="Debug Log"
              icon={<Settings className="w-4 h-4" />}
              defaultOpen={false}
            >
              <pre className="text-xs font-mono bg-muted/50 p-3 rounded-lg overflow-x-auto max-h-64 whitespace-pre-wrap break-all">
                {result.debugLog}
              </pre>
            </CollapsibleSection>
          )}
        </div>
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
            {t('analyze.imported', 'Imported!')}
          </>
        ) : (
          <>
            <ArrowRight className="w-5 h-5" />
            {t('analyze.importToGenerator', 'Import to Generator')}
          </>
        )}
      </Button>
    </>
  );
}

export function Analyze({ onNavigate, generatedCanvas }: Readonly<AnalyzeProps>) {
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
    renderState
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
    [reproState.setUiTimings]
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
    analyzeGeneratorCanvasRobust
  );

  const combinedTimings = useMemo(
    () => ({ ...result?.timing, ...uiTimings }),
    [result?.timing, uiTimings]
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
      onNavigate
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
    setUrlInput('');
    setImported(false);
    setAnalysisSource(null);
    reproState.setUiTimings({});
    if (originalImageUrl?.startsWith('blob:')) {
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
                  handleExportJSON={handleExportJSON}
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
