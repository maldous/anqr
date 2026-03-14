import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/app/search/search-context';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';

export const RemovedTicketingEditor = ({
  payload,
  setPayloadText,
  t,
}: Readonly<{
  payload: QRState['payload'];
  setPayloadText: QRState['setPayloadText'];
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.ticketId')}</HighlightedLabel>
      </Label>
      <Input
        value={payload.text}
        onChange={(e) => setPayloadText(e.target.value)}
        placeholder="TKT-2024-001234"
      />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.eventName')}</HighlightedLabel>
      </Label>
      <Input placeholder="Concert 2024" />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.venue')}</HighlightedLabel>
      </Label>
      <Input placeholder="Stadium Arena" />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.dateTime')}</HighlightedLabel>
      </Label>
      <Input type="datetime-local" />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.sectionZone')}</HighlightedLabel>
        </Label>
        <Input placeholder="Section A" />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.seat')}</HighlightedLabel>
        </Label>
        <Input placeholder="Row 5, Seat 12" />
      </div>
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.attendeeName')}</HighlightedLabel>
      </Label>
      <Input placeholder="John Doe" />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.validationUrl')}</HighlightedLabel>
      </Label>
      <Input type="url" placeholder="https://tickets.anqr.link/validate/" />
    </div>
  </div>
);
