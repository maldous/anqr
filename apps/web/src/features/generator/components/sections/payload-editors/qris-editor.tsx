import type { TFunction } from "i18next";
import { isValidMerchantId } from "@/domain/payload/generators";
import type { QRState } from "../../../../../state/qr-store";
import type { QRISForm } from "../payload-section-types";
import { MerchantCityAmountEditor } from "./merchant-city-amount-editor";

export const QrisEditor = ({
  payload,
  qrisForm,
  setQrisForm,
  t,
}: Readonly<{
  payload: QRState["payload"];
  qrisForm: QRISForm;
  setQrisForm: React.Dispatch<React.SetStateAction<QRISForm>>;
  t: TFunction;
}>) => (
  <MerchantCityAmountEditor
    amountLabel={`${t("payload.amount")} (IDR) ${t("common.optional")}`}
    amountPlaceholder={t("placeholders.idrAmountPlaceholder")}
    amountValue={qrisForm.amount}
    cityLabel={`${t("payload.city")} ${t("common.optional")}`}
    cityPlaceholder={t("placeholders.jakartaPlaceholder")}
    cityValue={qrisForm.merchantCity}
    hint={t("placeholders.qrisHint")}
    invalidMessage={t("validation.requiredField", "This field is required")}
    merchantName={qrisForm.merchantName}
    merchantNamePlaceholder={t("placeholders.tokoPlaceholder")}
    onAmountChange={(value) => setQrisForm({ ...qrisForm, amount: value })}
    onCityChange={(value) => setQrisForm({ ...qrisForm, merchantCity: value })}
    onMerchantNameChange={(value) => setQrisForm({ ...qrisForm, merchantName: value })}
    onPrimaryChange={(value) => setQrisForm({ ...qrisForm, merchantId: value })}
    payload={payload}
    primaryInvalid={
      payload.validate && qrisForm.merchantId !== "" && !isValidMerchantId(qrisForm.merchantId)
    }
    primaryInvalidMessage={t("validation.invalidMerchantId", "Enter a valid merchant ID")}
    primaryLabel={t("placeholders.merchantId")}
    primaryPlaceholder={t("placeholders.qrisMerchantIdPlaceholder")}
    primaryValue={qrisForm.merchantId}
  />
);
