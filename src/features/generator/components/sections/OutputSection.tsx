import { useTranslation } from 'react-i18next';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { HelpLink } from '@/ui/primitives/help-link';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/primitives/select';
import { Slider } from '@/ui/primitives/slider';
import { Switch } from '@/ui/primitives/switch';
import { HighlightedLabel } from '@/app/search/search-context';
import { type GifDither, type GifQuantizer, type OutputFormat, useQRStore } from '@/store/qr-store';

export function OutputSection() {
  const {
    tier,
    output,
    setOutputFormat,
    setOutputWidth,
    setOutputHeight,
    setOutputQuality,
    setOutputFilename,
    setOutputGifPaletteSize,
    setOutputGifQuantizer,
    setOutputSvgTrueVector,
  } = useQRStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Format */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label>
            <HighlightedLabel>{t('output.format')}</HighlightedLabel>
          </Label>
          <HelpLink anchor="section-13" />
        </div>
        <Select value={output.format} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
          <SelectTrigger
            data-testid={DynamicTestId.resolve('output-format-trigger', 'output-format-trigger')}
            title={t('hints.outputFormat')}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            data-testid={DynamicTestId.resolve('output-format-content', 'output-format-content')}
          >
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="webp">WebP</SelectItem>
            <SelectItem value="gif">GIF</SelectItem>
            <SelectItem value="svg">SVG (Bitmap)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dimensions */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label>
            <HighlightedLabel>{t('output.outputSize')}</HighlightedLabel>
          </Label>
          <HelpLink anchor="section-14" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              <HighlightedLabel>{t('output.width')}</HighlightedLabel>
            </Label>
            <Input
              data-testid={DynamicTestId.resolve('output-width-input', 'output-width-input')}
              type="number"
              value={output.widthPx}
              onChange={(e) => setOutputWidth(Number.parseInt(e.target.value, 10) || 400)}
              min={100}
              max={2000}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              <HighlightedLabel>{t('output.height')}</HighlightedLabel>
            </Label>
            <Input
              data-testid={DynamicTestId.resolve('output-height-input', 'output-height-input')}
              type="number"
              value={output.heightPx}
              onChange={(e) => setOutputHeight(Number.parseInt(e.target.value, 10) || 400)}
              min={100}
              max={2000}
            />
          </div>
        </div>
      </div>

      {/* Quality (for WebP/JPEG) */}
      {output.format === 'webp' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              <HighlightedLabel>{t('output.quality')}</HighlightedLabel>
            </Label>
            <span className="text-sm text-muted-foreground">
              {t('qr.nPercent', { count: Math.round(output.quality * 100) })}
            </span>
          </div>
          <Slider
            data-testid={DynamicTestId.resolve('output-quality-slider', 'output-quality-slider')}
            value={[output.quality]}
            onValueChange={([v]) => setOutputQuality(v)}
            min={0.1}
            max={1}
            step={0.05}
          />
        </div>
      )}

      {/* Advanced Options */}
      {(tier === 'advanced' || tier === 'professional') && (
        <>
          {/* Filename */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('output.filename')}</HighlightedLabel>
            </Label>
            <Input
              data-testid={DynamicTestId.resolve('output-filename-input', 'output-filename-input')}
              value={output.filename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="anqr-qrcode"
            />
          </div>

          {/* GIF Options */}
          {output.format === 'gif' && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-muted-foreground flex items-center gap-1.5">
                <HighlightedLabel>{t('output.gifSettings')}</HighlightedLabel>
                <HelpLink anchor="section-31" />
              </Label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">
                    <HighlightedLabel>{t('output.paletteSize')}</HighlightedLabel>
                  </Label>
                  <span className="text-sm text-muted-foreground">{output.gifPaletteSize}</span>
                </div>
                <Slider
                  data-testid={DynamicTestId.resolve(
                    'output-gif-palette-slider',
                    'output-gif-palette-slider'
                  )}
                  value={[output.gifPaletteSize]}
                  onValueChange={([v]) => setOutputGifPaletteSize(v)}
                  min={2}
                  max={256}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  <HighlightedLabel>{t('output.quantizer')}</HighlightedLabel>
                </Label>
                <Select
                  value={output.gifQuantizer}
                  onValueChange={(v) => setOutputGifQuantizer(v as GifQuantizer)}
                >
                  <SelectTrigger
                    data-testid={DynamicTestId.resolve(
                      'output-gif-quantizer-trigger',
                      'output-gif-quantizer-trigger'
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    data-testid={DynamicTestId.resolve(
                      'output-gif-quantizer-content',
                      'output-gif-quantizer-content'
                    )}
                  >
                    <SelectItem value="median_cut">{t('output.medianCut')}</SelectItem>
                    <SelectItem value="neuquant">{t('output.neuquant')}</SelectItem>
                    <SelectItem value="octree">{t('output.octree')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  <HighlightedLabel>{t('output.dithering')}</HighlightedLabel>
                </Label>
                <Select
                  value={output.gifDither}
                  onValueChange={(v) =>
                    useQRStore.setState((s) => ({
                      output: { ...s.output, gifDither: v as GifDither },
                    }))
                  }
                >
                  <SelectTrigger
                    data-testid={DynamicTestId.resolve(
                      'output-gif-dither-trigger',
                      'output-gif-dither-trigger'
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    data-testid={DynamicTestId.resolve(
                      'output-gif-dither-content',
                      'output-gif-dither-content'
                    )}
                  >
                    <SelectItem value="off">{t('output.off')}</SelectItem>
                    <SelectItem value="floyd">{t('output.floydSteinberg')}</SelectItem>
                    <SelectItem value="ordered">{t('output.ordered')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* SVG Options */}
          {output.format === 'svg' && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-muted-foreground flex items-center gap-1.5">
                <HighlightedLabel>{t('output.svgSettings')}</HighlightedLabel>
                <HelpLink anchor="section-34" />
              </Label>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">
                    <HighlightedLabel>{t('output.trueVector')}</HighlightedLabel>
                  </Label>
                  <p className="text-xs text-muted-foreground">{t('output.trueVectorDesc')}</p>
                </div>
                <Switch
                  data-testid={DynamicTestId.resolve(
                    'output-svg-true-vector-switch',
                    'output-svg-true-vector-switch'
                  )}
                  checked={output.svgTrueVector}
                  onCheckedChange={setOutputSvgTrueVector}
                />
              </div>

              {output.svgTrueVector && (
                <div className="space-y-2">
                  <Label className="text-sm">
                    <HighlightedLabel>{t('output.shapePrecision')}</HighlightedLabel>
                  </Label>
                  <Select
                    value={output.svgShapePrecision}
                    onValueChange={(v) =>
                      useQRStore.setState((s) => ({
                        output: {
                          ...s.output,
                          svgShapePrecision: v as typeof output.svgShapePrecision,
                        },
                      }))
                    }
                  >
                    <SelectTrigger
                      data-testid={DynamicTestId.resolve(
                        'output-svg-precision-trigger',
                        'output-svg-precision-trigger'
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      data-testid={DynamicTestId.resolve(
                        'output-svg-precision-content',
                        'output-svg-precision-content'
                      )}
                    >
                      <SelectItem value="pixel">{t('output.pixel')}</SelectItem>
                      <SelectItem value="precise">{t('output.precise')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-sm">
                  <HighlightedLabel>{t('output.embedRasterOverlay')}</HighlightedLabel>
                </Label>
                <Switch
                  data-testid={DynamicTestId.resolve(
                    'output-svg-embed-raster-switch',
                    'output-svg-embed-raster-switch'
                  )}
                  checked={output.svgEmbedRasterOverlay}
                  onCheckedChange={(checked) =>
                    useQRStore.setState((s) => ({
                      output: { ...s.output, svgEmbedRasterOverlay: checked },
                    }))
                  }
                />
              </div>
            </div>
          )}

          {/* GIF Transparent Color */}
          {output.format === 'gif' && (
            <div className="space-y-2">
              <Label className="text-sm">
                <HighlightedLabel>{t('output.transparentColor')}</HighlightedLabel>
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={output.gifTransparentColor || '#ffffff'}
                  onChange={(e) =>
                    useQRStore.setState((s) => ({
                      output: { ...s.output, gifTransparentColor: e.target.value },
                    }))
                  }
                  className="w-10 h-8 p-1"
                />
                <Input
                  type="text"
                  value={output.gifTransparentColor}
                  onChange={(e) =>
                    useQRStore.setState((s) => ({
                      output: { ...s.output, gifTransparentColor: e.target.value },
                    }))
                  }
                  placeholder={t('output.transparentColorPlaceholder')}
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {/* Background Override */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('output.backgroundOverride')}</HighlightedLabel>
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={output.bgOverride || '#ffffff'}
                onChange={(e) =>
                  useQRStore.setState((s) => ({
                    output: { ...s.output, bgOverride: e.target.value },
                  }))
                }
                className="w-10 h-8 p-1"
              />
              <Input
                type="text"
                value={output.bgOverride}
                onChange={(e) =>
                  useQRStore.setState((s) => ({
                    output: { ...s.output, bgOverride: e.target.value },
                  }))
                }
                placeholder={t('output.backgroundOverridePlaceholder')}
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}

      {/* Professional Options */}
      {tier === 'professional' && (
        <>
          {/* DPI */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t('output.dpi')}</HighlightedLabel>
              </Label>
              <span className="text-sm text-muted-foreground">{output.dpi}</span>
            </div>
            <Slider
              data-testid={DynamicTestId.resolve('output-dpi-slider', 'output-dpi-slider')}
              value={[output.dpi]}
              onValueChange={([v]) =>
                useQRStore.setState((s) => ({ output: { ...s.output, dpi: v } }))
              }
              min={72}
              max={600}
              step={1}
            />
          </div>

          {/* Include Quiet Zone */}
          <div className="flex items-center justify-between">
            <Label>
              <HighlightedLabel>{t('output.includeQuietZone')}</HighlightedLabel>
            </Label>
            <Switch
              data-testid={DynamicTestId.resolve(
                'output-include-quiet-zone-switch',
                'output-include-quiet-zone-switch'
              )}
              checked={output.includeQuietZone}
              onCheckedChange={(checked) =>
                useQRStore.setState((s) => ({ output: { ...s.output, includeQuietZone: checked } }))
              }
            />
          </div>

          {/* Extra Formats */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('output.exportAsAdditional')}</HighlightedLabel>
            </Label>
            <Select
              value={output.formatExtra}
              onValueChange={(v) =>
                useQRStore.setState((s) => ({
                  output: { ...s.output, formatExtra: v as typeof output.formatExtra },
                }))
              }
            >
              <SelectTrigger
                data-testid={DynamicTestId.resolve(
                  'output-format-extra-trigger',
                  'output-format-extra-trigger'
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                data-testid={DynamicTestId.resolve(
                  'output-format-extra-content',
                  'output-format-extra-content'
                )}
              >
                <SelectItem value="none">{t('output.none')}</SelectItem>
                <SelectItem value="eps">EPS</SelectItem>
                <SelectItem value="animated_webp">{t('output.animatedWebp')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
