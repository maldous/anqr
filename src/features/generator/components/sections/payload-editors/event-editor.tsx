import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/app/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import type { QRState } from '@/store/qr-store';
import { DateTimePicker } from '@/ui/primitives/date-time-picker';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Textarea } from '@/ui/primitives/textarea';

type EventEditorProps = {
  payload: QRState['payload'];
  setPayloadEvent: QRState['setPayloadEvent'];
  t: TFunction;
};

export const EventEditor = ({ payload, setPayloadEvent, t }: Readonly<EventEditorProps>) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.summary')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.event.summary || ''}
          onChange={(e) => setPayloadEvent({ summary: e.target.value })}
          placeholder="Meeting"
          data-testid={DynamicTestId.resolve(
            'payload-event-summary-input',
            'payload-event-summary-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.location')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.event.location || ''}
          onChange={(e) => setPayloadEvent({ location: e.target.value })}
          placeholder="Conference Room A"
          data-testid={DynamicTestId.resolve(
            'payload-event-location-input',
            'payload-event-location-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.description')}</HighlightedLabel>
        </Label>
        <Textarea
          value={payload.event.description || ''}
          onChange={(e) => setPayloadEvent({ description: e.target.value })}
          placeholder={t('placeholders.eventDetails')}
          rows={2}
          data-testid={DynamicTestId.resolve(
            'payload-event-description-textarea',
            'payload-event-description-textarea'
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.start')}</HighlightedLabel>
          </Label>
          <DateTimePicker
            value={payload.event.start || ''}
            onChange={(value: string) => setPayloadEvent({ start: value })}
            placeholder={t('placeholders.selectDateTime', 'Select date & time')}
            data-testid={DynamicTestId.resolve(
              'payload-event-start-input',
              'payload-event-start-input'
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.end')}</HighlightedLabel>
          </Label>
          <DateTimePicker
            value={payload.event.end || ''}
            onChange={(value: string) => setPayloadEvent({ end: value })}
            placeholder={t('placeholders.selectDateTime', 'Select date & time')}
            data-testid={DynamicTestId.resolve(
              'payload-event-end-input',
              'payload-event-end-input'
            )}
          />
        </div>
      </div>
    </div>
  );
};
