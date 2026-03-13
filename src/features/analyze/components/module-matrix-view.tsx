import { useCallback, useRef, useState } from 'react';
import { Check, ClipboardCopy, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/ui/primitives/button';

export const ModuleMatrixView = ({
  matrix,
  version,
  fgColor = '#000000',
  bgColor = '#ffffff',
}: Readonly<{
  matrix: boolean[][];
  version: number | null;
  fgColor?: string;
  bgColor?: string;
}>) => {
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const moduleCount = matrix.length;
  const baseModuleSize = Math.max(2, Math.min(8, Math.floor(280 / moduleCount)));
  const moduleSize = baseModuleSize * zoom;
  const gridSize = moduleCount * moduleSize;

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
      const textarea = document.createElement('textarea');
      textarea.value = asciiArt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
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
};
