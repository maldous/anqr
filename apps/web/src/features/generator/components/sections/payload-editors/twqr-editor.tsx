import type { TFunction } from "i18next";
import {
  isNonEmpty,
  isValidMerchantId,
} from "../../../../../../../../packages/domain/payload/src/payload-generators";
import type { QRState } from "../../../../../state/qr-store";
import type { TWQRForm } from "../payload-section-types";
import { ValidatedTextField } from "./validated-text-field";

export const TwqrEditor = ({
  payload,
  setTwqrForm,
  t,
  twqrForm,
}: Readonly<{
  payload: QRState["payload"];
  setTwqrForm: React.Dispatch<React.SetStateAction<TWQRForm>>;
  t: TFunction;
  twqrForm: TWQRForm;
}>) => (
  <div className="space-y-4">
    <ValidatedTextField
      label={t("placeholders.merchantId")}
      placeholder={t("placeholders.twMerchantIdPlaceholder")}
      value={twqrForm.merchantId}
      onChange={(value) => setTwqrForm({ ...twqrForm, merchantId: value })}
      invalid={
        payload.validate && twqrForm.merchantId !== "" && !isValidMerchantId(twqrForm.merchantId)
      }
      invalidMessage={t("validation.invalidMerchantId", "Enter a valid merchant ID")}
    />
    <ValidatedTextField
      label={t("payload.merchantName")}
      placeholder={t("placeholders.twMerchantNamePlaceholder")}
      value={twqrForm.merchantName}
      onChange={(value) => setTwqrForm({ ...twqrForm, merchantName: value })}
      invalid={payload.validate && !isNonEmpty(twqrForm.merchantName)}
      invalidMessage={t("validation.requiredField", "This field is required")}
    />
    <ValidatedTextField
      label={`${t("payload.amount")} (TWD) ${t("common.optional")}`}
      placeholder="0"
      value={twqrForm.amount}
      onChange={(value) => setTwqrForm({ ...twqrForm, amount: value })}
      invalid={false}
      invalidMessage=""
      type="number"
    />
    <p className="text-xs text-muted-foreground">{t("placeholders.twqrHint")}</p>
  </div>
);
