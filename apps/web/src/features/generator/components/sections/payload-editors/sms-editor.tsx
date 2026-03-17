import type { TFunction } from "i18next";
import { HighlightedLabel } from "../../../search/search-context";
import { DynamicTestId } from "@/infra/testing/dynamic-testid";
import { isValidPhone } from "@/modules/payload-generators";
import type { QRState } from "@/store/qr-store";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";
import { Textarea } from "@/ui/primitives/textarea";

export const SmsEditor = ({
  payload,
  setPayloadSms,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setPayloadSms: QRState["setPayloadSms"];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.tel")}</HighlightedLabel>
        </Label>
        <Input
          type="tel"
          value={payload.sms.number}
          onChange={(e) => setPayloadSms({ number: e.target.value })}
          placeholder="+1234567890"
          data-testid={DynamicTestId.resolve(
            "payload-sms-number-input",
            "payload-sms-number-input",
          )}
          className={
            payload.validate && payload.sms.number && !isValidPhone(payload.sms.number)
              ? "border-destructive focus-visible:ring-destructive"
              : ""
          }
        />
        {payload.validate && payload.sms.number && !isValidPhone(payload.sms.number) && (
          <p className="text-xs text-destructive">
            {t("validation.invalidPhone", "Enter a valid phone number (at least 3 digits)")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.messageOptional")}</HighlightedLabel>
        </Label>
        <Textarea
          value={payload.sms.body || ""}
          onChange={(e) => setPayloadSms({ body: e.target.value })}
          placeholder={t("placeholders.prefilledMessage")}
          rows={3}
          data-testid={DynamicTestId.resolve(
            "payload-sms-body-textarea",
            "payload-sms-body-textarea",
          )}
        />
      </div>
    </div>
  );
};
