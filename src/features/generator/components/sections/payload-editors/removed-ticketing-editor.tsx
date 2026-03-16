import { DetailsGridField } from "./details-grid-field";
import { LabeledInputField } from "./labeled-input-field";
import { PayloadFormShell } from "./payload-form-shell";
import type { PayloadTextEditorProps } from "./payload-text-editor.types";
import { TrailingUrlField } from "./trailing-url-field";

export const RemovedTicketingEditor = ({
  payload,
  setPayloadText,
  t,
}: Readonly<PayloadTextEditorProps>) => (
  <PayloadFormShell>
    <LabeledInputField
      label={t("payload.ticketId")}
      value={payload.text}
      onChange={setPayloadText}
      placeholder="TKT-2024-001234"
    />
    <LabeledInputField label={t("payload.eventName")} placeholder="Concert 2024" />
    <LabeledInputField label={t("payload.venue")} placeholder="Stadium Arena" />
    <LabeledInputField label={t("payload.dateTime")} placeholder="" type="datetime-local" />
    <DetailsGridField>
      <LabeledInputField label={t("payload.sectionZone")} placeholder="Section A" />
      <LabeledInputField label={t("payload.seat")} placeholder="Row 5, Seat 12" />
    </DetailsGridField>
    <LabeledInputField label={t("payload.attendeeName")} placeholder="John Doe" />
    <TrailingUrlField
      label={t("payload.validationUrl")}
      placeholder="https://tickets.anqr.link/validate/"
    />
  </PayloadFormShell>
);
