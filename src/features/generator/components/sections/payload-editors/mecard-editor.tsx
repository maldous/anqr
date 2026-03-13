import type { TFunction } from 'i18next';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { isValidEmail, isValidPhone } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { HighlightedLabel } from '@/app/search/search-context';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';

interface MecardEditorProps {
  payload: QRState['payload'];
  setPayloadMeCard: QRState['setPayloadMeCard'];
  t: TFunction;
}

export function MecardEditor({ payload, setPayloadMeCard, t }: Readonly<MecardEditorProps>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.name')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.mecard.n || ''}
          onChange={(e) => setPayloadMeCard({ n: e.target.value })}
          placeholder="Doe,John"
          data-testid={DynamicTestId.resolve('payload-mecard-n-input', 'payload-mecard-n-input')}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.nickname')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.mecard.nickname || ''}
          onChange={(e) => setPayloadMeCard({ nickname: e.target.value })}
          placeholder="Johnny"
          data-testid={DynamicTestId.resolve(
            'payload-mecard-nickname-input',
            'payload-mecard-nickname-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.phone')}</HighlightedLabel>
        </Label>
        <Input
          type="tel"
          value={payload.mecard.tel || ''}
          onChange={(e) => setPayloadMeCard({ tel: e.target.value })}
          placeholder="+1234567890"
          data-testid={DynamicTestId.resolve(
            'payload-mecard-tel-input',
            'payload-mecard-tel-input'
          )}
          className={
            payload.validate && payload.mecard.tel && !isValidPhone(payload.mecard.tel)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && payload.mecard.tel && !isValidPhone(payload.mecard.tel) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidPhone', 'Enter a valid phone number (at least 3 digits)')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.email')}</HighlightedLabel>
        </Label>
        <Input
          type="email"
          value={payload.mecard.email || ''}
          onChange={(e) => setPayloadMeCard({ email: e.target.value })}
          placeholder="name@anqr.link"
          data-testid={DynamicTestId.resolve(
            'payload-mecard-email-input',
            'payload-mecard-email-input'
          )}
          className={
            payload.validate && payload.mecard.email && !isValidEmail(payload.mecard.email)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && payload.mecard.email && !isValidEmail(payload.mecard.email) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidEmail', 'Enter a valid email address (must contain @)')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.organization')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.mecard.org || ''}
          onChange={(e) => setPayloadMeCard({ org: e.target.value })}
          placeholder="Company Inc."
          data-testid={DynamicTestId.resolve(
            'payload-mecard-org-input',
            'payload-mecard-org-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.address')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.mecard.adr || ''}
          onChange={(e) => setPayloadMeCard({ adr: e.target.value })}
          placeholder="123 Main St, City"
          data-testid={DynamicTestId.resolve(
            'payload-mecard-adr-input',
            'payload-mecard-adr-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.birthday')}</HighlightedLabel>
        </Label>
        <Input
          type="date"
          value={payload.mecard.bday || ''}
          onChange={(e) => setPayloadMeCard({ bday: e.target.value })}
          data-testid={DynamicTestId.resolve(
            'payload-mecard-bday-input',
            'payload-mecard-bday-input'
          )}
        />
      </div>
    </div>
  );
}
