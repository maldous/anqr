import { useTranslation } from "react-i18next";
import { type OutputFormat, useQRStore } from "../../../../state/qr-store";
import {
  DynamicTestId,
  HelpLink,
  HighlightedLabel,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
} from "./section-ui";

// B4-B11: several output controls used to be exposed here that had
// no consumer in the export pipeline (formatExtra, gifQuantizer,
// gifDither, gifTransparentColor, svgShapePrecision,
// svgEmbedRasterOverlay, includeQuietZone). They roundtripped through
// share URLs and contracts but the render code never read them, so
// flipping them changed nothing the user could observe. Removed from
// the UI. The store fields stay for now (still serialised) and will
// be cleaned in the orphan-state pass.

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
    setOutputSvgTrueVector,
  } = useQRStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Format */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label>
            <HighlightedLabel>{t("output.format")}</HighlightedLabel>
          </Label>
          <HelpLink anchor="section-13" />
        </div>
        <Select value={output.format} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
          <SelectTrigger
            data-testid={DynamicTestId.resolve("output-format-trigger", "output-format-trigger")}
            title={t("hints.outputFormat")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            data-testid={DynamicTestId.resolve("output-format-content", "output-format-content")}
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
            <HighlightedLabel>{t("output.outputSize")}</HighlightedLabel>
          </Label>
          <HelpLink anchor="section-14" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              <HighlightedLabel>{t("output.width")}</HighlightedLabel>
            </Label>
            <Input
              data-testid={DynamicTestId.resolve("output-width-input", "output-width-input")}
              type="number"
              value={output.widthPx}
              onChange={(e) => setOutputWidth(Number.parseInt(e.target.value, 10) || 400)}
              min={100}
              max={2000}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              <HighlightedLabel>{t("output.height")}</HighlightedLabel>
            </Label>
            <Input
              data-testid={DynamicTestId.resolve("output-height-input", "output-height-input")}
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
      {output.format === "webp" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              <HighlightedLabel>{t("output.quality")}</HighlightedLabel>
            </Label>
            <span className="text-sm text-muted-foreground">
              {t("qr.nPercent", { count: Math.round(output.quality * 100) })}
            </span>
          </div>
          <Slider
            data-testid={DynamicTestId.resolve("output-quality-slider", "output-quality-slider")}
            value={[output.quality]}
            onValueChange={([v]) => setOutputQuality(v)}
            min={0.1}
            max={1}
            step={0.05}
          />
        </div>
      )}

      {/* Advanced Options */}
      {(tier === "advanced" || tier === "professional") && (
        <>
          {/* Filename */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t("output.filename")}</HighlightedLabel>
            </Label>
            <Input
              data-testid={DynamicTestId.resolve("output-filename-input", "output-filename-input")}
              value={output.filename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="anqr-qrcode"
            />
          </div>

          {/* GIF Options — only paletteSize is wired into the encoder */}
          {output.format === "gif" && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-muted-foreground flex items-center gap-1.5">
                <HighlightedLabel>{t("output.gifSettings")}</HighlightedLabel>
                <HelpLink anchor="section-31" />
              </Label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">
                    <HighlightedLabel>{t("output.paletteSize")}</HighlightedLabel>
                  </Label>
                  <span className="text-sm text-muted-foreground">{output.gifPaletteSize}</span>
                </div>
                <Slider
                  data-testid={DynamicTestId.resolve(
                    "output-gif-palette-slider",
                    "output-gif-palette-slider",
                  )}
                  value={[output.gifPaletteSize]}
                  onValueChange={([v]) => setOutputGifPaletteSize(v)}
                  min={2}
                  max={256}
                  step={1}
                />
              </div>
            </div>
          )}

          {/* SVG Options — only trueVector is wired into the export */}
          {output.format === "svg" && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-muted-foreground flex items-center gap-1.5">
                <HighlightedLabel>{t("output.svgSettings")}</HighlightedLabel>
                <HelpLink anchor="section-34" />
              </Label>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">
                    <HighlightedLabel>{t("output.trueVector")}</HighlightedLabel>
                  </Label>
                  <p className="text-xs text-muted-foreground">{t("output.trueVectorDesc")}</p>
                </div>
                <Switch
                  data-testid={DynamicTestId.resolve(
                    "output-svg-true-vector-switch",
                    "output-svg-true-vector-switch",
                  )}
                  checked={output.svgTrueVector}
                  onCheckedChange={setOutputSvgTrueVector}
                />
              </div>
            </div>
          )}

          {/* Background Override — wired into export-gif.tsx and
              export-image.tsx (drawn behind the QR on raster exports) */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t("output.backgroundOverride")}</HighlightedLabel>
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={output.bgOverride || "#ffffff"}
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
                placeholder={t("output.backgroundOverridePlaceholder")}
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}

      {/* Professional Options */}
      {tier === "professional" && (
        <>
          {/* DPI — wired into PNG metadata embedder */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t("output.dpi")}</HighlightedLabel>
              </Label>
              <span className="text-sm text-muted-foreground">{output.dpi}</span>
            </div>
            <Slider
              data-testid={DynamicTestId.resolve("output-dpi-slider", "output-dpi-slider")}
              value={[output.dpi]}
              onValueChange={([v]) =>
                useQRStore.setState((s) => ({ output: { ...s.output, dpi: v } }))
              }
              min={72}
              max={600}
              step={1}
            />
          </div>
        </>
      )}
    </div>
  );
}
