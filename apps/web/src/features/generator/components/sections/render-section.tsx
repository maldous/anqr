import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/ui/web";
import type { GradientType } from "@/contracts/generator";
import { HexColorField } from "./hex-color-field";
import {
  type AlignmentStyle,
  type FinderStyle,
  type FrameStyle,
  type GapMode,
  type ModuleStyle,
  type TimingStyle,
  useQRStore,
} from "../../../../state/qr-store";
import { LabeledHelpSelectField } from "./labeled-help-select-field";
import { openNativeColorPicker } from "./open-native-color-picker";
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

export function RenderSection() {
  const {
    tier,
    render,
    setRenderModulePx,
    setRenderModuleGap,
    setRenderModuleStyle,
    setRenderFinderStyle,
    setRenderFgColor,
    setRenderBgColor,
    setRenderBgTransparent,
    setRenderGapMode,
    setRenderCornerRadius,
    setRenderFrameStyle,
    setRenderFrameText,
    setRenderGradient,
    setRenderAlignmentStyle,
    setRenderTimingStyle,
  } = useQRStore();
  const { t } = useTranslation();

  const [newPaletteColor, setNewPaletteColor] = useState("#000000");

  return (
    <div className="space-y-4">
      {/* Module Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Label>
              <HighlightedLabel>{t("qr.moduleSize")}</HighlightedLabel>
            </Label>
            <HelpLink anchor="section-8" />
          </div>
          <span className="text-sm text-muted-foreground">
            {t("qr.nPx", { count: render.modulePx })}
          </span>
        </div>
        <Slider
          data-testid={DynamicTestId.resolve(
            "render-module-size-slider",
            "render-module-size-slider",
          )}
          value={[render.modulePx]}
          onValueChange={([v]) => setRenderModulePx(v)}
          min={2}
          max={20}
          step={1}
          title={t("hints.moduleSize")}
        />
      </div>

      {/* Module Gap */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Label>
              <HighlightedLabel>{t("render.moduleGap")}</HighlightedLabel>
            </Label>
            <HelpLink anchor="section-12" />
          </div>
          <span className="text-sm text-muted-foreground">
            {t("qr.nPercent", { count: render.moduleGapPercent })}
          </span>
        </div>
        <Slider
          data-testid={DynamicTestId.resolve(
            "render-module-gap-slider",
            "render-module-gap-slider",
          )}
          value={[render.moduleGapPercent]}
          onValueChange={([v]) => setRenderModuleGap(v)}
          min={0}
          max={30}
          step={1}
          title={t("hints.moduleGap")}
        />
      </div>

      {/* Module Style */}
      <LabeledHelpSelectField
        anchor="section-8"
        label={t("render.shape")}
        onValueChange={(v) => setRenderModuleStyle(v as ModuleStyle)}
        testId="render-module-style-select"
        title={t("hints.moduleStyle")}
        value={render.moduleStyle}
      >
        <SelectItem value="square">{t("render.square")}</SelectItem>
        <SelectItem value="rounded">{t("render.rounded")}</SelectItem>
        <SelectItem value="dots">{t("render.dots")}</SelectItem>
        <SelectItem value="diamond">{t("render.diamond")}</SelectItem>
        <SelectItem value="connected">{t("render.connected")}</SelectItem>
      </LabeledHelpSelectField>

      {/* Finder Style */}
      <LabeledHelpSelectField
        anchor="section-9"
        label={t("render.finderStyle")}
        onValueChange={(v) => setRenderFinderStyle(v as FinderStyle)}
        testId="render-finder-style-select"
        title={t("hints.finderStyle")}
        value={render.finderStyle}
      >
        <SelectItem value="square">{t("render.square")}</SelectItem>
        <SelectItem value="rounded">{t("render.rounded")}</SelectItem>
        <SelectItem value="circle">{t("render.circle")}</SelectItem>
      </LabeledHelpSelectField>

      {/* Alignment Pattern Style */}
      <LabeledHelpSelectField
        label={t("render.alignmentStyle")}
        onValueChange={(v) => setRenderAlignmentStyle(v as AlignmentStyle)}
        testId="render-alignment-style-select"
        title={t("hints.alignmentStyle")}
        value={render.alignmentStyle}
      >
        <SelectItem value="match_finder">{t("render.matchFinder")}</SelectItem>
        <SelectItem value="square">{t("render.square")}</SelectItem>
        <SelectItem value="rounded">{t("render.rounded")}</SelectItem>
        <SelectItem value="circle">{t("render.circle")}</SelectItem>
      </LabeledHelpSelectField>

      {/* Timing Pattern Style */}
      <LabeledHelpSelectField
        label={t("render.timingStyle")}
        onValueChange={(v) => setRenderTimingStyle(v as TimingStyle)}
        testId="render-timing-style-select"
        title={t("hints.timingStyle")}
        value={render.timingStyle}
      >
        <SelectItem value="match_module">{t("render.matchModule")}</SelectItem>
        <SelectItem value="solid">{t("render.solid")}</SelectItem>
        <SelectItem value="dashed">{t("render.dashed")}</SelectItem>
      </LabeledHelpSelectField>

      {/* Colors */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label>
            <HighlightedLabel>{t("render.gradientColors")}</HighlightedLabel>
          </Label>
          <HelpLink anchor="section-11" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <HexColorField
            label={t("render.foreground")}
            onChange={setRenderFgColor}
            pickerTestId="render-fg-color-picker"
            pickerTitle={t("hints.pickFgColor")}
            textTestId="render-fg-color-text"
            textTitle={t("hints.fgColorHex")}
            value={render.fgColor}
          />
          <HexColorField
            label={t("render.background")}
            onChange={setRenderBgColor}
            pickerTestId="render-bg-color-picker"
            pickerTitle={t("hints.pickBgColor")}
            textTestId="render-bg-color-text"
            textTitle={t("hints.bgColorHex")}
            value={render.bgColor}
          />
        </div>
      </div>

      {/* Transparent Background */}
      <div className="flex items-center justify-between">
        <Label>
          <HighlightedLabel>{t("render.transparentBg")}</HighlightedLabel>
        </Label>
        <Switch
          data-testid={DynamicTestId.resolve(
            "render-transparent-bg-switch",
            "render-transparent-bg-switch",
          )}
          checked={render.bgTransparent}
          onCheckedChange={setRenderBgTransparent}
          title={t("hints.transparentBg")}
        />
      </div>

      {/* Advanced Options */}
      {(tier === "advanced" || tier === "professional") && (
        <>
          {/* Gap Mode */}
          <LabeledHelpSelectField
            label={t("render.gapMode")}
            onValueChange={(v) => setRenderGapMode(v as GapMode)}
            testId="render-gap-mode-select"
            title={t("hints.gapMode")}
            value={render.gapMode}
          >
            <SelectItem value="none">{t("render.none")}</SelectItem>
            <SelectItem value="inset">{t("render.inset")}</SelectItem>
            <SelectItem value="stroke">{t("render.stroke")}</SelectItem>
            <SelectItem value="negative_space">{t("render.negativeSpace")}</SelectItem>
          </LabeledHelpSelectField>

          {/* Corner Radius */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t("render.cornerRadius")}</HighlightedLabel>
              </Label>
              <span className="text-sm text-muted-foreground">
                {t("qr.nPercent", { count: render.cornerRadius })}
              </span>
            </div>
            <Slider
              data-testid={DynamicTestId.resolve(
                "render-corner-radius-slider",
                "render-corner-radius-slider",
              )}
              value={[render.cornerRadius]}
              onValueChange={([v]) => setRenderCornerRadius(v)}
              min={0}
              max={100}
              step={5}
              title={t("hints.cornerRadius")}
            />
          </div>

          {/* Gradient */}
          <LabeledHelpSelectField
            anchor="section-11"
            label={t("render.gradient")}
            onValueChange={(v) => setRenderGradient({ type: v as GradientType })}
            testId="render-gradient-type-select"
            title={t("hints.gradient")}
            value={render.gradient.type}
          >
            <SelectItem value="none">{t("render.none")}</SelectItem>
            <SelectItem value="linear">{t("render.linear")}</SelectItem>
            <SelectItem value="radial">{t("render.radial")}</SelectItem>
            <SelectItem value="conic">{t("render.conic")}</SelectItem>
          </LabeledHelpSelectField>

          {/* Eye Styles */}
          <LabeledHelpSelectField
            label={t("render.eyeOuterStyle")}
            onValueChange={(v) =>
              useQRStore.setState((s) => ({
                render: { ...s.render, eyeOuterStyle: v as FinderStyle },
              }))
            }
            testId="render-eye-outer-style-select"
            title={t("hints.eyeOuterStyle")}
            value={render.eyeOuterStyle}
          >
            <SelectItem value="square">{t("render.square")}</SelectItem>
            <SelectItem value="rounded">{t("render.rounded")}</SelectItem>
            <SelectItem value="circle">{t("render.circle")}</SelectItem>
          </LabeledHelpSelectField>

          <LabeledHelpSelectField
            label={t("render.eyeInnerStyle")}
            onValueChange={(v) =>
              useQRStore.setState((s) => ({
                render: { ...s.render, eyeInnerStyle: v as FinderStyle },
              }))
            }
            testId="render-eye-inner-style-select"
            title={t("hints.eyeInnerStyle")}
            value={render.eyeInnerStyle}
          >
            <SelectItem value="square">{t("render.square")}</SelectItem>
            <SelectItem value="rounded">{t("render.rounded")}</SelectItem>
            <SelectItem value="circle">{t("render.circle")}</SelectItem>
          </LabeledHelpSelectField>

          {/* Frame */}
          <LabeledHelpSelectField
            anchor="section-32"
            label={t("render.frameStyle")}
            onValueChange={(v) => setRenderFrameStyle(v as FrameStyle)}
            testId="render-frame-style-select"
            title={t("hints.frameStyle")}
            value={render.frameStyle}
          >
            <SelectItem value="none">{t("render.none")}</SelectItem>
            <SelectItem value="rounded_frame">{t("render.roundedFrame")}</SelectItem>
            <SelectItem value="sticker">{t("render.sticker")}</SelectItem>
            <SelectItem value="tag">{t("render.tag")}</SelectItem>
          </LabeledHelpSelectField>

          {render.frameStyle !== "none" && (
            <div className="space-y-2">
              <Label>
                <HighlightedLabel>{t("render.frameText")}</HighlightedLabel>
              </Label>
              <Input
                data-testid={DynamicTestId.resolve(
                  "render-frame-text-input",
                  "render-frame-text-input",
                )}
                value={render.frameText}
                onChange={(e) => setRenderFrameText(e.target.value)}
                placeholder={t("accessibility.scanMePlaceholder")}
                title={t("hints.frameText")}
              />
            </div>
          )}

          {/* Dot Rotation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t("render.dotRotation")}</HighlightedLabel>
              </Label>
              <span className="text-sm text-muted-foreground">
                {t("qr.nDegrees", { count: render.dotRotationDeg })}
              </span>
            </div>
            <Slider
              data-testid={DynamicTestId.resolve(
                "render-dot-rotation-slider",
                "render-dot-rotation-slider",
              )}
              value={[render.dotRotationDeg]}
              onValueChange={([v]) =>
                useQRStore.setState((s) => ({ render: { ...s.render, dotRotationDeg: v } }))
              }
              min={0}
              max={360}
              step={15}
              title={t("hints.dotRotation")}
            />
          </div>

          {/* Eye Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t("render.eyeScale")}</HighlightedLabel>
              </Label>
              <span className="text-sm text-muted-foreground">
                {t("qr.nPercent", { count: render.eyeScale })}
              </span>
            </div>
            <Slider
              data-testid={DynamicTestId.resolve(
                "render-eye-scale-slider",
                "render-eye-scale-slider",
              )}
              value={[render.eyeScale]}
              onValueChange={([v]) =>
                useQRStore.setState((s) => ({ render: { ...s.render, eyeScale: v } }))
              }
              min={50}
              max={150}
              step={5}
              title={t("hints.eyeScale")}
            />
          </div>
        </>
      )}

      {/* Professional Options */}
      {tier === "professional" && (
        <>
          {/* Crisp Edges */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t("render.crispEdges")}</HighlightedLabel>
              </Label>
              <Switch
                checked={render.crispEdges}
                onCheckedChange={(checked) =>
                  useQRStore.setState((s) => ({ render: { ...s.render, crispEdges: checked } }))
                }
                title={t("hints.crispEdges")}
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("render.crispEdgesDesc")}</p>
          </div>

          {/* Pixel Snap */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t("render.pixelSnap")}</HighlightedLabel>
            </Label>
            <Select
              value={render.pixelSnap}
              onValueChange={(v) =>
                useQRStore.setState((s) => ({
                  render: { ...s.render, pixelSnap: v as "floor" | "round" | "ceil" },
                }))
              }
            >
              <SelectTrigger title={t("hints.pixelSnap")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="floor">{t("render.floor")}</SelectItem>
                <SelectItem value="round">{t("render.round")}</SelectItem>
                <SelectItem value="ceil">{t("render.ceil")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Per-Module Color Mode */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t("render.perModuleColorMode")}</HighlightedLabel>
            </Label>
            <Select
              value={render.perModuleColorMode}
              onValueChange={(v) =>
                useQRStore.setState((s) => ({
                  render: {
                    ...s.render,
                    perModuleColorMode: v as typeof render.perModuleColorMode,
                  },
                }))
              }
            >
              <SelectTrigger title={t("hints.perModuleColor")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">{t("render.solid")}</SelectItem>
                <SelectItem value="by_brightness">{t("render.byBrightness")}</SelectItem>
                <SelectItem value="by_position">{t("render.byPosition")}</SelectItem>
                <SelectItem value="by_overlay">{t("render.byOverlay")}</SelectItem>
                <SelectItem value="by_cluster">{t("render.byCluster")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Palette */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t("render.colorPalette")}</HighlightedLabel>
            </Label>
            <div className="flex flex-wrap gap-2">
              {render.palette.map((color, index) => (
                <div key={`palette-${color}-${index}`} className="flex items-center gap-1">
                  <button
                    type="button"
                    className="w-6 h-6 rounded border cursor-pointer"
                    style={{ backgroundColor: color }}
                    onClick={() => openNativeColorPicker(render.palette, index)}
                    aria-label={`Edit color ${color}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      const newPalette = render.palette.filter((_, i) => i !== index);
                      useQRStore.setState((s) => ({
                        render: { ...s.render, palette: newPalette },
                      }));
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="color"
                value={newPaletteColor}
                onChange={(e) => setNewPaletteColor(e.target.value)}
                className="w-10 h-8 p-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  useQRStore.setState((s) => ({
                    render: { ...s.render, palette: [...s.render.palette, newPaletteColor] },
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> {t("render.addColor")}
              </Button>
            </div>
          </div>

          {/* Palette Mode - only show when palette has colors */}
          {render.palette.length > 0 && (
            <div className="space-y-2">
              <Label>
                <HighlightedLabel>{t("render.paletteMode")}</HighlightedLabel>
              </Label>
              <Select
                value={render.paletteMode}
                onValueChange={(v) =>
                  useQRStore.setState((s) => ({
                    render: { ...s.render, paletteMode: v as typeof render.paletteMode },
                  }))
                }
              >
                <SelectTrigger title={t("hints.paletteMode")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="position">{t("render.paletteModePosition")}</SelectItem>
                  <SelectItem value="brightness">{t("render.paletteModeBrightness")}</SelectItem>
                  <SelectItem value="diagonal">{t("render.paletteModeDiagonal")}</SelectItem>
                  <SelectItem value="radial">{t("render.paletteModeRadial")}</SelectItem>
                  <SelectItem value="random">{t("render.paletteModeRandom")}</SelectItem>
                  <SelectItem value="row">{t("render.paletteModeRow")}</SelectItem>
                  <SelectItem value="column">{t("render.paletteModeColumn")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Contrast Guard */}
          <div className="flex items-center justify-between">
            <Label>
              <HighlightedLabel>{t("render.contrastGuard")}</HighlightedLabel>
            </Label>
            <Switch
              checked={render.contrastGuard}
              onCheckedChange={(checked) =>
                useQRStore.setState((s) => ({ render: { ...s.render, contrastGuard: checked } }))
              }
              title={t("hints.contrastGuard")}
            />
          </div>

          {render.contrastGuard && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  <HighlightedLabel>{t("render.minContrastRatio")}</HighlightedLabel>
                </Label>
                <span className="text-sm text-muted-foreground">
                  {t("qr.contrastRatio", { count: render.minContrastRatio })}
                </span>
              </div>
              <Slider
                value={[render.minContrastRatio]}
                onValueChange={([v]) =>
                  useQRStore.setState((s) => ({ render: { ...s.render, minContrastRatio: v } }))
                }
                min={1}
                max={21}
                step={0.5}
                title={t("hints.minContrastRatio")}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
