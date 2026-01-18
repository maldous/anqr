import { AlertTriangle, Eye, Sparkles, Thermometer } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Type for render state
type RenderState = 'pending' | 'rendering' | 'idle';

import { useTranslation } from 'react-i18next';
import { AdUnit } from '@/components/AdUnit';
import { BusyOverlay } from '@/components/BusyOverlay';
import { useQRGenerator } from '@/hooks/useQRGenerator';
import { getContrastRatio, meetsContrastAA, meetsContrastAAA, parseColor } from '@/modules/core';
import { useQRStore } from '@/store/qr-store';

interface PreviewProps {
  sidebarOpen?: boolean;
}

export function Preview({ sidebarOpen = true }: Readonly<PreviewProps>) {
  const { t } = useTranslation();
  const {
    canvasRef,
    isLoading,
    isRendering,
    isPending,
    error,
    safetyWarnings,
    canvas,
    isPreparingAnimation,
  } = useQRGenerator();

  // Show busy overlay while loading OR while preparing multi-frame animation OR during active rendering
  // isPreparingAnimation is true when we have multi-frame content but cache isn't ready yet
  // isRendering is true when actively generating QR (after debounce, during expensive computation)
  // isPending is true when config has changed but debounce hasn't settled (gives immediate feedback)
  const showBusy = isLoading || isRendering || isPending || isPreparingAnimation;

  // Compute rendering state for test automation (data-rendering-state attribute)
  // 'idle' = ready for interaction, 'pending' = debounce waiting, 'rendering' = actively generating
  const renderingState: RenderState = isPending
    ? 'pending'
    : isRendering || isLoading || isPreparingAnimation
      ? 'rendering'
      : 'idle';

  // Track previous rendering state to dispatch lifecycle events
  const prevRenderingStateRef = useRef<RenderState | null>(null);

  // Dispatch CustomEvents for render lifecycle (enables event-driven test detection)
  useEffect(() => {
    const prevState = prevRenderingStateRef.current;

    // Skip initial mount (prevState is null)
    if (prevState !== null) {
      // Dispatch render-start when transitioning FROM idle to non-idle
      if (prevState === 'idle' && renderingState !== 'idle') {
        document.dispatchEvent(
          new CustomEvent('anqr:render-start', {
            detail: { previousState: prevState, newState: renderingState },
          })
        );
      }

      // Dispatch render-complete when transitioning TO idle from non-idle
      if (prevState !== 'idle' && renderingState === 'idle') {
        document.dispatchEvent(
          new CustomEvent('anqr:render-complete', {
            detail: { success: true, previousState: prevState },
          })
        );
      }
    }

    // Update ref for next render
    prevRenderingStateRef.current = renderingState;
  }, [renderingState]);
  const [showWarnings, setShowWarnings] = useState(true);
  const [heatmapActive, setHeatmapActive] = useState(false);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);

  // Use individual selectors to avoid re-renders when unrelated state changes
  const render = useQRStore((s) => s.render);
  const safety = useQRStore((s) => s.safety);
  const qa = useQRStore((s) => s.qa);

  // Reset showWarnings when safetyWarnings change
  useEffect(() => {
    if (safetyWarnings.length > 0) {
      setShowWarnings(true);
    }
  }, [safetyWarnings]);

  // Calculate contrast ratio between foreground and background colors
  const contrastAnalysis = useMemo(() => {
    if (safety.mode === 'off') return null;
    const fgRgb = parseColor(render.fgColor);
    const bgRgb = parseColor(render.bgColor);
    if (!(fgRgb && bgRgb)) return null;

    // Calculate contrast ratio
    const ratio = getContrastRatio(render.fgColor, render.bgColor);

    return {
      ratio,
      meetsAA: meetsContrastAA(render.fgColor, render.bgColor),
      meetsAAA: meetsContrastAAA(render.fgColor, render.bgColor),
    };
  }, [render.fgColor, render.bgColor, safety.mode]);

  // Determine badge color based on contrast ratio
  const getContrastBadgeColor = (ratio: number) => {
    if (ratio >= 7) return 'bg-green-500'; // AAA level
    if (ratio >= 4.5) return 'bg-green-400'; // AA level
    if (ratio >= 3) return 'bg-yellow-500'; // AA Large
    return 'bg-red-500'; // Poor contrast
  };

  const getContrastLabel = (ratio: number) => {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'AA-L';
    return 'Poor';
  };

  // Generate heatmap from the QR canvas
  const generateHeatmap = useCallback(() => {
    if (!(canvas && heatmapCanvasRef.current)) return;

    const heatmapCanvas = heatmapCanvasRef.current;
    const ctx = heatmapCanvas.getContext('2d');
    if (!ctx) return;

    // Match heatmap canvas size to QR canvas
    heatmapCanvas.width = canvas.width;
    heatmapCanvas.height = canvas.height;

    // Get QR canvas pixel data
    const qrCtx = canvas.getContext('2d');
    if (!qrCtx) return;

    const imageData = qrCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Parse background color for contrast calculation
    const bg = parseColor(render.bgColor);

    // Sample at a lower resolution for performance (every 4th pixel)
    const sampleSize = 4;

    for (let y = 0; y < canvas.height; y += sampleSize) {
      for (let x = 0; x < canvas.width; x += sampleSize) {
        const i = (y * canvas.width + x) * 4;
        const pixelColor = { r: data[i], g: data[i + 1], b: data[i + 2] };

        // Calculate contrast ratio with background
        const ratio = bg ? getContrastRatio(pixelColor, bg) : 1;

        // Map contrast ratio to heatmap color
        // 7:1 = AAA (green), 4.5:1 = AA (yellow-green), 3:1 = AA-L (yellow), <3 = poor (red)
        let r: number, g: number, b: number;

        if (ratio >= 7) {
          // Green - excellent contrast
          r = 34;
          g = 197;
          b = 94;
        } else if (ratio >= 4.5) {
          // Light green - good contrast
          r = 132;
          g = 204;
          b = 22;
        } else if (ratio >= 3) {
          // Yellow - acceptable for large text
          r = 234;
          g = 179;
          b = 8;
        } else if (ratio >= 2) {
          // Orange - poor contrast
          r = 249;
          g = 115;
          b = 22;
        } else {
          // Red - very poor contrast
          r = 239;
          g = 68;
          b = 68;
        }

        ctx.fillStyle = `rgba(${r},${g},${b},0.6)`;
        ctx.fillRect(x, y, sampleSize, sampleSize);
      }
    }
  }, [canvas, render.bgColor]);

  // Regenerate heatmap when canvas changes and heatmap is active
  useEffect(() => {
    if (heatmapActive && qa.showHeatmap && canvas) {
      generateHeatmap();
    }
  }, [heatmapActive, qa.showHeatmap, canvas, generateHeatmap]);

  // Generate noise pattern for noise simulation
  const generateNoisePattern = useCallback(() => {
    if (!(noiseCanvasRef.current && canvas)) return;

    const noiseCanvas = noiseCanvasRef.current;
    noiseCanvas.width = canvas.width;
    noiseCanvas.height = canvas.height;
    const ctx = noiseCanvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    // Generate random noise (Math.random is safe here - purely visual effect, not security-sensitive)
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255; // NOSONAR - visual noise only
      data[i] = noise; // R
      data[i + 1] = noise; // G
      data[i + 2] = noise; // B
      data[i + 3] = 255; // A (controlled by CSS opacity)
    }

    ctx.putImageData(imageData, 0, 0);
  }, [canvas]);

  // Generate noise when noise level changes or canvas updates
  useEffect(() => {
    if (qa.simulateNoise > 0 && canvas) {
      generateNoisePattern();
    }
  }, [qa.simulateNoise, canvas, generateNoisePattern]);

  // Calculate simulation styles for the QR canvas
  const simulationStyles = useMemo(() => {
    const styles: React.CSSProperties = {
      imageRendering: 'pixelated' as const,
    };

    const filters: string[] = [];
    const transforms: string[] = [];

    // Apply blur simulation
    if (qa.simulateBlurPx > 0) {
      filters.push(`blur(${qa.simulateBlurPx}px)`);
    }

    // Apply rotation simulation
    if (qa.simulateRotationDeg > 0) {
      transforms.push(`rotate(${qa.simulateRotationDeg}deg)`);
    }

    if (filters.length > 0) {
      styles.filter = filters.join(' ');
    }

    if (transforms.length > 0) {
      styles.transform = transforms.join(' ');
    }

    return styles;
  }, [qa.simulateBlurPx, qa.simulateRotationDeg]);

  // Check if any simulation is active
  const hasActiveSimulation =
    qa.simulateBlurPx > 0 || qa.simulateNoise > 0 || qa.simulateRotationDeg > 0;

  return (
    <main
      className={`flex-1 flex flex-col lg:flex-row bg-background overflow-auto scrollbar-hide transition-all duration-300 ${sidebarOpen ? 'lg:ms-96' : ''}`}
    >
      {/* Desktop Left Column Ad - Skyscraper 160x600, always visible */}
      {/* Fixed height based on viewport to prevent layout shift from AdSense */}
      <div className="hidden lg:flex flex-col items-center justify-center w-[180px] h-[calc(100vh-8rem)] bg-background flex-shrink-0 ps-3 pe-2">
        <AdUnit slot="left-skyscraper" width={160} height={600} format="vertical" />
      </div>

      {/* Main content area with QR */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Preview Area - on mobile, center QR in available space */}
        {/* Equal top/bottom padding for centering, with extra bottom space for scrolling above fixed buttons */}
        <div className="flex-1 flex items-center justify-center px-4 py-24 md:p-8 overflow-auto scrollbar-hide">
          <div className="qr-preview-container transition-all duration-300 w-full max-w-[280px] sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto">
            {/* QR Code Canvas */}
            <div className="bg-white rounded-lg shadow-xl flex items-center justify-center p-4 relative">
              {showBusy && <BusyOverlay visible={true} />}
              {error && (
                <div className="absolute inset-0 bg-red-50 flex items-center justify-center rounded-lg z-10 p-4">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}
              {/* Contrast ratio badge and heatmap toggle */}
              {contrastAnalysis && (
                <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1">
                  <div
                    className={`${getContrastBadgeColor(contrastAnalysis.ratio)} text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm flex items-center gap-1`}
                    title={`${t('safety.contrast')}: ${contrastAnalysis.ratio.toFixed(2)}:1 - ${(() => {
                      if (contrastAnalysis.meetsAAA) return 'WCAG AAA';
                      if (contrastAnalysis.meetsAA) return 'WCAG AA';
                      return t('safety.poor');
                    })()}`}
                  >
                    <Eye className="h-3 w-3" />
                    <span>{contrastAnalysis.ratio.toFixed(1)}:1</span>
                    <span className="opacity-75">({getContrastLabel(contrastAnalysis.ratio)})</span>
                  </div>
                  {qa.showHeatmap && (
                    <button
                      type="button"
                      onClick={() => setHeatmapActive(!heatmapActive)}
                      className={`text-xs font-medium px-2 py-1 rounded-md shadow-sm flex items-center gap-1 transition-colors ${
                        heatmapActive
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={t('safety.showHeatmap')}
                    >
                      <Thermometer className="h-3 w-3" />
                      <span>{t('safety.showHeatmap')}</span>
                    </button>
                  )}
                </div>
              )}
              {/* Safety warnings */}
              {safetyWarnings.length > 0 && showWarnings && (
                <div className="absolute top-2 right-2 max-w-xs z-10">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 shadow-sm">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-amber-800">{t('sections.safety')}</p>
                        <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
                          {safetyWarnings.map((warning) => (
                            <li key={warning}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowWarnings(false)}
                        className="text-amber-600 hover:text-amber-800 text-xs"
                        title={t('common.close')}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div
                className="relative inline-block"
                data-rendering-state={renderingState}
                data-testid="qr-preview"
              >
                {/* Simulation indicator badge */}
                {hasActiveSimulation && (
                  <div
                    className="absolute -top-2 -right-2 z-20 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
                    title={t('preview.simulationActive')}
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{t('preview.simulating')}</span>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full transition-all duration-200"
                  style={simulationStyles}
                  title={t('preview.qrCodePreview')}
                />
                {/* Noise overlay canvas - positioned over the QR canvas */}
                {qa.simulateNoise > 0 && (
                  <canvas
                    ref={noiseCanvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{
                      imageRendering: 'pixelated',
                      mixBlendMode: 'overlay',
                      opacity: qa.simulateNoise / 100,
                      ...simulationStyles, // Apply same rotation/transforms
                    }}
                  />
                )}
                {/* Heatmap overlay canvas - positioned over the QR canvas */}
                {qa.showHeatmap && heatmapActive && (
                  <canvas
                    ref={heatmapCanvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{
                      imageRendering: 'pixelated',
                      mixBlendMode: 'multiply',
                      ...simulationStyles, // Apply same rotation/transforms
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Right Column Ad - Skyscraper 160x600 */}
      {/* Fixed height based on viewport to prevent layout shift from AdSense */}
      <div className="hidden lg:flex flex-col items-center justify-center w-[180px] h-[calc(100vh-8rem)] bg-background flex-shrink-0 ps-2 pe-3">
        <AdUnit slot="right-skyscraper" width={160} height={600} format="vertical" />
      </div>
    </main>
  );
}
