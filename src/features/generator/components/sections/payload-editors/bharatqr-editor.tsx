import type { TFunction } from 'i18next';
import { isValidUpiVpa } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import type { BharatQRForm } from '../payload-section-types';

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
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <Label>
          {t('payload.city')} {t('common.optional')}
        </Label>
        <Input
          placeholder={t('placeholders.mumbaiPlaceholder')}
          value={bharatqrForm.merchantCity}
          onChange={(e) => setBharatqrForm({ ...bharatqrForm, merchantCity: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('payload.amountInr')}</Label>
        <Input
          type="number"
          placeholder="0.00"
          value={bharatqrForm.amount}
          onChange={(e) => setBharatqrForm({ ...bharatqrForm, amount: e.target.value })}
        />
      </div>
    </div>
    <p className="text-xs text-muted-foreground">{t('placeholders.bharatqrHint')}</p>
  </div>
);
