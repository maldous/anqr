import {
    isNonEmpty,
    isValidFpsId,
} from "@/application/generator";
import { Input, Label } from "@/ui/web";
import type { TFunction } from "i18next";
import type { QRState } from "../../../../../state/qr-store";
import type { HKQRForm } from "../payload-section-types";

export const HkqrEditor = ({
  hkqrForm,
  payload,
  setHkqrForm,
  t,
}: Readonly<{
  hkqrForm: HKQRForm;
  payload: QRState["payload"];
  setHkqrForm: React.Dispatch<React.SetStateAction<HKQRForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        {t("placeholders.fpsId")} {t("common.optional")}
      </Label>
      <Input
        placeholder="1234567890"
        value={hkqrForm.fpsId}
        onChange={(e) => setHkqrForm({ ...hkqrForm, fpsId: e.target.value })}
        className={
          payload.validate && hkqrForm.fpsId && !isValidFpsId(hkqrForm.fpsId)
            ? "border-destructive focus-visible:ring-destructive"
            : ""
        }
      />
      {payload.validate && hkqrForm.fpsId && !isValidFpsId(hkqrForm.fpsId) && (
        <p className="text-xs text-destructive">
          {t("validation.invalidFpsId", "Enter a valid FPS ID (7-9 digits)")}
        </p>
      )}
      <p className="text-xs text-muted-foreground">{t("placeholders.fpsHint")}</p>
    </div>
    <div className="space-y-2">
      <Label>
        {t("payload.merchantName")} {t("common.optional")}
      </Label>
      <Input
        placeholder={t("placeholders.fullName")}
        value={hkqrForm.merchantName}
        onChange={(e) => setHkqrForm({ ...hkqrForm, merchantName: e.target.value })}
        className={
          payload.validate && hkqrForm.merchantName && !isNonEmpty(hkqrForm.merchantName)
            ? "border-destructive focus-visible:ring-destructive"
            : ""
        }
      />
      {payload.validate && hkqrForm.merchantName && !isNonEmpty(hkqrForm.merchantName) && (
        <p className="text-xs text-destructive">
          {t("validation.invalidMerchantName", "Enter a valid merchant name")}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label>
        {t("payload.amount")} (HKD) {t("common.optional")}
      </Label>
      <Input
        type="number"
        placeholder="0.00"
        value={hkqrForm.amount}
        onChange={(e) => setHkqrForm({ ...hkqrForm, amount: e.target.value })}
      />
    </div>
    <p className="text-xs text-muted-foreground">
      {t("placeholders.hkqrHint", "Hong Kong FPS (Faster Payment System) QR code.")}
    </p>
  </div>
);
