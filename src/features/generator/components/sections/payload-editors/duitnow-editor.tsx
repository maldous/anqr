import type { TFunction } from 'i18next';
import { isNonEmpty, isValidProxyValue } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/primitives/select';
import type { DuitNowForm } from '../payload-section-types';

export const DuitnowEditor = ({
  duitnowForm,
  payload,
  setDuitnowForm,
  t,
}: Readonly<{
  duitnowForm: DuitNowForm;
  payload: QRState['payload'];
  setDuitnowForm: React.Dispatch<React.SetStateAction<DuitNowForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>{t('payload.proxyType')}</Label>
      <Select
        value={duitnowForm.proxyType}
        onValueChange={(v: DuitNowForm['proxyType']) =>
          setDuitnowForm({ ...duitnowForm, proxyType: v })
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MOBILE">{t('placeholders.mobileNumber')}</SelectItem>
          <SelectItem value="NRIC">{t('placeholders.nric')}</SelectItem>
          <SelectItem value="PASSPORT">{t('placeholders.passport')}</SelectItem>
          <SelectItem value="ARMY">{t('placeholders.armyId')}</SelectItem>
          <SelectItem value="BUSINESS">{t('placeholders.businessRegistration')}</SelectItem>
          <SelectItem value="OTHERS">{t('placeholders.others')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>{t('placeholders.proxyValue')}</Label>
      <Input
        placeholder={t('placeholders.myPhonePlaceholder')}
        value={duitnowForm.proxyValue}
        onChange={(e) => setDuitnowForm({ ...duitnowForm, proxyValue: e.target.value })}
        className={
          payload.validate &&
          duitnowForm.proxyValue &&
          !isValidProxyValue(duitnowForm.proxyValue, duitnowForm.proxyType)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate &&
        duitnowForm.proxyValue &&
        !isValidProxyValue(duitnowForm.proxyValue, duitnowForm.proxyType) && (
          <p className="text-xs text-destructive">
            {duitnowForm.proxyType === 'MOBILE'
              ? t('validation.invalidPhone', 'Enter a valid phone number (at least 3 digits)')
              : duitnowForm.proxyType === 'NRIC'
                ? t('validation.invalidNric', 'Enter a valid NRIC (12 digits)')
                : t('validation.invalidProxyValue', 'Enter a valid proxy value')}
          </p>
        )}
    </div>
    <div className="space-y-2">
      <Label>{t('payload.merchantName')}</Label>
      <Input
        placeholder={t('placeholders.fullName')}
        value={duitnowForm.merchantName}
        onChange={(e) => setDuitnowForm({ ...duitnowForm, merchantName: e.target.value })}
        className={
          payload.validate && !isNonEmpty(duitnowForm.merchantName)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && !isNonEmpty(duitnowForm.merchantName) && (
        <p className="text-xs text-destructive">
          {t('validation.requiredField', 'This field is required')}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label>
        {t('payload.amount')} (MYR) {t('common.optional')}
      </Label>
      <Input
        type="number"
        placeholder="0.00"
        value={duitnowForm.amount}
        onChange={(e) => setDuitnowForm({ ...duitnowForm, amount: e.target.value })}
      />
    </div>
    <p className="text-xs text-muted-foreground">{t('placeholders.duitnowHint')}</p>
  </div>
);
