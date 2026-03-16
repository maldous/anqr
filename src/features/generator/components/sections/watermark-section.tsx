import { Upload, X } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/ui/primitives/button";
import { useQRStore } from "@/store/qr-store";
import { LabeledTestIdSelectField } from "./labeled-testid-select-field";
import {
  DynamicTestId,
  HelpLink,
  HighlightedLabel,
  Input,
  Label,
  SelectItem,
  Slider,
  Switch,
} from "./section-ui";

export function WatermarkSection() {
  const {
    watermark,
    setWatermarkEnabled,
    setWatermarkKind,
    setWatermarkText,
    setWatermarkPosition,
    setWatermarkOpacity,
  } = useQRStore();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      useQRStore.setState((s) => ({ watermark: { ...s.watermark, image: file } }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Enable */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Label>
            <HighlightedLabel>{t("watermark.enabled")}</HighlightedLabel>
          </Label>
          <HelpLink href="/guide#section-23" requiredTier="advanced" />
        </div>
        <Switch
          data-testid={DynamicTestId.resolve(
            "watermark-enabled-switch",
            "watermark-enabled-switch",
          )}
          checked={watermark.enabled}
          onCheckedChange={setWatermarkEnabled}
        />
      </div>

      {watermark.enabled && (
        <>
          {/* Kind */}
          <LabeledTestIdSelectField
            contentTestId="watermark-kind-content"
            label={t("watermark.type")}
            onValueChange={(v) => setWatermarkKind(v as typeof watermark.kind)}
            triggerTestId="watermark-kind-trigger"
            value={watermark.kind}
          >
            <SelectItem value="text">{t("watermark.text")}</SelectItem>
            <SelectItem value="image">{t("watermark.image")}</SelectItem>
            <SelectItem value="pattern">{t("watermark.pattern")}</SelectItem>
          </LabeledTestIdSelectField>

          {/* Text */}
          {watermark.kind === "text" && (
            <div className="space-y-2">
              <Label>
                <HighlightedLabel>{t("watermark.text")}</HighlightedLabel>
              </Label>
              <Input
                data-testid={DynamicTestId.resolve("watermark-text-input", "watermark-text-input")}
                value={watermark.text}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder={t("watermark.textPlaceholder")}
              />
            </div>
          )}

          {/* Image Upload - for image and pattern types (pattern uses image as tile source) */}
          {(watermark.kind === "image" || watermark.kind === "pattern") && (
            <div className="space-y-2">
              <Label>
                <HighlightedLabel>{t("watermark.image")}</HighlightedLabel>
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {watermark.image ? (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                  <span className="flex-1 text-sm truncate">{watermark.image.name}</span>
                  <Button
                    data-testid={DynamicTestId.resolve(
                      "watermark-clear-image-button",
                      "watermark-clear-image-button",
                    )}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() =>
                      useQRStore.setState((s) => ({ watermark: { ...s.watermark, image: null } }))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  data-testid={DynamicTestId.resolve(
                    "watermark-upload-button",
                    "watermark-upload-button",
                  )}
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t("watermark.uploadImage")}
                </Button>
              )}
            </div>
          )}

          {/* Position */}
          <LabeledTestIdSelectField
            contentTestId="watermark-position-content"
            label={t("watermark.position")}
            onValueChange={(v) => setWatermarkPosition(v as typeof watermark.position)}
            triggerTestId="watermark-position-trigger"
            value={watermark.position}
          >
            <SelectItem value="center">{t("watermark.center")}</SelectItem>
            <SelectItem value="corners">{t("watermark.corners")}</SelectItem>
            <SelectItem value="edges">{t("watermark.edges")}</SelectItem>
            <SelectItem value="behind">{t("watermark.behindQr")}</SelectItem>
            <SelectItem value="quiet_zone">{t("watermark.quietZone")}</SelectItem>
          </LabeledTestIdSelectField>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t("watermark.opacity")}</HighlightedLabel>
              </Label>
              <span className="text-sm text-muted-foreground">
                {t("qr.nPercent", { count: watermark.opacity })}
              </span>
            </div>
            <Slider
              data-testid={DynamicTestId.resolve(
                "watermark-opacity-slider",
                "watermark-opacity-slider",
              )}
              value={[watermark.opacity]}
              onValueChange={([v]) => setWatermarkOpacity(v)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {/* Blend Mode */}
          <LabeledTestIdSelectField
            contentTestId="watermark-blend-content"
            label={t("watermark.blendMode")}
            onValueChange={(v) =>
              useQRStore.setState((s) => ({
                watermark: { ...s.watermark, blend: v as typeof watermark.blend },
              }))
            }
            triggerTestId="watermark-blend-trigger"
            value={watermark.blend}
          >
            <SelectItem value="normal">{t("watermark.normal")}</SelectItem>
            <SelectItem value="multiply">{t("watermark.multiply")}</SelectItem>
            <SelectItem value="screen">{t("watermark.screen")}</SelectItem>
            <SelectItem value="overlay">{t("watermark.overlay")}</SelectItem>
          </LabeledTestIdSelectField>
        </>
      )}
    </div>
  );
}
