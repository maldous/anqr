import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/app/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { isValidUrl } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { DateTimePicker } from '@/ui/primitives/date-time-picker';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Textarea } from '@/ui/primitives/textarea';

export const EventRsvpEditor = ({
  payload,
  setPayloadEventRsvp,
  t,
}: Readonly<{
  payload: QRState['payload'];
  setPayloadEventRsvp: QRState['setPayloadEventRsvp'];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.summary')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.eventRsvp.summary || ''}
          onChange={(e) => setPayloadEventRsvp({ summary: e.target.value })}
          placeholder="Annual Conference 2024"
          data-testid={DynamicTestId.resolve(
            'payload-rsvp-summary-input',
            'payload-rsvp-summary-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.location')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.eventRsvp.location || ''}
          onChange={(e) => setPayloadEventRsvp({ location: e.target.value })}
          placeholder="Conference Center"
          data-testid={DynamicTestId.resolve(
            'payload-rsvp-location-input',
            'payload-rsvp-location-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.description')}</HighlightedLabel>
        </Label>
        <Textarea
          value={payload.eventRsvp.description || ''}
          onChange={(e) => setPayloadEventRsvp({ description: e.target.value })}
          placeholder={t('placeholders.eventDetails')}
          rows={2}
          data-testid={DynamicTestId.resolve(
            'payload-rsvp-description-textarea',
            'payload-rsvp-description-textarea'
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.start')}</HighlightedLabel>
          </Label>
          <DateTimePicker
            value={payload.eventRsvp.start || ''}
            onChange={(value: string) => setPayloadEventRsvp({ start: value })}
            placeholder={t('placeholders.selectDateTime', 'Select date & time')}
            data-testid={DynamicTestId.resolve(
              'payload-rsvp-start-input',
              'payload-rsvp-start-input'
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.end')}</HighlightedLabel>
          </Label>
          <DateTimePicker
            value={payload.eventRsvp.end || ''}
            onChange={(value: string) => setPayloadEventRsvp({ end: value })}
            placeholder={t('placeholders.selectDateTime', 'Select date & time')}
            data-testid={DynamicTestId.resolve('payload-rsvp-end-input', 'payload-rsvp-end-input')}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.rsvpUrl')}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={payload.eventRsvp.rsvpUrl || ''}
          onChange={(e) => setPayloadEventRsvp({ rsvpUrl: e.target.value })}
          placeholder="https://anqr.link/rsvp/event123"
          data-testid={DynamicTestId.resolve('payload-rsvp-url-input', 'payload-rsvp-url-input')}
          className={
            payload.validate && payload.eventRsvp.rsvpUrl && !isValidUrl(payload.eventRsvp.rsvpUrl)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          payload.eventRsvp.rsvpUrl &&
          !isValidUrl(payload.eventRsvp.rsvpUrl) && (
            <p className="text-xs text-destructive">
              {t(
                'validation.invalidUrl',
                'Enter a valid URL (must start with http:// or https://)'
              )}
            </p>
          )}
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.rsvpNote')}</p>
    </div>
  );
};
