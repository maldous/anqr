import {
  Download,
  Droplets,
  FileText,
  Image,
  Palette,
  Play,
  QrCode,
  RotateCcw,
  Search,
  Share2,
  Shield,
  Type,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdUnit } from '@/components/AdUnit';
import { AnimationSection } from '@/components/sections/AnimationSection';
import { MetadataSection } from '@/components/sections/MetadataSection';
import { OutputSection } from '@/components/sections/OutputSection';
import { OverlaySection } from '@/components/sections/OverlaySection';
import { PayloadSection } from '@/components/sections/PayloadSection';
import { QREncodingSection } from '@/components/sections/qr-encoding-section';
import { RenderSection } from '@/components/sections/RenderSection';
import { SafetySection } from '@/components/sections/SafetySection';
import { ShareSection } from '@/components/sections/ShareSection';
import { WatermarkSection } from '@/components/sections/WatermarkSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HighlightedLabel, SearchProvider } from '@/lib/search-context';
import { useQRStore } from '@/store/qr-store';

const SECTIONS = [
  { id: 'payload', labelKey: 'sections.payload', icon: Type, tier: 'basic' as const },
  { id: 'overlay', labelKey: 'sections.overlay', icon: Image, tier: 'basic' as const },
  { id: 'qr', labelKey: 'sections.qrEncoding', icon: QrCode, tier: 'advanced' as const },
  { id: 'render', labelKey: 'sections.rendering', icon: Palette, tier: 'advanced' as const },
  { id: 'animation', labelKey: 'sections.animation', icon: Play, tier: 'advanced' as const },
  { id: 'output', labelKey: 'sections.output', icon: Download, tier: 'advanced' as const },
  {
    id: 'watermark',
    labelKey: 'sections.watermark',
    icon: Droplets,
    tier: 'professional' as const,
  },
  { id: 'metadata', labelKey: 'sections.metadata', icon: FileText, tier: 'professional' as const },
  { id: 'share', labelKey: 'sections.share', icon: Share2, tier: 'professional' as const },
  { id: 'safety', labelKey: 'sections.safety', icon: Shield, tier: 'professional' as const },
];

// Comprehensive keywords for deep search within each section, organized by tier
// Includes all field labels, select options, and common synonyms
const SECTION_KEYWORDS: Record<
  string,
  { basic: string[]; advanced: string[]; professional: string[] }
