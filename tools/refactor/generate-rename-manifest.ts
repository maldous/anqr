/**
 * Generate a rename manifest to apply the architecture doc file naming conventions.
 *
 * Architecture doc conventions (02-target-architecture.md):
 *   *.types.ts   — type-only contracts
 *   *.model.ts   — stable domain or state models
 *   *.service.ts — orchestration or application service
 *   *.adapter.ts — environment adapter
 *   *.client.ts  — worker or remote boundary client
 *   *.store.ts   — state store only
 *   *.selector.ts — selectors only
 *   *.serializer.ts — payload or data serializers only
 *
 * Additional rules:
 *   - All filenames kebab-case (no PascalCase)
 *   - Scaffolded files: strip {dir}-{ast}- prefix, apply arch doc suffix
 *   - Directory context provides the "domain" — filenames should be descriptive only
 */

import fs from 'node:fs';
import path from 'node:path';

type ManifestRow = {
  source: string;
  action: 'move';
  target: string;
  reason: string;
  confidence: string;
};

const ROOT = process.cwd();

function toKebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function getExt(f: string): string {
  if (f.endsWith('.tsx')) return '.tsx';
  return '.ts';
}

function stripExt(f: string): string {
  return f.replace(/\.tsx?$/, '');
}

const rows: ManifestRow[] = [];

function rename(source: string, target: string, reason: string) {
  if (source === target) return;
  rows.push({ source, action: 'move', target, reason, confidence: 'high' });
}

// ─── Scaffolded files: strip {dir}-{ast}- prefix, apply arch doc suffix ───

const scaffoldDirs = [
  'src/features/generator/application/generation',
  'src/features/generator/application/frames',
  'src/features/generator/application/qart',
  'src/features/generator/application/safety',
  'src/features/generator/application/export',
  'src/features/generator/application/input',
  'src/features/generator/application/url-import',
  'src/features/generator/hooks',
];

for (const dir of scaffoldDirs) {
  const absDir = path.resolve(ROOT, dir);
  if (!fs.existsSync(absDir)) continue;

  for (const file of fs.readdirSync(absDir)) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;

    const ext = getExt(file);
    const base = stripExt(file);

    // Match {dir}-{ast}-{desc} pattern
    const match = base.match(/^[a-z]+-([a-z]+)-(.+)$/);
    if (!match) continue;

    const [, astType, desc] = match;

    let newName: string;
    if (astType === 'type' || astType === 'interface') {
      newName = `${desc}.types${ext}`;
    } else if (astType === 'class') {
      newName = `${desc}${ext}`;
    } else if (astType === 'const') {
      newName = `${desc}${ext}`;
    } else {
      // fn, etc — just use the description
      newName = `${desc}${ext}`;
    }

    rename(`${dir}/${file}`, `${dir}/${newName}`, `Arch doc naming: strip prefix, apply suffix`);
  }
}

// ─── PascalCase → kebab-case conversions ───

