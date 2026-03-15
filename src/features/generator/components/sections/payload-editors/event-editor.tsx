import type { TFunction } from 'i18next';
import type { QRState } from '@/store/qr-store';
import { EventCoreFields } from './event-core-fields';

export const EventEditor = ({
  payload,
  setPayloadEvent,
  t,
}: Readonly<{
  payload: QRState['payload'];
  setPayloadEvent: QRState['setPayloadEvent'];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <EventCoreFields
        summary={payload.event.summary || ''}
        location={payload.event.location || ''}
        description={payload.event.description || ''}
        start={payload.event.start || ''}
        end={payload.event.end || ''}
        onSummaryChange={(value) => setPayloadEvent({ summary: value })}
        onLocationChange={(value) => setPayloadEvent({ location: value })}
        onDescriptionChange={(value) => setPayloadEvent({ description: value })}
        onStartChange={(value) => setPayloadEvent({ start: value })}
        onEndChange={(value) => setPayloadEvent({ end: value })}
        summaryPlaceholder="Meeting"
        locationPlaceholder="Conference Room A"
        summaryTestId="payload-event-summary-input"
        locationTestId="payload-event-location-input"
        descriptionTestId="payload-event-description-textarea"
        startTestId="payload-event-start-input"
        endTestId="payload-event-end-input"
        t={t}
      />
    </div>
  );
};
