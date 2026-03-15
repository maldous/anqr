import type { TFunction } from 'i18next';
import type { QRState } from '@/store/qr-store';
import { LabeledInputField } from './labeled-input-field';

export const BizcardEditor = ({
  payload,
  setPayloadBizCard,
  t,
}: Readonly<{
  payload: QRState['payload'];
  setPayloadBizCard: QRState['setPayloadBizCard'];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <LabeledInputField
        label={t('payload.firstName')}
        value={payload.bizcard.firstName || ''}
        onChange={(value) => setPayloadBizCard({ firstName: value })}
        placeholder="John"
        dataTestId="payload-bizcard-firstname-input"
      />
      <LabeledInputField
        label={t('payload.lastName')}
        value={payload.bizcard.lastName || ''}
        onChange={(value) => setPayloadBizCard({ lastName: value })}
        placeholder="Doe"
        dataTestId="payload-bizcard-lastname-input"
      />
      <LabeledInputField
        label={t('payload.company')}
        value={payload.bizcard.company || ''}
        onChange={(value) => setPayloadBizCard({ company: value })}
        placeholder="Company Inc."
        dataTestId="payload-bizcard-company-input"
      />
      <LabeledInputField
        label={t('payload.title')}
        value={payload.bizcard.title || ''}
        onChange={(value) => setPayloadBizCard({ title: value })}
        placeholder="Manager"
        dataTestId="payload-bizcard-title-input"
      />
      <LabeledInputField
        label={t('payload.phone')}
        value={payload.bizcard.phone || ''}
        onChange={(value) => setPayloadBizCard({ phone: value })}
        placeholder="+1234567890"
        type="tel"
        dataTestId="payload-bizcard-phone-input"
      />
      <LabeledInputField
        label={t('payload.email')}
        value={payload.bizcard.email || ''}
        onChange={(value) => setPayloadBizCard({ email: value })}
        placeholder="name@example.com"
        dataTestId="payload-bizcard-email-input"
      />
      <LabeledInputField
        label={t('payload.address')}
        value={payload.bizcard.address || ''}
        onChange={(value) => setPayloadBizCard({ address: value })}
        placeholder="123 Main St, City"
        dataTestId="payload-bizcard-address-input"
      />
      <p className="text-xs text-muted-foreground">{t('hints.bizcardLegacy')}</p>
    </div>
  );
};
