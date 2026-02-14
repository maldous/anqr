import { DynamicTestId } from '@/components/ui/dynamic-testid';
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
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdUnit } from '@/components/AdUnit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createLogger } from '@/lib/logger';
import { saveFileNative } from '@/modules/browser-io';
import {
  analyzeQRCode,
  analyzeQRFromFile,
  analyzeQRFromUrl,
  buildAnalysisExportData,
  type ContentType,
  type ContentTypeDetails,
  type ECCLevel,
  type QRAnalysisResult,
} from '@/modules/qr-analyzer';
import {
  createQRInstance,
  getStringToBytes,
  optimizeSegments,
  setStringToBytes,
} from '@/modules/qr-encoder';
import {
  ECC_CAPACITIES_ALPHANUMERIC,
  ECC_CAPACITIES_BYTE,
  ECC_CAPACITIES_NUMERIC,
} from '@/modules/qr-spec';
import { useQRStore } from '@/store/qr-store';

const log = createLogger('ANALYZE');

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
  testId?: string;
}

function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  children,
  badge,
  testId,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg overflow-hidden" data-testid={testId}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-3 bg-muted/50 rounded-md shadow-sm hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">{icon}</div>
          <span className="font-medium text-sm">{title}</span>
          {badge}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
        />
      </button>
      {isOpen && (
        <div className="px-3 pb-3 pt-3 mt-1 bg-card rounded-md shadow-sm border">{children}</div>
      )}
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
        className="w-6 h-6 rounded border shadow-md"
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

function formatMilliseconds(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return 'N/A';
  return `${ms.toFixed(2)} ms`;
}

function nowMs(): number {
  return typeof globalThis.performance?.now === 'function'
    ? globalThis.performance.now()
    : Date.now();
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

// WCAG Compliance Badge Component
interface WCAGBadgeProps {
  ratio: number;
  size?: 'sm' | 'md' | 'lg';
}

function WCAGBadge({ ratio, size = 'md' }: WCAGBadgeProps) {
  const meetsAAA = ratio >= 7;
  const meetsAA = ratio >= 4.5;
  const meetsAALarge = ratio >= 3;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 rounded-md font-bold ${sizeClasses[size]} ${
          meetsAAA
            ? 'bg-green-500 text-white'
            : meetsAA
              ? 'bg-green-400 text-white'
              : meetsAALarge
                ? 'bg-amber-500 text-white'
                : 'bg-red-500 text-white'
        }`}
      >
        {meetsAAA ? 'AAA' : meetsAA ? 'AA' : meetsAALarge ? 'AA-L' : 'Fail'}
      </span>
      <span className={`text-muted-foreground ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
        {ratio.toFixed(1)}:1
      </span>
    </div>
  );
}

// Copy Button Component
interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

