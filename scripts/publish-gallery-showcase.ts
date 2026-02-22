#!/usr/bin/env node

/**
 * Publish gallery showcase assets from gallery-permutation artifacts.
 *
 * Source of truth:
 * - Current permutations from scripts/lib/gallery-permutations.mjs
 * - Local artifact run output in reports/gallery-artifacts/<source>/
 *   (sharded reports are merged into report.merged.json for deterministic selection)
 *
 * Output:
 * - public/gallery/*.{png,gif}
 * - public/gallery/manifest.json
 * - public/gallery/showcase-manifest.json
 * - src/data/gallery-showcase.generated.ts
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generateAllScenarios,
  scenarioFilename,
} from './lib/gallery-permutations.mjs';

type SourceMode = 'local' | 'browser' | 'remote';
type ScenarioCategory = 'nooverlay' | 'overlay' | 'artwork';
type GalleryCategory =
  | 'plain'
  | 'styles'
  | 'colors'
  | 'image-overlay'
  | 'animation-overlay'
  | 'blend-modes'
  | 'color-modes'
  | 'encoding'
  | 'power-combos'
  | 'qr-art';

interface ScenarioConfig {
  id: string;
  category: ScenarioCategory;
  params: Record<string, string | number | boolean | undefined>;
  fixtureId?: string | null;
  isAnimated?: boolean;
}

interface ReportResult {
  id: string;
  category: ScenarioCategory;
  status: 'pass' | 'fail';
  reason?: string;
  filename?: string;
  contentType?: string;
  durationMs?: number;
}

interface Candidate {
  sectionCategoryHint: GalleryCategory | null;
  config: ScenarioConfig;
  sourceMode: SourceMode;
  sourcePath: string;
  filename: string;
  itemId: string;
  ext: 'png' | 'gif';
  labelLower: string;
  fixtureId: string;
  isAnimated: boolean;
  reportStatus: 'pass' | 'fail' | 'unknown';
  reportReason: string;
  reportDurationMs: number;
  sha256: string;
  bytes: number;
}

interface SectionSpec {
  id: GalleryCategory;
  title: string;
  description: string;
  icon: string;
  animationPreference: 'static' | 'animated' | 'mixed';
  featureKeys: string[];
  primaryMatch: (candidate: Candidate) => boolean;
  fallbackMatch: (candidate: Candidate) => boolean;
}

interface GalleryItemOut {
  id: string;
  title: string;
  description: string;
  category: GalleryCategory;
  params: Record<string, string | number | boolean>;
  isAnimated: boolean;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTIFACTS_DIR = path.join(ROOT, 'reports', 'gallery-artifacts');
const PUBLIC_GALLERY_DIR = path.join(ROOT, 'public', 'gallery');
const GENERATED_TS_PATH = path.join(ROOT, 'src', 'data', 'gallery-showcase.generated.ts');

const sourceMode = (process.env.GALLERY_PUBLISH_SOURCE || 'local').trim() as SourceMode;
const strictPublish = process.env.GALLERY_STRICT_PUBLISH !== '0';
const allowUnreported = process.env.GALLERY_ALLOW_UNREPORTED === '1';
const mergeOnly = process.env.GALLERY_MERGE_ONLY === '1';

const GALLERY_COLUMNS = Math.max(1, Number.parseInt(process.env.GALLERY_COLUMNS || '6', 10) || 6);
const GALLERY_ROWS = Math.max(1, Number.parseInt(process.env.GALLERY_ROWS || '5', 10) || 5);
const ITEMS_PER_SECTION = GALLERY_COLUMNS * GALLERY_ROWS;

const SECTION_SPECS: SectionSpec[] = [
  {
    id: 'plain',
    title: 'Plain QR Codes',
    description: 'Baseline QR variants focused on clean geometry and predictable scan behavior.',
    icon: 'QrCode',
    animationPreference: 'static',
    featureKeys: ['style', 'finder', 'ec', 'v', 'mask', 'gapMode', 'frame'],
    primaryMatch: (c) =>
      c.config.category === 'nooverlay' &&
      !c.isAnimated &&
      !matchesAny(c.labelLower, [
        /anim/,
        /visual/,
        /wm/,
        /power/,
        /mega/,
        /target/,
        /interp/,
        /tempdither/,
        /colorcycle/,
        /filler/,
        /encoding/,
        /^fg-/,
        /^bg-/,
        /palette/,
        /grad/,
        /modcolor/,
      ]),
    fallbackMatch: (c) => c.config.category === 'nooverlay' && !c.isAnimated,
  },
  {
    id: 'styles',
    title: 'Module & Finder Styles',
    description: 'Shape and structure exploration across modules, eyes, frames, and spacing modes.',
    icon: 'Shapes',
    animationPreference: 'mixed',
    featureKeys: ['style', 'finder', 'gapMode', 'frame', 'eyeOuter', 'eyeInner', 'isAnimated'],
    primaryMatch: (c) =>
      c.config.category === 'nooverlay' &&
      matchesAny(c.labelLower, [
        /^style-/,
        /^finder-/,
        /style-x-/,
        /finder/,
        /gapmode/,
        /frame/,
        /^eye/,
        /^snap-/,
        /^border-/,
        /crisp/,
        /transparent/,
      ]),
    fallbackMatch: (c) =>
      c.config.category === 'nooverlay' &&
      Boolean(c.config.params.style || c.config.params.finder || c.config.params.frame),
  },
  {
    id: 'colors',
    title: 'Colors & Themes',
    description: 'Foreground/background palettes, gradients, and module color strategies.',
    icon: 'Palette',
    animationPreference: 'mixed',
    featureKeys: ['fg', 'bg', 'grad', 'gradStops', 'paletteMode', 'modColor', 'isAnimated'],
    primaryMatch: (c) =>
      c.config.category === 'nooverlay' &&
      (matchesAny(c.labelLower, [/^fg-/, /^bg-/, /palette/, /modcolor/, /grad/, /color/]) ||
        Boolean(c.config.params.fg || c.config.params.bg || c.config.params.grad)),
    fallbackMatch: (c) =>
      c.config.category === 'nooverlay' &&
      Boolean(c.config.params.fg || c.config.params.bg || c.config.params.palette || c.config.params.grad),
  },
  {
    id: 'image-overlay',
    title: 'Image Overlays',
    description: 'Static overlay rendering with blend modes, image transforms, and placement controls.',
    icon: 'Image',
    animationPreference: 'static',
    featureKeys: ['mode', 'fixture', 'fit', 'filter', 'ditherKind', 'diffKernel'],
    primaryMatch: (c) =>
      c.config.category === 'overlay' &&
      !c.isAnimated &&
      !matchesAny(c.labelLower, [
        /^colormode-/,
        /^ditherkind-/,
        /^diffkernel-/,
        /^ditherstr-/,
        /keepfinders/,
        /keeptiming/,
        /keepboth/,
        /eccaware/,
        /blendpresmode/,
      ]),
    fallbackMatch: (c) => c.config.category === 'overlay' && !c.isAnimated,
  },
  {
    id: 'animation-overlay',
    title: 'Animated Overlays',
    description: 'Overlay motion, stacked animation targets, interpolation, and temporal effects.',
    icon: 'Film',
    animationPreference: 'animated',
    featureKeys: ['fixture', 'mode', 'animPattern', 'animPattern2', 'interp', 'tempDither', 'animTarget'],
    primaryMatch: (c) => c.config.category === 'overlay' && c.isAnimated,
    fallbackMatch: (c) =>
      c.config.category === 'overlay' &&
      matchesAny(c.labelLower, [/anim/, /hero/, /target-stack/, /wave/, /pulse/, /scanline/, /shimmer/, /drift/]),
  },
  {
    id: 'blend-modes',
    title: 'Blend Modes',
    description: 'Preservation behavior and structural safeguards for finder/timing alignment legibility.',
    icon: 'Layers',
    animationPreference: 'mixed',
    featureKeys: ['mode', 'blendPresMode', 'keepFinders', 'keepTiming', 'keepBoth', 'fit', 'logoSize'],
    primaryMatch: (c) =>
      c.config.category === 'overlay' &&
      matchesAny(c.labelLower, [
        /keepfinders/,
        /keeptiming/,
        /keepboth/,
        /eccaware/,
        /blendpresmode/,
        /^mode-blend/,
        /^wmblend-/,
        /^fit-/,
        /^logosize-/,
        /^crop/,
        /^flip/,
        /^rot/,
      ]),
    fallbackMatch: (c) =>
      c.config.category === 'overlay' &&
      matchesAny(c.labelLower, [/blend/, /pres/, /keep/, /^fit-/, /^logosize-/]),
  },
  {
    id: 'color-modes',
    title: 'Color Processing',
    description: 'Dither families, diffusion kernels, grayscale/BW outputs, and tonal processing variants.',
    icon: 'Contrast',
    animationPreference: 'mixed',
    featureKeys: ['colorMode', 'ditherKind', 'diffKernel', 'ditherStrength', 'mode', 'fixture'],
    primaryMatch: (c) =>
      c.config.category === 'overlay' &&
      matchesAny(c.labelLower, [
        /^colormode-/,
        /^ditherkind-/,
        /^diffkernel-/,
        /^ditherstr-/,
        /duotone/,
        /noir/,
        /grayscale/,
        /\bbw\b/,
        /adaptive/,
        /blue_noise/,
      ]),
    fallbackMatch: (c) =>
      c.config.category === 'overlay' &&
      Boolean(c.config.params.colorMode || c.config.params.ditherKind || c.config.params.diffKernel),
  },
  {
    id: 'encoding',
    title: 'QR Encoding',
    description: 'Version, error correction, and mask diversity across generated scenarios.',
    icon: 'Settings2',
    animationPreference: 'mixed',
    featureKeys: ['v', 'ec', 'mask', 'isAnimated', 'category'],
    primaryMatch: (c) =>
      c.config.category === 'nooverlay' &&
      (matchesAny(c.labelLower, [/encoding/, /\bec-/, /\bver-/, /\bmask-/]) ||
        c.config.params.v !== 6 ||
        c.config.params.ec !== 'H' ||
        c.config.params.mask !== undefined),
    fallbackMatch: (c) =>
      c.config.category !== 'artwork' &&
      (c.config.params.v !== 6 || c.config.params.ec !== 'H' || c.config.params.mask !== undefined),
  },
  {
    id: 'power-combos',
    title: 'Power Combos',
    description: 'High-impact stacks combining multiple render, animation, and overlay dimensions.',
    icon: 'Sparkles',
    animationPreference: 'mixed',
    featureKeys: ['category', 'mode', 'animPattern', 'animPattern2', 'style', 'fixture', 'wmKind'],
    primaryMatch: (c) =>
      c.config.category !== 'artwork' &&
      (matchesAny(c.labelLower, [/power/, /mega/, /visual/, /hero/, /target-stack/, /filler/, /^wm-/]) ||
        Boolean(c.config.params.animPattern2 || c.config.params.animTarget2)),
    fallbackMatch: (c) => c.config.category !== 'artwork',
  },
  {
    id: 'qr-art',
    title: 'QR Art',
    description: 'Art-embedded QR outputs across static and animated source artwork fixtures.',
    icon: 'Paintbrush',
    animationPreference: 'mixed',
    featureKeys: ['fixture', 'style', 'finder', 'animPattern', 'animPattern2', 'tempDither', 'v', 'ec'],
    primaryMatch: (c) => c.config.category === 'artwork',
    fallbackMatch: (c) => c.config.category === 'artwork',
  },
];

const SELECTION_ORDER: GalleryCategory[] = [
  'blend-modes',
  'encoding',
  'color-modes',
  'animation-overlay',
  'image-overlay',
  'styles',
  'colors',
  'plain',
  'qr-art',
  'power-combos',
];

const DISPLAY_ORDER: GalleryCategory[] = [
  'plain',
  'styles',
  'colors',
  'image-overlay',
  'animation-overlay',
  'blend-modes',
  'color-modes',
  'encoding',
  'power-combos',
  'qr-art',
];

const FIXTURE_NAMES: Record<string, string> = {
  tsunami: 'Tsunami',
  king: 'King GIF',
  logo: 'Logo',
  test: 'Test',
  trump: 'Trump',
  dance: 'Dance GIF',
  none: 'No Fixture',
};

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function clearPublishedImages(dir: string): Promise<void> {
  if (!(await exists(dir))) return;
  const files = await fs.readdir(dir);
  await Promise.all(
    files
      .filter((f) => /\.(png|gif|webp|jpg|jpeg|json)$/i.test(f))
      .map((f) => fs.rm(path.join(dir, f), { force: true })),
  );
}

function matchesAny(input: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(input));
}

function toSortedParams(
  params: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  const entries = Object.entries(params || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  for (const [key, value] of entries) {
    out[key] = value as string | number | boolean;
  }
  return out;
}

function deterministicParamEntries(
  params: Record<string, string | number | boolean>,
): Array<[string, string]> {
  return Object.entries(params)
    .map(([key, value]) => [key, String(value)] as [string, string])
    .sort(([a], [b]) => a.localeCompare(b));
}

function buildDeterministicQuery(params: Record<string, string | number | boolean>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of deterministicParamEntries(params)) {
    sp.set(key, value);
  }
  return sp.toString();
}

function stableParamHash(params: Record<string, string | number | boolean>): string {
  return createHash('sha256').update(buildDeterministicQuery(params)).digest('hex');
}

function bufferSha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

function sanitizeItemId(filename: string): string {
  return filename.replace(/\.(png|gif)$/i, '');
}

function extractFixtureId(config: ScenarioConfig): string {
  if (config.fixtureId && String(config.fixtureId).trim()) {
    return String(config.fixtureId).trim();
  }
  const raw = String(config.params.img || '').trim();
  if (!raw) return 'none';
  try {
    const parsed = new URL(raw, 'https://anqr.link');
    const base = path.basename(parsed.pathname).replace(/\.[^.]+$/, '');
    return base || 'none';
  } catch {
    const base = path.basename(raw).replace(/\.[^.]+$/, '');
    return base || 'none';
  }
}

function isScenarioAnimated(config: ScenarioConfig): boolean {
  return Boolean(config.isAnimated) || String(config.params.format || '').toLowerCase() === 'gif';
}

function humanizeToken(value: string): string {
  if (!value) return '';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toLabelLower(filename: string): string {
  return filename
    .replace(/^[^_]+__/, '')
    .replace(/\.(png|gif)$/i, '')
    .toLowerCase();
}

function featureValue(candidate: Candidate, key: string): string {
  const params = candidate.config.params;
  switch (key) {
    case 'style':
      return String(params.style || 'square');
    case 'finder':
      return String(params.finder || 'square');
    case 'gapMode':
      return String(params.gapMode || 'none');
    case 'frame':
      return String(params.frame || 'none');
    case 'eyeOuter':
      return String(params.eyeOuter || 'square');
    case 'eyeInner':
      return String(params.eyeInner || 'square');
    case 'fg':
      return String(params.fg || 'default');
    case 'bg':
      return String(params.bg || 'default');
    case 'grad':
      return String(params.grad || 'none');
    case 'gradStops':
      return String(params.gradStops || 'none');
    case 'paletteMode':
      return String(params.paletteMode || 'none');
    case 'modColor':
      return String(params.modColor || 'none');
    case 'mode':
      return String(params.mode || 'none');
    case 'fixture':
      return candidate.fixtureId;
    case 'fit':
      return String(params.fit || 'none');
    case 'filter':
      return String(params.filter || 'none');
    case 'ditherKind':
      return String(params.ditherKind || 'none');
    case 'diffKernel':
      return String(params.diffKernel || 'none');
    case 'animPattern':
      return String(params.animPattern || 'none');
    case 'animPattern2':
      return String(params.animPattern2 || 'none');
    case 'interp':
      return String(params.interp || 'none');
    case 'tempDither':
      return String(params.tempDither || 'none');
    case 'animTarget':
      return String(params.animTarget || 'none');
    case 'blendPresMode':
      return String(params.blendPresMode || 'none');
    case 'keepFinders':
      return String(params.keepFinders || '0');
    case 'keepTiming':
      return String(params.keepTiming || '0');
    case 'keepBoth':
      return String(params.keepBoth || '0');
    case 'logoSize':
      return String(params.logoSize || 'none');
    case 'colorMode':
      return String(params.colorMode || 'none');
    case 'ditherStrength':
      return String(params.ditherStrength || 'none');
    case 'v':
      return String(params.v ?? 'auto');
    case 'ec':
      return String(params.ec || 'H');
    case 'mask':
      return String(params.mask ?? 'auto');
    case 'wmKind':
      return String(params.wmKind || 'none');
    case 'isAnimated':
      return candidate.isAnimated ? 'gif' : 'png';
    case 'category':
      return candidate.config.category;
    default:
      return String((params as Record<string, unknown>)[key] ?? 'none');
  }
}

function variantFromCandidate(sectionId: GalleryCategory, candidate: Candidate): string {
  const p = candidate.config.params;
  const variantParts: string[] = [];
  const push = (value: unknown) => {
    const text = humanizeToken(String(value || ''));
    if (!text || text === 'None') return;
    if (!variantParts.includes(text)) variantParts.push(text);
  };

  switch (sectionId) {
    case 'plain':
      push(p.mask !== undefined ? `mask ${String(p.mask)}` : 'mask auto');
      push(p.style || 'square');
      push(p.finder || 'square');
      break;
    case 'styles':
      push(p.style || 'square');
      push(p.finder || 'square');
      push(p.frame || p.gapMode || p.eyeOuter || p.eyeInner);
      break;
    case 'colors':
      push(p.grad || p.paletteMode || p.modColor || 'theme');
      push(p.fg ? `fg ${String(p.fg)}` : '');
      break;
    case 'image-overlay':
      push(p.mode || 'overlay');
      push(p.ditherKind || p.filter || p.fit || p.colorMode || p.diffKernel);
      break;
    case 'animation-overlay':
      push(p.animPattern || 'animated');
      push(p.animPattern2 || p.interp || p.tempDither || p.animTarget || p.animWaveAxis);
      break;
    case 'blend-modes':
      push(p.blendPresMode || p.mode || 'blend');
      push(
        p.fit ||
          p.filter ||
          (p.flipX ? 'flip x' : '') ||
          (p.flipY ? 'flip y' : '') ||
          (p.rot90 ? 'rot 90' : '') ||
          (p.rot180 ? 'rot 180' : '') ||
          (p.cropEn ? 'crop' : '') ||
          p.wmBlend ||
          '',
      );
      push(
        p.keepBoth ? 'keep both' : p.keepFinders ? 'keep finders' : p.keepTiming ? 'keep timing' : '',
      );
      break;
    case 'color-modes':
      push(p.ditherKind || p.colorMode || p.mode || 'color');
      push(p.diffKernel || p.ditherStrength || p.mode);
      break;
    case 'encoding':
      push(`v${String(p.v ?? 6)}`);
      push(`ec ${String(p.ec || 'H')}`);
      push(p.mask !== undefined ? `mask ${String(p.mask)}` : 'mask auto');
      break;
    case 'power-combos':
      push(p.animPattern || p.mode || 'combo');
      push(p.animPattern2 || p.interp || p.frame || p.wmKind || p.style);
      break;
    case 'qr-art':
      push(p.style || 'square');
      push(p.animPattern || p.animPattern2 || p.interp || p.tempDither || 'static');
      break;
    default:
      break;
  }

  if (variantParts.length === 0) {
    const compact = humanizeToken(candidate.labelLower).split(' ').slice(0, 3).join(' ');
    if (compact) variantParts.push(compact);
  }

  return variantParts.slice(0, 2).join(' · ');
}

function titleFromCandidate(sectionId: GalleryCategory, candidate: Candidate): string {
  const params = candidate.config.params;
  const fixture = FIXTURE_NAMES[candidate.fixtureId] || humanizeToken(candidate.fixtureId);
  const mode = humanizeToken(String(params.mode || ''));
  const anim = humanizeToken(String(params.animPattern || ''));
  const style = humanizeToken(String(params.style || ''));
  const variant = variantFromCandidate(sectionId, candidate);

  switch (sectionId) {
    case 'plain':
      return `Plain ${style || 'Square'} · V${String(params.v ?? 6)} · ${variant}`;
    case 'styles':
      return `${style || 'Square'} Modules · ${humanizeToken(String(params.finder || 'square'))} Finder · ${variant}`;
    case 'colors':
      return `${humanizeToken(String(params.grad || params.paletteMode || 'Theme'))} · #${String(params.fg || '000000')} · ${variant}`;
    case 'image-overlay':
      return `${mode || 'Overlay'} · ${fixture} · ${variant}`;
    case 'animation-overlay':
      return `${anim || 'Animated'} · ${fixture} · ${variant}`;
    case 'blend-modes':
      return `${humanizeToken(String(params.blendPresMode || params.mode || 'Blend'))} · ${fixture} · ${variant}`;
    case 'color-modes':
      return `${humanizeToken(String(params.ditherKind || params.colorMode || params.mode || 'Color'))} · ${fixture} · ${variant}`;
    case 'encoding':
      return `Version ${String(params.v ?? 6)} · EC ${String(params.ec || 'H')} · ${variant}`;
    case 'power-combos':
      return `${humanizeToken(String(params.animPattern || params.mode || 'Combo'))} · ${fixture} · ${variant}`;
    case 'qr-art':
      return `QR Art · ${fixture} · ${style || 'Square'} · ${variant}`;
    default:
      return humanizeToken(candidate.itemId);
  }
}

function descriptionFromCandidate(sectionId: GalleryCategory, candidate: Candidate): string {
  const params = candidate.config.params;
  const parts: string[] = [];

  parts.push(`v${String(params.v ?? 6)} EC ${String(params.ec || 'H')}`);
  if (params.mode) parts.push(`mode ${humanizeToken(String(params.mode))}`);
  if (params.ditherKind) parts.push(`dither ${humanizeToken(String(params.ditherKind))}`);
  if (params.animPattern) parts.push(`anim ${humanizeToken(String(params.animPattern))}`);
  if (params.animPattern2) parts.push(`stack ${humanizeToken(String(params.animPattern2))}`);
  if (params.style && sectionId !== 'styles') parts.push(`${humanizeToken(String(params.style))} modules`);
  if (params.fit) parts.push(`fit ${humanizeToken(String(params.fit))}`);
  if (params.filter) parts.push(`filter ${humanizeToken(String(params.filter))}`);
  if (params.blendPresMode) parts.push(`preservation ${humanizeToken(String(params.blendPresMode))}`);
  if (candidate.fixtureId !== 'none') parts.push(`source ${FIXTURE_NAMES[candidate.fixtureId] || candidate.fixtureId}`);

  const variant = variantFromCandidate(sectionId, candidate);
  if (variant) parts.push(`variant ${variant}`);
  return parts.slice(0, 5).join(' · ');
}

function scoreCandidate(
  candidate: Candidate,
  section: SectionSpec,
  selected: Candidate[],
  coverage: Map<string, Map<string, number>>,
  selectedHashes: Set<string>,
): number {
  let score = 0;

  for (const key of section.featureKeys) {
    const value = featureValue(candidate, key);
    const counts = coverage.get(key);
    const seen = counts?.get(value) ?? 0;
    score += seen === 0 ? 6 : 1 / (seen + 1);
  }

  if (section.animationPreference === 'animated') {
    score += candidate.isAnimated ? 4 : -4;
  } else if (section.animationPreference === 'static') {
    score += candidate.isAnimated ? -3 : 3;
  } else {
    const animatedSelected = selected.filter((entry) => entry.isAnimated).length;
    const staticSelected = selected.length - animatedSelected;
    if (animatedSelected < staticSelected) {
      score += candidate.isAnimated ? 2 : 0;
    } else if (staticSelected < animatedSelected) {
      score += candidate.isAnimated ? 0 : 2;
    } else {
      score += 1;
    }
  }

  if (candidate.labelLower.includes('filler')) score -= 1.25;
  if (candidate.labelLower.includes('mega')) score += 0.75;
  if (candidate.labelLower.includes('hero')) score += 0.5;

  if (selectedHashes.has(candidate.sha256)) score -= 50;

  // Prefer report-confirmed pass artifacts over unknown-only entries.
  if (candidate.reportStatus === 'pass') score += 1.5;
  if (candidate.reportStatus === 'fail') score -= 8;

  return score;
}

function pickVariedCandidates(
  section: SectionSpec,
  pool: Candidate[],
  count: number,
  avoidHashes: Set<string> = new Set(),
): Candidate[] {
  const available = [...pool].sort((a, b) => a.itemId.localeCompare(b.itemId));
  const selected: Candidate[] = [];
  const selectedHashes = new Set<string>();
  const coverage = new Map<string, Map<string, number>>();

  for (const key of section.featureKeys) {
    coverage.set(key, new Map());
  }

  while (selected.length < count && available.length > 0) {
    let candidateIndices = available
      .map((entry, idx) => ({ entry, idx }))
      .filter(({ entry }) => !selectedHashes.has(entry.sha256) && !avoidHashes.has(entry.sha256))
      .map(({ idx }) => idx);
    if (candidateIndices.length === 0) {
      candidateIndices = available
        .map((entry, idx) => ({ entry, idx }))
        .filter(({ entry }) => !selectedHashes.has(entry.sha256))
        .map(({ idx }) => idx);
    }
    if (candidateIndices.length === 0) {
      candidateIndices = available.map((_, idx) => idx);
    }

    let bestIdx = 0;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const idx of candidateIndices) {
      const candidate = available[idx];
      const score = scoreCandidate(candidate, section, selected, coverage, selectedHashes);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      } else if (score === bestScore) {
        if (available[idx].itemId < available[bestIdx].itemId) {
          bestIdx = idx;
        }
      }
    }

    const [picked] = available.splice(bestIdx, 1);
    selected.push(picked);
    selectedHashes.add(picked.sha256);

    for (const key of section.featureKeys) {
      const value = featureValue(picked, key);
      const map = coverage.get(key)!;
      map.set(value, (map.get(value) || 0) + 1);
    }
  }

  return selected;
}

async function readLines(filePath: string): Promise<string[]> {
  const raw = await fs.readFile(filePath, 'utf8');
  return raw
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean);
}

async function mergeShardOutputs(sourceDir: string): Promise<{
  reportFiles: string[];
  passFiles: string[];
  failFiles: string[];
  mergedResults: ReportResult[];
  resultById: Map<string, ReportResult>;
  passFilenames: Set<string>;
  failFilenames: Set<string>;
}> {
  const entries = (await fs.readdir(sourceDir)).sort();
  const reportFiles = entries.filter((name) => /^report(?:\.shard-\d+-of-\d+)?\.json$/i.test(name));
  const passFiles = entries.filter((name) => /^passed(?:\.shard-\d+-of-\d+)?\.txt$/i.test(name));
  const failFiles = entries.filter((name) => /^failed(?:\.shard-\d+-of-\d+)?\.txt$/i.test(name));

  const passFilenames = new Set<string>();
  const failFilenames = new Set<string>();
  const latestById = new Map<string, { result: ReportResult; generatedAt: number }>();

  for (const file of passFiles) {
    const lines = await readLines(path.join(sourceDir, file));
    for (const line of lines) passFilenames.add(line);
  }
  for (const file of failFiles) {
    const lines = await readLines(path.join(sourceDir, file));
    for (const line of lines) failFilenames.add(line);
  }

  for (const reportFile of reportFiles) {
    const fullPath = path.join(sourceDir, reportFile);
    const json = JSON.parse(await fs.readFile(fullPath, 'utf8')) as {
      generatedAt?: string;
      results?: ReportResult[];
    };
    const generatedAt = Date.parse(String(json.generatedAt || '')) || 0;
    for (const result of json.results || []) {
      const previous = latestById.get(result.id);
      if (!previous || generatedAt >= previous.generatedAt) {
        latestById.set(result.id, { result, generatedAt });
      }
      if (result.filename) {
        if (result.status === 'pass') passFilenames.add(result.filename);
        if (result.status === 'fail') failFilenames.add(result.filename);
      }
    }
  }

  const mergedResults = [...latestById.values()]
    .map((entry) => entry.result)
    .sort((a, b) => a.id.localeCompare(b.id));
  const resultById = new Map(mergedResults.map((entry) => [entry.id, entry]));

  const merged = {
    generatedAt: new Date().toISOString(),
    sourceDir: path.relative(ROOT, sourceDir),
    reportFiles,
    passFiles,
    failFiles,
    totalResults: mergedResults.length,
    passCount: mergedResults.filter((entry) => entry.status === 'pass').length,
    failCount: mergedResults.filter((entry) => entry.status === 'fail').length,
    results: mergedResults,
  };

  await fs.writeFile(path.join(sourceDir, 'report.merged.json'), `${JSON.stringify(merged, null, 2)}\n`);
  await fs.writeFile(
    path.join(sourceDir, 'passed.merged.txt'),
    `${[...passFilenames].sort().join('\n')}${passFilenames.size ? '\n' : ''}`,
  );
  await fs.writeFile(
    path.join(sourceDir, 'failed.merged.txt'),
    `${[...failFilenames].sort().join('\n')}${failFilenames.size ? '\n' : ''}`,
  );

  return {
    reportFiles,
    passFiles,
    failFiles,
    mergedResults,
    resultById,
    passFilenames,
    failFilenames,
  };
}

function toCandidateHint(candidate: Candidate): GalleryCategory | null {
  for (const spec of SECTION_SPECS) {
    if (spec.primaryMatch(candidate)) return spec.id;
  }
  return null;
}

async function selectShowcaseItems(
  candidates: Candidate[],
): Promise<{
  sectionMap: Map<GalleryCategory, Candidate[]>;
  missingSections: Array<{ section: GalleryCategory; needed: number; found: number }>;
}> {
  const sectionById = new Map(SECTION_SPECS.map((spec) => [spec.id, spec]));
  const usedScenarioIds = new Set<string>();
  const usedHashes = new Set<string>();
  const sectionMap = new Map<GalleryCategory, Candidate[]>();
  const missingSections: Array<{ section: GalleryCategory; needed: number; found: number }> = [];

  for (const sectionId of SELECTION_ORDER) {
    const section = sectionById.get(sectionId);
    if (!section) continue;

    const primaryPool = candidates.filter(
      (candidate) => !usedScenarioIds.has(candidate.config.id) && section.primaryMatch(candidate),
    );
    const fallbackPool = candidates.filter(
      (candidate) =>
        !usedScenarioIds.has(candidate.config.id) &&
        !primaryPool.some((entry) => entry.config.id === candidate.config.id) &&
        section.fallbackMatch(candidate),
    );

    const pool = [...primaryPool, ...fallbackPool];
    const picked = pickVariedCandidates(section, pool, ITEMS_PER_SECTION, usedHashes);

    for (const candidate of picked) {
      usedScenarioIds.add(candidate.config.id);
      usedHashes.add(candidate.sha256);
    }
    sectionMap.set(sectionId, picked);

    if (picked.length < ITEMS_PER_SECTION) {
      missingSections.push({
        section: sectionId,
        needed: ITEMS_PER_SECTION,
        found: picked.length,
      });
    }
  }

  return { sectionMap, missingSections };
}

async function copySelectedArtifacts(
  selected: Candidate[],
): Promise<
  Array<{
    id: string;
    category: GalleryCategory;
    file: string;
    bytes: number;
    sha256: string;
    sourcePath: string;
    sourceMode: SourceMode;
    isAnimated: boolean;
  }>
> {
  const copied: Array<{
    id: string;
    category: GalleryCategory;
    file: string;
    bytes: number;
    sha256: string;
    sourcePath: string;
    sourceMode: SourceMode;
    isAnimated: boolean;
  }> = [];

  for (const candidate of selected) {
    const outputFile = `${candidate.itemId}.${candidate.ext}`;
    const outputPath = path.join(PUBLIC_GALLERY_DIR, outputFile);
    await fs.copyFile(candidate.sourcePath, outputPath);
    const buffer = await fs.readFile(outputPath);
    copied.push({
      id: candidate.itemId,
      category: candidate.sectionCategoryHint || 'power-combos',
      file: outputFile,
      bytes: buffer.byteLength,
      sha256: createHash('sha256').update(buffer).digest('hex'),
      sourcePath: path.relative(ROOT, candidate.sourcePath),
      sourceMode: candidate.sourceMode,
      isAnimated: candidate.isAnimated,
    });
  }

  return copied;
}

async function writeGeneratedGalleryData(
  sections: Array<{
    id: GalleryCategory;
    title: string;
    description: string;
    icon: string;
    items: GalleryItemOut[];
  }>,
  summary: Record<string, unknown>,
): Promise<void> {
  const source = `/**
 * Auto-generated file. Do not edit manually.
 * Source: scripts/publish-gallery-showcase.ts
 */

