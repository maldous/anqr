import type { TFunction } from 'i18next';
import { isNonEmpty, isValidMerchantId } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import type { QRISForm } from '../payload-section-types';

export const QrisEditor = ({
  payload,
  qrisForm,
  setQrisForm,
  t,
}: Readonly<{
  payload: QRState['payload'];
  qrisForm: QRISForm;
  setQrisForm: React.Dispatch<React.SetStateAction<QRISForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>{t('placeholders.merchantId')}</Label>
      <Input
        placeholder={t('placeholders.qrisMerchantIdPlaceholder')}
        value={qrisForm.merchantId}
        onChange={(e) => setQrisForm({ ...qrisForm, merchantId: e.target.value })}
        className={
          payload.validate && qrisForm.merchantId && !isValidMerchantId(qrisForm.merchantId)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && qrisForm.merchantId && !isValidMerchantId(qrisForm.merchantId) && (
        <p className="text-xs text-destructive">
          {t('validation.invalidMerchantId', 'Enter a valid merchant ID')}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label>{t('payload.merchantName')}</Label>
      <Input
        placeholder={t('placeholders.tokoPlaceholder')}
        value={qrisForm.merchantName}
        onChange={(e) => setQrisForm({ ...qrisForm, merchantName: e.target.value })}
        className={
          payload.validate && !isNonEmpty(qrisForm.merchantName)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && !isNonEmpty(qrisForm.merchantName) && (
        <p className="text-xs text-destructive">
          {t('validation.requiredField', 'This field is required')}
        </p>
      )}
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <Label>
          {t('payload.city')} {t('common.optional')}
        </Label>
        <Input
          placeholder={t('placeholders.jakartaPlaceholder')}
          value={qrisForm.merchantCity}
          onChange={(e) => setQrisForm({ ...qrisForm, merchantCity: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.amount')} (IDR) {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder={t('placeholders.idrAmountPlaceholder')}
          value={qrisForm.amount}
          onChange={(e) => setQrisForm({ ...qrisForm, amount: e.target.value })}
        />
      </div>
    </div>
    <p className="text-xs text-muted-foreground">{t('placeholders.qrisHint')}</p>
  </div>
);
