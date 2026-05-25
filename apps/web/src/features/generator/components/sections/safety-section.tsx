import { useTranslation } from "react-i18next";
import { type SafetyMode, useQRStore } from "../../../../state/qr-store";
import {
  DynamicTestId,
  HelpLink,
  HighlightedLabel,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
} from "./section-ui";

export function SafetySection() {
  const {
    safety,
    qa,
    auto,
    overlay,
    setSafetyMode,
    setSafetyMinModulePx,
    setSafetyLocks,
    setQaSimulateBlur,
    setQaShowHeatmap,
    setAutoPickEcc,
  } = useQRStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Safety Mode */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <HighlightedLabel>{t("safety.safetyMode")}</HighlightedLabel>
          <HelpLink
            href="/guide#section-41"
            requiredTier="professional"
            title={t("common.learnMore")}
          />
        </Label>
        <Select value={safety.mode} onValueChange={(v) => setSafetyMode(v as SafetyMode)}>
          <SelectTrigger
            data-testid={DynamicTestId.resolve("safety-mode-trigger", "safety-mode-trigger")}
            title={t("hints.safetyMode")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            data-testid={DynamicTestId.resolve("safety-mode-content", "safety-mode-content")}
          >
            <SelectItem value="off">{t("safety.off")}</SelectItem>
            <SelectItem value="balanced">{t("safety.balanced")}</SelectItem>
            <SelectItem value="strict">{t("safety.strict")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {safety.mode !== "off" && (
        <>
          {/* Min Module Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t("safety.minModuleSize")}</HighlightedLabel>
              </Label>
              <span className="text-sm text-muted-foreground">
                {t("qr.nPx", { count: safety.minModulePx })}
              </span>
            </div>
            <Slider
              data-testid={DynamicTestId.resolve(
                "safety-min-module-slider",
                "safety-min-module-slider",
              )}
              value={[safety.minModulePx]}
              onValueChange={([v]) => setSafetyMinModulePx(v)}
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Min Quiet Zone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t("safety.minQuietZone")}</HighlightedLabel>
              </Label>
              <span className="text-sm text-muted-foreground">
                {t("qr.nModules", { count: safety.minQuietZoneModules })}
              </span>
            </div>
            <Slider
              data-testid={DynamicTestId.resolve(
                "safety-min-quiet-zone-slider",
                "safety-min-quiet-zone-slider",
              )}
              value={[safety.minQuietZoneModules]}
              onValueChange={([v]) =>
                useQRStore.setState((s) => ({ safety: { ...s.safety, minQuietZoneModules: v } }))
              }
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Locks */}
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <HighlightedLabel>{t("safety.protectionLocks")}</HighlightedLabel>
              <HelpLink
                href="/guide#section-54"
                requiredTier="professional"
                title={t("common.learnMore")}
              />
            </Label>
            <div className="flex items-center justify-between">
              <Label className="text-sm">
                <HighlightedLabel>{t("safety.lockFinders")}</HighlightedLabel>
              </Label>
              <Switch
                data-testid={DynamicTestId.resolve(
                  "safety-lock-finders-switch",
                  "safety-lock-finders-switch",
                )}
                checked={safety.lockFinders}
                onCheckedChange={(checked) => setSafetyLocks({ lockFinders: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">
                <HighlightedLabel>{t("safety.lockTiming")}</HighlightedLabel>
              </Label>
              <Switch
                data-testid={DynamicTestId.resolve(
                  "safety-lock-timing-switch",
                  "safety-lock-timing-switch",
                )}
                checked={safety.lockTiming}
                onCheckedChange={(checked) => setSafetyLocks({ lockTiming: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">
                <HighlightedLabel>{t("safety.lockAlignment")}</HighlightedLabel>
              </Label>
              <Switch
                data-testid={DynamicTestId.resolve(
                  "safety-lock-alignment-switch",
                  "safety-lock-alignment-switch",
                )}
                checked={safety.lockAlign}
                onCheckedChange={(checked) => setSafetyLocks({ lockAlign: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">
                <HighlightedLabel>{t("safety.lockFormat")}</HighlightedLabel>
              </Label>
              <Switch
                data-testid={DynamicTestId.resolve(
                  "safety-lock-format-switch",
                  "safety-lock-format-switch",
                )}
                checked={safety.lockFormat}
                onCheckedChange={(checked) => setSafetyLocks({ lockFormat: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">
                <HighlightedLabel>{t("safety.lockVersion")}</HighlightedLabel>
              </Label>
              <Switch
                data-testid={DynamicTestId.resolve(
                  "safety-lock-version-switch",
                  "safety-lock-version-switch",
                )}
                checked={safety.lockVersion}
                onCheckedChange={(checked) => setSafetyLocks({ lockVersion: checked })}
              />
            </div>
          </div>
        </>
      )}

      {/* QA / Analysis */}
      <div className="space-y-2 pt-2 border-t">
        <Label className="text-muted-foreground flex items-center gap-1.5">
          <HighlightedLabel>{t("safety.qualityAnalysis")}</HighlightedLabel>
          <HelpLink anchor="section-40" />
        </Label>

        {/*
          B13: previously had a "Contrast Check" switch bound to
          qa.contrastCheck — that flag had no downstream consumer, and
          the WCAG contrast panel in analyze renders unconditionally
          whenever detectedColors is present. Removed to stop the
          toggle being a visible no-op.
        */}

        <div className="flex items-center justify-between">
          <Label className="text-sm">
            <HighlightedLabel>{t("safety.showHeatmap")}</HighlightedLabel>
          </Label>
          <Switch
            data-testid={DynamicTestId.resolve(
              "safety-show-heatmap-switch",
              "safety-show-heatmap-switch",
            )}
            checked={qa.showHeatmap}
            onCheckedChange={setQaShowHeatmap}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">
              <HighlightedLabel>{t("safety.simulateBlur")}</HighlightedLabel>
            </Label>
            <span className="text-sm text-muted-foreground">
              {t("qr.nPx", { count: qa.simulateBlurPx })}
            </span>
          </div>
          <Slider
            data-testid={DynamicTestId.resolve(
              "safety-simulate-blur-slider",
              "safety-simulate-blur-slider",
            )}
            value={[qa.simulateBlurPx]}
            onValueChange={([v]) => setQaSimulateBlur(v)}
            min={0}
            max={10}
            step={0.5}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">
              <HighlightedLabel>{t("safety.simulateNoise")}</HighlightedLabel>
            </Label>
            <span className="text-sm text-muted-foreground">
              {t("qr.nPercent", { count: qa.simulateNoise })}
            </span>
          </div>
          <Slider
            data-testid={DynamicTestId.resolve(
              "safety-simulate-noise-slider",
              "safety-simulate-noise-slider",
            )}
            value={[qa.simulateNoise]}
            onValueChange={([v]) =>
              useQRStore.setState((s) => ({ qa: { ...s.qa, simulateNoise: v } }))
            }
            min={0}
            max={50}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">
              <HighlightedLabel>{t("safety.simulateRotation")}</HighlightedLabel>
            </Label>
            <span className="text-sm text-muted-foreground">
              {t("qr.nDegrees", { count: qa.simulateRotationDeg })}
            </span>
          </div>
          <Slider
            data-testid={DynamicTestId.resolve(
              "safety-simulate-rotation-slider",
              "safety-simulate-rotation-slider",
            )}
            value={[qa.simulateRotationDeg]}
            onValueChange={([v]) =>
              useQRStore.setState((s) => ({ qa: { ...s.qa, simulateRotationDeg: v } }))
            }
            min={0}
            max={45}
            step={1}
          />
        </div>
      </div>

      {/* Auto-Tuning */}
      <div className="space-y-2 pt-2 border-t">
        <Label className="text-muted-foreground flex items-center gap-1.5">
          <HighlightedLabel>{t("safety.autoTuning")}</HighlightedLabel>
          <HelpLink anchor="section-40" />
        </Label>

        {/*
          B12: previously had an "Auto-Pick Version" switch bound to
          auto.pickVersion — that flag had no consumer in the render
          pipeline. The QR version slider at value=0 already drives
          auto-picking (see qr-encoding-section), so the toggle was a
          visible no-op. Removed.
        */}

        <div className="flex items-center justify-between">
          <Label className="text-sm">
            <HighlightedLabel>{t("safety.autoPickEcc")}</HighlightedLabel>
          </Label>
          <Switch
            data-testid={DynamicTestId.resolve(
              "safety-auto-pick-ecc-switch",
              "safety-auto-pick-ecc-switch",
            )}
            checked={auto.pickEcc}
            onCheckedChange={setAutoPickEcc}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">
              <HighlightedLabel>{t("safety.autoReduceIntensity")}</HighlightedLabel>
            </Label>
            <p className="text-xs text-muted-foreground">{t("safety.untilScannable")}</p>
          </div>
          <Switch
            data-testid={DynamicTestId.resolve(
              "safety-auto-reduce-intensity-switch",
              "safety-auto-reduce-intensity-switch",
            )}
            checked={auto.reduceIntensityUntilSafe}
            onCheckedChange={(checked) =>
              useQRStore.setState((s) => ({
                auto: { ...s.auto, reduceIntensityUntilSafe: checked },
              }))
            }
          />
        </div>
      </div>

      {/* ECC-Aware Mode */}
      <div className="space-y-2 pt-2 border-t">
        <Label className="text-muted-foreground flex items-center gap-1.5">
          <HighlightedLabel>{t("safety.eccAwareMode")}</HighlightedLabel>
          <HelpLink
            href="/guide#section-55"
            requiredTier="professional"
            title={t("common.learnMore")}
          />
        </Label>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">
              <HighlightedLabel>{t("safety.eccAwareEnabled")}</HighlightedLabel>
            </Label>
            <p className="text-xs text-muted-foreground">{t("safety.eccAwareDesc")}</p>
          </div>
          <Switch
            data-testid={DynamicTestId.resolve(
              "safety-ecc-aware-enabled-switch",
              "safety-ecc-aware-enabled-switch",
            )}
            checked={overlay.eccAwareEnabled}
            onCheckedChange={(checked) =>
              useQRStore.setState((s) => ({ overlay: { ...s.overlay, eccAwareEnabled: checked } }))
            }
          />
        </div>

        {overlay.eccAwareEnabled && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">
                  <HighlightedLabel>{t("safety.eccAwareRiskBudget")}</HighlightedLabel>
                </Label>
                <span className="text-sm text-muted-foreground">
                  {t("qr.nPercent", { count: overlay.eccAwareRiskBudget })}
                </span>
              </div>
              <Slider
                data-testid={DynamicTestId.resolve(
                  "safety-ecc-risk-budget-slider",
                  "safety-ecc-risk-budget-slider",
                )}
                value={[overlay.eccAwareRiskBudget]}
                onValueChange={([v]) =>
                  useQRStore.setState((s) => ({ overlay: { ...s.overlay, eccAwareRiskBudget: v } }))
                }
                min={0}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">{t("safety.eccAwareRiskBudgetDesc")}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                <HighlightedLabel>{t("safety.eccAwareWeightMap")}</HighlightedLabel>
              </Label>
              <Select
                value={overlay.eccAwareWeightMap}
                onValueChange={(v) =>
                  useQRStore.setState((s) => ({
                    overlay: {
                      ...s.overlay,
                      eccAwareWeightMap: v as
                        | "distance_to_finders"
                        | "block_heatmap"
                        | "empirical_scan_heatmap",
                    },
                  }))
                }
              >
                <SelectTrigger
                  data-testid={DynamicTestId.resolve(
                    "safety-ecc-weight-map-trigger",
                    "safety-ecc-weight-map-trigger",
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  data-testid={DynamicTestId.resolve(
                    "safety-ecc-weight-map-content",
                    "safety-ecc-weight-map-content",
                  )}
                >
                  <SelectItem value="distance_to_finders">
                    {t("safety.eccMapDistanceToFinders")}
                  </SelectItem>
                  <SelectItem value="block_heatmap">{t("safety.eccMapBlockHeatmap")}</SelectItem>
                  <SelectItem value="empirical_scan_heatmap">
                    {t("safety.eccMapEmpiricalScan")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
