import type { TFunction } from 'i18next';
import { isValidUpiVpa } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import type { BharatQRForm } from '../payload-section-types';
import { CityAmountFields } from './city-amount-fields';

export const BharatqrEditor = ({
  bharatqrForm,
  payload,
  setBharatqrForm,
  t,
}: Readonly<{
  bharatqrForm: BharatQRForm;
  payload: QRState['payload'];
  setBharatqrForm: React.Dispatch<React.SetStateAction<BharatQRForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        {t('payload.upiId')} {t('common.optional')}
      </Label>
      <Input
        placeholder={t('placeholders.upiId')}
        value={bharatqrForm.merchantVPA}
        onChange={(e) => setBharatqrForm({ ...bharatqrForm, merchantVPA: e.target.value })}
        className={
          payload.validate && bharatqrForm.merchantVPA && !isValidUpiVpa(bharatqrForm.merchantVPA)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && bharatqrForm.merchantVPA && !isValidUpiVpa(bharatqrForm.merchantVPA) && (
        <p className="text-xs text-destructive">
          {t('validation.invalidUpiVpa', 'Enter a valid UPI ID (e.g., name@upi)')}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label>{t('payload.merchantName')}</Label>
      <Input
        placeholder={t('placeholders.fullName')}
        value={bharatqrForm.merchantName}
        onChange={(e) => setBharatqrForm({ ...bharatqrForm, merchantName: e.target.value })}
      />
    </div>
    <CityAmountFields
      cityLabel={`${t('payload.city')} ${t('common.optional')}`}
      cityPlaceholder={t('placeholders.mumbaiPlaceholder')}
      cityValue={bharatqrForm.merchantCity}
      onCityChange={(value) => setBharatqrForm({ ...bharatqrForm, merchantCity: value })}
      amountLabel={t('payload.amountInr')}
      amountPlaceholder="0.00"
      amountValue={bharatqrForm.amount}
      onAmountChange={(value) => setBharatqrForm({ ...bharatqrForm, amount: value })}
    />
    <p className="text-xs text-muted-foreground">{t('placeholders.bharatqrHint')}</p>
  </div>
);
