import type { TFunction } from "i18next";
import { HighlightedLabel } from "../../../search/search-context";
import { ECC_CAPACITIES_BYTE } from "../../../../../../../../packages/domain/qr/src/spec/constants";
import type { QRState } from "../../../../../state/qr-store";
import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";
import { Switch } from "../../../../../../../../packages/ui/web/src/primitives/switch";

export const ValidationOptionsEditor = ({
  getPayloadText,
  payload,
  qr,
  setPayloadValidation,
  t,
}: Readonly<{
  getPayloadText: QRState["getPayloadText"];
  payload: QRState["payload"];
  qr: QRState["qr"];
  setPayloadValidation: QRState["setPayloadValidation"];
  t: TFunction;
}>) => (
  <div className="space-y-2 pt-4 border-t">
    <Label className="text-muted-foreground text-xs">
      <HighlightedLabel>{t("payload.validationOptions")}</HighlightedLabel>
    </Label>
    <div className="flex items-center justify-between">
      <Label className="text-sm">
        <HighlightedLabel>{t("payload.validateInput")}</HighlightedLabel>
      </Label>
      <Switch
        checked={payload.validate}
        onCheckedChange={(checked) => setPayloadValidation({ validate: checked })}
        title={t("hints.validateInput")}
        data-testid={DynamicTestId.resolve("payload-validate-switch", "payload-validate-switch")}
      />
    </div>
    <div className="flex items-center justify-between">
      <Label className="text-sm">
        <HighlightedLabel>{t("payload.trimWhitespace")}</HighlightedLabel>
      </Label>
      <Switch
        checked={payload.trim}
        onCheckedChange={(checked) => setPayloadValidation({ trim: checked })}
        title={t("hints.trimWhitespace")}
        data-testid={DynamicTestId.resolve("payload-trim-switch", "payload-trim-switch")}
      />
    </div>
    <div className="flex items-center justify-between">
      <Label className="text-sm">
        <HighlightedLabel>{t("payload.normalizeNewlines")}</HighlightedLabel>
      </Label>
      <Switch
        checked={payload.normalizeNewlines}
        onCheckedChange={(checked) => setPayloadValidation({ normalizeNewlines: checked })}
        title={t("hints.normalizeNewlines")}
        data-testid={DynamicTestId.resolve(
          "payload-normalize-newlines-switch",
          "payload-normalize-newlines-switch",
        )}
      />
    </div>
    {qr.ecc === "L" &&
      (() => {
        const payloadText = getPayloadText();
        const byteLength = new TextEncoder().encode(payloadText).length;
        const effectiveVersion = qr.version > 0 ? qr.version : 40;
        const maxCapacity = ECC_CAPACITIES_BYTE[qr.ecc]?.[effectiveVersion - 1] || 2953;
        return byteLength > maxCapacity * 0.8 ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {t("hints.validationCapacity")}
          </p>
        ) : null;
      })()}
  </div>
);