const pascalCaseFiles = [
  ['src/app/pages/StaticPage.tsx', 'src/app/pages/static-page.tsx'],
  ['src/app/shell/AppShell.tsx', 'src/app/shell/app-shell.tsx'],
  ['src/app/shell/ErrorBoundary.tsx', 'src/app/shell/error-boundary.tsx'],
  ['src/features/analyze/components/content-type-renderers.tsx', null], // already kebab
  [
    'src/features/gallery/components/GalleryScreen.tsx',
    'src/features/gallery/components/gallery-screen.tsx',
  ],
  [
    'src/features/generator/components/Preview.tsx',
    'src/features/generator/components/preview.tsx',
  ],
  [
    'src/features/generator/components/Sidebar.tsx',
    'src/features/generator/components/sidebar.tsx',
  ],
  [
    'src/features/generator/components/sections/AnimationSection.tsx',
    'src/features/generator/components/sections/animation-section.tsx',
  ],
  [
    'src/features/generator/components/sections/MetadataSection.tsx',
    'src/features/generator/components/sections/metadata-section.tsx',
  ],
  [
    'src/features/generator/components/sections/OutputSection.tsx',
    'src/features/generator/components/sections/output-section.tsx',
  ],
  [
    'src/features/generator/components/sections/OverlaySection.tsx',
    'src/features/generator/components/sections/overlay-section.tsx',
  ],
  [
    'src/features/generator/components/sections/PayloadSection.tsx',
    'src/features/generator/components/sections/payload-section.tsx',
  ],
  [
    'src/features/generator/components/sections/RenderSection.tsx',
    'src/features/generator/components/sections/render-section.tsx',
  ],
  [
    'src/features/generator/components/sections/SafetySection.tsx',
    'src/features/generator/components/sections/safety-section.tsx',
  ],
  [
    'src/features/generator/components/sections/ShareSection.tsx',
    'src/features/generator/components/sections/share-section.tsx',
  ],
  [
    'src/features/generator/components/sections/WatermarkSection.tsx',
    'src/features/generator/components/sections/watermark-section.tsx',
  ],
  [
    'src/features/onboarding/components/WelcomeModal.tsx',
    'src/features/onboarding/components/welcome-modal.tsx',
  ],
  [
    'src/platform/ads/components/AdPlaceholder.tsx',
    'src/platform/ads/components/ad-placeholder.tsx',
  ],
  ['src/platform/ads/components/AdUnit.tsx', 'src/platform/ads/components/ad-unit.tsx'],
  ['src/ui/composites/BusyOverlay.tsx', 'src/ui/composites/busy-overlay.tsx'],
  ['src/ui/composites/MobileDivider.tsx', 'src/ui/composites/mobile-divider.tsx'],
] as const;

for (const [source, target] of pascalCaseFiles) {
  if (target && fs.existsSync(path.resolve(ROOT, source))) {
    rename(source, target, 'Arch doc naming: PascalCase to kebab-case');
  }
}

// ─── Architecture doc suffix renames ───

const suffixRenames = [
  // Types files
  ['src/domain/qr/decode/result-types.ts', 'src/domain/qr/decode/result.types.ts'],
  // Adapter files
  ['src/domain/qr/decode/decoder-adapter.ts', 'src/domain/qr/decode/decoder.adapter.ts'],
  // Client files
  ['src/platform/worker/qart/worker-client.ts', 'src/platform/worker/qart/qart.client.ts'],
  [
    'src/platform/worker/analyze/validation-worker-client.ts',
    'src/platform/worker/analyze/analyze.client.ts',
  ],
  // Protocol/types
  [
    'src/platform/worker/qart/worker-protocol.ts',
    'src/platform/worker/qart/qart-protocol.types.ts',
  ],
  ['src/platform/worker/qart/worker.ts', 'src/platform/worker/qart/qart.worker.ts'],
  [
    'src/platform/worker/analyze/validation-worker.ts',
    'src/platform/worker/analyze/analyze.worker.ts',
  ],
  // Adapter files in platform
  ['src/platform/browser/clipboard/api.ts', 'src/platform/browser/clipboard/clipboard.adapter.ts'],
  ['src/platform/browser/io/api.ts', 'src/platform/browser/io/io.adapter.ts'],
  ['src/platform/native/ads/admob.ts', 'src/platform/native/ads/admob.adapter.ts'],
  [
    'src/platform/native/media-store/media-store.ts',
    'src/platform/native/media-store/media-store.adapter.ts',
  ],
  [
    'src/platform/native/notifications/native-toast.ts',
    'src/platform/native/notifications/native-toast.adapter.ts',
  ],
] as const;

for (const [source, target] of suffixRenames) {
  if (fs.existsSync(path.resolve(ROOT, source))) {
    rename(source, target, 'Arch doc naming: apply role suffix');
  }
}

// ─── Write manifest ───

const outPath = path.join(ROOT, 'manifests', 'rename-to-arch-doc-naming.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(rows, null, 2) + '\n', 'utf8');

// Summary
const byReason = new Map<string, number>();
for (const r of rows) {
  byReason.set(r.reason, (byReason.get(r.reason) ?? 0) + 1);
}
for (const [reason, count] of byReason) {
}