> = {
  payload: {
    basic: [
      // Field labels
      'text',
      'content',
      'type',
      'plain text',
      'url',
      'link',
      'website',
      'https',
      'http',
      // Content type dropdown options
      'plain',
      'input',
    ],
    advanced: [
      // Phone
      'phone',
      'telephone',
      'tel',
      'number',
      'call',
      // Email
      'email',
      'mailto',
      'subject',
      'body',
      'address',
      // SMS
      'sms',
      'mms',
      'message',
      'smsto',
      // WiFi
      'wifi',
      'wi-fi',
      'network',
      'ssid',
      'password',
      'security',
      'wpa',
      'wpa2',
      'wpa3',
      'wep',
      'hidden',
      'open',
      // vCard
      'vcard',
      'contact',
      'name',
      'full name',
      'organization',
      'org',
      'title',
      'role',
      'address',
      'birthday',
      'bday',
      'note',
      'photo',
      'version',
      // MeCard
      'mecard',
      'nickname',
      // Event
      'event',
      'calendar',
      'vevent',
      'icalendar',
      'summary',
      'location',
      'description',
      'start',
      'end',
      'timezone',
      'tz',
      'rrule',
      'recurrence',
      'rsvp',
      // Geo
      'geo',
      'location',
      'latitude',
      'lat',
      'longitude',
      'lon',
      'query',
      'coordinates',
      'gps',
      // Payment
      'payment',
      'crypto',
      'bitcoin',
      'ethereum',
      'litecoin',
      'amount',
      'label',
      'wallet',
      // OTP
      'otpauth',
      'totp',
      'hotp',
      '2fa',
      'authenticator',
      'otp',
      'issuer',
      'account',
      'secret',
      'algorithm',
      'sha1',
      'sha256',
      'sha512',
      'digits',
      'period',
      'counter',
      // Social
      'social',
      'facebook',
      'instagram',
      'twitter',
      'linkedin',
      'whatsapp',
      'telegram',
      'signal',
      // Documents
      'pdf',
      'file',
      'document',
      'image',
      'video',
      'cloud',
      'drive',
      'dropbox',
      // EPC/SEPA/Payment rails
      'epc',
      'sepa',
      'bank',
      'transfer',
      'iban',
      'bic',
      'upi',
      'paynow',
      'promptpay',
      'pix',
      // Validation options
      'validate',
      'validation',
      'input',
      'trim',
      'whitespace',
      'normalize',
      'newlines',
      'max length',
      'guard',
      // Marketing Tags
      'marketing',
      'tags',
      'utm',
      'source',
      'medium',
      'campaign',
      'term',
      'tracking',
      'force https',
      // Bizcard
      'bizcard',
    ],
    professional: [
      // App links
      'app',
      'deep link',
      'intent',
      'universal link',
      'scheme',
      'android',
      'ios',
      // Custom
      'custom',
      'format',
      'raw',
      'data',
      // GS1/Industrial
      'gs1',
      'digital link',
      'inventory',
      'asset',
      'tag',
      'ticketing',
    ],
  },
  qr: {
    basic: [
      // Version
      'version',
      'auto',
      'size',
      'capacity',
      // ECC
      'ecc',
      'error correction',
      'level',
      'low',
      'medium',
      'quartile',
      'high',
      'l',
      'm',
      'q',
      'h',
      'reed solomon',
      // Quiet zone
      'quiet zone',
      'margin',
      'border',
      'modules',
    ],
    advanced: [
      // Mask
      'mask',
      'pattern',
      'optimal',
      'auto',
      // Encoding mode
      'encoding',
      'mode',
      'numeric',
      'alphanumeric',
      'byte',
      'kanji',
      'utf-8',
      'binary',
      'data mode',
      // Min enforce
      'enforce',
      'minimum',
    ],
    professional: [
      // Structured append
      'structured append',
      'multi-qr',
      'split',
      'index',
      'count',
      'parity',
      'symbols',
      // FNC1/GS1
      'fnc1',
      'gs1',
      'first position',
      'second position',
      'ai',
      'application identifier',
      // ECI
      'eci',
      'extended channel interpretation',
      'character set',
      'charset',
      // Segment
      'segment',
      'optimize',
      'optimization',
      // Model
      'model',
      'model1',
      'model2',
      'legacy',
      'standard',
      // Micro/rMQR
      'micro qr',
      'micro',
      'rmqr',
      'rectangular',
      // Structure
      'finder',
      'separator',
      'timing',
      'alignment',
      'dark module',
      'format info',
      'version info',
    ],
  },
  render: {
    basic: [
      // Module
      'module',
      'size',
      'pixel',
      'px',
      'scale',
      // Gap
      'gap',
      'spacing',
      'percent',
      // Module style dropdown
      'style',
      'square',
      'rounded',
      'dots',
      'dot',
      'diamond',
      'connected',
      // Finder style dropdown
      'finder',
      'pattern',
      // Alignment style dropdown
      'alignment',
      'match finder',
      // Timing style dropdown
      'timing',
      'match module',
      'solid',
      'dashed',
      // Colors
      'color',
      'foreground',
      'fg',
      'background',
      'bg',
      'transparent',
    ],
    advanced: [
      // Gap mode dropdown
      'gap mode',
      'inset',
      'stroke',
      'negative space',
      'none',
      // Corner radius
      'corner',
      'radius',
      'round',
      // Gradient dropdown
      'gradient',
      'linear',
      'radial',
      'conic',
      'stops',
      // Eye styles
      'eye',
      'outer',
      'inner',
      'outer style',
      'inner style',
      // Eye scale
      'eye scale',
      // Frame dropdown
      'frame',
      'frame style',
      'rounded frame',
      'sticker',
      'tag',
      'frame text',
      // Dot rotation
      'dot rotation',
      'rotation',
      'degree',
      'rotate',
    ],
    professional: [
      // Crisp edges
      'crisp',
      'crisp edges',
      'pixelated',
      'sharp',
      // Pixel snap dropdown
      'pixel snap',
      'floor',
      'round',
      'ceil',
      // Per-module color mode dropdown
      'per-module',
      'color mode',
      'by brightness',
      'by position',
      'by overlay',
      'by cluster',
      // Palette
      'palette',
      'add color',
      // Contrast guard
      'contrast',
      'guard',
      'ratio',
      'min contrast',
      'wcag',
    ],
  },
  overlay: {
    basic: [
      // Upload
      'image',
      'gif',
      'upload',
      'file',
      'enable',
      // Mode dropdown
      'blend',
      'blend mode',
      'mode',
      'center',
      'logo',
      // Intensity
      'intensity',
      // Color mode dropdown
      'color mode',
      'full color',
      'grayscale',
      'black white',
      'bw',
      // Preserve
      'preserve',
      'finder',
      'finder patterns',
    ],
    advanced: [
      // Blend modes dropdown
      'halftone',
      'subpixel',
      'dithered',
      'blue noise',
      'mosaic',
      'gapfill',
      'brightness',
      'duotone',
      // Invert
      'invert',
      // Fit mode dropdown
      'fit',
      'fit mode',
      'cover',
      'contain',
      'stretch',
      // Rotation
      'rotation',
      'rotate',
      'degree',
      // Flip
      'flip',
      'flip x',
      'flip y',
      'horizontal',
      'vertical',
      // Image adjustments
      'brightness',
      'contrast',
      'gamma',
      'saturation',
      'hue',
      'hue rotate',
      // Blur/sharpen
      'blur',
      'sharpen',
      // Posterize
      'posterize',
      'levels',
      // Threshold
      'threshold',
      // Edge detect dropdown
      'edge',
      'edge detection',
      'detect',
      'sobel',
      'canny',
      // Preserve timing/alignment
      'timing',
      'alignment',
      'preserve timing',
      'preserve alignment',
      // Dither kind dropdown
      'dither',
      'dither kind',
      'error diffusion',
      'blue noise threshold',
      'true dither',
      // Diffusion kernel dropdown
      'diffusion',
      'kernel',
      'floyd steinberg',
      'floyd-steinberg',
      'jarvis',
      'judice',
      'ninke',
      'jjn',
      'stucki',
      'burkes',
      'sierra',
      'atkinson',
      // Dither strength
      'dither strength',
      'strength',
      // Serpentine
      'serpentine',
      'scanning',
      // Ordered matrix dropdown
      'ordered',
      'matrix',
      'bayer',
      '2x2',
      '4x4',
      '8x8',
      'clustered dot',
      'void cluster',
      // Blue noise settings
      'tile',
      'tile size',
      'seed',
      // Color dither dropdown
      'color dither',
      'per channel',
      'perceptual',
      // Subpixel settings
      'subpixel',
      'grid size',
      '2x2',
      '3x3',
      '4x4',
      'center rule',
      'strict',
      'halftone center',
      'neutral color',
      'finder override',
      'stylized',
      // Halftone settings
      'halftone',
      'cell',
      'cell size',
      'per module',
      'n×n',
      'dot shape',
      'circle',
      'square',
      'line',
      'brightness curve',
      's-curve',
      // Duotone
      'duotone',
      'colors',
      'shadow',
      'highlight',
      // GIF settings
      'frame',
      'frame delays',
      'use frame delays',
      'fps',
      'max fps',
      'disposal',
      'disposal handling',
      'respect',
      'simplify',
      // Crop
      'crop',
      'region',
    ],
    professional: [
      // More blend modes
      'pixelate',
      'outline',
      'wave',
      'subpixel-size',
      'extreme',
      // ECC aware
      'ecc aware',
      'ecc-aware',
      'risk',
      'risk budget',
      'budget',
      'weight',
      'weight map',
      'heatmap',
      'distance to finders',
      'block heatmap',
      'empirical',
      // Protect
      'protect',
      'format info',
      'version info',
      'protect format',
      'protect version',
      // Advanced dithering
      'white noise',
      'gaussian',
      'triangular',
      'screened',
      'edge-aware',
      'adaptive',
      'temporal',
    ],
  },
  animation: {
    basic: [
      // Speed
      'speed',
      'frame speed',
      'ms',
      'milliseconds',
      // Loop
      'loop',
      'loop animation',
      // Bounce
      'bounce',
      'ping-pong',
      'ping pong',
    ],
    advanced: [
      // Start frame
      'start',
      'start frame',
      // Max frames
      'max',
      'max frames',
      // Frame step
      'step',
      'frame step',
      'every',
      // Interpolation dropdown
      'interpolate',
      'interpolation',
      'crossfade',
      'morph',
      'none',
    ],
    professional: [
      // Temporal dither dropdown
      'temporal',
      'temporal dither',
      'blue noise',
      'flicker',
      'flicker safe',
      // Pattern dropdown
      'pattern',
      'generated pattern',
      'pulse',
      'wave',
      'scanline',
      'shimmer',
      'drift',
      // Module jitter
      'jitter',
      'module jitter',
      // Color cycle
      'color',
      'color cycle',
      'cycle',
      // Seed
      'seed',
      'random seed',
      // Play/pause
      'play',
      'pause',
      'playing',
      // Delay
      'delay',
      'per frame delay',
    ],
  },
  output: {
    basic: [
      // Format dropdown
      'format',
      'png',
      'webp',
      'gif',
      'svg',
      // Dimensions
      'width',
      'height',
      'dimension',
      'size',
      'output size',
      // Quality
      'quality',
    ],
    advanced: [
      // Filename
      'filename',
      'name',
      // GIF settings
      'palette',
      'palette size',
      // Quantizer dropdown
      'quantizer',
      'median cut',
      'median-cut',
      'neuquant',
      'octree',
      // GIF dither dropdown
      'dither',
      'dithering',
      'floyd',
      'ordered',
      'off',
      // Transparent
      'transparent',
      'transparent color',
      // SVG settings
      'vector',
      'true vector',
      'raster',
      // Shape precision dropdown
      'shape',
      'precision',
      'shape precision',
      'pixel',
      'precise',
      // Embed
      'embed',
      'embed raster',
      'overlay',
      // Background override
      'background',
      'bg',
      'override',
      'background override',
    ],
    professional: [
      // Extra formats dropdown
      'pdf',
      'eps',
      'apng',
      'animated png',
      'animated webp',
      // DPI
      'dpi',
      'print',
      'resolution',
      'ppi',
      // Include quiet zone
      'include',
      'quiet zone',
      'include quiet zone',
      // Metadata
      'metadata',
      'svg metadata',
    ],
  },
  watermark: {
    basic: [],
    advanced: [
      // Enable
      'enable',
      'watermark',
      // Type dropdown
      'type',
      'text',
      'image',
      'pattern',
      // Text
      'text',
      // Image upload
      'image',
      'upload',
      'logo',
      // Position dropdown
      'position',
      'center',
      'corners',
      'edges',
      'behind',
      'quiet zone',
      // Opacity
      'opacity',
      'alpha',
      // Blend dropdown
      'blend',
      'blend mode',
      'normal',
      'multiply',
      'screen',
      'overlay',
    ],
    professional: [],
  },
  metadata: {
    basic: [],
    advanced: [
      // Fields
      'title',
      'author',
      'copyright',
      'license',
      'description',
      // Creation time
      'creation',
      'creation time',
      'time',
      'date',
      'include creation',
      // Custom KV
      'custom',
      'custom metadata',
      'key',
      'value',
      'field',
      'add custom',
    ],
    professional: [],
  },
  share: {
    basic: [],
    advanced: [
      // Direct link
      'direct',
      'direct link',
      'link',
      'url',
      'shareable',
      // Embed
      'embed',
      'embed html',
      'html',
      'code',
      // Encode params
      'encode',
      'parameters',
      'all parameters',
      'settings',
      // Copy
      'copy',
      'clipboard',
      'quick share',
    ],
    professional: [],
  },
  safety: {
    basic: [],
    advanced: [],
    professional: [
      // Safety mode dropdown
      'safety',
      'mode',
      'strict',
      'balanced',
      'off',
      // Min module
      'min',
      'minimum',
      'module',
      'module size',
      'min module',
      // Min quiet zone
      'quiet zone',
      'min quiet zone',
      // Locks
      'lock',
      'protection',
      'lock finders',
      'lock timing',
      'lock alignment',
      'lock format',
      'lock version',
      // QA
      'qa',
      'quality',
      'analysis',
      'quality analysis',
      // Contrast check
      'contrast',
      'contrast check',
      // Show heatmap
      'heatmap',
      'show heatmap',
      // Simulate
      'simulate',
      'blur',
      'simulate blur',
      'noise',
      'simulate noise',
      'rotation',
      'simulate rotation',
      // Readability
      'readability',
      'score',
      'score readability',
      // Auto-tuning
      'auto',
      'auto-tuning',
      'tuning',
      // Auto pick
      'pick',
      'auto-pick',
      'pick version',
      'pick mask',
      'pick ecc',
      // Reduce intensity
      'reduce',
      'intensity',
      'reduce intensity',
      'until safe',
      'scannable',
    ],
  },
};

