import type { TFunction } from "i18next";
import { isValidAccountNumber } from "@/domain/payload/generators";
import type { QRState } from "../../../../../state/qr-store";
import type { QRPhForm } from "../payload-section-types";
import { MerchantCityAmountEditor } from "./merchant-city-amount-editor";

export const QrphEditor = ({
  payload,
  qrphForm,
  setQrphForm,
  t,
}: Readonly<{
  payload: QRState["payload"];
  qrphForm: QRPhForm;
  setQrphForm: React.Dispatch<React.SetStateAction<QRPhForm>>;
  t: TFunction;
}>) => (
  <MerchantCityAmountEditor
    amountLabel={`${t("payload.amount")} (PHP) ${t("common.optional")}`}
    amountPlaceholder="0.00"
    amountValue={qrphForm.amount}
    cityLabel={`${t("payload.city")} ${t("common.optional")}`}
    cityPlaceholder={t("placeholders.manilaPlaceholder")}
    cityValue={qrphForm.merchantCity}
    hint={t("placeholders.qrphHint")}
    invalidMessage={t("validation.requiredField", "This field is required")}
    merchantName={qrphForm.merchantName}
    merchantNamePlaceholder={t("placeholders.filipinoName")}
    onAmountChange={(value) => setQrphForm({ ...qrphForm, amount: value })}
    onCityChange={(value) => setQrphForm({ ...qrphForm, merchantCity: value })}
    onMerchantNameChange={(value) => setQrphForm({ ...qrphForm, merchantName: value })}
    onPrimaryChange={(value) => setQrphForm({ ...qrphForm, accountNumber: value })}
    payload={payload}
    primaryInvalid={
      payload.validate &&
      qrphForm.accountNumber !== "" &&
      !isValidAccountNumber(qrphForm.accountNumber)
    }
    primaryInvalidMessage={t(
      "validation.invalidAccountNumber",
      "Enter a valid account number (at least 4 digits)",
    )}
    primaryLabel={t("placeholders.accountNumber")}
    primaryPlaceholder={t("placeholders.accountNumberPlaceholder")}
    primaryValue={qrphForm.accountNumber}
  />
);
