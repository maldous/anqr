import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { calculateOptimalVersion } from "@/application/generator";
import {
  type CharacterEncoding,
  type ECCLevel,
  type EncodingMode,
  type MaskPattern,
  useQRStore,
} from "../../../../state/qr-store";
import { LabeledHelpSelectField } from "./labeled-help-select-field";
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

// Short debounce for version slider to batch rapid changes while sliding
// The main useQRGenerator debounce (300ms) handles the expensive computation
const VERSION_DEBOUNCE_MS = 100;

export function QREncodingSection() {
  const {
    tier,
    qr,
    overlay,
    setQrVersion,
    setQrEcc,
    setQrEncodingMode,
    setQrMaskPattern,
    setQrCharacterEncoding,
    setQrQuietZone,
    setQrQuietZoneMinEnforce,
    getPayloadText,
  } = useQRStore();

  const isArtworkMode = overlay.enabled && overlay.mode === "artwork";
  const { t } = useTranslation();

  // Local version state for immediate slider feedback
  // This allows the slider to move instantly while debouncing the expensive store update
  const [localVersion, setLocalVersion] = useState(qr.version);
  const versionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local version when store version changes externally (e.g., URL params, presets)
  useEffect(() => {
    // Cancel any pending debounced update when store version changes externally
    // This prevents a race where external change + pending timeout fight each other
    if (versionDebounceRef.current) {
      clearTimeout(versionDebounceRef.current);
    }
    setLocalVersion(qr.version);
  }, [qr.version]);

  // Calculate minimum required version for current content
  const minRequiredVersion = useMemo(() => {
    const content = getPayloadText();
    if (!content) return 1;
    return calculateOptimalVersion(content, qr.ecc);
  }, [getPayloadText, qr.ecc]);

  // Handle version change with debounce - immediate visual feedback, delayed computation
  const handleVersionChange = (value: number) => {
    // Update local state immediately for responsive slider
    setLocalVersion(value);

    // Clear any pending debounced update
    if (versionDebounceRef.current) {
      clearTimeout(versionDebounceRef.current);
    }

    // Debounce the actual store update to prevent expensive computation while sliding
    versionDebounceRef.current = setTimeout(() => {
      let finalValue = value;
      if (value === 0) {
        // Auto mode is always allowed
        finalValue = 0;
      } else if (value < minRequiredVersion) {
        // Jump to minimum required version
        finalValue = minRequiredVersion;
        setLocalVersion(finalValue); // Sync local to corrected value
      }
      setQrVersion(finalValue);
    }, VERSION_DEBOUNCE_MS);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (versionDebounceRef.current) {
        clearTimeout(versionDebounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Version */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Label>
              <HighlightedLabel>{t("qr.version")}</HighlightedLabel>
            </Label>
            <HelpLink anchor="section-6" />
          </div>
          <span className="text-sm text-muted-foreground">
            {localVersion === 0 ? t("qr.autoMin", { version: minRequiredVersion }) : localVersion}
          </span>
        </div>
        <Slider
          data-testid={DynamicTestId.resolve("qr-version-slider", "qr-version-slider")}
          value={[localVersion]}
          onValueChange={([v]) => handleVersionChange(v)}
          min={0}
          max={40}
          step={1}
          title={t("hints.qrVersion")}
        />
        <p className="text-xs text-muted-foreground">
          {(() => {
            if (localVersion === 0) {
              return t("hints.autoDetect", { version: minRequiredVersion });
            }
            if (localVersion < minRequiredVersion) {
              return t("hints.versionTooLow", { version: minRequiredVersion });
            }
            return t("hints.autoMinVersion", { version: minRequiredVersion });
          })()}
        </p>
      </div>

      {/* Error Correction Level */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label>
            <HighlightedLabel>{t("qr.errorCorrection")}</HighlightedLabel>
          </Label>
          <HelpLink anchor="section-6" />
        </div>
        <Select
          value={qr.ecc}
          onValueChange={(v) => setQrEcc(v as ECCLevel)}
          disabled={isArtworkMode}
        >
          <SelectTrigger
            data-testid={DynamicTestId.resolve("qr-ecc-select", "qr-ecc-select")}
            title={t("hints.errorCorrection")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">{t("qr.low")}</SelectItem>
            <SelectItem value="M">{t("qr.medium")}</SelectItem>
            <SelectItem value="Q">{t("qr.quartile")}</SelectItem>
            <SelectItem value="H">{t("qr.high")}</SelectItem>
          </SelectContent>
        </Select>
        {isArtworkMode ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {t("overlay.artworkRequiresLowEcc")}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{t("hints.higherEccLargerQr")}</p>
        )}
      </div>

      {/* Quiet Zone / Margin */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Label>
              <HighlightedLabel>{t("qr.margin")}</HighlightedLabel>
            </Label>
            <HelpLink anchor="section-7" />
          </div>
          <span className="text-sm text-muted-foreground">
            {t("qr.nModules", { count: qr.quietZoneModules })}
          </span>
        </div>
        <Slider
          data-testid={DynamicTestId.resolve("qr-quiet-zone-slider", "qr-quiet-zone-slider")}
          value={[qr.quietZoneModules]}
          onValueChange={([v]) => setQrQuietZone(v)}
          min={0}
          max={10}
          step={1}
          title={t("hints.quietZone")}
        />
      </div>

      {/* Advanced Options */}
      {(tier === "advanced" || tier === "professional") && (
        <>
          {/* Encoding Mode */}
          <LabeledHelpSelectField
            anchor="section-6"
            label={t("qr.encodingMode")}
            onValueChange={(v) => setQrEncodingMode(v as EncodingMode)}
            testId="qr-encoding-mode-select"
            title={t("hints.encodingMode")}
            value={qr.encodingMode}
          >
            <SelectItem value="auto">{t("qr.autoOptimal")}</SelectItem>
            <SelectItem value="numeric">{t("qr.numericOnly")}</SelectItem>
            <SelectItem value="alphanumeric">{t("qr.alphanumeric")}</SelectItem>
            <SelectItem value="byte">{t("qr.byteUtf8")}</SelectItem>
            <SelectItem value="kanji">{t("qr.kanji")}</SelectItem>
          </LabeledHelpSelectField>

          {/* Character Encoding */}
          <div className="space-y-2">
            <LabeledHelpSelectField
              anchor="section-6"
              label={t("qr.characterEncoding")}
              onValueChange={(v) => setQrCharacterEncoding(v as CharacterEncoding)}
              testId="qr-character-encoding-select"
              title={t("hints.characterEncoding")}
              value={qr.characterEncoding}
            >
              <SelectItem value="default">{t("qr.latin1Default")}</SelectItem>
              <SelectItem value="utf8">{t("qr.utf8Unicode")}</SelectItem>
              <SelectItem value="iso-8859-1">{t("qr.iso88591")}</SelectItem>
              <SelectItem value="shift-jis">{t("qr.shiftJis")}</SelectItem>
            </LabeledHelpSelectField>
            <p className="text-xs text-muted-foreground">{t("hints.characterEncodingNote")}</p>
          </div>

          {/* Mask Pattern */}
          <div className="space-y-2">
            <LabeledHelpSelectField
              anchor="section-6"
              label={t("qr.mask")}
              onValueChange={(v) =>
                setQrMaskPattern(v === "auto" ? "auto" : (Number.parseInt(v, 10) as MaskPattern))
              }
              testId="qr-mask-pattern-select"
              title={t("hints.maskPattern")}
              value={String(qr.maskPattern)}
            >
              <SelectItem value="auto">{t("qr.autoOptimal")}</SelectItem>
              <SelectItem value="0">{t("qr.maskPattern0")}</SelectItem>
              <SelectItem value="1">{t("qr.maskPattern1")}</SelectItem>
              <SelectItem value="2">{t("qr.maskPattern2")}</SelectItem>
              <SelectItem value="3">{t("qr.maskPattern3")}</SelectItem>
              <SelectItem value="4">{t("qr.maskPattern4")}</SelectItem>
              <SelectItem value="5">{t("qr.maskPattern5")}</SelectItem>
              <SelectItem value="6">{t("qr.maskPattern6")}</SelectItem>
              <SelectItem value="7">{t("qr.maskPattern7")}</SelectItem>
            </LabeledHelpSelectField>
            <p className="text-xs text-muted-foreground">{t("hints.maskPatternNote")}</p>
          </div>

          {/* Min Quiet Zone Enforce */}
          <div className="flex items-center justify-between">
            <div>
              <Label>
                <HighlightedLabel>{t("qr.enforceMinQuietZone")}</HighlightedLabel>
              </Label>
              <p className="text-xs text-muted-foreground">{t("qr.enforceMinQuietZoneDesc")}</p>
            </div>
            <Switch
              data-testid={DynamicTestId.resolve(
                "qr-quiet-zone-enforce-switch",
                "qr-quiet-zone-enforce-switch",
              )}
              checked={qr.quietZoneMinEnforce}
              onCheckedChange={setQrQuietZoneMinEnforce}
              title={t("hints.enforceMinQuietZone")}
            />
          </div>
        </>
      )}

      {/* Professional Options */}
      {tier === "professional" && (
        <>
          {/* Border Modules Extra */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label>{t("qr.extraBorderModules")}</Label>
              <span className="text-sm text-muted-foreground">{qr.borderModulesExtra}</span>
            </div>
            <Slider
              value={[qr.borderModulesExtra]}
              onValueChange={([v]) =>
                useQRStore.setState((s) => ({ qr: { ...s.qr, borderModulesExtra: v } }))
              }
              min={0}
              max={10}
              step={1}
              title={t("hints.extraBorder")}
            />
            <p className="text-xs text-muted-foreground">{t("qr.additionalBorder")}</p>
          </div>
        </>
      )}
    </div>
  );
}
