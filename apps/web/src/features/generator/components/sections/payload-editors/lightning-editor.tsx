import { isValidLightningInvoice } from "@/application/generator";
import { Label, Textarea } from "@/ui/web";
import type { TFunction } from "i18next";
import type { QRState } from "../../../../../state/qr-store";
import type { LightningForm } from "../payload-section-types";

export const LightningEditor = ({
  lightningForm,
  payload,
  setLightningForm,
  t,
}: Readonly<{
  lightningForm: LightningForm;
  payload: QRState["payload"];
  setLightningForm: React.Dispatch<React.SetStateAction<LightningForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>{t("placeholders.bolt11Invoice")}</Label>
      <Textarea
        placeholder={t("placeholders.lnbcPlaceholder")}
        className={`font-mono text-xs h-24 ${
          payload.validate &&
          lightningForm.invoice &&
          !isValidLightningInvoice(lightningForm.invoice)
            ? "border-destructive focus-visible:ring-destructive"
            : ""
        }`}
        value={lightningForm.invoice}
        onChange={(e) => setLightningForm({ invoice: e.target.value })}
      />
      {payload.validate &&
        lightningForm.invoice &&
        !isValidLightningInvoice(lightningForm.invoice) && (
          <p className="text-xs text-destructive">
            {t(
              "validation.invalidLightningInvoice",
              "Enter a valid Lightning invoice (starts with lnbc)",
            )}
          </p>
        )}
      <p className="text-xs text-muted-foreground">{t("placeholders.bolt11Hint")}</p>
    </div>
  </div>
);
