import type { TFunction } from "i18next";
import {
  isValidEmail,
  isValidPhone,
} from "@/domain/payload/generators";
import type { QRState } from "../../../../../state/qr-store";
import { LabeledInputField } from "./labeled-input-field";
import { ValidatedLabeledInputField } from "./validated-labeled-input-field";

export const MecardEditor = ({
  payload,
  setPayloadMeCard,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setPayloadMeCard: QRState["setPayloadMeCard"];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <LabeledInputField
        label={t("payload.name")}
        value={payload.mecard.n || ""}
        onChange={(value) => setPayloadMeCard({ n: value })}
        placeholder="Doe,John"
        dataTestId="payload-mecard-n-input"
      />
      <LabeledInputField
        label={t("payload.nickname")}
        value={payload.mecard.nickname || ""}
        onChange={(value) => setPayloadMeCard({ nickname: value })}
        placeholder="Johnny"
        dataTestId="payload-mecard-nickname-input"
      />
      <ValidatedLabeledInputField
        label={t("payload.phone")}
        value={payload.mecard.tel || ""}
        onChange={(value) => setPayloadMeCard({ tel: value })}
        placeholder="+1234567890"
        validate={payload.validate}
        invalidMessage={t(
          "validation.invalidPhone",
          "Enter a valid phone number (at least 3 digits)",
        )}
        dataTestId="payload-mecard-tel-input"
        type="tel"
        isValid={isValidPhone}
      />
      <ValidatedLabeledInputField
        label={t("payload.email")}
        value={payload.mecard.email || ""}
        onChange={(value) => setPayloadMeCard({ email: value })}
        placeholder="name@anqr.link"
        validate={payload.validate}
        invalidMessage={t(
          "validation.invalidEmail",
          "Enter a valid email address (must contain @)",
        )}
        dataTestId="payload-mecard-email-input"
        type="email"
        isValid={isValidEmail}
      />
      <LabeledInputField
        label={t("payload.organization")}
        value={payload.mecard.org || ""}
        onChange={(value) => setPayloadMeCard({ org: value })}
        placeholder="Company Inc."
        dataTestId="payload-mecard-org-input"
      />
      <LabeledInputField
        label={t("payload.address")}
        value={payload.mecard.adr || ""}
        onChange={(value) => setPayloadMeCard({ adr: value })}
        placeholder="123 Main St, City"
        dataTestId="payload-mecard-adr-input"
      />
      <LabeledInputField
        label={t("payload.birthday")}
        value={payload.mecard.bday || ""}
        onChange={(value) => setPayloadMeCard({ bday: value })}
        placeholder=""
        type="text"
        dataTestId="payload-mecard-bday-input"
      />
    </div>
  );
};
