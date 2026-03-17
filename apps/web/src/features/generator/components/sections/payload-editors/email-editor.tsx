import type { TFunction } from "i18next";
import { HighlightedLabel } from "../../../search/search-context";
import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import { isValidEmail } from "../../../../../../../../packages/domain/payload/src/payload-generators";
import type { QRState } from "../../../../../state/qr-store";
import { Input } from "../../../../../../../../packages/ui/web/src/primitives/input";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";
import { Textarea } from "../../../../../../../../packages/ui/web/src/primitives/textarea";
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
