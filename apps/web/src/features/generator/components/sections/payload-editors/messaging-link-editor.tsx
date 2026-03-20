import { generateMessagingLink, isValidPhone } from "@/application/generator";
import { Input, Label, Textarea } from "@/ui/web";
import type { TFunction } from "i18next";
import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import type { QRState } from "../../../../../state/qr-store";
import { HighlightedLabel } from "../../../search/search-context";
import { PlatformSelectField } from "./platform-select-field";

export const MessagingLinkEditor = ({
  payload,
  setPayloadMessaging,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setPayloadMessaging: QRState["setPayloadMessaging"];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <PlatformSelectField
        label={t("payload.platform")}
        value={payload.messaging.platform}
        onValueChange={(value) =>
          setPayloadMessaging({ platform: value as typeof payload.messaging.platform })
        }
        dataTestId="payload-messaging-platform-select"
        options={[
          { value: "whatsapp", label: t("payload.whatsapp") },
          { value: "telegram", label: t("payload.telegram") },
          { value: "signal", label: t("payload.signal") },
          { value: "messenger", label: t("payload.messenger") },
          { value: "line", label: "LINE" },
          { value: "viber", label: t("payload.viber") },
        ]}
      />
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.phoneUsername")}</HighlightedLabel>
        </Label>
        <Input
          value={payload.messaging.identifier || ""}
          onChange={(e) => setPayloadMessaging({ identifier: e.target.value })}
          placeholder={
            {
              whatsapp: "+1234567890",
              telegram: "@username",
              signal: "+1234567890",
              viber: "+1234567890",
              line: "@username",
              messenger: "username",
            }[payload.messaging.platform] || "+1234567890"
          }
          data-testid={DynamicTestId.resolve(
            "payload-messaging-identifier-input",
            "payload-messaging-identifier-input",
          )}
          className={
            payload.validate &&
            payload.messaging.identifier &&
            !isValidPhone(payload.messaging.identifier) &&
            !payload.messaging.identifier.startsWith("@")
              ? "border-destructive focus-visible:ring-destructive"
              : ""
          }
        />
        {payload.validate &&
          payload.messaging.identifier &&
          !isValidPhone(payload.messaging.identifier) &&
          !payload.messaging.identifier.startsWith("@") && (
            <p className="text-xs text-destructive">
              {t("validation.invalidPhoneOrUsername", "Enter a valid phone number or @username")}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.prefilledMessage")}</HighlightedLabel>
        </Label>
        <Textarea
          value={payload.messaging.message || ""}
          onChange={(e) => setPayloadMessaging({ message: e.target.value })}
          placeholder="Hello! I scanned your QR code..."
          rows={2}
          data-testid={DynamicTestId.resolve(
            "payload-messaging-message-textarea",
            "payload-messaging-message-textarea",
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("hints.messagingLinkGenerated", "Link: ")}
        {payload.messaging.identifier
          ? generateMessagingLink(
              payload.messaging.platform,
              payload.messaging.identifier,
              payload.messaging.message,
            )
          : "..."}
      </p>
    </div>
  );
};
