/**
 * Analyze Component
 * Comprehensive QR Code analysis page that extracts and displays detailed metadata
 * from uploaded/captured QR codes with side-by-side original vs reproduced preview
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Binary,
  Camera as CameraIcon,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Database,
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
  Type,
  Upload,
  Wallet,
  Wifi,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdUnit } from '@/components/AdUnit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  analyzeQRCode,
  analyzeQRFromFile,
  analyzeQRFromUrl,
  type ContentType,
  type ContentTypeDetails,
  type ECCLevel,
  type QRAnalysisResult,
} from '@/modules/qr-analyzer';
import { createQRInstance, getStringToBytes, setStringToBytes } from '@/modules/qr-encoder';
import { useQRStore } from '@/store/qr-store';

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

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  children,
  badge,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">{icon}</div>
          <span className="font-medium text-sm">{title}</span>
          {badge}
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="px-3 pb-3 pt-1">{children}</div>}
    </div>
  );
}

// Detail Row Component
interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

function DetailRow({ label, value, icon, className = '' }: DetailRowProps) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

// Color Swatch Component
interface ColorSwatchProps {
  color: string;
  label: string;
}

function ColorSwatch({ color, label }: ColorSwatchProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded border shadow-sm"
        style={{ backgroundColor: color }}
        title={color}
      />
      <div className="text-xs">
        <div className="font-medium">{label}</div>
        <div className="text-muted-foreground font-mono">{color}</div>
      </div>
    </div>
  );
}

// Progress Bar Component
interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClass =
    percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div className="space-y-1">
      {label && <div className="text-xs text-muted-foreground">{label}</div>}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{value} used</span>
        <span>{max} max</span>
      </div>
    </div>
  );
}

// Status Badge Component
interface StatusBadgeProps {
  status: boolean;
  trueLabel: string;
  falseLabel: string;
}

function StatusBadge({ status, trueLabel, falseLabel }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        status
          ? 'bg-green-500/10 text-green-700 dark:text-green-400'
          : 'bg-red-500/10 text-red-700 dark:text-red-400'
      }`}
    >
      {status ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {status ? trueLabel : falseLabel}
    </span>
  );
}

export function Analyze({ onNavigate, generatedCanvas }: AnalyzeProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSource, setLoadingSource] = useState<
    'file' | 'url' | 'camera' | 'generator' | null
  >(null);
  const [analysisSource, setAnalysisSource] = useState<
    'file' | 'url' | 'camera' | 'generator' | null
  >(null);
  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);
  const [result, setResult] = useState<QRAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [imported, setImported] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const reproducedCanvasRef = useRef<HTMLCanvasElement>(null);

  // Store getters (for exact reproduction of the self-generated QR)
  const qrState = useQRStore((s) => s.qr);
  const renderState = useQRStore((s) => s.render);

  // Store setters
  const setPayloadText = useQRStore((s) => s.setPayloadText);
  const setPayloadKind = useQRStore((s) => s.setPayloadKind);
  const setPayloadUrl = useQRStore((s) => s.setPayloadUrl);
  const setQrEcc = useQRStore((s) => s.setQrEcc);
  const setQrVersion = useQRStore((s) => s.setQrVersion);
  const setQrMaskPattern = useQRStore((s) => s.setQrMaskPattern);
  const setQrEncodingMode = useQRStore((s) => s.setQrEncodingMode);
  const setRenderFgColor = useQRStore((s) => s.setRenderFgColor);
  const setRenderBgColor = useQRStore((s) => s.setRenderBgColor);

  // Render reproduced QR by generating a fresh, clean QR code from extracted settings
  useEffect(() => {
    if (!(result?.success && result.payload && reproducedCanvasRef.current)) return;

    const canvas = reproducedCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const ecc: ECCLevel = result.eccLevel || 'M';

      // Strategy:
      // - For self-generated QRs (Analyze -> Current QR), reproduce EXACTLY using the live generator settings.
      //   This must be pixel-identical for the default generated QR.
      // - For external images, prefer exact (version/mask/mode) if detected, else fall back to auto.
      const isGeneratorSource = analysisSource === 'generator' && !!generatedCanvas;

      const versionToUse = isGeneratorSource ? qrState.version : (result.version ?? 0);

      // Prefer detected mask when available (even for generator), because it is the actual chosen mask.
      const maskToUse =
        typeof result.maskPattern === 'number' && result.maskPattern >= 0 && result.maskPattern <= 7
          ? result.maskPattern
          : typeof qrState.maskPattern === 'number'
            ? qrState.maskPattern
            : undefined;

      // Prefer detected encoding mode when available (it is a property of the encoded data), else use generator mode.
      // Note: analyzer returns 'mixed'/'unknown' sometimes, those are not valid encoder modes, so only pass valid.
      const modeToUse = (() => {
        const m = isGeneratorSource ? qrState.encodingMode : result.encodingMode;
        if (
          m === 'numeric' ||
          m === 'alphanumeric' ||
          m === 'byte' ||
          m === 'kanji' ||
          m === 'auto'
        )
          return m;
        return undefined;
      })();

      const encoderInput = (() => {
        // Prefer raw payload bytes when available for byte mode. This is required for exact reproduction.
        const bytes = result.payloadBytes;
        const wantsByte = modeToUse === 'byte' || result.encodingMode === 'byte';
        if (bytes?.length && wantsByte) {
          // Build a binary string where each charCode is one byte 0..255.
          let s = '';
          const chunk = 0x8000;
          for (let i = 0; i < bytes.length; i += chunk) {
            const part = bytes.slice(i, i + chunk);
            s += String.fromCharCode(...Array.from(part));
          }
          return { kind: 'bytes' as const, data: s };
        }
        return { kind: 'string' as const, data: result.payload };
      })();

      // Always prefer the decoder's detected version for reproduction when available.
      const versionToUseFinal =
        typeof result.version === 'number' && result.version > 0
          ? result.version
          : versionToUse || 0;

      // If the app globally changed stringToBytes (UTF-8, Shift-JIS, etc.), force identity mapping for binary strings.
      const prevStringToBytes = getStringToBytes();
      const needsIdentityBytes = encoderInput.kind === 'bytes';

      if (needsIdentityBytes) {
        setStringToBytes((s: string) => {
          const out: number[] = new Array(s.length);
          for (let i = 0; i < s.length; i += 1) out[i] = s.charCodeAt(i) & 0xff;
          return out;
        });
      }

      // For reproduction:
      // - If we have raw bytes AND the original was pure byte mode, force byte mode
      // - If the original was 'mixed' (e.g., byte + numeric), use 'auto' to let encoder optimize
      // - Otherwise use the detected mode
      const effectiveMode = (() => {
        if (encoderInput.kind === 'bytes') {
          // Only force byte mode if original was pure byte mode
          // For 'mixed' mode, let encoder auto-optimize (it may use byte+numeric segments)
          if (result.encodingMode === 'byte') return 'byte';
          // For mixed or unknown, use auto to let encoder choose optimal encoding
          return undefined;
        }
        return modeToUse;
      })();

      let qr: ReturnType<typeof createQRInstance>;
      let actualVersionUsed = versionToUseFinal;
      try {
        qr = createQRInstance(encoderInput.data, ecc, versionToUseFinal, {
          ...(effectiveMode ? { mode: effectiveMode } : {}),
          ...(typeof maskToUse === 'number' && maskToUse >= 0 && maskToUse <= 7
            ? { maskPattern: maskToUse as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 }
            : {}),
        });
      } catch (encoderError) {
        // If the error is "code length overflow", the payload doesn't fit in the detected version.
        // Fall back to auto version selection (version 0) which will pick the smallest version that fits.
        const errorMessage = encoderError instanceof Error ? encoderError.message : String(encoderError);
        if (errorMessage.includes('code length overflow') || errorMessage.includes('overflow')) {
          console.warn('[QR-Analyzer:reproduced] Payload too long for detected version, falling back to auto', {
            detectedVersion: versionToUseFinal,
            ecc,
            payloadLength: encoderInput.data.length,
          });
          // Retry with version 0 (auto) - let the encoder pick the right version
          qr = createQRInstance(encoderInput.data, ecc, 0, {
            ...(effectiveMode ? { mode: effectiveMode } : {}),
            // Don't force mask pattern when using auto version - let encoder optimize
          });
          actualVersionUsed = 0; // Mark as auto
        } else {
          // Re-throw other errors
          throw encoderError;
        }
      } finally {
        if (needsIdentityBytes) setStringToBytes(prevStringToBytes);
      }
      const moduleCount = qr.getModuleCount();
      const actualVersion = (moduleCount - 17) / 4;

      // Margin handling
      // For the self-generated QR, infer the exact margin from the actual generator canvas.
      // This avoids off-by-one errors (quiet zone vs border modules) and matches safety-adjusted quiet zones.
      const marginModules = (() => {
        if (isGeneratorSource && generatedCanvas) {
          const modulePx = Math.max(1, Math.floor(renderState.modulePx || 1));
          const totalModules = Math.round(generatedCanvas.width / modulePx);
          const inferred = Math.max(0, Math.floor((totalModules - moduleCount) / 2));
          return inferred;
        }
        return Math.max(4, result.quietZone?.top ?? 4);
      })();

      // Canvas sizing
      // - Generator: match the exact canvas size (pixel-identical display)
      // - External: render at a readable size (~300px)
      let modulePx: number;
      let size: number;
      if (isGeneratorSource && generatedCanvas) {
        // Pixel-identical to the generator output
        modulePx = Math.max(1, Math.floor(renderState.modulePx || 1));
        size = generatedCanvas.width;
      } else {
        const targetSize = 300;
        const totalModules = moduleCount + marginModules * 2;
        modulePx = Math.max(3, Math.floor(targetSize / totalModules));
        size = totalModules * modulePx;
      }

      canvas.width = size;
      canvas.height = size;

      // Colors
      // Generator: use live render colors.
      // External: use detected colors, fall back to black/white.
      const fg = isGeneratorSource
        ? renderState.fgColor
        : result.detectedColors?.foreground || '#000000';
      const bg = isGeneratorSource
        ? renderState.bgTransparent
          ? '#ffffff'
          : renderState.bgColor
        : result.detectedColors?.background || '#ffffff';

      // Draw background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size, size);

      // Draw modules
      ctx.fillStyle = fg;
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (!qr.isDark(row, col)) continue;
          const x = (marginModules + col) * modulePx;
          const y = (marginModules + row) * modulePx;
          ctx.fillRect(x, y, modulePx, modulePx);
        }
      }

      // --- Debug: matrix comparisons to pinpoint mismatch source ---
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
            if (!firstDiff) firstDiff = { row: r, col: c, a: a[r][c], b: b[r][c] };
          }
        }
        const total = rows * cols;
        return { rows, cols, diffCount, diffPct: total ? diffCount / total : 0, firstDiff };
      };

      const regenMatrix = buildRegenMatrix();
      const regenVsDecoded = result.moduleMatrix
        ? diffMatrices(result.moduleMatrix, regenMatrix)
        : null;

      const sampleOriginalMatrix = (): boolean[][] | null => {
        if (!(isGeneratorSource && generatedCanvas)) return null;
        const gctx = generatedCanvas.getContext('2d');
        if (!gctx) return null;

        const m: boolean[][] = new Array(moduleCount);
        for (let r = 0; r < moduleCount; r += 1) {
          const row: boolean[] = new Array(moduleCount);
          for (let c = 0; c < moduleCount; c += 1) {
            const x = Math.floor((marginModules + c + 0.5) * modulePx);
            const y = Math.floor((marginModules + r + 0.5) * modulePx);
            const d = gctx.getImageData(x, y, 1, 1).data;
            const lum = (d[0] + d[1] + d[2]) / 3;
            const dark = d[3] > 16 && lum < 128;
            row[c] = dark;
          }
          m[r] = row;
        }
        return m;
      };

      const originalMatrix = sampleOriginalMatrix();
      const regenVsOriginal = originalMatrix ? diffMatrices(originalMatrix, regenMatrix) : null;

      const bestShift = (() => {
        if (!originalMatrix) return null;
        let best = { dr: 0, dc: 0, diffCount: Number.POSITIVE_INFINITY };
        for (let dr = -2; dr <= 2; dr += 1) {
          for (let dc = -2; dc <= 2; dc += 1) {
            let diffCount = 0;
            for (let r = 0; r < moduleCount; r += 1) {
              const rr = r + dr;
              if (rr < 0 || rr >= moduleCount) {
                diffCount += moduleCount;
                continue;
              }
              for (let c = 0; c < moduleCount; c += 1) {
                const cc = c + dc;
                if (cc < 0 || cc >= moduleCount) {
                  diffCount += 1;
                  continue;
                }
                if (originalMatrix[r][c] !== regenMatrix[rr][cc]) diffCount += 1;
              }
            }
            if (diffCount < best.diffCount) best = { dr, dc, diffCount };
          }
        }
        return {
          ...best,
          diffPct: moduleCount * moduleCount ? best.diffCount / (moduleCount * moduleCount) : 0,
        };
      })();

      const payloadBytesHead = (() => {
        const bytes = result.payloadBytes;
        if (!bytes?.length) return null;
        return Array.from(bytes.slice(0, 16))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ');
      })();

      // Track if reproduction matches original
      const reproductionMismatch = actualVersion !== (result.version ?? actualVersion);
      
      console.log('[QR-Analyzer:reproduced] Generated QR code', {
        strategy: isGeneratorSource ? 'exact' : (actualVersionUsed === 0 ? 'auto_fallback' : 'detected'),
        reproductionMismatch,
        encoderInputKind: encoderInput.kind,
        payloadPreview:
          encoderInput.kind === 'bytes'
            ? (result.payload ?? '').slice(0, 80)
            : (result.payload ?? '').slice(0, 80),
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
        matrix: {
          regenVsDecoded,
          regenVsOriginal,
          bestShift,
        },
      });
      if (regenVsOriginal && regenVsOriginal.diffCount > 0) {
        console.warn('[QR-Analyzer:reproduced] Matrix mismatch (original vs regenerated)', {
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
          regenVsDecoded,
          regenVsOriginal,
          bestShift,
        });
      }
    } catch (err) {
      console.error('[QR-Analyzer:reproduced] Failed to generate QR code:', err);
      // Clear canvas and show error state
      canvas.width = 200;
      canvas.height = 200;
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#999';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Generation failed', 100, 100);
    }
  }, [result, analysisSource, generatedCanvas, qrState, renderState]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsLoading(true);
      setLoadingSource('file');
      setAnalysisSource('file');
      setError(null);
      setResult(null);
      setImported(false);

      // Create object URL for original image display
      const imageUrl = URL.createObjectURL(file);
      setOriginalImageUrl(imageUrl);

      try {
        const analysisResult = await analyzeQRFromFile(file);
        setResult(analysisResult);
        if (!analysisResult.success) {
          setError(analysisResult.error || t('analyze.genericError', 'Failed to analyze QR code'));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t('analyze.genericError', 'Failed to analyze QR code')
        );
      } finally {
        setIsLoading(false);
        setLoadingSource(null);
        e.target.value = '';
      }
    },
    [t]
  );

  // Handle URL input
  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) {
      setError(t('analyze.urlRequired', 'Please enter a URL'));
      return;
    }

    setIsLoading(true);
    setLoadingSource('url');
    setAnalysisSource('url');
    setError(null);
    setResult(null);
    setImported(false);
    setOriginalImageUrl(urlInput.trim());

    try {
      const analysisResult = await analyzeQRFromUrl(urlInput.trim());
      setResult(analysisResult);
      if (!analysisResult.success) {
        setError(analysisResult.error || t('analyze.genericError', 'Failed to analyze QR code'));
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('analyze.loadFailed', 'Failed to load image');
      setError(message);
    } finally {
      setIsLoading(false);
      setLoadingSource(null);
    }
  }, [urlInput, t]);

  // Handle camera capture (native only)
  const handleCameraCapture = useCallback(async () => {
    setIsLoading(true);
    setLoadingSource('camera');
    setAnalysisSource('camera');
    setError(null);
    setResult(null);
    setImported(false);

    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera === 'denied') {
        const requested = await Camera.requestPermissions();
        if (requested.camera === 'denied') {
          setError(t('camera.permissionDenied', 'Camera permission denied'));
          return;
        }
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        setOriginalImageUrl(image.dataUrl);

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setError(t('analyze.cameraProcessError', 'Could not process image'));
            setIsLoading(false);
            setLoadingSource(null);
            return;
          }
          ctx.drawImage(img, 0, 0);

          const analysisResult = analyzeQRCode(canvas);
          setResult(analysisResult);
          setAnalysisSource('camera');
          if (!analysisResult.success) {
            setError(analysisResult.error || t('analyze.noCodeDetected', 'No QR code detected'));
          }
          setIsLoading(false);
          setLoadingSource(null);
        };
        img.onerror = () => {
          setError(t('analyze.cameraLoadFailed', 'Failed to load captured image'));
          setIsLoading(false);
          setLoadingSource(null);
        };
        img.src = image.dataUrl;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (!(errorMessage.includes('cancelled') || errorMessage.includes('User cancelled'))) {
        setError(t('analyze.cameraFailed', 'Camera capture failed'));
      }
      setIsLoading(false);
      setLoadingSource(null);
    }
  }, [t]);

  // Import to Generator
  const handleImportToGenerator = useCallback(() => {
    if (!(result?.success && result.payload)) return;

    // Set payload
    if (result.payload.startsWith('http://') || result.payload.startsWith('https://')) {
      setPayloadKind('url');
      setPayloadUrl({ href: result.payload });
    } else {
      setPayloadKind('plain_text');
    }
    setPayloadText(result.payload);

    // Set QR encoding parameters for EXACT replication
    if (result.eccLevel) {
      setQrEcc(result.eccLevel as 'L' | 'M' | 'Q' | 'H');
    }
    if (result.version !== null && result.version >= 1 && result.version <= 40) {
      setQrVersion(result.version);
    }
    if (result.maskPattern !== null && result.maskPattern >= 0 && result.maskPattern <= 7) {
      setQrMaskPattern(result.maskPattern as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7);
    }
    if (
      result.encodingMode &&
      result.encodingMode !== 'unknown' &&
      result.encodingMode !== 'mixed'
    ) {
      const modeMap: Record<string, 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji'> = {
        numeric: 'numeric',
        alphanumeric: 'alphanumeric',
        byte: 'byte',
        kanji: 'kanji',
      };
      if (modeMap[result.encodingMode]) {
        setQrEncodingMode(modeMap[result.encodingMode]);
      }
    }

    // Set colors if detected
    if (result.detectedColors) {
      setRenderFgColor(result.detectedColors.foreground);
      setRenderBgColor(result.detectedColors.background);
    }

    setImported(true);

    // Navigate to editor after a short delay
    setTimeout(() => {
      if (onNavigate) {
        onNavigate('editor');
      } else {
        // Fallback: navigate using window location
        // Clear hash/query to go to main editor
        window.location.hash = '';
        window.location.search = '';
        // If we're still on the same page, force a reload to the editor
        if (window.location.pathname === '/' || window.location.pathname === '') {
          window.location.reload();
        } else {
          window.location.href = '/';
        }
      }
    }, 500);
  }, [
    result,
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

  // Reset analysis
  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setUrlInput('');
    setImported(false);
    setAnalysisSource(null);
    if (originalImageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(originalImageUrl);
    }
    setOriginalImageUrl(null);
  }, [originalImageUrl]);

  // Handle analyzing the current generator canvas
  const handleAnalyzeGenerator = useCallback(async () => {
    if (!generatedCanvas) return;

    setIsLoading(true);
    setLoadingSource('generator');
    setError(null);
    setResult(null);
    setImported(false);

    try {
      // Create a data URL from the canvas for original image display
      const canvas = generatedCanvas as HTMLCanvasElement;
      const dataUrl = canvas.toDataURL('image/png');
      setOriginalImageUrl(dataUrl);

      // Analyze the canvas directly
      const analysisResult = analyzeQRCode(canvas);
      setResult(analysisResult);
      setAnalysisSource('generator');
      if (!analysisResult.success) {
        setError(analysisResult.error || t('analyze.noCodeDetected', 'No QR code detected'));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('analyze.genericError', 'Failed to analyze QR code')
      );
    } finally {
      setIsLoading(false);
      setLoadingSource(null);
    }
  }, [generatedCanvas, t]);

  // Reset hasAutoAnalyzed when generatedCanvas changes so re-navigating triggers auto-analysis
  useEffect(() => {
    setHasAutoAnalyzed(false);
  }, []);

  // Auto-analyze the generator canvas on first load if available
  useEffect(() => {
    if (generatedCanvas && !hasAutoAnalyzed && !result && !isLoading) {
      setHasAutoAnalyzed(true);
      handleAnalyzeGenerator();
    }
  }, [generatedCanvas, hasAutoAnalyzed, result, isLoading, handleAnalyzeGenerator]);

  // Render content type details
  const renderContentTypeDetails = (contentType: ContentTypeDetails) => {
    const details: Array<{ label: string; value: string }> = [];

    if (contentType.url) details.push({ label: 'URL', value: contentType.url });
    if (contentType.protocol) details.push({ label: 'Protocol', value: contentType.protocol });
    if (contentType.wifiSsid) details.push({ label: 'SSID', value: contentType.wifiSsid });
    if (contentType.wifiAuth) details.push({ label: 'Auth', value: contentType.wifiAuth });
    if (contentType.contactName) details.push({ label: 'Name', value: contentType.contactName });
    if (contentType.phoneNumber) details.push({ label: 'Phone', value: contentType.phoneNumber });
    if (contentType.emailAddress) details.push({ label: 'Email', value: contentType.emailAddress });
    if (contentType.cryptoCurrency)
      details.push({ label: 'Currency', value: contentType.cryptoCurrency });
    if (contentType.cryptoAddress)
      details.push({ label: 'Address', value: contentType.cryptoAddress });
    if (contentType.amount) details.push({ label: 'Amount', value: contentType.amount });

    // UTM parameters
    if (contentType.hasUtmParams) {
      if (contentType.utmSource)
        details.push({ label: 'UTM Source', value: contentType.utmSource });
      if (contentType.utmMedium)
        details.push({ label: 'UTM Medium', value: contentType.utmMedium });
      if (contentType.utmCampaign)
        details.push({ label: 'UTM Campaign', value: contentType.utmCampaign });
    }

    return details;
  };

  // Get contrast badge color
  const getContrastBadgeColor = (ratio: number) => {
    if (ratio >= 7) return 'bg-green-500 text-white';
    if (ratio >= 4.5) return 'bg-green-400 text-white';
    if (ratio >= 3) return 'bg-yellow-500 text-black';
    return 'bg-red-500 text-white';
  };

  const getContrastLabel = (ratio: number) => {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'AA-L';
    return 'Poor';
  };

  return (
    <main className="flex-1 flex bg-background overflow-hidden">
      {/* Left Skyscraper Ad */}
      <div className="hidden lg:flex flex-col items-center justify-center w-[180px] min-h-[600px] bg-background flex-shrink-0 pl-3 pr-2">
        <AdUnit slot="static-left" width={160} height={600} format="vertical" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
              <ScanLine className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('analyze.title', 'QR Code Analyzer')}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              {t(
                'analyze.description',
                'Upload or capture a QR code to extract its complete technical specification and import settings to recreate or modify it.'
              )}
            </p>
          </div>

          {/* Input Section - Always visible, compact cards */}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {/* Use Current QR Card - only shown when generator canvas is available */}
            {generatedCanvas ? (
              <button
                type="button"
                onClick={handleAnalyzeGenerator}
                disabled={isLoading}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all h-full ${
                  isLoading && loadingSource === 'generator'
                    ? 'border-primary bg-primary/5'
                    : 'border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10'
                }`}
              >
                {isLoading && loadingSource === 'generator' ? (
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
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border opacity-40 h-full">
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
            )}

            {/* File Upload Card */}
            <label className="relative group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />
              <div
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all h-full ${
                  isLoading && loadingSource === 'file'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary hover:bg-primary/5'
                }`}
              >
                {isLoading && loadingSource === 'file' ? (
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

            {/* URL Input Card */}
            <div
              className={`flex flex-col gap-2 p-4 rounded-lg border-2 transition-all h-full ${
                isLoading && loadingSource === 'url'
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
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
                  {isLoading && loadingSource === 'url' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Camera Card */}
            {Capacitor.isNativePlatform() ? (
              <button
                type="button"
                onClick={handleCameraCapture}
                disabled={isLoading}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all h-full ${
                  isLoading && loadingSource === 'camera'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary hover:bg-primary/5'
                }`}
              >
                {isLoading && loadingSource === 'camera' ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <CameraIcon className="w-6 h-6 text-muted-foreground" />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium">{t('analyze.captureCamera', 'Photo')}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t('analyze.cameraHint', 'Camera')}
                  </p>
                </div>
              </button>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border opacity-40 h-full">
                <CameraIcon className="w-6 h-6 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('analyze.captureCamera', 'Photo')}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t('analyze.cameraWebHint', 'App only')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error State */}
          {error && !result && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{t('analyze.error', 'Analysis Failed')}</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                {t('analyze.tryAgain', 'Try Again')}
              </Button>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-4">
              {/* Status Header - Success */}
              {result.success && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {t('analyze.success', 'QR Code Analyzed Successfully')}
                    </p>
                    {result.confidence && (
                      <p className="text-xs opacity-80">
                        Confidence:{' '}
                        <span className="font-medium capitalize">{result.confidence}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Error Display - Failure */}
              {!result.success && (
                <div className="space-y-4">
                  {/* CORS-specific error with helpful guidance */}
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
                            <li>
                              {t('analyze.corsStep1', 'Go to the website with the QR code image')}
                            </li>
                            <li>
                              {t(
                                'analyze.corsStep2',
                                'Right-click the image and select "Save image as..."'
                              )}
                            </li>
                            <li>
                              {t('analyze.corsStep3', 'Come back here and upload the saved file')}
                            </li>
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
                    /* Generic error display */
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                      <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">
                          {result.errorType === 'no_qr_detected'
                            ? t('analyze.noQrDetected', 'No QR Code Found')
                            : t('analyze.failed', 'Analysis Failed')}
                        </p>
                        <p className="text-sm opacity-90 whitespace-pre-wrap">{result.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-700 dark:text-amber-400">
                    {result.warnings.map((warning, i) => (
                      <p key={i}>• {warning}</p>
                    ))}
                  </div>
                </div>
              )}

              {result.success && (
                <>
                  {/* Side-by-Side Preview */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Original Image */}
                    <div className="border rounded-lg p-4 bg-card">
                      <div className="flex items-center gap-2 mb-3">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Original</span>
                      </div>
                      <div className="aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        {originalImageUrl ? (
                          <img
                            src={originalImageUrl}
                            alt="Original QR Code"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-muted-foreground text-sm">No image</div>
                        )}
                      </div>
                    </div>

                    {/* Reproduced QR */}
                    <div className="border rounded-lg p-4 bg-card">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Reproduced (Extracted Settings)</span>
                      </div>
                      <div className="aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        <canvas
                          ref={reproducedCanvasRef}
                          className="max-w-full max-h-full object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payload Content */}
                  {result.payload && (
                    <div className="border rounded-lg p-4 bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Payload Content</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {result.payload.length} characters
                        </span>
                      </div>
                      <pre className="text-sm font-mono bg-muted/50 p-3 rounded-lg overflow-x-auto max-h-32 whitespace-pre-wrap break-all">
                        {result.payload}
                      </pre>
                    </div>
                  )}

                  {/* Analysis Sections */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Content Analysis */}
                    {result.contentType && (
                      <CollapsibleSection
                        title="Content Analysis"
                        icon={
                          CONTENT_TYPE_ICONS[result.contentType.type] || (
                            <QrCode className="w-4 h-4" />
                          )
                        }
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
                          {renderContentTypeDetails(result.contentType).map((detail, i) => (
                            <DetailRow
                              key={i}
                              label={detail.label}
                              value={
                                <span className="font-mono text-xs truncate max-w-[200px] block">
                                  {detail.value}
                                </span>
                              }
                            />
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                    {/* QR Structure */}
                    <CollapsibleSection title="QR Structure" icon={<Grid3x3 className="w-4 h-4" />}>
                      <div className="space-y-2">
                        <DetailRow
                          label="Version"
                          value={
                            result.version !== null
                              ? `${result.version} (${result.moduleCount}×${result.moduleCount} modules)`
                              : '—'
                          }
                          icon={<Hash className="w-3.5 h-3.5" />}
                        />
                        <DetailRow
                          label="Error Correction"
                          value={
                            result.eccLevel ? (
                              <div className="text-right">
                                <div>Level {result.eccLevel}</div>
                                <div className="text-xs text-muted-foreground">
                                  {ECC_DESCRIPTIONS[result.eccLevel].recovery} recovery
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
                            result.maskPattern !== null ? (
                              <div className="text-right">
                                <div>Pattern {result.maskPattern}</div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {MASK_DESCRIPTIONS[result.maskPattern]}
                                </div>
                              </div>
                            ) : (
                              '—'
                            )
                          }
                          icon={<Layers className="w-3.5 h-3.5" />}
                        />
                      </div>
                    </CollapsibleSection>

                    {/* Encoding */}
                    <CollapsibleSection
                      title="Encoding"
                      icon={<Binary className="w-4 h-4" />}
                      badge={
                        result.errorsCorrected !== null && result.errorsCorrected > 0 ? (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {result.errorsCorrected} error{result.errorsCorrected !== 1 ? 's' : ''}{' '}
                            corrected
                          </span>
                        ) : null
                      }
                    >
                      <div className="space-y-2">
                        <DetailRow
                          label="Mode"
                          value={
                            <span className="capitalize">{result.encodingMode || 'Unknown'}</span>
                          }
                          icon={<Type className="w-3.5 h-3.5" />}
                        />
                        {result.payloadBytes && (
                          <DetailRow
                            label="Raw Bytes"
                            value={`${result.payloadBytes.length} bytes`}
                            icon={<Database className="w-3.5 h-3.5" />}
                          />
                        )}
                        <DetailRow
                          label="RS Error Correction"
                          value={
                            result.errorsCorrected === null ? (
                              <span className="text-muted-foreground">Not available</span>
                            ) : result.errorsCorrected > 0 ? (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                {result.errorsCorrected} error
                                {result.errorsCorrected !== 1 ? 's' : ''} recovered
                              </span>
                            ) : (
                              <span className="text-green-600 dark:text-green-400">
                                No errors detected
                              </span>
                            )
                          }
                          icon={<Shield className="w-3.5 h-3.5" />}
                        />
                      </div>
                    </CollapsibleSection>

                    {/* Colors */}
                    {result.detectedColors && (
                      <CollapsibleSection
                        title="Colors"
                        icon={<Palette className="w-4 h-4" />}
                        badge={
                          <span
                            className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${getContrastBadgeColor(result.detectedColors.contrastRatio)}`}
                          >
                            {result.detectedColors.contrastRatio.toFixed(1)}:1 (
                            {getContrastLabel(result.detectedColors.contrastRatio)})
                          </span>
                        }
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <ColorSwatch
                              color={result.detectedColors.foreground}
                              label="Foreground"
                            />
                            <ColorSwatch
                              color={result.detectedColors.background}
                              label="Background"
                            />
                          </div>
                          <DetailRow
                            label="Contrast Ratio"
                            value={`${result.detectedColors.contrastRatio.toFixed(2)}:1`}
                            icon={<Eye className="w-3.5 h-3.5" />}
                          />
                        </div>
                      </CollapsibleSection>
                    )}

                    {/* Spatial Analysis */}
                    <CollapsibleSection
                      title="Spatial Analysis"
                      icon={<Ruler className="w-4 h-4" />}
                    >
                      <div className="space-y-2">
                        {result.estimatedModulePx !== null && (
                          <DetailRow
                            label="Module Size"
                            value={`~${result.estimatedModulePx} px`}
                            icon={<Square className="w-3.5 h-3.5" />}
                          />
                        )}
                        {result.quietZone && (
                          <>
                            <DetailRow
                              label="Quiet Zone"
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

                    {/* Data Capacity */}
                    {result.dataCapacity && (
                      <CollapsibleSection
                        title="Data Capacity"
                        icon={<Database className="w-4 h-4" />}
                        badge={
                          result.dataCapacity.overflow ? (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Detection mismatch
                            </span>
                          ) : (
                            <span
                              className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                                result.dataCapacity.percentage > 90
                                  ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                                  : result.dataCapacity.percentage > 70
                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                    : 'bg-green-500/10 text-green-700 dark:text-green-400'
                              }`}
                            >
                              {result.dataCapacity.percentage}% used
                            </span>
                          )
                        }
                      >
                        {result.dataCapacity.overflow ? (
                          <div className="space-y-2">
                            <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
                              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>
                                Payload ({result.dataCapacity.used} bytes) exceeds detected capacity
                                ({result.dataCapacity.total} bytes). Version or ECC detection may be
                                inaccurate.
                              </span>
                            </div>
                            <DetailRow
                              label="Payload Size"
                              value={`${result.dataCapacity.used} bytes`}
                              icon={<Database className="w-3.5 h-3.5" />}
                            />
                            <DetailRow
                              label="Detected Capacity"
                              value={`${result.dataCapacity.total} bytes`}
                              icon={<Database className="w-3.5 h-3.5" />}
                            />
                          </div>
                        ) : (
                          <ProgressBar
                            value={result.dataCapacity.used}
                            max={result.dataCapacity.total}
                            label="Byte Mode Capacity"
                          />
                        )}
                      </CollapsibleSection>
                    )}

                    {/* Structural Patterns */}
                    {result.structuralAnalysis && (
                      <CollapsibleSection
                        title="Structural Patterns"
                        icon={<Settings className="w-4 h-4" />}
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

                    {/* Image Properties */}
                    {result.imageProperties && (
                      <CollapsibleSection
                        title="Image Properties"
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
                          {result.imageProperties.estimatedQrSizePx > 0 &&
                            result.imageProperties.width > 0 && (
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

                  {/* Debug Log (collapsible, for diagnostics) */}
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

                  {/* Import Section */}
                  <div className="border rounded-lg p-4 bg-card space-y-4">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <span className="font-medium">Import to Generator</span>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">Settings to be imported:</p>
                      <ul className="grid grid-cols-2 gap-1 text-xs">
                        <li className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500" />
                          Payload content
                        </li>
                        {result.version !== null && (
                          <li className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500" />
                            Version {result.version}
                          </li>
                        )}
                        {result.eccLevel && (
                          <li className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500" />
                            ECC Level {result.eccLevel}
                          </li>
                        )}
                        {result.maskPattern !== null && (
                          <li className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500" />
                            Mask Pattern {result.maskPattern}
                          </li>
                        )}
                        {result.encodingMode && result.encodingMode !== 'unknown' && (
                          <li className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500" />
                            {result.encodingMode} mode
                          </li>
                        )}
                        {result.detectedColors && (
                          <li className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500" />
                            Colors (FG/BG)
                          </li>
                        )}
                      </ul>
                    </div>

                    <Button
                      size="lg"
                      className="w-full gap-2"
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
                  </div>
                </>
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

export default Analyze;
