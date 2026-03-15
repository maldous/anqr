import type { TFunction } from 'i18next';
import { isValidAccountNumber, isValidBankBin } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import type { VietQRForm } from '../payload-section-types';

export const VietqrEditor = ({
  payload,
  setVietqrForm,
  t,
  vietqrForm,
}: Readonly<{
  payload: QRState['payload'];
  setVietqrForm: React.Dispatch<React.SetStateAction<VietQRForm>>;
  t: TFunction;
  vietqrForm: VietQRForm;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>{t('placeholders.bankBin')}</Label>
      <Input
        placeholder={t('placeholders.bankBinPlaceholder')}
        value={vietqrForm.bankBin}
        onChange={(e) => setVietqrForm({ ...vietqrForm, bankBin: e.target.value })}
        className={
          payload.validate && vietqrForm.bankBin && !isValidBankBin(vietqrForm.bankBin)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && vietqrForm.bankBin && !isValidBankBin(vietqrForm.bankBin) && (
        <p className="text-xs text-destructive">
          {t('validation.invalidBankBin', 'Enter a valid bank BIN (6-8 digits)')}
        </p>
      )}
      <p className="text-xs text-muted-foreground">{t('placeholders.napasHint')}</p>
    </div>
    <div className="space-y-2">
      <Label>{t('placeholders.accountNumber')}</Label>
      <Input
        placeholder={t('placeholders.accountNumberPlaceholder')}
        value={vietqrForm.accountNumber}
        onChange={(e) => setVietqrForm({ ...vietqrForm, accountNumber: e.target.value })}
        className={
          payload.validate &&
          vietqrForm.accountNumber &&
          !isValidAccountNumber(vietqrForm.accountNumber)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate &&
        vietqrForm.accountNumber &&
        !isValidAccountNumber(vietqrForm.accountNumber) && (
          <p className="text-xs text-destructive">
            {t(
              'validation.invalidAccountNumber',
              'Enter a valid account number (at least 4 digits)'
            )}
          </p>
        )}
    </div>
    <div className="space-y-2">
      <Label>
        {t('payload.accountName')} {t('common.optional')}
      </Label>
      <Input
        placeholder={t('placeholders.vietnameseName')}
        value={vietqrForm.accountName}
        onChange={(e) => setVietqrForm({ ...vietqrForm, accountName: e.target.value })}
      />
    </div>
    <div className="space-y-2">
      <Label>
        {t('payload.amount')} (VND) {t('common.optional')}
      </Label>
      <Input
        type="number"
        placeholder={t('placeholders.vndAmountPlaceholder')}
        value={vietqrForm.amount}
        onChange={(e) => setVietqrForm({ ...vietqrForm, amount: e.target.value })}
      />
    </div>
  </div>
);
