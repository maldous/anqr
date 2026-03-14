import type { TFunction } from 'i18next';
import { isNonEmpty, isValidAccountNumber } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import type { QRPhForm } from '../payload-section-types';

export const QrphEditor = ({
  payload,
  qrphForm,
  setQrphForm,
  t,
}: Readonly<{
  payload: QRState['payload'];
  qrphForm: QRPhForm;
  setQrphForm: React.Dispatch<React.SetStateAction<QRPhForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>{t('placeholders.accountNumber')}</Label>
      <Input
        placeholder={t('placeholders.accountNumberPlaceholder')}
        value={qrphForm.accountNumber}
        onChange={(e) => setQrphForm({ ...qrphForm, accountNumber: e.target.value })}
        className={
          payload.validate &&
          qrphForm.accountNumber &&
          !isValidAccountNumber(qrphForm.accountNumber)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate &&
        qrphForm.accountNumber &&
        !isValidAccountNumber(qrphForm.accountNumber) && (
          <p className="text-xs text-destructive">
            {t(
              'validation.invalidAccountNumber',
              'Enter a valid account number (at least 4 digits)'
            )}
          </p>
        )}
    </div>
    <div className="space-y-2">
      <Label>{t('payload.merchantName')}</Label>
      <Input
        placeholder={t('placeholders.filipinoName')}
        value={qrphForm.merchantName}
        onChange={(e) => setQrphForm({ ...qrphForm, merchantName: e.target.value })}
        className={
          payload.validate && !isNonEmpty(qrphForm.merchantName)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && !isNonEmpty(qrphForm.merchantName) && (
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
          placeholder={t('placeholders.manilaPlaceholder')}
          value={qrphForm.merchantCity}
          onChange={(e) => setQrphForm({ ...qrphForm, merchantCity: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.amount')} (PHP) {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder="0.00"
          value={qrphForm.amount}
          onChange={(e) => setQrphForm({ ...qrphForm, amount: e.target.value })}
        />
      </div>
    </div>
    <p className="text-xs text-muted-foreground">{t('placeholders.qrphHint')}</p>
  </div>
);
