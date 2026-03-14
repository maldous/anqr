import type { TFunction } from 'i18next';
import { isNonEmpty, isValidMerchantId } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import type { TWQRForm } from '../payload-section-types';

export const TwqrEditor = ({
  payload,
  setTwqrForm,
  t,
  twqrForm,
}: Readonly<{
  payload: QRState['payload'];
  setTwqrForm: React.Dispatch<React.SetStateAction<TWQRForm>>;
  t: TFunction;
  twqrForm: TWQRForm;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>{t('placeholders.merchantId')}</Label>
      <Input
        placeholder={t('placeholders.twMerchantIdPlaceholder')}
        value={twqrForm.merchantId}
        onChange={(e) => setTwqrForm({ ...twqrForm, merchantId: e.target.value })}
        className={
          payload.validate && twqrForm.merchantId && !isValidMerchantId(twqrForm.merchantId)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && twqrForm.merchantId && !isValidMerchantId(twqrForm.merchantId) && (
        <p className="text-xs text-destructive">
          {t('validation.invalidMerchantId', 'Enter a valid merchant ID')}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label>{t('payload.merchantName')}</Label>
      <Input
        placeholder={t('placeholders.twMerchantNamePlaceholder')}
        value={twqrForm.merchantName}
        onChange={(e) => setTwqrForm({ ...twqrForm, merchantName: e.target.value })}
        className={
          payload.validate && !isNonEmpty(twqrForm.merchantName)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && !isNonEmpty(twqrForm.merchantName) && (
        <p className="text-xs text-destructive">
          {t('validation.requiredField', 'This field is required')}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label>
        {t('payload.amount')} (TWD) {t('common.optional')}
      </Label>
      <Input
        type="number"
        placeholder="0"
        value={twqrForm.amount}
        onChange={(e) => setTwqrForm({ ...twqrForm, amount: e.target.value })}
      />
    </div>
    <p className="text-xs text-muted-foreground">{t('placeholders.twqrHint')}</p>
  </div>
);
