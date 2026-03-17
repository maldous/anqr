import type { TFunction } from "i18next";
import { isNonEmpty, isValidStoreId } from "@/modules/payload-generators";
import type { QRState } from "@/store/qr-store";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";
import type { JPQRForm } from "../payload-section-types";
import { ValidatedTextField } from "./validated-text-field";

export const JpqrEditor = ({
  jpqrForm,
  payload,
  setJpqrForm,
  t,
}: Readonly<{
  jpqrForm: JPQRForm;
  payload: QRState["payload"];
  setJpqrForm: React.Dispatch<React.SetStateAction<JPQRForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <ValidatedTextField
      label={t("placeholders.storeId")}
      placeholder={t("placeholders.jpStoreIdPlaceholder")}
      value={jpqrForm.storeId}
      onChange={(value) => setJpqrForm({ ...jpqrForm, storeId: value })}
      invalid={payload.validate && jpqrForm.storeId !== "" && !isValidStoreId(jpqrForm.storeId)}
      invalidMessage={t("validation.invalidStoreId", "Enter a valid store ID")}
    />
    <ValidatedTextField
      label={t("payload.merchantName")}
      placeholder={t("placeholders.jpMerchantNamePlaceholder")}
      value={jpqrForm.merchantName}
      onChange={(value) => setJpqrForm({ ...jpqrForm, merchantName: value })}
      invalid={payload.validate && !isNonEmpty(jpqrForm.merchantName)}
      invalidMessage={t("validation.requiredField", "This field is required")}
    />
    <div className="space-y-2">
      <Label>
        {t("payload.amount")} (JPY) {t("common.optional")}
      </Label>
      <Input
        type="number"
        placeholder="0"
        value={jpqrForm.amount}
        onChange={(e) => setJpqrForm({ ...jpqrForm, amount: e.target.value })}
      />
    </div>
    <p className="text-xs text-muted-foreground">{t("placeholders.jpqrHint")}</p>
  </div>
);
