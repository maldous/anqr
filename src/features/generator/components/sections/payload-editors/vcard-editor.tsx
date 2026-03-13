import type { TFunction } from 'i18next';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { isValidEmail, isValidPhone, isValidUrl } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { HighlightedLabel } from '@/app/search/search-context';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';

interface VcardEditorProps {
  payload: QRState['payload'];
  setPayloadVCard: QRState['setPayloadVCard'];
  t: TFunction;
}

export function VcardEditor({ payload, setPayloadVCard, t }: Readonly<VcardEditorProps>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.fullName')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.vcard.fn || ''}
          onChange={(e) => setPayloadVCard({ fn: e.target.value })}
          placeholder="John Doe"
          data-testid={DynamicTestId.resolve('payload-vcard-fn-input', 'payload-vcard-fn-input')}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.organization')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.vcard.org || ''}
          onChange={(e) => setPayloadVCard({ org: e.target.value })}
          placeholder="Company Inc."
          data-testid={DynamicTestId.resolve('payload-vcard-org-input', 'payload-vcard-org-input')}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.title')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.vcard.title || ''}
          onChange={(e) => setPayloadVCard({ title: e.target.value })}
          placeholder="Software Engineer"
          data-testid={DynamicTestId.resolve(
            'payload-vcard-title-input',
            'payload-vcard-title-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.phone')}</HighlightedLabel>
        </Label>
        <Input
          type="tel"
          value={payload.vcard.tel?.[0] || ''}
          onChange={(e) => setPayloadVCard({ tel: [e.target.value] })}
          placeholder="+1234567890"
          data-testid={DynamicTestId.resolve('payload-vcard-tel-input', 'payload-vcard-tel-input')}
          className={
            payload.validate && payload.vcard.tel?.[0] && !isValidPhone(payload.vcard.tel[0])
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && payload.vcard.tel?.[0] && !isValidPhone(payload.vcard.tel[0]) && (
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
          value={payload.vcard.email?.[0] || ''}
          onChange={(e) => setPayloadVCard({ email: [e.target.value] })}
          placeholder="name@anqr.link"
          data-testid={DynamicTestId.resolve(
            'payload-vcard-email-input',
            'payload-vcard-email-input'
          )}
          className={
            payload.validate && payload.vcard.email?.[0] && !isValidEmail(payload.vcard.email[0])
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && payload.vcard.email?.[0] && !isValidEmail(payload.vcard.email[0]) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidEmail', 'Enter a valid email address (must contain @)')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.website')}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={payload.vcard.url || ''}
          onChange={(e) => setPayloadVCard({ url: e.target.value })}
          placeholder="https://anqr.link"
          data-testid={DynamicTestId.resolve('payload-vcard-url-input', 'payload-vcard-url-input')}
          className={
            payload.validate && payload.vcard.url && !isValidUrl(payload.vcard.url)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && payload.vcard.url && !isValidUrl(payload.vcard.url) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidUrl', 'Enter a valid URL (must start with http:// or https://)')}
          </p>
        )}
      </div>
    </div>
  );
}