function CopyButton({ text, label, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={`h-7 gap-1.5 text-xs ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <ClipboardCopy className="w-3 h-3" />
          {label && <span>{label}</span>}
        </>
      )}
    </Button>
  );
}

// Hex Dump View Component
interface HexDumpViewProps {
  bytes: Uint8Array;
  maxRows?: number;
}

function HexDumpView({ bytes, maxRows = 16 }: HexDumpViewProps) {
  const [expanded, setExpanded] = useState(false);
  // Use 16 bytes per row on desktop, 8 on mobile
  const bytesPerRowDesktop = 16;
  const bytesPerRowMobile = 8;

  // Calculate rows for mobile (used for display)
  const totalRowsMobile = Math.ceil(bytes.length / bytesPerRowMobile);
  const displayRowsMobile = expanded ? totalRowsMobile : Math.min(maxRows, totalRowsMobile);

  const totalRowsDesktop = Math.ceil(bytes.length / bytesPerRowDesktop);
  const displayRowsDesktop = expanded ? totalRowsDesktop : Math.min(maxRows, totalRowsDesktop);

  const hexDumpMobile = useMemo(() => {
    const rows: Array<{ offset: string; hex: string; ascii: string }> = [];
    for (
      let i = 0;
      i < displayRowsMobile * bytesPerRowMobile && i < bytes.length;
      i += bytesPerRowMobile
    ) {
      const slice = bytes.slice(i, Math.min(i + bytesPerRowMobile, bytes.length));
      const hex = Array.from(slice)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ');
      const ascii = Array.from(slice)
        .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
        .join('');
      rows.push({
        offset: i.toString(16).padStart(4, '0'),
        hex: hex.padEnd(bytesPerRowMobile * 3 - 1, ' '),
        ascii: ascii.padEnd(bytesPerRowMobile, ' '),
      });
    }
    return rows;
  }, [bytes, displayRowsMobile]);

  const hexDumpDesktop = useMemo(() => {
    const rows: Array<{ offset: string; hex: string; ascii: string }> = [];
    for (
      let i = 0;
      i < displayRowsDesktop * bytesPerRowDesktop && i < bytes.length;
      i += bytesPerRowDesktop
    ) {
      const slice = bytes.slice(i, Math.min(i + bytesPerRowDesktop, bytes.length));
      const hex = Array.from(slice)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ');
      const ascii = Array.from(slice)
        .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
        .join('');
      rows.push({
        offset: i.toString(16).padStart(4, '0'),
        hex: hex.padEnd(bytesPerRowDesktop * 3 - 1, ' '),
        ascii: ascii.padEnd(bytesPerRowDesktop, ' '),
      });
    }
    return rows;
  }, [bytes, displayRowsDesktop]);

  const fullHex = useMemo(
    () =>
      Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' '),
    [bytes]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{bytes.length} bytes</span>
        <CopyButton text={fullHex} label="Copy Hex" />
      </div>
      {/* Mobile layout (8 bytes per row) */}
      <div className="bg-muted/50 rounded-lg shadow-inner p-2 md:hidden">
        <div className="font-mono text-[9px] leading-relaxed">
          {/* Header */}
          <div className="grid grid-cols-[4ch_1fr_1fr] gap-2 text-muted-foreground mb-1 border-b border-muted pb-1">
            <span>Addr</span>
            <span>Hex</span>
            <span>ASCII</span>
          </div>
          {/* Data rows */}
          {hexDumpMobile.map((row, i) => (
            <div key={i} className="grid grid-cols-[4ch_1fr_1fr] gap-2">
              <span className="text-blue-500 dark:text-blue-400">{row.offset}</span>
              <span className="text-foreground">{row.hex}</span>
              <span className="text-green-600 dark:text-green-400">{row.ascii}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Desktop layout (16 bytes per row) */}
      <div className="bg-muted/50 rounded-lg shadow-inner p-3 hidden md:block">
        <div className="font-mono text-[10px] leading-relaxed">
          {/* Header */}
          <div className="grid grid-cols-[4ch_1fr_1fr] gap-3 text-muted-foreground mb-1 border-b border-muted pb-1">
            <span>Addr</span>
            <span>Hex</span>
            <span>ASCII</span>
          </div>
          {/* Data rows */}
          {hexDumpDesktop.map((row, i) => (
            <div key={i} className="grid grid-cols-[4ch_1fr_1fr] gap-3">
              <span className="text-blue-500 dark:text-blue-400">{row.offset}</span>
              <span className="text-foreground">{row.hex}</span>
              <span className="text-green-600 dark:text-green-400">{row.ascii}</span>
            </div>
          ))}
        </div>
      </div>
      {totalRowsMobile > maxRows && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs shadow-sm"
        >
          {expanded ? 'Show Less' : `Show All (${totalRowsMobile} rows)`}
        </Button>
      )}
    </div>
  );
}

// Module Matrix Visualization Component
interface ModuleMatrixViewProps {
  matrix: boolean[][];
  version: number | null;
  fgColor?: string;
  bgColor?: string;
}

function ModuleMatrixView({
  matrix,
  version,
  fgColor = '#000000',
  bgColor = '#ffffff',
}: ModuleMatrixViewProps) {
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const moduleCount = matrix.length;

  // Calculate module size based on container and zoom
  const baseModuleSize = Math.max(2, Math.min(8, Math.floor(280 / moduleCount)));
  const moduleSize = baseModuleSize * zoom;
  const gridSize = moduleCount * moduleSize;

  // Generate ASCII art representation
  const generateAsciiArt = useCallback(() => {
    return matrix.map((row) => row.map((isDark) => (isDark ? '██' : '░░')).join('')).join('\n');
  }, [matrix]);

  const handleCopyAsText = useCallback(async () => {
    const asciiArt = generateAsciiArt();
    try {
      await navigator.clipboard.writeText(asciiArt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = asciiArt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generateAsciiArt]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">
          {moduleCount} × {moduleCount} modules
          {version && ` (Version ${version})`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyAsText}
            className="h-7 gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <ClipboardCopy className="w-3 h-3" />
                <span>Copy as Text</span>
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="h-7 w-7 p-0"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="h-7 w-7 p-0"
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="overflow-auto max-h-[400px] rounded-lg border bg-white dark:bg-gray-900 p-2 shadow-inner flex justify-center"
      >
        <div
          style={{
            width: gridSize,
            height: gridSize,
            display: 'grid',
            gridTemplateColumns: `repeat(${moduleCount}, ${moduleSize}px)`,
            gap: 0,
          }}
        >
          {matrix.map((row, r) =>
            row.map((isDark, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  width: moduleSize,
                  height: moduleSize,
                  backgroundColor: isDark ? fgColor : bgColor,
                }}
                title={`Row ${r}, Col ${c}: ${isDark ? 'Dark' : 'Light'}`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Capacity Table by Mode Component
interface CapacityByModeProps {
  version: number;
  eccLevel: ECCLevel;
  currentBytes?: number;
}

function CapacityByModeTable({ version, eccLevel, currentBytes }: CapacityByModeProps) {
  const versionIndex = version - 1;

  const capacities = [
    {
      mode: 'Numeric',
      icon: <Hash className="w-3.5 h-3.5" />,
      capacity: ECC_CAPACITIES_NUMERIC[eccLevel]?.[versionIndex] ?? 0,
      unit: 'digits',
    },
    {
      mode: 'Alphanumeric',
      icon: <Type className="w-3.5 h-3.5" />,
      capacity: ECC_CAPACITIES_ALPHANUMERIC[eccLevel]?.[versionIndex] ?? 0,
      unit: 'chars',
    },
    {
      mode: 'Byte',
      icon: <Binary className="w-3.5 h-3.5" />,
      capacity: ECC_CAPACITIES_BYTE[eccLevel]?.[versionIndex] ?? 0,
      unit: 'bytes',
      current: currentBytes,
    },
    {
      mode: 'Kanji',
      icon: <Globe className="w-3.5 h-3.5" />,
      capacity: Math.floor((ECC_CAPACITIES_BYTE[eccLevel]?.[versionIndex] ?? 0) * 0.6),
      unit: 'chars',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground mb-2">
        Maximum capacity for Version {version} with ECC {eccLevel}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {capacities.map((cap) => (
          <div
            key={cap.mode}
            className={`p-2.5 rounded-lg border bg-card ${
              cap.current !== undefined ? 'ring-1 ring-primary/50' : ''
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <div className="text-muted-foreground">{cap.icon}</div>
              <span className="text-xs font-medium">{cap.mode}</span>
            </div>
            <div className="text-lg font-bold">
              {cap.capacity.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground ml-1">{cap.unit}</span>
            </div>
            {cap.current !== undefined && (
              <div className="mt-1">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      (cap.current / cap.capacity) > 0.9
                        ? 'bg-red-500'
                        : cap.current / cap.capacity > 0.7
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (cap.current / cap.capacity) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {cap.current} used ({Math.round((cap.current / cap.capacity) * 100)}%)
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Sticky Summary Bar Component
interface SummaryBarProps {
  result: QRAnalysisResult;
}

function SummaryBar({ result }: SummaryBarProps) {
  if (!result.success) return null;

  // Common badge styling for consistent width
  const badgeBase =
    'inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md font-medium text-center flex-1 min-w-[65px] shadow-sm';

  return (
    <div
      className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border rounded-lg shadow-sm py-2 px-3 mb-4 animate-in slide-in-from-top duration-300"
      data-testid={DynamicTestId.resolve('analyze-summary-bar', 'analyze-summary-bar')}
    >
      <div className="flex flex-wrap items-stretch gap-1.5 text-xs">
        {/* Version chip */}
        {result.version !== null && (
          <span className={`${badgeBase} bg-primary/10 text-primary`}>
            <Grid3x3 className="w-3 h-3" />V{result.version}
          </span>
        )}

        {/* ECC chip */}
        {result.eccLevel && (
          <span className={`${badgeBase} bg-blue-500/10 text-blue-700 dark:text-blue-400`}>
            <Shield className="w-3 h-3" />
            ECC-{result.eccLevel}
          </span>
        )}

        {/* Mask pattern chip */}
        {result.maskPattern !== null && (
          <span className={`${badgeBase} bg-indigo-500/10 text-indigo-700 dark:text-indigo-400`}>
            <Layers className="w-3 h-3" />
            Mask {result.maskPattern}
          </span>
        )}

        {/* Encoding mode chip */}
        {result.encodingMode && result.encodingMode !== 'unknown' && (
          <span
            className={`${badgeBase} bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 capitalize`}
          >
            <Code2 className="w-3 h-3" />
            {result.encodingMode}
          </span>
        )}

        {/* Content type chip */}
        {result.contentType && (
          <span className={`${badgeBase} bg-purple-500/10 text-purple-700 dark:text-purple-400`}>
            {CONTENT_TYPE_ICONS[result.contentType.type]}
            {result.contentType.label}
          </span>
        )}

        {/* Contrast chip */}
        {result.detectedColors && (
          <span className={`${badgeBase} bg-muted`}>
            <Eye className="w-3 h-3" />
            <WCAGBadge ratio={result.detectedColors.contrastRatio} size="sm" />
          </span>
        )}

        {/* Module count */}
        <span className={`${badgeBase} bg-muted text-muted-foreground`}>
          <Grid3x3 className="w-3 h-3" />
          {result.moduleCount}×{result.moduleCount}
        </span>

        {/* Payload char count */}
        {result.payload && (
          <span className={`${badgeBase} bg-muted text-muted-foreground`}>
            <Type className="w-3 h-3" />
            {result.payload.length} chars
          </span>
        )}

        {/* Payload byte count */}
        {result.payloadBytes && result.payloadBytes.length > 0 && (
          <span className={`${badgeBase} bg-muted text-muted-foreground`}>
            <Binary className="w-3 h-3" />
            {result.payloadBytes.length} bytes
          </span>
        )}

        {/* Decoder byte count */}
        {typeof result.decoderMetadata?.totalByteLength === 'number' &&
          result.decoderMetadata.totalByteLength > 0 && (
            <span className={`${badgeBase} bg-muted text-muted-foreground`}>
              <Database className="w-3 h-3" />
              Dec {result.decoderMetadata.totalByteLength}
            </span>
          )}

        {/* Erasures */}
        {typeof result.erasures === 'number' && result.erasures >= 0 && (
          <span className={`${badgeBase} bg-amber-500/10 text-amber-700 dark:text-amber-400`}>
            <AlertTriangle className="w-3 h-3" />
            Erasures {result.erasures}
          </span>
        )}

        {/* Orientation */}
        {typeof result.orientation === 'number' && (
          <span className={`${badgeBase} bg-muted text-muted-foreground`}>
            <Ruler className="w-3 h-3" />
            {result.orientation}°
          </span>
        )}

        {/* Quiet zone status */}
        {result.quietZone && (
          <span
            className={`${badgeBase} ${result.quietZone.adequate ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}
          >
            {result.quietZone.adequate ? (
              <Check className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
            Quiet Zone
          </span>
        )}

        {/* Image dimensions */}
        {result.imageProperties && (
          <span className={`${badgeBase} bg-muted text-muted-foreground`}>
            <ImageIcon className="w-3 h-3" />
            {result.imageProperties.width}×{result.imageProperties.height}
          </span>
        )}
      </div>
    </div>
  );
}

// Encoding Efficiency Component
interface EncodingEfficiencyProps {
  payload: string;
  payloadBytes?: Uint8Array;
  encodingMode: string | null;
}

function EncodingEfficiency({ payload, payloadBytes, encodingMode }: EncodingEfficiencyProps) {
  const analysis = useMemo(() => {
    const numericChars = (payload.match(/[0-9]/g) || []).length;
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
  const [actualUsedVersion, setActualUsedVersion] = useState<number | null>(null);
  const [uiTimings, setUiTimings] = useState<{
    encodeMs?: number | null;
    renderMs?: number | null;
    exportMs?: number | null;
  }>({});
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

  const combinedTimings = useMemo(
    () => ({
      ...(result?.timing ?? {}),
      ...uiTimings,
    }),
    [result?.timing, uiTimings]
  );

  // Render reproduced QR by generating a fresh, clean QR code from extracted settings
  useEffect(() => {
    if (!(result?.success && result.payload && reproducedCanvasRef.current)) return;

    const canvas = reproducedCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      let encodeMs: number | null = null;
      let renderMs: number | null = null;
      const ecc: ECCLevel = result.eccLevel || 'M';

      // Strategy:
      // - For self-generated QRs (Analyze -> Current QR), reproduce EXACTLY using the live generator settings.
      //   This must be pixel-identical for the default generated QR.
      // - For external images, prefer exact (version/mask/mode) if detected, else fall back to auto.
      const isGeneratorSource = analysisSource === 'generator' && !!generatedCanvas;

      // STEP 1: Log detected params
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

      // Version must come from decoder - not estimated
      // For generator source, prefer detected version, fall back to store version only if detected is valid
      const versionToUse = isGeneratorSource ? (result.version ?? qrState.version) : result.version;

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

      // STEP 2: Log encoder input construction
      const encoderInputPreview =
        encoderInput.kind === 'bytes'
          ? `[bytes] len=${encoderInput.data.length}, first32codes=[${encoderInput.data
              .slice(0, 32)
              .split('')
              .map((c) => c.charCodeAt(0))
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

      // Version must come from decoder metadata - not auto (0)
      // If decoder didn't detect the version, reproduction cannot be accurate
      const versionToUseFinal =
        typeof result.version === 'number' && result.version >= 1 && result.version <= 40
          ? result.version
          : typeof versionToUse === 'number' && versionToUse >= 1 && versionToUse <= 40
            ? versionToUse
            : null;

      // If version is not available from decoder, we cannot reproduce accurately
      if (versionToUseFinal === null) {
        log.error('CANNOT REPRODUCE: Version not detected by decoder');
        // Clear canvas and show error
        canvas.width = 200;
        canvas.height = 200;
        ctx.fillStyle = '#fff3cd';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#856404';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Cannot reproduce:', 100, 80);
        ctx.fillText('Version not detected', 100, 100);
        ctx.fillText('by decoder', 100, 120);
        return;
      }

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

      // STEP 3: Log createQRInstance call params
      const createQRParams = {
        dataLength: encoderInput.data.length,
        ecc,
        version: versionToUseFinal,
        mode: effectiveMode ?? 'auto (undefined)',
        maskPattern:
          typeof maskToUse === 'number' && maskToUse >= 0 && maskToUse <= 7
            ? maskToUse
            : 'auto (undefined)',
        needsIdentityBytes,
      };
      log.debug('STEP 3 - createQRInstance params', createQRParams);

      let qr: ReturnType<typeof createQRInstance> | null = null;
      let actualVersionUsed = versionToUseFinal;
      const encodeStartMs = nowMs();
      try {
        // NEVER use auto version (0) - always use the detected version from decoder
        qr = createQRInstance(encoderInput.data, ecc, versionToUseFinal, {
          ...(effectiveMode ? { mode: effectiveMode } : {}),
          ...(typeof maskToUse === 'number' && maskToUse >= 0 && maskToUse <= 7
            ? { maskPattern: maskToUse as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 }
            : {}),
        });
        log.debug('STEP 3b - createQRInstance SUCCESS');
      } catch (encoderError) {
        const errorMessage =
          encoderError instanceof Error ? encoderError.message : String(encoderError);
        log.error('STEP 3b - createQRInstance FAILED', {
          error: errorMessage,
          requestedVersion: versionToUseFinal,
          ecc,
          dataLength: encoderInput.data.length,
          mode: effectiveMode,
          maskPattern: maskToUse,
        });

        // For overflow errors, try mixed mode encoding first, then higher versions
        if (errorMessage.includes('overflow')) {
          // First, try mixed mode encoding at the original version
          // This is crucial for QArt codes that use numeric URL fragments
          const segments = optimizeSegments(encoderInput.data);
          const hasMixedModeOptimization =
            segments.length > 1 || (segments.length === 1 && segments[0].mode !== 'byte');

          if (hasMixedModeOptimization) {
            log.debug('STEP 3c - Trying MIXED MODE encoding at original version', {
              segments: segments.map((s) => ({ mode: s.mode, len: s.data.length })),
              originalVersion: versionToUseFinal,
            });

            try {
              qr = createQRInstance(encoderInput.data, ecc, versionToUseFinal, {
                mode: 'mixed',
                ...(typeof maskToUse === 'number' && maskToUse >= 0 && maskToUse <= 7
                  ? { maskPattern: maskToUse as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 }
                  : {}),
              });
              log.debug('STEP 3c - MIXED MODE SUCCESS at original version!', {
                version: versionToUseFinal,
                segments: segments.map((s) => ({ mode: s.mode, len: s.data.length })),
              });
              // Successfully encoded with mixed mode at original version
            } catch (mixedModeError) {
              log.debug('STEP 3c - Mixed mode failed, trying higher versions...', {
                error:
                  mixedModeError instanceof Error ? mixedModeError.message : String(mixedModeError),
              });
              qr = null; // Reset to try higher versions
            }
          }

          // If mixed mode didn't work (or wasn't applicable), try higher versions
          if (!qr) {
            log.debug('STEP 3c - Trying higher versions due to overflow...');
            let foundVersion: number | null = null;

            for (let tryVersion = versionToUseFinal + 1; tryVersion <= 40; tryVersion++) {
              try {
                // Try with mixed mode first at higher version
                qr = createQRInstance(encoderInput.data, ecc, tryVersion, {
                  mode: 'mixed',
                  ...(typeof maskToUse === 'number' && maskToUse >= 0 && maskToUse <= 7
                    ? { maskPattern: maskToUse as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 }
                    : {}),
                });
                foundVersion = tryVersion;
                log.debug('STEP 3c - VERSION UPGRADE: Successfully encoded at version', {
                  originalVersion: versionToUseFinal,
                  newVersion: tryVersion,
                  versionIncrease: tryVersion - versionToUseFinal,
                  ecc,
                  maskPattern: maskToUse,
                  usedMixedMode: true,
                });
                break;
              } catch {
                // Try next version
              }
            }

            if (foundVersion !== null) {
              actualVersionUsed = foundVersion;
            } else {
              throw new Error(
                `Data too large: cannot fit in any QR version (1-40) with ECC ${ecc}`
              );
            }
          }
        } else {
          throw encoderError; // Re-throw for other errors
        }
      } finally {
        if (needsIdentityBytes) setStringToBytes(prevStringToBytes);
      }

      // At this point qr must be non-null
      if (!qr) {
        throw new Error('QR instance is null - this should not happen');
      }
      encodeMs = Math.round((nowMs() - encodeStartMs) * 100) / 100;

      // Store the actual version used for import to generator
      setActualUsedVersion(actualVersionUsed);

      const moduleCount = qr.getModuleCount();
      const actualVersion = (moduleCount - 17) / 4;

      // STEP 4: Log QR instance result
      log.debug('STEP 4 - QR instance result', {
        moduleCount,
        actualVersion,
        requestedVersion: versionToUseFinal,
        actualVersionUsed,
        versionMatch: actualVersion === (result.version ?? actualVersion),
      });

      // STEP 4b: Warn if version mismatch
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

      // Margin handling
      // For the self-generated QR, infer the exact margin from the actual generator canvas.
      // This avoids off-by-one errors (quiet zone vs border modules) and matches safety-adjusted quiet zones.
      const marginModules = (() => {
        if (isGeneratorSource && generatedCanvas) {
          const modulePxFromStore = Math.max(1, Math.floor(renderState.modulePx || 1));
          const totalModules = Math.round(generatedCanvas.width / modulePxFromStore);
          const inferred = Math.max(0, Math.floor((totalModules - moduleCount) / 2));

          // STEP 5: Log margin calculation (generator source)
          log.debug('STEP 5 - Margin calculation (generator)', {
            renderStateModulePx: renderState.modulePx,
            modulePxFromStore,
            canvasWidth: generatedCanvas.width,
            totalModulesInferred: totalModules,
            qrModuleCount: moduleCount,
            inferredMargin: inferred,
            calculation: `floor((${totalModules} - ${moduleCount}) / 2) = ${inferred}`,
          });

          return inferred;
        }

        // STEP 5: Log margin calculation (external source)
        const margin = Math.max(4, result.quietZone?.top ?? 4);
        log.debug('STEP 5 - Margin calculation (external)', {
          quietZoneTop: result.quietZone?.top,
          margin,
        });

        return margin;
      })();

      // Canvas sizing
      // - Generator: match the exact canvas size (pixel-identical display)
      // - External: render at a readable size (~300px)
      let modulePx: number;
      let size: number;
      if (isGeneratorSource && generatedCanvas) {
        // Calculate modulePx that actually fits the QR in the canvas
        // (renderState.modulePx is the configured setting, but the actual rendered
        // module size may differ due to canvas sizing / quiet zone adjustments)
        size = generatedCanvas.width;
        const totalModulesWithMargin = moduleCount + marginModules * 2;
        modulePx = Math.max(1, Math.floor(size / totalModulesWithMargin));

        // STEP 6: Log canvas sizing (generator)
        log.debug('STEP 6 - Canvas sizing (generator)', {
          canvasSize: size,
          moduleCount,
          marginModules,
          totalModulesWithMargin,
          calculatedModulePx: modulePx,
          renderStateModulePx: renderState.modulePx,
          totalPixelsNeeded: totalModulesWithMargin * modulePx,
          willFit: totalModulesWithMargin * modulePx <= size,
        });
      } else {
        const targetSize = 300;
        const totalModules = moduleCount + marginModules * 2;
        modulePx = Math.max(3, Math.floor(targetSize / totalModules));
        size = totalModules * modulePx;

        // STEP 6: Log canvas sizing (external)
        log.debug('STEP 6 - Canvas sizing (external)', {
          targetSize,
          moduleCount,
          marginModules,
          totalModules,
          calculatedModulePx: modulePx,
          calculatedSize: size,
        });
      }

      canvas.width = size;
      canvas.height = size;

      // STEP 7: Final summary before drawing
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
      const renderStartMs = nowMs();
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
      renderMs = Math.round((nowMs() - renderStartMs) * 100) / 100;

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
        const gctx = generatedCanvas.getContext('2d') as CanvasRenderingContext2D | null;
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

      // Track if reproduction matches original - should always match now since we don't allow fallbacks
      const reproductionMismatch = actualVersion !== result.version;

      log.debug('Generated QR code', {
        strategy: isGeneratorSource ? 'exact' : 'detected_only',
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
          regenVsDecoded,
          regenVsOriginal,
          bestShift,
        });
      }

      setUiTimings((prev) => ({
        ...prev,
        encodeMs,
        renderMs,
      }));
    } catch (err) {
      setUiTimings((prev) => ({
        ...prev,
        encodeMs: null,
        renderMs: null,
      }));
      log.error('Failed to generate QR code', { error: err });
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
      setUiTimings({});

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
    setUiTimings({});
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
    setUiTimings({});

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
    // Use actualUsedVersion if available (may be upgraded from detected version due to data overflow)
    const versionToImport = actualUsedVersion ?? result.version;
    if (versionToImport !== null && versionToImport >= 1 && versionToImport <= 40) {
      setQrVersion(versionToImport);
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

  // Reset analysis
  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setUrlInput('');
    setImported(false);
    setAnalysisSource(null);
    setActualUsedVersion(null);
    setUiTimings({});
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
    setUiTimings({});

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

  // ==================== PAYLOAD PARSERS FOR COMPREHENSIVE CONTENT ANALYSIS ====================

  // WiFi payload parser - parses WIFI:T:WPA;S:Name;P:pass;H:true;;
  const parseWifiPayload = useCallback((payload: string): Record<string, string | null> => {
    const result: Record<string, string | null> = {
      ssid: null,
      password: null,
      security: null,
      hidden: null,
      eapMethod: null,
      identity: null,
      anonymousIdentity: null,
      phase2: null,
    };

    if (!payload.toUpperCase().startsWith('WIFI:')) return result;

    // Remove WIFI: prefix and trailing ;;
    const content = payload.slice(5).replace(/;;\s*$/, '');
    const parts = content.split(';');

    for (const part of parts) {
      const colonIdx = part.indexOf(':');
      if (colonIdx === -1) continue;
      const key = part.slice(0, colonIdx).toUpperCase();
      const value = part.slice(colonIdx + 1);

      switch (key) {
        case 'S':
          result.ssid = value;
          break;
        case 'P':
          result.password = value;
          break;
        case 'T':
          result.security = value.toUpperCase();
          break;
        case 'H':
          result.hidden = value.toLowerCase() === 'true' ? 'true' : 'false';
          break;
        case 'E':
          result.eapMethod = value;
          break;
        case 'I':
          result.identity = value;
          break;
        case 'A':
          result.anonymousIdentity = value;
          break;
        case 'PH2':
          result.phase2 = value;
          break;
      }
    }

    return result;
  }, []);

  // vCard parser - parses BEGIN:VCARD...END:VCARD
  const parseVCardPayload = useCallback(
    (payload: string): Record<string, string | string[] | null> => {
      const result: Record<string, string | string[] | null> = {
        version: null,
        fullName: null,
        name: null,
        organization: null,
        title: null,
        phones: [],
        emails: [],
        addresses: [],
        birthday: null,
        url: null,
        note: null,
        hasPhoto: null,
      };

      if (!payload.toUpperCase().includes('BEGIN:VCARD')) return result;

      const lines = payload.split(/\r?\n/);
      const phones: string[] = [];
      const emails: string[] = [];
      const addresses: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        // Handle line folding (continuation lines start with space or tab)
        while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
          line += lines[++i].slice(1);
        }

        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;

        const keyPart = line.slice(0, colonIdx).toUpperCase();
        const value = line.slice(colonIdx + 1);
        const baseKey = keyPart.split(';')[0];

        switch (baseKey) {
          case 'VERSION':
            result.version = value;
            break;
          case 'FN':
            result.fullName = value;
            break;
          case 'N':
            result.name = value.replace(/;/g, ' ').trim();
            break;
          case 'ORG':
            result.organization = value.replace(/;/g, ', ');
            break;
          case 'TITLE':
            result.title = value;
            break;
          case 'TEL': {
            const typeMatch = keyPart.match(/TYPE=([^;:]+)/i);
            const type = typeMatch ? typeMatch[1] : 'Phone';
            phones.push(`${type}: ${value}`);
            break;
          }
          case 'EMAIL': {
            const typeMatch = keyPart.match(/TYPE=([^;:]+)/i);
            const type = typeMatch ? typeMatch[1] : 'Email';
            emails.push(`${type}: ${value}`);
            break;
          }
          case 'ADR': {
            const typeMatch = keyPart.match(/TYPE=([^;:]+)/i);
            const type = typeMatch ? typeMatch[1] : 'Address';
            const addrParts = value.split(';').filter(Boolean);
            if (addrParts.length > 0) {
              addresses.push(`${type}: ${addrParts.join(', ')}`);
            }
            break;
          }
          case 'BDAY':
            result.birthday = value;
            break;
          case 'URL':
            result.url = value;
            break;
          case 'NOTE':
            result.note = value;
            break;
          case 'PHOTO':
            result.hasPhoto = 'true';
            break;
        }
      }

      result.phones = phones;
      result.emails = emails;
      result.addresses = addresses;

      return result;
    },
    []
  );

  // MeCard parser - parses MECARD:N:Last,First;...;;
  const parseMeCardPayload = useCallback((payload: string): Record<string, string | null> => {
    const result: Record<string, string | null> = {
      name: null,
      organization: null,
      phone: null,
      email: null,
      address: null,
      birthday: null,
      url: null,
      note: null,
    };

    if (!payload.toUpperCase().startsWith('MECARD:')) return result;

    const content = payload.slice(7).replace(/;;\s*$/, '');
    const parts = content.split(';');

    for (const part of parts) {
      const colonIdx = part.indexOf(':');
      if (colonIdx === -1) continue;
      const key = part.slice(0, colonIdx).toUpperCase();
      const value = part.slice(colonIdx + 1);

      switch (key) {
        case 'N':
          result.name = value.replace(',', ' ');
          break;
        case 'ORG':
          result.organization = value;
          break;
        case 'TEL':
          result.phone = value;
          break;
        case 'EMAIL':
          result.email = value;
          break;
        case 'ADR':
          result.address = value.replace(/,/g, ', ');
          break;
        case 'BDAY':
          result.birthday = value;
          break;
        case 'URL':
          result.url = value;
          break;
        case 'NOTE':
          result.note = value;
          break;
      }
    }

    return result;
  }, []);

  // Email (mailto:) parser
  const parseEmailPayload = useCallback((payload: string): Record<string, string | null> => {
    const result: Record<string, string | null> = {
      to: null,
      subject: null,
      body: null,
      cc: null,
      bcc: null,
      domain: null,
      provider: null,
    };

    if (!payload.toLowerCase().startsWith('mailto:')) return result;

    const content = payload.slice(7);
    const [email, queryString] = content.split('?');
    result.to = decodeURIComponent(email);

    // Extract domain
    const atIdx = result.to.indexOf('@');
    if (atIdx !== -1) {
      result.domain = result.to.slice(atIdx + 1).toLowerCase();
      // Detect provider
      if (result.domain.includes('gmail')) result.provider = 'Gmail';
      else if (
        result.domain.includes('outlook') ||
        result.domain.includes('hotmail') ||
        result.domain.includes('live.com')
      )
        result.provider = 'Microsoft Outlook';
      else if (result.domain.includes('yahoo')) result.provider = 'Yahoo Mail';
      else if (
        result.domain.includes('icloud') ||
        result.domain.includes('me.com') ||
        result.domain.includes('mac.com')
      )
        result.provider = 'Apple iCloud';
      else if (result.domain.includes('protonmail') || result.domain.includes('proton.me'))
        result.provider = 'ProtonMail';
      else result.provider = 'Custom Domain';
    }

    if (queryString) {
      const params = new URLSearchParams(queryString);
      result.subject = params.get('subject');
      result.body = params.get('body');
      result.cc = params.get('cc');
      result.bcc = params.get('bcc');
    }

    return result;
  }, []);

  // Phone (tel:) parser with country detection
  const parseTelPayload = useCallback((payload: string): Record<string, string | null> => {
    const result: Record<string, string | null> = {
      number: null,
      formatted: null,
      countryCode: null,
      country: null,
      countryFlag: null,
    };

    let number = payload.toLowerCase().startsWith('tel:') ? payload.slice(4) : payload;
    number = number.replace(/[^+\d]/g, '');
    result.number = number;
    result.formatted = number;

    // Detect country by dialing code
    const countryCodes: Record<string, { name: string; flag: string }> = {
      '+1': { name: 'USA/Canada', flag: '🇺🇸' },
      '+44': { name: 'United Kingdom', flag: '🇬🇧' },
      '+61': { name: 'Australia', flag: '🇦🇺' },
      '+91': { name: 'India', flag: '🇮🇳' },
      '+86': { name: 'China', flag: '🇨🇳' },
      '+81': { name: 'Japan', flag: '🇯🇵' },
      '+49': { name: 'Germany', flag: '🇩🇪' },
      '+33': { name: 'France', flag: '🇫🇷' },
      '+39': { name: 'Italy', flag: '🇮🇹' },
      '+34': { name: 'Spain', flag: '🇪🇸' },
      '+55': { name: 'Brazil', flag: '🇧🇷' },
      '+52': { name: 'Mexico', flag: '🇲🇽' },
      '+82': { name: 'South Korea', flag: '🇰🇷' },
      '+7': { name: 'Russia', flag: '🇷🇺' },
      '+31': { name: 'Netherlands', flag: '🇳🇱' },
      '+46': { name: 'Sweden', flag: '🇸🇪' },
      '+41': { name: 'Switzerland', flag: '🇨🇭' },
      '+65': { name: 'Singapore', flag: '🇸🇬' },
      '+64': { name: 'New Zealand', flag: '🇳🇿' },
      '+353': { name: 'Ireland', flag: '🇮🇪' },
      '+972': { name: 'Israel', flag: '🇮🇱' },
      '+971': { name: 'UAE', flag: '🇦🇪' },
      '+966': { name: 'Saudi Arabia', flag: '🇸🇦' },
      '+27': { name: 'South Africa', flag: '🇿🇦' },
      '+62': { name: 'Indonesia', flag: '🇮🇩' },
      '+60': { name: 'Malaysia', flag: '🇲🇾' },
      '+63': { name: 'Philippines', flag: '🇵🇭' },
      '+66': { name: 'Thailand', flag: '🇹🇭' },
      '+84': { name: 'Vietnam', flag: '🇻🇳' },
    };

    if (number.startsWith('+')) {
      // Try to match longest prefix first
      for (const prefix of Object.keys(countryCodes).sort((a, b) => b.length - a.length)) {
        if (number.startsWith(prefix)) {
          result.countryCode = prefix;
          result.country = countryCodes[prefix].name;
          result.countryFlag = countryCodes[prefix].flag;
          break;
        }
      }
    }

    return result;
  }, []);

  // SMS parser
  const parseSmsPayload = useCallback((payload: string): Record<string, string | number | null> => {
    const result: Record<string, string | number | null> = {
      number: null,
      body: null,
      charCount: null,
      segmentCount: null,
    };

    let content = payload;
    if (payload.toLowerCase().startsWith('sms:')) content = payload.slice(4);
    else if (payload.toLowerCase().startsWith('smsto:')) content = payload.slice(6);

    const [number, queryPart] = content.split('?');
    result.number = number;

    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      result.body = params.get('body');
      if (result.body) {
        result.charCount = result.body.length;
        // SMS segments: 160 chars for GSM-7, 70 for Unicode
        const hasUnicode = /\P{ASCII}/u.test(result.body);
        const charsPerSegment = hasUnicode ? 70 : 160;
        result.segmentCount = Math.ceil(result.body.length / charsPerSegment);
      }
    }

    return result;
  }, []);

  // Geo coordinate parser with DMS conversion
  const parseGeoPayload = useCallback((payload: string): Record<string, string | number | null> => {
    const result: Record<string, string | number | null> = {
      latitude: null,
      longitude: null,
      altitude: null,
      uncertainty: null,
      latDms: null,
      lonDms: null,
      latHemisphere: null,
      lonHemisphere: null,
      googleMapsUrl: null,
      appleMapsUrl: null,
      osmUrl: null,
    };

    const match = payload.match(/^geo:([\d.-]+),([\d.-]+)(?:,([\d.-]+))?(?:\?.*u=([\d.]+))?/i);
    if (!match) return result;

    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    result.latitude = lat;
    result.longitude = lon;
    result.altitude = match[3] ? parseFloat(match[3]) : null;
    result.uncertainty = match[4] ? parseFloat(match[4]) : null;

    // Determine hemispheres
    result.latHemisphere = lat >= 0 ? 'N' : 'S';
    result.lonHemisphere = lon >= 0 ? 'E' : 'W';

    // Convert to DMS
    const toDms = (decimal: number): string => {
      const abs = Math.abs(decimal);
      const deg = Math.floor(abs);
      const minFloat = (abs - deg) * 60;
      const min = Math.floor(minFloat);
      const sec = ((minFloat - min) * 60).toFixed(2);
      return `${deg}° ${min}' ${sec}"`;
    };

    result.latDms = `${toDms(lat)} ${result.latHemisphere}`;
    result.lonDms = `${toDms(lon)} ${result.lonHemisphere}`;

    // Generate map URLs
    result.googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    result.appleMapsUrl = `https://maps.apple.com/?ll=${lat},${lon}`;
    result.osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`;

    return result;
  }, []);

  // Crypto address parser
  const parseCryptoPayload = useCallback((payload: string): Record<string, string | null> => {
    const result: Record<string, string | null> = {
      network: null,
      address: null,
      addressPreview: null,
      amount: null,
      label: null,
      message: null,
      explorerUrl: null,
      networkColor: null,
    };

    const lowerPayload = payload.toLowerCase();
    let network = 'Unknown';
    let address = payload;
    let queryString = '';

    if (lowerPayload.startsWith('bitcoin:')) {
      network = 'Bitcoin';
      result.networkColor = 'orange';
      const content = payload.slice(8);
      [address, queryString] = content.split('?');
      result.explorerUrl = `https://www.blockchain.com/btc/address/${address}`;
    } else if (lowerPayload.startsWith('ethereum:')) {
      network = 'Ethereum';
      result.networkColor = 'purple';
      const content = payload.slice(9);
      [address, queryString] = content.split('?');
      result.explorerUrl = `https://etherscan.io/address/${address}`;
    } else if (lowerPayload.startsWith('litecoin:')) {
      network = 'Litecoin';
      result.networkColor = 'gray';
      const content = payload.slice(9);
      [address, queryString] = content.split('?');
      result.explorerUrl = `https://blockchair.com/litecoin/address/${address}`;
    } else if (lowerPayload.startsWith('dogecoin:')) {
      network = 'Dogecoin';
      result.networkColor = 'yellow';
      const content = payload.slice(9);
      [address, queryString] = content.split('?');
      result.explorerUrl = `https://dogechain.info/address/${address}`;
    }

    result.network = network;
    result.address = address;
    result.addressPreview =
      address.length > 20 ? `${address.slice(0, 10)}...${address.slice(-10)}` : address;

    if (queryString) {
      const params = new URLSearchParams(queryString);
      result.amount = params.get('amount');
      result.label = params.get('label');
      result.message = params.get('message') || params.get('memo');
    }

    return result;
  }, []);

  // EPC/SEPA payment parser
  const parseEpcSepaPayload = useCallback((payload: string): Record<string, string | null> => {
    const result: Record<string, string | null> = {
      serviceTag: null,
      version: null,
      encoding: null,
      bic: null,
      beneficiaryName: null,
      iban: null,
      amount: null,
      currency: null,
      purposeCode: null,
      referenceType: null,
      reference: null,
      remittanceInfo: null,
      beneficiaryToOriginator: null,
    };

    const lines = payload.split('\n');
    if (lines.length < 4) return result;

    result.serviceTag = lines[0] || null; // Should be 'BCD'
    result.version = lines[1] || null;
    result.encoding = lines[2] || null;
    // Line 3 is identification code
    result.bic = lines[4] || null;
    result.beneficiaryName = lines[5] || null;
    result.iban = lines[6] || null;

    // Parse amount (format: EUR123.45)
    if (lines[7]) {
      const amountMatch = lines[7].match(/([A-Z]{3})([\d.]+)/);
      if (amountMatch) {
        result.currency = amountMatch[1];
        result.amount = amountMatch[2];
      }
    }

    result.purposeCode = lines[8] || null;
    result.referenceType = lines[9] || null;
    result.reference = lines[10] || null;
    result.remittanceInfo = lines[11] || null;
    result.beneficiaryToOriginator = lines[12] || null;

    // Format IBAN with spaces
    if (result.iban) {
      result.iban = result.iban.replace(/(.{4})/g, '$1 ').trim();
    }

    return result;
  }, []);

  // UPI payment parser
  const parseUpiPayload = useCallback((payload: string): Record<string, string | null> => {
    const result: Record<string, string | null> = {
      vpa: null,
      payeeName: null,
      amount: null,
      currency: 'INR',
      transactionRef: null,
      transactionNote: null,
      merchantCode: null,
      minAmount: null,
      url: null,
    };

    if (!payload.toLowerCase().startsWith('upi://')) return result;

    try {
      const url = new URL(payload);
      result.vpa = url.searchParams.get('pa');
      result.payeeName = url.searchParams.get('pn');
      result.amount = url.searchParams.get('am');
      result.currency = url.searchParams.get('cu') || 'INR';
      result.transactionRef = url.searchParams.get('tr');
      result.transactionNote = url.searchParams.get('tn');
      result.merchantCode = url.searchParams.get('mc');
      result.minAmount = url.searchParams.get('mam');
      result.url = url.searchParams.get('url');
    } catch {
      // Invalid URL format
    }

    return result;
  }, []);

  // Calendar event parser
  const parseCalendarPayload = useCallback(
    (payload: string): Record<string, string | boolean | null> => {
      const result: Record<string, string | boolean | null> = {
        summary: null,
        description: null,
        location: null,
        startDate: null,
        startFormatted: null,
        endDate: null,
        endFormatted: null,
        duration: null,
        organizer: null,
        attendeesCount: null,
        recurrence: null,
        recurrenceFormatted: null,
        isAllDay: false,
        timezone: null,
        alarm: null,
      };

      if (
        !(
          payload.toUpperCase().includes('BEGIN:VCALENDAR') ||
          payload.toUpperCase().includes('BEGIN:VEVENT')
        )
      ) {
        return result;
      }

      const lines = payload.split(/\r?\n/);
      let attendeesCount = 0;

      const formatDateTime = (dt: string): string => {
        // Parse iCal datetime format: YYYYMMDDTHHMMSS or YYYYMMDD
        try {
          const isAllDay = dt.length === 8;
          const year = parseInt(dt.slice(0, 4), 10);
          const month = parseInt(dt.slice(4, 6), 10) - 1;
          const day = parseInt(dt.slice(6, 8), 10);
          let hours = 0,
            minutes = 0;

          if (!isAllDay && dt.includes('T')) {
            const timePart = dt.split('T')[1];
            hours = parseInt(timePart.slice(0, 2), 10);
            minutes = parseInt(timePart.slice(2, 4), 10);
          }

          const date = new Date(year, month, day, hours, minutes);

          if (isAllDay) {
            return date.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          }
          return date.toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });
        } catch {
          return dt;
        }
      };

      const formatRecurrence = (rrule: string): string => {
        const parts: Record<string, string> = {};
        rrule
          .replace('RRULE:', '')
          .split(';')
          .forEach((p) => {
            const [k, v] = p.split('=');
            if (k && v) parts[k] = v;
          });

        const freq = parts.FREQ;
        const interval = parts.INTERVAL ? parseInt(parts.INTERVAL, 10) : 1;
        const byday = parts.BYDAY;
        const until = parts.UNTIL;
        const count = parts.COUNT;

        let text = '';
        const dayNames: Record<string, string> = {
          SU: 'Sunday',
          MO: 'Monday',
          TU: 'Tuesday',
          WE: 'Wednesday',
          TH: 'Thursday',
          FR: 'Friday',
          SA: 'Saturday',
        };

        if (freq === 'DAILY') text = interval === 1 ? 'Daily' : `Every ${interval} days`;
        else if (freq === 'WEEKLY') {
          if (byday) {
            const days = byday
              .split(',')
              .map((d) => dayNames[d] || d)
              .join(', ');
            text = interval === 1 ? `Weekly on ${days}` : `Every ${interval} weeks on ${days}`;
          } else {
            text = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
          }
        } else if (freq === 'MONTHLY')
          text = interval === 1 ? 'Monthly' : `Every ${interval} months`;
        else if (freq === 'YEARLY') text = interval === 1 ? 'Yearly' : `Every ${interval} years`;
        else text = freq || 'Recurring';

        if (until) text += ` until ${formatDateTime(until)}`;
        if (count) text += ` (${count} times)`;

        return text;
      };

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        // Handle line folding
        while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
          line += lines[++i].slice(1);
        }

        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;

        const keyPart = line.slice(0, colonIdx).toUpperCase();
        const value = line.slice(colonIdx + 1);
        const baseKey = keyPart.split(';')[0];

        switch (baseKey) {
          case 'SUMMARY':
            result.summary = value;
            break;
          case 'DESCRIPTION':
            result.description = value.replace(/\\n/g, '\n').replace(/\\,/g, ',');
            break;
          case 'LOCATION':
            result.location = value.replace(/\\,/g, ',');
            break;
          case 'DTSTART': {
            result.startDate = value;
            result.startFormatted = formatDateTime(value.replace('Z', ''));
            result.isAllDay = value.length === 8;
            const tzMatch = keyPart.match(/TZID=([^;:]+)/i);
            if (tzMatch) result.timezone = tzMatch[1];
            break;
          }
          case 'DTEND': {
            result.endDate = value;
            result.endFormatted = formatDateTime(value.replace('Z', ''));
            break;
          }
          case 'DURATION':
            result.duration = value;
            break;
          case 'ORGANIZER': {
            const cnMatch = value.match(/CN=([^:;]+)/i) || keyPart.match(/CN=([^:;]+)/i);
            result.organizer = cnMatch ? cnMatch[1] : value.replace('mailto:', '');
            break;
          }
          case 'ATTENDEE':
            attendeesCount++;
            break;
          case 'RRULE': {
            result.recurrence = value;
            result.recurrenceFormatted = formatRecurrence(line);
            break;
          }
          case 'VALARM':
          case 'TRIGGER': {
            if (value) result.alarm = value;
            break;
          }
        }
      }

      result.attendeesCount = attendeesCount > 0 ? String(attendeesCount) : null;

      return result;
    },
    []
  );

  // OTP Auth parser
  const parseOtpAuthPayload = useCallback((payload: string): Record<string, string | null> => {
    const result: Record<string, string | null> = {
      type: null,
      issuer: null,
      account: null,
      algorithm: null,
      algorithmNote: null,
      digits: null,
      period: null,
      counter: null,
      hasSecret: null,
    };

    const match = payload.match(/^otpauth:\/\/(totp|hotp)\/([^?]+)(?:\?(.*))?$/i);
    if (!match) return result;

    result.type = match[1].toUpperCase();
    const label = decodeURIComponent(match[2]);
    const queryString = match[3];

    // Parse label (format: Issuer:Account or just Account)
    if (label.includes(':')) {
      const [issuer, account] = label.split(':');
      result.issuer = issuer;
      result.account = account;
    } else {
      result.account = label;
    }

    if (queryString) {
      const params = new URLSearchParams(queryString);
      result.issuer = result.issuer || params.get('issuer');
      result.algorithm = params.get('algorithm')?.toUpperCase() || 'SHA1';
      result.digits = params.get('digits') || '6';
      result.period = params.get('period') || '30';
      result.counter = params.get('counter');
      result.hasSecret = params.has('secret') ? 'Present (hidden for security)' : 'Missing';

      // Add security note for algorithm
      if (result.algorithm === 'SHA1') {
        result.algorithmNote = 'Standard, widely compatible';
      } else if (result.algorithm === 'SHA256') {
        result.algorithmNote = 'More secure, good compatibility';
      } else if (result.algorithm === 'SHA512') {
        result.algorithmNote = 'Most secure, limited compatibility';
      }
    }

    return result;
  }, []);

  // URL parser with comprehensive breakdown
  interface UrlParseResult {
    full: string;
    protocol: string | null;
    hostname: string | null;
    port: string | null;
    path: string | null;
    queryString: string | null;
    fragment: string | null;
    isSecure: string | null;
    isShortened: string | null;
    shortenerService: string | null;
    params: Array<{ key: string; value: string }>;
    urlLength: string;
    hasPercentEncoding: string | null;
  }
  const parseUrlPayload = useCallback((payload: string): UrlParseResult => {
    const result: UrlParseResult = {
      full: payload,
      protocol: null,
      hostname: null,
      port: null,
      path: null,
      queryString: null,
      fragment: null,
      isSecure: null,
      isShortened: null,
      shortenerService: null,
      params: [],
      urlLength: String(payload.length),
      hasPercentEncoding: /%[0-9A-Fa-f]{2}/.test(payload) ? 'true' : null,
    };

    try {
      const url = new URL(payload);
      result.protocol = url.protocol.replace(':', '');
      result.hostname = url.hostname;
      result.port = url.port || null;
      result.path = url.pathname !== '/' ? url.pathname : null;
      result.queryString = url.search || null;
      result.fragment = url.hash ? url.hash.slice(1) : null;
      result.isSecure = url.protocol === 'https:' ? 'true' : 'false';

      // Check if shortened URL
      const shorteners = [
        'bit.ly',
        't.co',
        'goo.gl',
        'tinyurl.com',
        'ow.ly',
        'is.gd',
        'buff.ly',
        'adf.ly',
        'j.mp',
        'rb.gy',
        'cutt.ly',
        'shorturl.at',
      ];
      for (const shortener of shorteners) {
        if (url.hostname.includes(shortener)) {
          result.isShortened = 'true';
          result.shortenerService = shortener;
          break;
        }
      }

      // Parse all query parameters
      const params: Array<{ key: string; value: string }> = [];
      url.searchParams.forEach((value, key) => {
        params.push({ key, value: decodeURIComponent(value) });
      });
      result.params = params;
    } catch {
      // Not a valid URL
    }

    return result;
  }, []);

  // Plain text analyzer
  const analyzePlainText = useCallback(
    (payload: string): Record<string, string | number | boolean> => {
      const result: Record<string, string | number | boolean> = {
        charCount: payload.length,
        wordCount: payload.trim().split(/\s+/).filter(Boolean).length,
        lineCount: payload.split(/\r?\n/).length,
        hasSpecialChars: /[^a-zA-Z0-9\s]/.test(payload),
        hasNonAscii: /\P{ASCII}/u.test(payload),
        hasEmoji: /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(payload),
        isAllNumeric: /^[0-9]+$/.test(payload),
        isAllAlphanumeric: /^[0-9A-Z $%*+\-./:]+$/i.test(payload),
        encodingRecommendation: 'Byte mode',
        preview: payload.length > 200 ? `${payload.slice(0, 200)}...` : payload,
      };

      if (result.isAllNumeric) {
        result.encodingRecommendation = 'Numeric mode (most efficient)';
      } else if (result.isAllAlphanumeric && !result.hasNonAscii) {
        result.encodingRecommendation = 'Alphanumeric mode (efficient)';
      } else if (result.hasNonAscii) {
        result.encodingRecommendation = 'Byte mode (UTF-8 required)';
      }

      return result;
    },
    []
  );

  // Social media platform detection
  const detectSocialPlatform = (
    url: string
  ): { name: string; badge: React.ReactNode; extractedInfo?: React.ReactNode } | null => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname;

      // WhatsApp - extract phone number
      if (
        hostname.includes('wa.me') ||
        hostname.includes('whatsapp.com') ||
        hostname.includes('api.whatsapp.com')
      ) {
        const phoneMatch = pathname.match(/\/(\d+)/);
        const phone = phoneMatch ? phoneMatch[1] : null;
        return {
          name: 'WhatsApp',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              WhatsApp
            </span>
          ),
          extractedInfo: phone ? (
            <a href={`tel:+${phone}`} className="font-mono text-xs text-primary hover:underline">
              +{phone}
            </a>
          ) : null,
        };
      }

      // Facebook
      if (
        hostname.includes('facebook.com') ||
        hostname.includes('fb.com') ||
        hostname.includes('fb.me') ||
        hostname.includes('m.facebook.com')
      ) {
        return {
          name: 'Facebook',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
              Facebook
            </span>
          ),
        };
      }

      // Instagram
      if (hostname.includes('instagram.com') || hostname.includes('instagr.am')) {
        const usernameMatch = pathname.match(/^\/([^/]+)/);
        const username =
          usernameMatch && !['p', 'reel', 'stories', 'explore'].includes(usernameMatch[1])
            ? usernameMatch[1]
            : null;
        return {
          name: 'Instagram',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white">
              Instagram
            </span>
          ),
          extractedInfo: username ? <span className="font-mono text-xs">@{username}</span> : null,
        };
      }

      // Twitter/X
      if (
        hostname.includes('twitter.com') ||
        hostname.includes('x.com') ||
        hostname.includes('t.co')
      ) {
        const usernameMatch = pathname.match(/^\/([^/]+)/);
        const username =
          usernameMatch && !['search', 'explore', 'home', 'i', 'intent'].includes(usernameMatch[1])
            ? usernameMatch[1]
            : null;
        return {
          name: 'X (Twitter)',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black text-white dark:bg-white dark:text-black">
              𝕏
            </span>
          ),
          extractedInfo: username ? <span className="font-mono text-xs">@{username}</span> : null,
        };
      }

      // YouTube
      if (
        hostname.includes('youtube.com') ||
        hostname.includes('youtu.be') ||
        hostname.includes('m.youtube.com')
      ) {
        let videoId: string | null = null;
        if (hostname.includes('youtu.be')) {
          videoId = pathname.slice(1).split('?')[0];
        } else {
          const vParam = urlObj.searchParams.get('v');
          if (vParam) videoId = vParam;
        }
        return {
          name: 'YouTube',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
              ▶ YouTube
            </span>
          ),
          extractedInfo: videoId ? (
            <span className="font-mono text-xs">Video: {videoId}</span>
          ) : null,
        };
      }

      // LinkedIn
      if (hostname.includes('linkedin.com') || hostname.includes('lnkd.in')) {
        return {
          name: 'LinkedIn',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-700 text-white">
              LinkedIn
            </span>
          ),
        };
      }

      // TikTok
      if (hostname.includes('tiktok.com') || hostname.includes('vm.tiktok.com')) {
        const usernameMatch = pathname.match(/^\/@([^/]+)/);
        return {
          name: 'TikTok',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-black text-white">
              ♪ TikTok
            </span>
          ),
          extractedInfo: usernameMatch ? (
            <span className="font-mono text-xs">@{usernameMatch[1]}</span>
          ) : null,
        };
      }

      // Telegram
      if (
        hostname.includes('t.me') ||
        hostname.includes('telegram.me') ||
        hostname.includes('telegram.org')
      ) {
        const usernameMatch = pathname.match(/^\/([^/]+)/);
        return {
          name: 'Telegram',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500 text-white">
              Telegram
            </span>
          ),
          extractedInfo: usernameMatch ? (
            <span className="font-mono text-xs">@{usernameMatch[1]}</span>
          ) : null,
        };
      }

      // Discord
      if (
        hostname.includes('discord.gg') ||
        hostname.includes('discord.com') ||
        hostname.includes('discordapp.com')
      ) {
        return {
          name: 'Discord',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-600 text-white">
              Discord
            </span>
          ),
        };
      }

      // Snapchat
      if (hostname.includes('snapchat.com') || hostname.includes('snap.com')) {
        return {
          name: 'Snapchat',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-400 text-black">
              👻 Snapchat
            </span>
          ),
        };
      }

      // Reddit
      if (hostname.includes('reddit.com') || hostname.includes('redd.it')) {
        const subredditMatch = pathname.match(/^\/r\/([^/]+)/);
        return {
          name: 'Reddit',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-600 text-white">
              Reddit
            </span>
          ),
          extractedInfo: subredditMatch ? (
            <span className="font-mono text-xs">r/{subredditMatch[1]}</span>
          ) : null,
        };
      }

      // Pinterest
      if (hostname.includes('pinterest.com') || hostname.includes('pin.it')) {
        return {
          name: 'Pinterest',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-700 text-white">
              Pinterest
            </span>
          ),
        };
      }

      // App Store (Apple)
      if (hostname.includes('apps.apple.com') || hostname.includes('itunes.apple.com')) {
        return {
          name: 'App Store',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              App Store
            </span>
          ),
        };
      }

      // Google Play Store
      if (hostname.includes('play.google.com')) {
        return {
          name: 'Google Play',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              Google Play
            </span>
          ),
        };
      }

      // Spotify
      if (hostname.includes('spotify.com') || hostname.includes('open.spotify.com')) {
        return {
          name: 'Spotify',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
              ♫ Spotify
            </span>
          ),
        };
      }

      // GitHub
      if (hostname.includes('github.com') || hostname.includes('gist.github.com')) {
        const repoMatch = pathname.match(/^\/([^/]+)\/([^/]+)/);
        return {
          name: 'GitHub',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800">
              GitHub
            </span>
          ),
          extractedInfo: repoMatch ? (
            <span className="font-mono text-xs">
              {repoMatch[1]}/{repoMatch[2]}
            </span>
          ) : null,
        };
      }

      // PayPal
      if (hostname.includes('paypal.com') || hostname.includes('paypal.me')) {
        const usernameMatch = pathname.match(/^\/([^/]+)/);
        return {
          name: 'PayPal',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-800 text-white flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              PayPal
            </span>
          ),
          extractedInfo:
            usernameMatch && hostname.includes('paypal.me') ? (
              <span className="font-mono text-xs">@{usernameMatch[1]}</span>
            ) : null,
        };
      }

      // Venmo
      if (hostname.includes('venmo.com')) {
        return {
          name: 'Venmo',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-400 text-white flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              Venmo
            </span>
          ),
        };
      }

      // Cash App
      if (hostname.includes('cash.app')) {
        const cashtagMatch = pathname.match(/^\/(\$[^/]+)/);
        return {
          name: 'Cash App',
          badge: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              Cash App
            </span>
          ),
          extractedInfo: cashtagMatch ? (
            <span className="font-mono text-xs">{cashtagMatch[1]}</span>
          ) : null,
        };
      }

      return null;
    } catch {
      return null;
    }
  };

  // Render content type details - COMPREHENSIVE analysis using ALL parsers
  const renderContentTypeDetails = (contentType: ContentTypeDetails, payload: string) => {
    const details: Array<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = [];

    // Helper to add plain text analysis as fallback
    const addPlainTextAnalysis = () => {
      const analysis = analyzePlainText(payload);
      details.push({
        label: 'Character Count',
        value: `${analysis.charCount} characters`,
        icon: <Type className="w-3 h-3" />,
      });
      details.push({
        label: 'Word Count',
        value: `${analysis.wordCount} words`,
        icon: <Type className="w-3 h-3" />,
      });
      details.push({
        label: 'Line Count',
        value: `${analysis.lineCount} lines`,
        icon: <Type className="w-3 h-3" />,
      });
      if (analysis.hasEmoji) {
        details.push({
          label: 'Contains Emoji',
          value: <span className="text-amber-600 dark:text-amber-400">Yes</span>,
          icon: <Type className="w-3 h-3" />,
        });
      }
      if (analysis.hasNonAscii) {
        details.push({
          label: 'Contains Non-ASCII',
          value: <span className="text-blue-600 dark:text-blue-400">Yes (UTF-8)</span>,
          icon: <Binary className="w-3 h-3" />,
        });
      }
      details.push({
        label: 'Encoding Recommendation',
        value: <span className="font-medium">{analysis.encodingRecommendation}</span>,
        icon: <Settings className="w-3 h-3" />,
      });
    };

    switch (contentType.type) {
      case 'url': {
        const urlData = parseUrlPayload(payload);
        const socialPlatform = detectSocialPlatform(payload);

        // Social platform badge first if detected
        if (socialPlatform) {
          details.push({
            label: 'Platform',
            value: socialPlatform.badge,
            icon: <Globe className="w-3 h-3" />,
          });
          if (socialPlatform.extractedInfo) {
            details.push({
              label: socialPlatform.name === 'WhatsApp' ? 'Phone' : 'Handle',
              value: socialPlatform.extractedInfo,
              icon:
                socialPlatform.name === 'WhatsApp' ? (
                  <Phone className="w-3 h-3" />
                ) : (
                  <Type className="w-3 h-3" />
                ),
            });
          }
        }

        // Domain with security indicator
        if (urlData.hostname) {
          details.push({
            label: 'Domain',
            value: (
              <span className="flex items-center gap-1">
                {urlData.isSecure === 'true' && <Lock className="w-3 h-3 text-green-500" />}
                <span className="font-mono text-xs">{urlData.hostname}</span>
              </span>
            ),
            icon: <Globe className="w-3 h-3" />,
          });
        }

        // Security status
        details.push({
          label: 'Security',
          value:
            urlData.isSecure === 'true' ? (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> HTTPS (Encrypted)
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> HTTP (Not Encrypted)
              </span>
            ),
          icon: <Shield className="w-3 h-3" />,
        });

        // Protocol
        if (urlData.protocol) {
          details.push({
            label: 'Protocol',
            value: <span className="font-mono text-xs uppercase">{urlData.protocol}</span>,
            icon: <Link className="w-3 h-3" />,
          });
        }

        // Port (if non-standard)
        if (urlData.port) {
          details.push({
            label: 'Port',
            value: <span className="font-mono text-xs">{urlData.port}</span>,
            icon: <Settings className="w-3 h-3" />,
          });
        }

        // Path
        if (urlData.path) {
          details.push({
            label: 'Path',
            value: <span className="font-mono text-xs break-all">{urlData.path}</span>,
            icon: <Link className="w-3 h-3" />,
          });
        }

        // Fragment/Hash
        if (urlData.fragment) {
          details.push({
            label: 'Fragment',
            value: <span className="font-mono text-xs">#{urlData.fragment}</span>,
            icon: <Hash className="w-3 h-3" />,
          });
        }

        // Shortened URL detection
        if (urlData.isShortened === 'true') {
          details.push({
            label: 'URL Type',
            value: (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Shortened ({urlData.shortenerService})
              </span>
            ),
            icon: <Link className="w-3 h-3" />,
          });
        }

        // Query parameters
        const params = urlData.params;
        if (params && params.length > 0) {
          details.push({
            label: 'Query Parameters',
            value: <span className="font-medium">{params.length} parameter(s)</span>,
            icon: <Settings className="w-3 h-3" />,
          });
          // Show first 5 params
          params.slice(0, 5).forEach((param) => {
            details.push({
              label: `  └ ${param.key}`,
              value: (
                <span className="font-mono text-xs truncate max-w-[150px] block">
                  {param.value}
                </span>
              ),
              icon: <ChevronRight className="w-3 h-3 text-muted-foreground" />,
            });
          });
          if (params.length > 5) {
            details.push({
              label: '',
              value: (
                <span className="text-xs text-muted-foreground">
                  ...and {params.length - 5} more
                </span>
              ),
            });
          }
        }

        // URL length and encoding
        details.push({
          label: 'URL Length',
          value: `${urlData.urlLength} characters`,
          icon: <Ruler className="w-3 h-3" />,
        });

        if (urlData.hasPercentEncoding === 'true') {
          details.push({
            label: 'Encoding',
            value: <span className="text-xs">Contains percent-encoded characters</span>,
            icon: <Binary className="w-3 h-3" />,
          });
        }

        // Clickable link
        details.push({
          label: 'Open URL',
          value: (
            <a
              href={payload}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Open in new tab <ChevronRight className="w-3 h-3" />
            </a>
          ),
          icon: <Globe className="w-3 h-3" />,
        });
        break;
      }

      case 'wifi': {
        const wifiData = parseWifiPayload(payload);

        // SSID
        if (wifiData.ssid) {
          details.push({
            label: 'Network Name (SSID)',
            value: <span className="font-mono text-xs font-medium">{wifiData.ssid}</span>,
            icon: <Wifi className="w-3 h-3" />,
          });
        }

        // Security type with detailed explanation
        if (wifiData.security) {
          const sec = String(wifiData.security).toUpperCase();
          let securityBadge: React.ReactNode;
          let securityNote = '';

          if (sec.includes('WPA3')) {
            securityBadge = (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                WPA3 (Strongest)
              </span>
            );
            securityNote = 'AES-256 encryption, latest standard';
          } else if (sec.includes('WPA2')) {
            securityBadge = (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                WPA2 (Strong)
              </span>
            );
            securityNote = 'AES encryption, widely compatible';
          } else if (sec.includes('WPA')) {
            securityBadge = (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                WPA (Moderate)
              </span>
            );
            securityNote = 'TKIP encryption, upgrade recommended';
          } else if (sec.includes('WEP')) {
            securityBadge = (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                WEP (Weak)
              </span>
            );
            securityNote = '⚠️ Deprecated, easily cracked';
          } else if (sec === 'NOPASS' || sec === 'OPEN' || sec === '') {
            securityBadge = (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                Open (No Security)
              </span>
            );
            securityNote = '⚠️ No encryption, avoid for sensitive data';
          } else {
            securityBadge = <span className="font-mono text-xs">{wifiData.security}</span>;
          }

          details.push({
            label: 'Security Type',
            value: securityBadge,
            icon: <Shield className="w-3 h-3" />,
          });

          if (securityNote) {
            details.push({
              label: 'Security Note',
              value: <span className="text-xs text-muted-foreground">{securityNote}</span>,
              icon: <Info className="w-3 h-3" />,
            });
          }
        }

        // Password (masked)
        if (wifiData.password) {
          const pwd = String(wifiData.password);
          details.push({
            label: 'Password',
            value: (
              <span className="font-mono text-xs">
                {'•'.repeat(Math.min(pwd.length, 12))}
                <span className="text-muted-foreground ml-1">({pwd.length} chars)</span>
              </span>
            ),
            icon: <Lock className="w-3 h-3" />,
          });
        }

        // Hidden network
        details.push({
          label: 'Hidden Network',
          value:
            wifiData.hidden === 'true' ? (
              <span className="text-amber-600 dark:text-amber-400">Yes (won't appear in scan)</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">No (visible)</span>
            ),
          icon: <Eye className="w-3 h-3" />,
        });

        // Enterprise settings
        if (wifiData.eapMethod) {
          details.push({
            label: 'EAP Method',
            value: <span className="font-mono text-xs">{wifiData.eapMethod}</span>,
            icon: <Settings className="w-3 h-3" />,
          });
        }
        if (wifiData.identity) {
          details.push({
            label: 'Identity',
            value: <span className="font-mono text-xs">{wifiData.identity}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }
        if (wifiData.phase2) {
          details.push({
            label: 'Phase 2',
            value: <span className="font-mono text-xs">{wifiData.phase2}</span>,
            icon: <Settings className="w-3 h-3" />,
          });
        }
        break;
      }

      case 'vcard': {
        const vcardData = parseVCardPayload(payload);

        // vCard version
        if (vcardData.version) {
          details.push({
            label: 'vCard Version',
            value: <span className="font-mono text-xs">v{vcardData.version}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Full name
        if (vcardData.fullName) {
          details.push({
            label: 'Full Name',
            value: <span className="font-medium">{vcardData.fullName}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Organization & Title
        if (vcardData.organization) {
          details.push({
            label: 'Organization',
            value: vcardData.organization,
            icon: <FileText className="w-3 h-3" />,
          });
        }
        if (vcardData.title) {
          details.push({
            label: 'Title',
            value: vcardData.title,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Phone numbers (clickable)
        const phones = vcardData.phones as string[];
        if (phones && phones.length > 0) {
          phones.forEach((phone) => {
            const [type, number] = phone.includes(':') ? phone.split(': ') : ['Phone', phone];
            details.push({
              label: type,
              value: (
                <a
                  href={`tel:${number.replace(/[^+\d]/g, '')}`}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  {number}
                </a>
              ),
              icon: <Phone className="w-3 h-3" />,
            });
          });
        }

        // Email addresses (clickable)
        const emails = vcardData.emails as string[];
        if (emails && emails.length > 0) {
          emails.forEach((email) => {
            const [type, address] = email.includes(':') ? email.split(': ') : ['Email', email];
            details.push({
              label: type,
              value: (
                <a
                  href={`mailto:${address}`}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  {address}
                </a>
              ),
              icon: <Mail className="w-3 h-3" />,
            });
          });
        }

        // Addresses
        const addresses = vcardData.addresses as string[];
        if (addresses && addresses.length > 0) {
          addresses.forEach((addr) => {
            details.push({
              label: 'Address',
              value: <span className="text-xs">{addr}</span>,
              icon: <MapPin className="w-3 h-3" />,
            });
          });
        }

        // Birthday
        if (vcardData.birthday) {
          details.push({
            label: 'Birthday',
            value: vcardData.birthday,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // URL
        if (vcardData.url) {
          details.push({
            label: 'Website',
            value: (
              <a
                href={String(vcardData.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                {String(vcardData.url)}
              </a>
            ),
            icon: <Globe className="w-3 h-3" />,
          });
        }

        // Note
        if (vcardData.note) {
          details.push({
            label: 'Notes',
            value: (
              <span className="text-xs">
                {String(vcardData.note).slice(0, 100)}
                {String(vcardData.note).length > 100 ? '...' : ''}
              </span>
            ),
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Photo indicator
        if (vcardData.hasPhoto === 'true') {
          details.push({
            label: 'Photo',
            value: <span className="text-green-600 dark:text-green-400">Embedded</span>,
            icon: <ImageIcon className="w-3 h-3" />,
          });
        }
        break;
      }

      case 'mecard': {
        const mecardData = parseMeCardPayload(payload);

        if (mecardData.name) {
          details.push({
            label: 'Name',
            value: <span className="font-medium">{mecardData.name}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }
        if (mecardData.organization) {
          details.push({
            label: 'Organization',
            value: mecardData.organization,
            icon: <FileText className="w-3 h-3" />,
          });
        }
        if (mecardData.phone) {
          details.push({
            label: 'Phone',
            value: (
              <a
                href={`tel:${String(mecardData.phone).replace(/[^+\d]/g, '')}`}
                className="font-mono text-xs text-primary hover:underline"
              >
                {mecardData.phone}
              </a>
            ),
            icon: <Phone className="w-3 h-3" />,
          });
        }
        if (mecardData.email) {
          details.push({
            label: 'Email',
            value: (
              <a
                href={`mailto:${mecardData.email}`}
                className="font-mono text-xs text-primary hover:underline"
              >
                {mecardData.email}
              </a>
            ),
            icon: <Mail className="w-3 h-3" />,
          });
        }
        if (mecardData.address) {
          details.push({
            label: 'Address',
            value: <span className="text-xs">{mecardData.address}</span>,
            icon: <MapPin className="w-3 h-3" />,
          });
        }
        if (mecardData.birthday) {
          details.push({
            label: 'Birthday',
            value: mecardData.birthday,
            icon: <FileText className="w-3 h-3" />,
          });
        }
        if (mecardData.url) {
          details.push({
            label: 'Website',
            value: (
              <a
                href={String(mecardData.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                {mecardData.url}
              </a>
            ),
            icon: <Globe className="w-3 h-3" />,
          });
        }
        if (mecardData.note) {
          details.push({
            label: 'Notes',
            value: <span className="text-xs">{mecardData.note}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }
        break;
      }

      case 'email': {
        const emailData = parseEmailPayload(payload);

        // Provider badge
        if (emailData.provider) {
          const providerColors: Record<string, string> = {
            Gmail: 'bg-red-500/10 text-red-600 dark:text-red-400',
            'Microsoft Outlook': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
            'Yahoo Mail': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
            'Apple iCloud': 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
            ProtonMail: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
          };
          const colorClass =
            providerColors[String(emailData.provider)] || 'bg-muted text-foreground';
          details.push({
            label: 'Email Provider',
            value: (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                {emailData.provider}
              </span>
            ),
            icon: <Mail className="w-3 h-3" />,
          });
        }

        // Recipient
        if (emailData.to) {
          details.push({
            label: 'Recipient',
            value: (
              <a
                href={`mailto:${emailData.to}`}
                className="font-mono text-xs text-primary hover:underline"
              >
                {emailData.to}
              </a>
            ),
            icon: <Mail className="w-3 h-3" />,
          });
        }

        // Domain
        if (emailData.domain) {
          details.push({
            label: 'Domain',
            value: <span className="font-mono text-xs">{emailData.domain}</span>,
            icon: <Globe className="w-3 h-3" />,
          });
        }

        // Subject
        if (emailData.subject) {
          details.push({
            label: 'Subject',
            value: <span className="text-xs font-medium">{emailData.subject}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Body preview
        if (emailData.body) {
          details.push({
            label: 'Body Preview',
            value: (
              <span className="text-xs text-muted-foreground">
                {String(emailData.body).slice(0, 80)}
                {String(emailData.body).length > 80 ? '...' : ''}
              </span>
            ),
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // CC/BCC
        if (emailData.cc) {
          details.push({
            label: 'CC',
            value: <span className="font-mono text-xs">{emailData.cc}</span>,
            icon: <Mail className="w-3 h-3" />,
          });
        }
        if (emailData.bcc) {
          details.push({
            label: 'BCC',
            value: <span className="font-mono text-xs">{emailData.bcc}</span>,
            icon: <Mail className="w-3 h-3" />,
          });
        }
        break;
      }

      case 'tel': {
        const telData = parseTelPayload(payload);

        // Country with flag
        if (telData.country && telData.countryFlag) {
          details.push({
            label: 'Country',
            value: (
              <span className="flex items-center gap-1">
                <span className="text-lg">{telData.countryFlag}</span>
                <span>{telData.country}</span>
              </span>
            ),
            icon: <Globe className="w-3 h-3" />,
          });
        }

        // Country code
        if (telData.countryCode) {
          details.push({
            label: 'Country Code',
            value: <span className="font-mono text-xs font-medium">{telData.countryCode}</span>,
            icon: <Phone className="w-3 h-3" />,
          });
        }

        // Phone number (clickable)
        if (telData.number) {
          details.push({
            label: 'Phone Number',
            value: (
              <a
                href={`tel:${telData.number}`}
                className="font-mono text-sm text-primary hover:underline font-medium"
              >
                {telData.formatted || telData.number}
              </a>
            ),
            icon: <Phone className="w-3 h-3" />,
          });
        }

        // Call action
        details.push({
          label: 'Action',
          value: (
            <a
              href={`tel:${telData.number}`}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Phone className="w-3 h-3" /> Tap to call
            </a>
          ),
          icon: <ChevronRight className="w-3 h-3" />,
        });
        break;
      }

      case 'sms': {
        const smsData = parseSmsPayload(payload);

        // Phone number
        if (smsData.number) {
          details.push({
            label: 'Recipient',
            value: (
              <a
                href={`tel:${String(smsData.number).replace(/[^+\d]/g, '')}`}
                className="font-mono text-xs text-primary hover:underline"
              >
                {smsData.number}
              </a>
            ),
            icon: <Phone className="w-3 h-3" />,
          });
        }

        // Message body
        if (smsData.body) {
          details.push({
            label: 'Message',
            value: <span className="text-xs">{smsData.body}</span>,
            icon: <MessageSquare className="w-3 h-3" />,
          });
        }

        // Character count
        if (smsData.charCount) {
          details.push({
            label: 'Character Count',
            value: `${smsData.charCount} characters`,
            icon: <Type className="w-3 h-3" />,
          });
        }

        // SMS segments
        if (smsData.segmentCount) {
          details.push({
            label: 'SMS Segments',
            value: (
              <span
                className={
                  Number(smsData.segmentCount) > 1 ? 'text-amber-600 dark:text-amber-400' : ''
                }
              >
                {smsData.segmentCount} segment(s)
                {Number(smsData.segmentCount) > 1 && ' (may cost more)'}
              </span>
            ),
            icon: <MessageSquare className="w-3 h-3" />,
          });
        }
        break;
      }

      case 'geo': {
        const geoData = parseGeoPayload(payload);

        // Coordinates in decimal
        if (geoData.latitude !== null && geoData.longitude !== null) {
          details.push({
            label: 'Latitude',
            value: (
              <span className="font-mono text-xs">
                {Number(geoData.latitude).toFixed(6)}° {geoData.latHemisphere}
              </span>
            ),
            icon: <MapPin className="w-3 h-3" />,
          });
          details.push({
            label: 'Longitude',
            value: (
              <span className="font-mono text-xs">
                {Number(geoData.longitude).toFixed(6)}° {geoData.lonHemisphere}
              </span>
            ),
            icon: <MapPin className="w-3 h-3" />,
          });
        }

        // DMS format
        if (geoData.latDms && geoData.lonDms) {
          details.push({
            label: 'DMS Format',
            value: (
              <span className="font-mono text-xs">
                {geoData.latDms}, {geoData.lonDms}
              </span>
            ),
            icon: <MapPin className="w-3 h-3" />,
          });
        }

        // Altitude
        if (geoData.altitude !== null) {
          details.push({
            label: 'Altitude',
            value: `${geoData.altitude}m`,
            icon: <MapPin className="w-3 h-3" />,
          });
        }

        // Uncertainty
        if (geoData.uncertainty !== null) {
          details.push({
            label: 'Uncertainty',
            value: `±${geoData.uncertainty}m`,
            icon: <MapPin className="w-3 h-3" />,
          });
        }

        // Map links
        if (geoData.googleMapsUrl) {
          details.push({
            label: 'Google Maps',
            value: (
              <a
                href={String(geoData.googleMapsUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Open in Google Maps <ChevronRight className="w-3 h-3" />
              </a>
            ),
            icon: <MapPin className="w-3 h-3" />,
          });
        }
        if (geoData.appleMapsUrl) {
          details.push({
            label: 'Apple Maps',
            value: (
              <a
                href={String(geoData.appleMapsUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Open in Apple Maps <ChevronRight className="w-3 h-3" />
              </a>
            ),
            icon: <MapPin className="w-3 h-3" />,
          });
        }
        if (geoData.osmUrl) {
          details.push({
            label: 'OpenStreetMap',
            value: (
              <a
                href={String(geoData.osmUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Open in OpenStreetMap <ChevronRight className="w-3 h-3" />
              </a>
            ),
            icon: <MapPin className="w-3 h-3" />,
          });
        }
        break;
      }

      case 'crypto_bitcoin':
      case 'crypto_ethereum':
      case 'crypto_other': {
        const cryptoData = parseCryptoPayload(payload);

        // Network badge
        if (cryptoData.network) {
          const networkColors: Record<string, string> = {
            Bitcoin: 'bg-orange-500 text-white',
            Ethereum: 'bg-purple-500 text-white',
            Litecoin: 'bg-gray-500 text-white',
            Dogecoin: 'bg-yellow-500 text-black',
          };
          const colorClass =
            networkColors[String(cryptoData.network)] || 'bg-muted text-foreground';
          details.push({
            label: 'Network',
            value: (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                {cryptoData.network}
              </span>
            ),
            icon: <Wallet className="w-3 h-3" />,
          });
        }

        // Address preview
        if (cryptoData.addressPreview) {
          details.push({
            label: 'Address',
            value: <span className="font-mono text-xs">{cryptoData.addressPreview}</span>,
            icon: <Hash className="w-3 h-3" />,
          });
        }

        // Full address with copy
        if (cryptoData.address) {
          details.push({
            label: 'Full Address',
            value: (
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] break-all max-w-[150px]">
                  {cryptoData.address}
                </span>
                <CopyButton text={String(cryptoData.address)} />
              </div>
            ),
            icon: <Hash className="w-3 h-3" />,
          });
        }

        // Amount
        if (cryptoData.amount) {
          details.push({
            label: 'Amount',
            value: (
              <span className="font-mono text-sm font-bold">
                {cryptoData.amount} {cryptoData.network}
              </span>
            ),
            icon: <CreditCard className="w-3 h-3" />,
          });
        }

        // Label
        if (cryptoData.label) {
          details.push({
            label: 'Label',
            value: cryptoData.label,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Message
        if (cryptoData.message) {
          details.push({
            label: 'Message',
            value: <span className="text-xs">{cryptoData.message}</span>,
            icon: <MessageSquare className="w-3 h-3" />,
          });
        }

        // Block explorer
        if (cryptoData.explorerUrl) {
          details.push({
            label: 'Block Explorer',
            value: (
              <a
                href={String(cryptoData.explorerUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View on blockchain <ChevronRight className="w-3 h-3" />
              </a>
            ),
            icon: <Globe className="w-3 h-3" />,
          });
        }
        break;
      }

      case 'epc_sepa': {
        const epcData = parseEpcSepaPayload(payload);

        // Payment standard badge
        details.push({
          label: 'Payment Standard',
          value: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
              EPC/SEPA Credit Transfer
            </span>
          ),
          icon: <CreditCard className="w-3 h-3" />,
        });

        // Service tag & version
        if (epcData.serviceTag) {
          details.push({
            label: 'Service Tag',
            value: <span className="font-mono text-xs">{epcData.serviceTag}</span>,
            icon: <Settings className="w-3 h-3" />,
          });
        }
        if (epcData.version) {
          details.push({
            label: 'Version',
            value: <span className="font-mono text-xs">{epcData.version}</span>,
            icon: <Settings className="w-3 h-3" />,
          });
        }

        // Beneficiary
        if (epcData.beneficiaryName) {
          details.push({
            label: 'Beneficiary',
            value: <span className="font-medium">{epcData.beneficiaryName}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // IBAN (formatted)
        if (epcData.iban) {
          details.push({
            label: 'IBAN',
            value: (
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs">{epcData.iban}</span>
                <CopyButton text={String(epcData.iban).replace(/\s/g, '')} />
              </div>
            ),
            icon: <CreditCard className="w-3 h-3" />,
          });
        }

        // BIC
        if (epcData.bic) {
          details.push({
            label: 'BIC/SWIFT',
            value: <span className="font-mono text-xs">{epcData.bic}</span>,
            icon: <CreditCard className="w-3 h-3" />,
          });
        }

        // Amount & currency
        if (epcData.amount) {
          details.push({
            label: 'Amount',
            value: (
              <span className="font-mono text-sm font-bold">
                {epcData.currency || 'EUR'} {epcData.amount}
              </span>
            ),
            icon: <CreditCard className="w-3 h-3" />,
          });
        }

        // Reference
        if (epcData.referenceType) {
          details.push({
            label: 'Reference Type',
            value: <span className="font-mono text-xs">{epcData.referenceType}</span>,
            icon: <Hash className="w-3 h-3" />,
          });
        }
        if (epcData.reference) {
          details.push({
            label: 'Reference',
            value: <span className="font-mono text-xs">{epcData.reference}</span>,
            icon: <Hash className="w-3 h-3" />,
          });
        }

        // Remittance info
        if (epcData.remittanceInfo) {
          details.push({
            label: 'Remittance Info',
            value: <span className="text-xs">{epcData.remittanceInfo}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }
        break;
      }

      case 'upi': {
        const upiData = parseUpiPayload(payload);

        // Payment standard badge
        details.push({
          label: 'Payment Standard',
          value: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
              UPI (India)
            </span>
          ),
          icon: <Smartphone className="w-3 h-3" />,
        });

        // VPA
        if (upiData.vpa) {
          details.push({
            label: 'UPI ID (VPA)',
            value: <span className="font-mono text-xs font-medium">{upiData.vpa}</span>,
            icon: <CreditCard className="w-3 h-3" />,
          });
        }

        // Payee name
        if (upiData.payeeName) {
          details.push({
            label: 'Payee Name',
            value: <span className="font-medium">{upiData.payeeName}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Amount & currency
        if (upiData.amount) {
          details.push({
            label: 'Amount',
            value: (
              <span className="font-mono text-sm font-bold">
                {upiData.currency || 'INR'} {upiData.amount}
              </span>
            ),
            icon: <CreditCard className="w-3 h-3" />,
          });
        }

        // Transaction reference
        if (upiData.transactionRef) {
          details.push({
            label: 'Transaction Ref',
            value: <span className="font-mono text-xs">{upiData.transactionRef}</span>,
            icon: <Hash className="w-3 h-3" />,
          });
        }

        // Transaction note
        if (upiData.transactionNote) {
          details.push({
            label: 'Note',
            value: <span className="text-xs">{upiData.transactionNote}</span>,
            icon: <MessageSquare className="w-3 h-3" />,
          });
        }

        // Merchant code
        if (upiData.merchantCode) {
          details.push({
            label: 'Merchant Code',
            value: <span className="font-mono text-xs">{upiData.merchantCode}</span>,
            icon: <Settings className="w-3 h-3" />,
          });
        }
        break;
      }

      case 'emv_qr': {
        // Payment standard badge
        details.push({
          label: 'Payment Standard',
          value: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500 text-white">
              EMVCo QR
            </span>
          ),
          icon: <CreditCard className="w-3 h-3" />,
        });
        details.push({
          label: 'Format',
          value: 'Merchant-Presented Mode',
          icon: <Settings className="w-3 h-3" />,
        });
        // Add plain text analysis for additional info
        addPlainTextAnalysis();
        break;
      }

      case 'swiss_qr_bill': {
        // Payment standard badge
        details.push({
          label: 'Payment Standard',
          value: (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
              Swiss QR-bill
            </span>
          ),
          icon: <CreditCard className="w-3 h-3" />,
        });
        details.push({
          label: 'Country',
          value: (
            <span className="flex items-center gap-1">
              <span className="text-lg">🇨🇭</span> Switzerland
            </span>
          ),
          icon: <Globe className="w-3 h-3" />,
        });
        // Add plain text analysis for additional info
        addPlainTextAnalysis();
        break;
      }

      case 'calendar_event': {
        const calData = parseCalendarPayload(payload);

        // Event summary
        if (calData.summary) {
          details.push({
            label: 'Event',
            value: <span className="font-medium">{calData.summary}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // All-day indicator
        if (calData.isAllDay) {
          details.push({
            label: 'Type',
            value: (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                All-Day Event
              </span>
            ),
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Start date/time
        if (calData.startFormatted) {
          details.push({
            label: 'Start',
            value: <span className="text-sm">{calData.startFormatted}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // End date/time
        if (calData.endFormatted) {
          details.push({
            label: 'End',
            value: <span className="text-sm">{calData.endFormatted}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Duration
        if (calData.duration) {
          details.push({
            label: 'Duration',
            value: <span className="font-mono text-xs">{calData.duration}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Timezone
        if (calData.timezone) {
          details.push({
            label: 'Timezone',
            value: <span className="font-mono text-xs">{calData.timezone}</span>,
            icon: <Globe className="w-3 h-3" />,
          });
        }

        // Location
        if (calData.location) {
          details.push({
            label: 'Location',
            value: <span className="text-xs">{calData.location}</span>,
            icon: <MapPin className="w-3 h-3" />,
          });
        }

        // Description
        if (calData.description) {
          const desc = String(calData.description);
          details.push({
            label: 'Description',
            value: (
              <span className="text-xs text-muted-foreground">
                {desc.slice(0, 100)}
                {desc.length > 100 ? '...' : ''}
              </span>
            ),
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Recurrence
        if (calData.recurrenceFormatted) {
          details.push({
            label: 'Recurrence',
            value: (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {calData.recurrenceFormatted}
              </span>
            ),
            icon: <Settings className="w-3 h-3" />,
          });
        }

        // Organizer
        if (calData.organizer) {
          details.push({
            label: 'Organizer',
            value: <span className="text-xs">{calData.organizer}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Attendees
        if (calData.attendeesCount) {
          details.push({
            label: 'Attendees',
            value: `${calData.attendeesCount} invited`,
            icon: <FileText className="w-3 h-3" />,
          });
        }
        break;
      }

      case 'otp_auth': {
        const otpData = parseOtpAuthPayload(payload);

        // Type badge
        if (otpData.type) {
          details.push({
            label: 'Type',
            value: (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  otpData.type === 'TOTP'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}
              >
                {otpData.type === 'TOTP' ? 'Time-based OTP' : 'Counter-based OTP'}
              </span>
            ),
            icon: <Lock className="w-3 h-3" />,
          });
        }

        // Issuer
        if (otpData.issuer) {
          details.push({
            label: 'Issuer',
            value: <span className="font-medium">{otpData.issuer}</span>,
            icon: <Shield className="w-3 h-3" />,
          });
        }

        // Account
        if (otpData.account) {
          details.push({
            label: 'Account',
            value: <span className="font-mono text-xs">{otpData.account}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }

        // Algorithm
        if (otpData.algorithm) {
          details.push({
            label: 'Algorithm',
            value: (
              <div className="text-right">
                <span className="font-mono text-xs">{otpData.algorithm}</span>
                {otpData.algorithmNote && (
                  <div className="text-[10px] text-muted-foreground">{otpData.algorithmNote}</div>
                )}
              </div>
            ),
            icon: <Settings className="w-3 h-3" />,
          });
        }

        // Digits
        if (otpData.digits) {
          details.push({
            label: 'Code Length',
            value: `${otpData.digits} digits`,
            icon: <Hash className="w-3 h-3" />,
          });
        }

        // Period (for TOTP)
        if (otpData.period && otpData.type === 'TOTP') {
          details.push({
            label: 'Refresh Period',
            value: `${otpData.period} seconds`,
            icon: <Settings className="w-3 h-3" />,
          });
        }

        // Counter (for HOTP)
        if (otpData.counter && otpData.type === 'HOTP') {
          details.push({
            label: 'Counter',
            value: <span className="font-mono text-xs">{otpData.counter}</span>,
            icon: <Hash className="w-3 h-3" />,
          });
        }

        // Secret status
        if (otpData.hasSecret) {
          details.push({
            label: 'Secret',
            value: (
              <span
                className={
                  otpData.hasSecret === 'Missing'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }
              >
                {otpData.hasSecret}
              </span>
            ),
            icon: <Lock className="w-3 h-3" />,
          });
        }
        break;
      }
      default: {
        // For plain text and unknown types, always provide comprehensive analysis
        addPlainTextAnalysis();

        // Content preview
        if (payload.length > 0) {
          const preview = payload.length > 200 ? `${payload.slice(0, 200)}...` : payload;
          details.push({
            label: 'Content Preview',
            value: <span className="text-xs font-mono break-all">{preview}</span>,
            icon: <FileText className="w-3 h-3" />,
          });
        }
        break;
      }
    }

    // Ensure we always have at least some details
    if (details.length === 0) {
      addPlainTextAnalysis();
    }

    return details;
  };

  // Parse geo coordinates from payload for geo content type
  const _renderGeoDetails = (payload: string) => {
    const geoMatch = payload.match(/^geo:([\d.-]+),([\d.-]+)/i);
    if (!geoMatch) return null;
    const lat = parseFloat(geoMatch[1]);
    const lng = parseFloat(geoMatch[2]);
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    return (
      <div className="mt-2 p-2 rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Coordinates</span>
          <span className="font-mono text-xs">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </span>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <MapPin className="w-3 h-3" />
          Open in Google Maps
        </a>
      </div>
    );
  };

  // Export analysis result as JSON for Netlify API
  const handleExportJSON = useCallback(() => {
    if (!result?.success) return;
    const exportStartMs = nowMs();
    const exportData = buildAnalysisExportData(
      {
        ...result,
        timing: {
          ...(result.timing ?? {}),
          encodeMs: uiTimings.encodeMs ?? result.timing?.encodeMs ?? null,
          renderMs: uiTimings.renderMs ?? result.timing?.renderMs ?? null,
          exportMs: null,
        },
      },
      {
        source: analysisSource,
        actualUsedVersion,
      }
    );
    const exportMs = Math.round((nowMs() - exportStartMs) * 100) / 100;
    exportData.analysis.timing = {
      ...(exportData.analysis.timing ?? {}),
      exportMs,
    };
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
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result, actualUsedVersion, analysisSource, uiTimings]);

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
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-2 shadow-lg shadow-primary/10">
              <ScanLine className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {t('analyze.title', 'QR Code Analyzer')}
            </h1>
            {/* Hide description on Android */}
            {!Capacitor.isNativePlatform() && (
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t(
                  'analyze.description',
                  'The most comprehensive QR code analyzer available. Extract every technical detail, visualize the module matrix, check WCAG compliance, and export analysis data for recreation.'
                )}
              </p>
            )}
          </div>

          {/* Input Section - Always visible, compact cards */}
          {/* On web: 3 columns (no camera), on native: 4 columns (with camera) */}
          <div
            className={`grid gap-3 ${Capacitor.isNativePlatform() ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'}`}
          >
            {/* Use Current QR Card - only shown when generator canvas is available */}
            {generatedCanvas ? (
              <button
                type="button"
                onClick={handleAnalyzeGenerator}
                disabled={isLoading}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all h-full shadow-sm ${
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
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all h-full shadow-sm ${
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
              className={`flex flex-col gap-2 p-4 rounded-lg border-2 transition-all h-full shadow-sm ${
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

            {/* Camera Card - only on native mobile */}
            {Capacitor.isNativePlatform() && (
              <button
                type="button"
                onClick={handleCameraCapture}
                disabled={isLoading}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all h-full shadow-sm ${
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
            )}
          </div>

          {/* Error State */}
          {error && !result && (
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
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-4">
              {/* Status Header - Success */}
              {result.success && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 shadow-sm">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportJSON}
                    className="gap-1.5 text-green-700 dark:text-green-400 hover:bg-green-500/10"
                  >
                    <Download className="w-4 h-4" />
                    <span className={Capacitor.isNativePlatform() ? 'inline' : 'hidden sm:inline'}>
                      Export JSON
                    </span>
                  </Button>
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
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 shadow-sm">
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
                  {/* Sticky Summary Bar */}
                  <SummaryBar result={result} />

                  {/* Side-by-Side Preview */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Original Image */}
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

                    {/* Reproduced QR */}
                    <div className="border rounded-lg p-4 bg-card shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Reproduced</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          From Extracted Settings
                        </span>
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

                  {/* Payload Content with Copy */}
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

                  {/* Analysis Sections - Continuous listing */}
                  <div className="space-y-4">
                    {/* Content & Structure */}
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
                            {renderContentTypeDetails(result.contentType, result.payload || '').map(
                              (detail, i) => (
                                <DetailRow
                                  key={i}
                                  label={detail.label}
                                  value={detail.value}
                                  icon={detail.icon}
                                />
                              )
                            )}
                            {/* Geo coordinates are now handled in renderContentTypeDetails */}
                          </div>
                        </CollapsibleSection>
                      )}

                      {/* QR Structure */}
                      <CollapsibleSection
                        title="QR Structure"
                        icon={<Grid3x3 className="w-4 h-4" />}
                        testId="analyze-section-qr-structure"
                      >
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
                        testId="analyze-section-encoding"
                        badge={
                          result.errorsCorrected !== null && result.errorsCorrected > 0 ? (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {result.errorsCorrected} error
                              {result.errorsCorrected !== 1 ? 's' : ''} corrected
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
                                  Payload ({result.dataCapacity.used} bytes) exceeds detected
                                  capacity ({result.dataCapacity.total} bytes). Version or ECC
                                  detection may be inaccurate.
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

                    {/* Technical Section */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Capacity by Mode */}
                      {result.version !== null && result.eccLevel && (
                        <CollapsibleSection
                          title="Capacity by Mode"
                          icon={<BarChart3 className="w-4 h-4" />}
                        >
                          <CapacityByModeTable
                            version={result.version}
                            eccLevel={result.eccLevel}
                            currentBytes={result.payloadBytes?.length}
                          />
                        </CollapsibleSection>
                      )}

                      {/* Encoding Efficiency */}
                      {result.payload && (
                        <CollapsibleSection
                          title="Encoding Efficiency"
                          icon={<BarChart3 className="w-4 h-4" />}
                        >
                          <EncodingEfficiency
                            payload={result.payload}
                            payloadBytes={result.payloadBytes}
                            encodingMode={result.encodingMode}
                          />
                        </CollapsibleSection>
                      )}
                    </div>

                    {/* Decoder Metadata, Format Info + Image Properties - 2 column layout */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Decoder Raw Metadata - Authoritative source of truth */}
                      {result.decoderMetadata && (
                        <CollapsibleSection
                          title="Decoder Metadata"
                          icon={<Database className="w-4 h-4" />}
                          testId="analyze-section-decoder-metadata"
                          defaultOpen={true}
                          badge={
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400">
                              Authoritative
                            </span>
                          }
                        >
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted/50 rounded">
                              Raw decoder output - authoritative source for reproduction.
                            </div>
                            <DetailRow
                              label="Version"
                              value={
                                result.decoderMetadata.version !== null ? (
                                  `${result.decoderMetadata.version} (${result.decoderMetadata.version * 4 + 17}×${result.decoderMetadata.version * 4 + 17})`
                                ) : (
                                  <span className="text-red-500">— (not detected)</span>
                                )
                              }
                              icon={<Hash className="w-3.5 h-3.5" />}
                            />
                            <DetailRow
                              label="Mask Pattern"
                              value={
                                result.decoderMetadata.maskPattern !== null ? (
                                  `${result.decoderMetadata.maskPattern}`
                                ) : (
                                  <span className="text-amber-500">— (not detected)</span>
                                )
                              }
                              icon={<Layers className="w-3.5 h-3.5" />}
                            />
                            <DetailRow
                              label="ECC Level"
                              value={
                                result.decoderMetadata.eccLevel !== null ? (
                                  result.decoderMetadata.eccLevel
                                ) : (
                                  <span className="text-amber-500">— (not detected)</span>
                                )
                              }
                              icon={<Shield className="w-3.5 h-3.5" />}
                            />
                            <DetailRow
                              label="Errors Corrected"
                              value={
                                result.decoderMetadata.errorsCorrected !== null ? (
                                  result.decoderMetadata.errorsCorrected === 0 ? (
                                    <span className="text-green-600 dark:text-green-400">
                                      0 (no errors)
                                    </span>
                                  ) : (
                                    <span className="text-amber-600 dark:text-amber-400">
                                      {result.decoderMetadata.errorsCorrected}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-muted-foreground">0 (clean decode)</span>
                                )
                              }
                              icon={<Shield className="w-3.5 h-3.5" />}
                            />
                            <DetailRow
                              label="Erasures"
                              value={
                                result.decoderMetadata.erasures !== null ? (
                                  result.decoderMetadata.erasures === 0 ? (
                                    <span className="text-green-600 dark:text-green-400">0</span>
                                  ) : (
                                    result.decoderMetadata.erasures
                                  )
                                ) : (
                                  <span className="text-muted-foreground">N/A</span>
                                )
                              }
                              icon={<Shield className="w-3.5 h-3.5" />}
                            />
                            <DetailRow
                              label="Raw Bits"
                              value={
                                result.decoderMetadata.numBits !== null ? (
                                  `${result.decoderMetadata.numBits} bits`
                                ) : (
                                  <span className="text-muted-foreground">N/A</span>
                                )
                              }
                              icon={<Binary className="w-3.5 h-3.5" />}
                            />
                            <DetailRow
                              label="Orientation"
                              value={
                                result.decoderMetadata.orientation !== null &&
                                result.decoderMetadata.orientation !== 0 ? (
                                  `${result.decoderMetadata.orientation}°`
                                ) : (
                                  <span className="text-muted-foreground">Standard (0°)</span>
                                )
                              }
                              icon={<Settings className="w-3.5 h-3.5" />}
                            />
                            <DetailRow
                              label="Structured Append"
                              value={
                                result.decoderMetadata.hasStructuredAppend
                                  ? `Seq ${result.decoderMetadata.structuredAppendSequence}, Parity ${result.decoderMetadata.structuredAppendParity}`
                                  : 'No'
                              }
                              icon={<Layers className="w-3.5 h-3.5" />}
                            />
                            <DetailRow
                              label="Byte Segments"
                              value={
                                result.decoderMetadata.byteSegmentCount > 0
                                  ? `${result.decoderMetadata.byteSegmentCount} segment(s), ${result.decoderMetadata.totalByteLength} bytes`
                                  : 'None'
                              }
                              icon={<Database className="w-3.5 h-3.5" />}
                            />
                          </div>
                        </CollapsibleSection>
                      )}

                      {/* Format Info + Image Properties stacked */}
                      <div className="space-y-4">
                        <CollapsibleSection
                          title="Format Information"
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

                        {/* Image Properties - below Format Info */}
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
                    </div>

                    {/* Visual Section */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Processing Timings */}
                      {(combinedTimings.decodeMs !== null &&
                        combinedTimings.decodeMs !== undefined) ||
                      (combinedTimings.totalAnalysisMs !== null &&
                        combinedTimings.totalAnalysisMs !== undefined) ||
                      (combinedTimings.encodeMs !== null &&
                        combinedTimings.encodeMs !== undefined) ||
                      (combinedTimings.renderMs !== null &&
                        combinedTimings.renderMs !== undefined) ||
                      (combinedTimings.exportMs !== null &&
                        combinedTimings.exportMs !== undefined) ? (
                        <CollapsibleSection
                          title="Processing Timings"
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
                                    Math.max(
                                      0,
                                      combinedTimings.totalAnalysisMs - combinedTimings.decodeMs
                                    )
                                  )}
                                  icon={<Settings className="w-3.5 h-3.5" />}
                                />
                              )}
                          </div>
                        </CollapsibleSection>
                      ) : null}

                      {/* Colors & Contrast */}
                      {result.detectedColors && (
                        <CollapsibleSection
                          title="Colors & WCAG Compliance"
                          icon={<Palette className="w-4 h-4" />}
                          badge={
                            <WCAGBadge ratio={result.detectedColors.contrastRatio} size="sm" />
                          }
                        >
                          <div className="space-y-4">
                            {/* Color Swatches */}
                            <div className="flex justify-between items-center">
                              <ColorSwatch
                                color={result.detectedColors.foreground}
                                label="Foreground"
                              />
                              <div className="flex flex-col items-center">
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">contrast</span>
                              </div>
                              <ColorSwatch
                                color={result.detectedColors.background}
                                label="Background"
                              />
                            </div>

                            {result.dominantColors && result.dominantColors.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Dominant Palette
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  {result.dominantColors.map((entry, idx) => (
                                    <div
                                      key={`${entry.color}-${idx}`}
                                      className="p-2 rounded-md bg-muted/50"
                                    >
                                      <ColorSwatch
                                        color={entry.color}
                                        label={`#${idx + 1} • ${entry.percentage}%`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* WCAG Compliance Details */}
                            <div className="p-3 rounded-lg bg-muted/50 space-y-2 shadow-inner">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">WCAG Compliance</span>
                                <WCAGBadge ratio={result.detectedColors.contrastRatio} size="md" />
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div
                                  className={`p-2 rounded ${
                                    result.detectedColors.contrastRatio >= 3
                                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                      : 'bg-red-500/10 text-red-700 dark:text-red-400'
                                  }`}
                                >
                                  <div className="font-bold">AA-Large</div>
                                  <div className="text-[10px]">≥3:1</div>
                                </div>
                                <div
                                  className={`p-2 rounded ${
                                    result.detectedColors.contrastRatio >= 4.5
                                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                      : 'bg-red-500/10 text-red-700 dark:text-red-400'
                                  }`}
                                >
                                  <div className="font-bold">AA</div>
                                  <div className="text-[10px]">≥4.5:1</div>
                                </div>
                                <div
                                  className={`p-2 rounded ${
                                    result.detectedColors.contrastRatio >= 7
                                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                      : 'bg-red-500/10 text-red-700 dark:text-red-400'
                                  }`}
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

                      {/* Spatial Analysis */}
                      <CollapsibleSection
                        title="Spatial Analysis"
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
                    </div>

                    {/* Advanced Section */}
                    <div className="grid md:grid-cols-1 gap-4">
                      {/* Binary/Hex View */}
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

                      {/* Module Matrix Visualization */}
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

                      {/* Debug Log */}
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

                  {/* Import Button - Simplified */}
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
