import type { TFunction } from "i18next";
import { isValidEmail, isValidPhone, isValidUrl } from "@/modules/payload-generators";
import type { QRState } from "@/store/qr-store";
import { LabeledInputField } from "./labeled-input-field";
import { ValidatedLabeledInputField } from "./validated-labeled-input-field";
import { HighlightedLabel } from "../../../search/search-context";
import { DynamicTestId } from "@/infra/testing/dynamic-testid";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";

export const VcardEditor = ({
  payload,
  setPayloadVCard,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setPayloadVCard: QRState["setPayloadVCard"];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <LabeledInputField
        label={t("payload.fullName")}
        value={payload.vcard.fn || ""}
        onChange={(value) => setPayloadVCard({ fn: value })}
        placeholder="John Doe"
        dataTestId="payload-vcard-fn-input"
      />
      <LabeledInputField
        label={t("payload.organization")}
        value={payload.vcard.org || ""}
        onChange={(value) => setPayloadVCard({ org: value })}
        placeholder="Company Inc."
        dataTestId="payload-vcard-org-input"
      />
      <LabeledInputField
        label={t("payload.title")}
        value={payload.vcard.title || ""}
        onChange={(value) => setPayloadVCard({ title: value })}
        placeholder="Software Engineer"
        dataTestId="payload-vcard-title-input"
      />
      <ValidatedLabeledInputField
        label={t("payload.phone")}
        value={payload.vcard.tel?.[0] || ""}
        onChange={(value) => setPayloadVCard({ tel: [value] })}
        placeholder="+1234567890"
        validate={payload.validate}
        invalidMessage={t(
          "validation.invalidPhone",
          "Enter a valid phone number (at least 3 digits)",
        )}
        dataTestId="payload-vcard-tel-input"
        type="tel"
        isValid={isValidPhone}
      />
      <ValidatedLabeledInputField
        label={t("payload.email")}
        value={payload.vcard.email?.[0] || ""}
        onChange={(value) => setPayloadVCard({ email: [value] })}
        placeholder="name@anqr.link"
        validate={payload.validate}
        invalidMessage={t(
          "validation.invalidEmail",
          "Enter a valid email address (must contain @)",
        )}
        dataTestId="payload-vcard-email-input"
        type="email"
        isValid={isValidEmail}
      />
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.website")}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={payload.vcard.url || ""}
          onChange={(e) => setPayloadVCard({ url: e.target.value })}
          placeholder="https://anqr.link"
          data-testid={DynamicTestId.resolve("payload-vcard-url-input", "payload-vcard-url-input")}
          className={
            payload.validate && payload.vcard.url && !isValidUrl(payload.vcard.url)
              ? "border-destructive focus-visible:ring-destructive"
              : ""
          }
        />
        {payload.validate && payload.vcard.url && !isValidUrl(payload.vcard.url) && (
          <p className="text-xs text-destructive">
            {t("validation.invalidUrl", "Enter a valid URL (must start with http:// or https://)")}
          </p>
        )}
      </div>
    </div>
  );
};