const generatedGallerySummary = ${JSON.stringify(summary, null, 2)} as const;

export const generatedGallerySections = ${JSON.stringify(sections, null, 2)} as const;
`;

  await fs.writeFile(GENERATED_TS_PATH, source);
}

async function main(): Promise<void> {
  if (!['local', 'browser', 'remote'].includes(sourceMode)) {
    throw new Error(`Unsupported GALLERY_PUBLISH_SOURCE="${sourceMode}"`);
  }

  const sourceDir = path.join(ARTIFACTS_DIR, sourceMode);
  if (!(await exists(sourceDir))) {
    throw new Error(`Missing artifact directory: ${sourceDir}`);
  }

  const scenarios = generateAllScenarios() as ScenarioConfig[];
  const merged = await mergeShardOutputs(sourceDir);
  if (mergeOnly) {
    console.log('\n=== Gallery Artifact Shard Merge ===\n');
    console.log(`Source mode:    ${sourceMode}`);
    console.log(`Source dir:     ${sourceDir}`);
    console.log(`Report files:   ${merged.reportFiles.length}`);
    console.log(`Pass files:     ${merged.passFiles.length}`);
    console.log(`Fail files:     ${merged.failFiles.length}`);
    console.log(`Merged results: ${merged.mergedResults.length}`);
    console.log(`Merged report:  ${path.join(sourceDir, 'report.merged.json')}`);
    console.log(`Merged pass:    ${path.join(sourceDir, 'passed.merged.txt')}`);
    console.log(`Merged fail:    ${path.join(sourceDir, 'failed.merged.txt')}\n`);
    return;
  }
  const hasReportCoverage = merged.mergedResults.length > 0 || merged.passFilenames.size > 0;

  const candidates: Candidate[] = [];
  const skippedUnreported: Candidate[] = [];

  for (const config of scenarios) {
    const report = merged.resultById.get(config.id);
    const reportFilename =
      report?.filename && /\.(png|gif)$/i.test(report.filename) ? report.filename : '';
    const canonicalFilename = scenarioFilename(config);
    const candidateFilenames = [reportFilename, canonicalFilename].filter(Boolean);

    let filename = '';
    let sourcePath = '';
    for (const maybe of candidateFilenames) {
      const maybePath = path.join(sourceDir, maybe);
      if (await exists(maybePath)) {
        filename = maybe;
        sourcePath = maybePath;
        break;
      }
    }
    if (!filename) continue;
    if (!/\.(png|gif)$/i.test(filename)) continue;

    const reportStatus = (report?.status || 'unknown') as 'pass' | 'fail' | 'unknown';
    const reportReason = report?.reason || '';
    const reportDurationMs = Number(report?.durationMs || 0);
    const passByFile = merged.passFilenames.has(filename);
    const sourceBuffer = await fs.readFile(sourcePath);
    const sourceSha256 = bufferSha256(sourceBuffer);

    const candidate: Candidate = {
      sectionCategoryHint: null,
      config,
      sourceMode,
      sourcePath,
      filename,
      itemId: sanitizeItemId(filename),
      ext: /\.(gif)$/i.test(filename) ? 'gif' : 'png',
      labelLower: toLabelLower(filename),
      fixtureId: extractFixtureId(config),
      isAnimated: isScenarioAnimated(config),
      reportStatus,
      reportReason,
      reportDurationMs,
      sha256: sourceSha256,
      bytes: sourceBuffer.byteLength,
    };
    candidate.sectionCategoryHint = toCandidateHint(candidate);

    const isReportPassed = reportStatus === 'pass';
    const eligible = hasReportCoverage
      ? isReportPassed || passByFile || allowUnreported
      : true;

    if (eligible) {
      candidates.push(candidate);
    } else {
      skippedUnreported.push(candidate);
    }
  }

  if (candidates.length < ITEMS_PER_SECTION * SECTION_SPECS.length) {
    throw new Error(
      `Insufficient eligible artifacts (${candidates.length}) for ${SECTION_SPECS.length} sections × ${ITEMS_PER_SECTION} items`,
    );
  }

  const { sectionMap, missingSections } = await selectShowcaseItems(candidates);
  if (strictPublish && missingSections.length > 0) {
    const formatted = missingSections
      .map((entry) => `${entry.section}: found ${entry.found}, needed ${entry.needed}`)
      .join('; ');
    throw new Error(`Unable to fill gallery sections: ${formatted}`);
  }

  await ensureDir(PUBLIC_GALLERY_DIR);
  await clearPublishedImages(PUBLIC_GALLERY_DIR);

  const sectionsOut: Array<{
    id: GalleryCategory;
    title: string;
    description: string;
    icon: string;
    items: GalleryItemOut[];
  }> = [];

  const selectedCandidates: Candidate[] = [];
  for (const sectionId of DISPLAY_ORDER) {
    const spec = SECTION_SPECS.find((entry) => entry.id === sectionId);
    if (!spec) continue;
    const chosen = sectionMap.get(sectionId) || [];
    const seenTitleDesc = new Map<string, number>();
    const seenTitles = new Set<string>();
    const items: GalleryItemOut[] = chosen.map((candidate) => {
      selectedCandidates.push(candidate);
      let title = titleFromCandidate(sectionId, candidate);
      let description = descriptionFromCandidate(sectionId, candidate);
      const key = `${title}|||${description}`;
      const count = (seenTitleDesc.get(key) || 0) + 1;
      seenTitleDesc.set(key, count);
      if (count > 1) {
        const extra = humanizeToken(candidate.labelLower).split(' ').slice(0, 2).join(' ');
        title = `${title} · ${extra || `Case ${count}`}`;
      }
      if (seenTitles.has(title)) {
        const extra = humanizeToken(candidate.labelLower).split(' ').slice(0, 2).join(' ');
        const baseTitle = title;
        let bump = 2;
        let uniqueTitle = `${baseTitle} · ${extra || 'Variant'} ${bump}`;
        while (seenTitles.has(uniqueTitle)) {
          bump += 1;
          uniqueTitle = `${baseTitle} · ${extra || 'Variant'} ${bump}`;
        }
        title = uniqueTitle;
      }
      seenTitles.add(title);
      return {
        id: candidate.itemId,
        title,
        description,
        category: sectionId,
        params: toSortedParams(candidate.config.params),
        isAnimated: candidate.isAnimated,
      };
    });
    sectionsOut.push({
      id: spec.id,
      title: spec.title,
      description: spec.description,
      icon: spec.icon,
      items,
    });
  }

  const copied = await copySelectedArtifacts(selectedCandidates);
  const copyById = new Map(copied.map((entry) => [entry.id, entry]));

  const manifestItems = sectionsOut.flatMap((section) =>
    section.items.map((item) => {
      const copiedEntry = copyById.get(item.id);
      const query = buildDeterministicQuery(item.params);
      return {
        id: item.id,
        category: section.id,
        title: item.title,
        description: item.description,
        isAnimated: item.isAnimated,
        params: item.params,
        query,
        paramSignatureSha256: stableParamHash(item.params),
        output: copiedEntry
          ? {
              file: copiedEntry.file,
              bytes: copiedEntry.bytes,
              sha256: copiedEntry.sha256,
              sourceMode: copiedEntry.sourceMode,
              sourcePath: copiedEntry.sourcePath,
            }
          : null,
      };
    }),
  );

  const sectionCounts = Object.fromEntries(
    sectionsOut.map((section) => [section.id, section.items.length]),
  );

  const showcaseManifest = {
    manifestVersion: '4.0',
    generatedAt: new Date().toISOString(),
    sourceMode,
    sourceDir: path.relative(ROOT, sourceDir),
    strictPublish,
    allowUnreported,
    layout: {
      categories: SECTION_SPECS.length,
      columns: GALLERY_COLUMNS,
      rows: GALLERY_ROWS,
      itemsPerSection: ITEMS_PER_SECTION,
      totalItems: SECTION_SPECS.length * ITEMS_PER_SECTION,
    },
    reportCoverage: {
      hasReportCoverage,
      mergedReportFile: path.relative(ROOT, path.join(sourceDir, 'report.merged.json')),
      mergedPassFile: path.relative(ROOT, path.join(sourceDir, 'passed.merged.txt')),
      mergedFailFile: path.relative(ROOT, path.join(sourceDir, 'failed.merged.txt')),
      reportFiles: merged.reportFiles,
      passFiles: merged.passFiles,
      failFiles: merged.failFiles,
      mergedResults: merged.mergedResults.length,
      candidates: candidates.length,
      skippedUnreported: skippedUnreported.length,
    },
    sections: sectionsOut.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      icon: section.icon,
      count: section.items.length,
    })),
    sectionCounts,
    items: manifestItems,
  };

  await fs.writeFile(
    path.join(PUBLIC_GALLERY_DIR, 'showcase-manifest.json'),
    `${JSON.stringify(showcaseManifest, null, 2)}\n`,
  );
  await fs.writeFile(
    path.join(PUBLIC_GALLERY_DIR, 'manifest.json'),
    `${JSON.stringify(showcaseManifest, null, 2)}\n`,
  );

  await writeGeneratedGalleryData(sectionsOut, {
    generatedAt: showcaseManifest.generatedAt,
    sourceMode,
    totalItems: showcaseManifest.layout.totalItems,
    sectionCounts,
  });

  console.log('\n=== Gallery Showcase Publish ===\n');
  console.log(`Source mode:            ${sourceMode}`);
  console.log(`Scenarios available:    ${scenarios.length}`);
  console.log(`Eligible candidates:    ${candidates.length}`);
  console.log(`Sections:               ${SECTION_SPECS.length}`);
  console.log(`Items per section:      ${ITEMS_PER_SECTION}`);
  console.log(`Published gallery items:${manifestItems.length}`);
  console.log(`Skipped unreported:     ${skippedUnreported.length}`);
  console.log(`Output dir:             ${PUBLIC_GALLERY_DIR}`);
  console.log(`Manifest:               ${path.join(PUBLIC_GALLERY_DIR, 'showcase-manifest.json')}`);
  console.log(`Generated data:         ${GENERATED_TS_PATH}\n`);

  for (const section of sectionsOut) {
    console.log(`  - ${section.id}: ${section.items.length}`);
  }

  if (strictPublish && missingSections.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[publish-gallery-showcase] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
