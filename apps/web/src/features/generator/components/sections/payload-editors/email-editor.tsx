import { isValidEmail } from "@/application/generator";
import { Input, Label, Textarea } from "@/ui/web";
import type { TFunction } from "i18next";
import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import type { QRState } from "../../../../../state/qr-store";
import { HighlightedLabel } from "../../../search/search-context";
import { ValidatedLabeledInputField } from "./validated-labeled-input-field";

export const EmailEditor = ({
  payload,
  setPayloadEmail,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setPayloadEmail: QRState["setPayloadEmail"];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <ValidatedLabeledInputField
        label={t("payload.email")}
        value={payload.email.to}
        onChange={(value) => setPayloadEmail({ to: value })}
        placeholder="name@anqr.link"
        validate={payload.validate}
        invalidMessage={t(
          "validation.invalidEmail",
          "Enter a valid email address (must contain @)",
        )}
        dataTestId="payload-email-to-input"
        type="email"
        isValid={isValidEmail}
      />
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.subject")}</HighlightedLabel>
        </Label>
        <Input
          value={payload.email.subject || ""}
          onChange={(e) => setPayloadEmail({ subject: e.target.value })}
          placeholder={t("placeholders.emailSubject")}
          data-testid={DynamicTestId.resolve(
            "payload-email-subject-input",
            "payload-email-subject-input",
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.body")}</HighlightedLabel>
        </Label>
        <Textarea
          value={payload.email.body || ""}
          onChange={(e) => setPayloadEmail({ body: e.target.value })}
          placeholder={t("placeholders.emailBody")}
          rows={3}
          data-testid={DynamicTestId.resolve(
            "payload-email-body-textarea",
            "payload-email-body-textarea",
          )}
        />
      </div>
    </div>
  );
};