// Get keywords available for a section at the current tier
function getAvailableKeywords(
  sectionId: string,
  currentTier: 'basic' | 'advanced' | 'professional'
): string[] {
  const keywords = SECTION_KEYWORDS[sectionId];
  if (!keywords) return [];

  let available = [...keywords.basic];
  if (currentTier === 'advanced' || currentTier === 'professional') {
    available = [...available, ...keywords.advanced];
  }
  if (currentTier === 'professional') {
    available = [...available, ...keywords.professional];
  }
  return available;
}

interface SidebarProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly mobileHeightPercent?: number;
}

export function Sidebar({ isOpen, onClose, mobileHeightPercent = 45 }: SidebarProps) {
  // Use individual selectors to avoid re-renders when unrelated state changes
  const tier = useQRStore((s) => s.tier);
  const searchQuery = useQRStore((s) => s.searchQuery);
  const setSearchQuery = useQRStore((s) => s.setSearchQuery);
  const { t, i18n } = useTranslation();
  const [openSections, setOpenSections] = useState<string[]>(['payload', 'render']);

  // Force re-render when language changes by using i18n.language as a key dependency
  const _currentLanguage = i18n.language;
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Click outside to close on tablet and desktop
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // Don't close if clicking inside the sidebar
      if (sidebarRef.current?.contains(target)) {
        return;
      }

      // Don't close if clicking on a Radix UI portal element (dropdowns, selects, dialogs, tabs, etc.)
      // These are rendered outside the sidebar but are part of the UI
      const targetElement = target as HTMLElement;
      if (
        targetElement.closest?.('[data-radix-popper-content-wrapper]') ||
        targetElement.closest?.('[data-radix-select-viewport]') ||
        targetElement.closest?.('[data-radix-menu-content]') ||
        targetElement.closest?.('[data-radix-dialog-content]') ||
        targetElement.closest?.('[data-radix-tabs-list]') ||
        targetElement.closest?.('[role="listbox"]') ||
        targetElement.closest?.('[role="menu"]') ||
        targetElement.closest?.('[role="dialog"]') ||
        targetElement.closest?.('[role="tablist"]') ||
        targetElement.closest?.('header') ||
        // Don't close when clicking on the welcome modal
        targetElement.closest?.('dialog')
      ) {
        return;
      }

      // Close on tablet (md-lg) and desktop (lg+) when clicking outside
      if (globalThis.innerWidth >= 768) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Reset all settings
  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      globalThis.location.reload();
    }
  };

  // Filter sections by tier and search
  const visibleSections = SECTIONS.filter((section) => {
    // Tier filter
    if (section.tier === 'advanced' && tier === 'basic') return false;
    if (section.tier === 'professional' && tier !== 'professional') return false;

    // Search filter - check section label AND keywords available at current tier
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const translatedLabel = t(section.labelKey);
      const labelMatch = translatedLabel.toLowerCase().includes(query);
      const keywords = getAvailableKeywords(section.id, tier);
      const keywordMatch = keywords.some((keyword) => keyword.toLowerCase().includes(query));
      return labelMatch || keywordMatch;
    }
    return true;
  });

  // Auto-expand sections that match the search
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchingSections = SECTIONS.filter((section) => {
        // Check tier first
        if (section.tier === 'advanced' && tier === 'basic') return false;
        if (section.tier === 'professional' && tier !== 'professional') return false;

        const translatedLabel = t(section.labelKey);
        const labelMatch = translatedLabel.toLowerCase().includes(query);
        const keywords = getAvailableKeywords(section.id, tier);
        const keywordMatch = keywords.some((keyword) => keyword.toLowerCase().includes(query));
        return labelMatch || keywordMatch;
      }).map((s) => s.id);

      if (matchingSections.length > 0) {
        setOpenSections(matchingSections);
      }
    }
    // Note: Don't reset when search is cleared - let user keep their open sections
    // Include currentLanguage to re-run search when language changes
  }, [searchQuery, tier, t]);

  // When tier changes, keep currently open sections that are still visible,
  // and add any newly available sections if user upgraded
  useEffect(() => {
    setOpenSections((prev) => {
      // Keep sections that are still visible at the new tier
      const stillVisible = prev.filter((sectionId) => {
        const section = SECTIONS.find((s) => s.id === sectionId);
        if (!section) return false;
        if (section.tier === 'basic') return true;
        if (section.tier === 'advanced') return tier === 'advanced' || tier === 'professional';
        if (section.tier === 'professional') return tier === 'professional';
        return false;
      });

      // If nothing is open after filtering, default to payload
      return stillVisible.length > 0 ? stillVisible : ['payload'];
    });
  }, [tier]);

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'payload':
        return <PayloadSection />;
      case 'qr':
        return <QREncodingSection />;
      case 'render':
        return <RenderSection />;
      case 'overlay':
        return <OverlaySection />;
      case 'animation':
        return <AnimationSection />;
      case 'output':
        return <OutputSection />;
      case 'watermark':
        return <WatermarkSection />;
      case 'metadata':
        return <MetadataSection />;
      case 'share':
        return <ShareSection />;
      case 'safety':
        return <SafetySection />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop for tablet only (md to lg) - mobile uses split view, no backdrop needed */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-30 hidden md:block lg:hidden appearance-none border-none cursor-default"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClose();
            }
          }}
        >
          <span className="sr-only">Close sidebar</span>
        </button>
      )}

      <aside
        ref={sidebarRef}
        data-testid="sidebar"
        className={`
          ${/* Mobile: relative in-flow element for split view */ ''}
          ${/* Tablet: fixed overlay */ ''}
          ${/* Desktop: fixed sidebar */ ''}
          mobile-sidebar-height
          md:fixed md:inset-y-0 md:top-0 md:start-0 md:end-auto md:z-50
          w-full md:w-80 lg:w-96 bg-card md:border-e md:shadow-xl
          transform transition-[transform,opacity] duration-300 ease-in-out
          ${
            isOpen
              ? 'md:h-auto md:translate-x-0 rtl:md:-translate-x-0 opacity-100 md:border-b-0'
              : 'md:h-auto md:-translate-x-full rtl:md:translate-x-full opacity-0 pointer-events-none md:pointer-events-auto'
          }
          flex flex-col overflow-hidden flex-shrink-0
        `}
        style={
          {
            '--mobile-height': isOpen ? `${mobileHeightPercent}%` : '0',
          } as React.CSSProperties
        }
      >
        {/* Sections - scrolls within container */}
        <div
          className="flex-1 overflow-y-auto px-4 pt-1 scrollbar-hide"
          data-testid="sidebar-scroll"
        >
          {/* Search bar styled like accordion items */}
          <div className="flex items-center gap-2 px-3 py-3 bg-muted/50 rounded-md shadow-sm mb-[6px]">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('header.searchSettings')}
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-muted-foreground"
              title={t('header.searchSettings')}
            />
            {searchQuery && (
              <button
                type="button"
                className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery('')}
                title={t('common.reset')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-foreground ml-auto"
              onClick={handleReset}
              title={t('common.reset')}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              title={t('common.close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Accordion type="multiple" value={openSections} onValueChange={setOpenSections}>
            {visibleSections.map((section) => {
              const Icon = section.icon;
              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border-none mb-[6px]"
                  data-testid={`accordion-${section.id}`}
                >
                  <AccordionTrigger
                    className="hover:no-underline py-3 px-3 bg-muted/50 rounded-md shadow-sm [&>svg]:ml-auto"
                    title={`${t(section.labelKey)} settings - Click to expand`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        <SearchProvider searchQuery={searchQuery}>
                          <HighlightedLabel>{t(section.labelKey)}</HighlightedLabel>
                        </SearchProvider>
                      </span>
                      {section.tier !== 'basic' && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            section.tier === 'advanced'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                          }`}
                        >
                          {section.tier === 'advanced' ? 'ADV' : 'PRO'}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-3 px-4 mt-1 bg-card rounded-md shadow-sm border">
                    <SearchProvider searchQuery={searchQuery}>
                      {renderSection(section.id)}
                    </SearchProvider>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Desktop Ad below settings - only visible on large screens */}
        <div className="hidden lg:block p-4 border-t flex-shrink-0">
          <AdUnit slot="sidebar-bottom" width={'100%'} height={250} format="rectangle" />
        </div>
      </aside>
    </>
  );
}
