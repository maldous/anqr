import type { TFunction } from "i18next";
import { isValidPhone } from "../../../../../../../../packages/domain/payload/src/payload-generators";
import type { QRState } from "../../../../../state/qr-store";
import { ValidatedLabeledInputField } from "./validated-labeled-input-field";

export const TelEditor = ({
  payload,
  setPayloadTel,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setPayloadTel: QRState["setPayloadTel"];
  t: TFunction;
}>) => {
  return (
    <ValidatedLabeledInputField
      label={t("payload.phone")}
      value={payload.tel.number}
      onChange={(value) => setPayloadTel({ number: value })}
      placeholder="+1234567890"
      validate={payload.validate}
      invalidMessage={t(
        "validation.invalidPhone",
        "Enter a valid phone number (at least 3 digits)",
      )}
      dataTestId="payload-tel-input"
      type="tel"
      isValid={isValidPhone}
    />
  );
};
