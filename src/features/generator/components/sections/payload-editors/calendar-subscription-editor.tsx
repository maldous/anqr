import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/app/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { isValidUrlWithScheme } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';

export const CalendarSubscriptionEditor = ({
  payload,
  setPayloadCalendarSub,
  t,
}: Readonly<{
  payload: QRState['payload'];
  setPayloadCalendarSub: QRState['setPayloadCalendarSub'];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.calendarUrl')}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={payload.calendarSub.url || ''}
          onChange={(e) => setPayloadCalendarSub({ url: e.target.value })}
          placeholder="webcal://anqr.link/calendar.ics"
          data-testid={DynamicTestId.resolve(
            'payload-calsub-url-input',
            'payload-calsub-url-input'
          )}
          className={
            payload.validate &&
            payload.calendarSub.url &&
            !isValidUrlWithScheme(payload.calendarSub.url)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          payload.calendarSub.url &&
          !isValidUrlWithScheme(payload.calendarSub.url) && (
            <p className="text-xs text-destructive">
              {t(
                'validation.invalidCalendarUrl',
                'Enter a valid calendar URL (webcal:// or https://)'
              )}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.calendarName')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.calendarSub.calendarName || ''}
          onChange={(e) => setPayloadCalendarSub({ calendarName: e.target.value })}
          placeholder="Team Schedule"
          data-testid={DynamicTestId.resolve(
            'payload-calsub-name-input',
            'payload-calsub-name-input'
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.calendarNote')}</p>
    </div>
  );
};
