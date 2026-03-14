import type { TFunction } from 'i18next';
import { isNonEmpty, isValidStoreId } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import type { JPQRForm } from '../payload-section-types';

export const JpqrEditor = ({
  jpqrForm,
  payload,
  setJpqrForm,
  t,
}: Readonly<{
  jpqrForm: JPQRForm;
  payload: QRState['payload'];
  setJpqrForm: React.Dispatch<React.SetStateAction<JPQRForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>{t('placeholders.storeId')}</Label>
      <Input
        placeholder={t('placeholders.jpStoreIdPlaceholder')}
        value={jpqrForm.storeId}
        onChange={(e) => setJpqrForm({ ...jpqrForm, storeId: e.target.value })}
        className={
          payload.validate && jpqrForm.storeId && !isValidStoreId(jpqrForm.storeId)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && jpqrForm.storeId && !isValidStoreId(jpqrForm.storeId) && (
        <p className="text-xs text-destructive">
          {t('validation.invalidStoreId', 'Enter a valid store ID')}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label>{t('payload.merchantName')}</Label>
      <Input
        placeholder={t('placeholders.jpMerchantNamePlaceholder')}
        value={jpqrForm.merchantName}
        onChange={(e) => setJpqrForm({ ...jpqrForm, merchantName: e.target.value })}
        className={
          payload.validate && !isNonEmpty(jpqrForm.merchantName)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && !isNonEmpty(jpqrForm.merchantName) && (
        <p className="text-xs text-destructive">
          {t('validation.requiredField', 'This field is required')}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label>
        {t('payload.amount')} (JPY) {t('common.optional')}
      </Label>
      <Input
        type="number"
        placeholder="0"
        value={jpqrForm.amount}
        onChange={(e) => setJpqrForm({ ...jpqrForm, amount: e.target.value })}
      />
    </div>
    <p className="text-xs text-muted-foreground">{t('placeholders.jpqrHint')}</p>
  </div>
);
