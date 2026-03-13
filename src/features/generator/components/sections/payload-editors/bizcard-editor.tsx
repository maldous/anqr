import type { TFunction } from 'i18next';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import type { QRState } from '@/store/qr-store';
import { HighlightedLabel } from '@/app/search/search-context';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';

interface BizcardEditorProps {
  payload: QRState['payload'];
  setPayloadBizCard: QRState['setPayloadBizCard'];
  t: TFunction;
}

export function BizcardEditor({ payload, setPayloadBizCard, t }: Readonly<BizcardEditorProps>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.firstName')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.bizcard.firstName || ''}
          onChange={(e) => setPayloadBizCard({ firstName: e.target.value })}
          placeholder="John"
          data-testid={DynamicTestId.resolve(
            'payload-bizcard-firstname-input',
            'payload-bizcard-firstname-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.lastName')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.bizcard.lastName || ''}
          onChange={(e) => setPayloadBizCard({ lastName: e.target.value })}
          placeholder="Doe"
          data-testid={DynamicTestId.resolve(
            'payload-bizcard-lastname-input',
            'payload-bizcard-lastname-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.company')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.bizcard.company || ''}
          onChange={(e) => setPayloadBizCard({ company: e.target.value })}
          placeholder="Company Inc."
          data-testid={DynamicTestId.resolve(
            'payload-bizcard-company-input',
            'payload-bizcard-company-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.title')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.bizcard.title || ''}
          onChange={(e) => setPayloadBizCard({ title: e.target.value })}
          placeholder="Manager"
          data-testid={DynamicTestId.resolve(
            'payload-bizcard-title-input',
            'payload-bizcard-title-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.phone')}</HighlightedLabel>
        </Label>
        <Input
          type="tel"
          value={payload.bizcard.phone || ''}
          onChange={(e) => setPayloadBizCard({ phone: e.target.value })}
          placeholder="+1234567890"
          data-testid={DynamicTestId.resolve(
            'payload-bizcard-phone-input',
            'payload-bizcard-phone-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.email')}</HighlightedLabel>
        </Label>
        <Input
          type="email"
          value={payload.bizcard.email || ''}
          onChange={(e) => setPayloadBizCard({ email: e.target.value })}
          placeholder="name@example.com"
          data-testid={DynamicTestId.resolve(
            'payload-bizcard-email-input',
            'payload-bizcard-email-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.address')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.bizcard.address || ''}
          onChange={(e) => setPayloadBizCard({ address: e.target.value })}
          placeholder="123 Main St, City"
          data-testid={DynamicTestId.resolve(
            'payload-bizcard-address-input',
            'payload-bizcard-address-input'
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.bizcardLegacy')}</p>
    </div>
  );
}
