import type { TFunction } from "i18next";
import { HighlightedLabel } from "../../../search/search-context";
import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import { isValidUrl } from "../../../../../../../../packages/domain/payload/src/payload-generators";
import type { QRState } from "../../../../../state/qr-store";
import { Input } from "../../../../../../../../packages/ui/web/src/primitives/input";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";
import { EventCoreFields } from "./event-core-fields";

export const EventRsvpEditor = ({
  payload,
  setPayloadEventRsvp,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setPayloadEventRsvp: QRState["setPayloadEventRsvp"];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <EventCoreFields
        summary={payload.eventRsvp.summary || ""}
        location={payload.eventRsvp.location || ""}
        description={payload.eventRsvp.description || ""}
        start={payload.eventRsvp.start || ""}
        end={payload.eventRsvp.end || ""}
        onSummaryChange={(value) => setPayloadEventRsvp({ summary: value })}
        onLocationChange={(value) => setPayloadEventRsvp({ location: value })}
        onDescriptionChange={(value) => setPayloadEventRsvp({ description: value })}
        onStartChange={(value) => setPayloadEventRsvp({ start: value })}
        onEndChange={(value) => setPayloadEventRsvp({ end: value })}
        summaryPlaceholder="Annual Conference 2024"
        locationPlaceholder="Conference Center"
        summaryTestId="payload-rsvp-summary-input"
        locationTestId="payload-rsvp-location-input"
        descriptionTestId="payload-rsvp-description-textarea"
        startTestId="payload-rsvp-start-input"
        endTestId="payload-rsvp-end-input"
        t={t}
      />
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.rsvpUrl")}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={payload.eventRsvp.rsvpUrl || ""}
          onChange={(e) => setPayloadEventRsvp({ rsvpUrl: e.target.value })}
          placeholder="https://anqr.link/rsvp/event123"
          data-testid={DynamicTestId.resolve("payload-rsvp-url-input", "payload-rsvp-url-input")}
          className={
            payload.validate && payload.eventRsvp.rsvpUrl && !isValidUrl(payload.eventRsvp.rsvpUrl)
              ? "border-destructive focus-visible:ring-destructive"
              : ""
          }
        />
        {payload.validate &&
          payload.eventRsvp.rsvpUrl &&
          !isValidUrl(payload.eventRsvp.rsvpUrl) && (
            <p className="text-xs text-destructive">
              {t(
                "validation.invalidUrl",
                "Enter a valid URL (must start with http:// or https://)",
              )}
            </p>
          )}
      </div>
      <p className="text-xs text-muted-foreground">{t("hints.rsvpNote")}</p>
    </div>
  );
};
