import type { QRAnalysisResult } from '@/modules/qr-analyzer';
import type { ImportToGeneratorSetters } from '@/features/analyze/lib/analysis-runtime.types';

export function importAnalysisToGenerator(
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

  if (result.eccLevel) setters.setQrEcc(result.eccLevel as 'L' | 'M' | 'Q' | 'H');
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
    if (modeMap[result.encodingMode]) setters.setQrEncodingMode(modeMap[result.encodingMode]);
  }
  if (result.detectedColors) {
    setters.setRenderFgColor(result.detectedColors.foreground);
    setters.setRenderBgColor(result.detectedColors.background);
  }

  setTimeout(() => {
    if (onNavigate) {
      onNavigate('editor');
      return;
    }
    globalThis.location.hash = '';
    globalThis.location.search = '';
    if (globalThis.location.pathname === '/' || globalThis.location.pathname === '') {
      globalThis.location.reload();
      return;
    }
    globalThis.location.href = '/';
  }, 500);
}
