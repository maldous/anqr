import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/app/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { isValidPhone } from '@/modules/payload-generators';
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
import type { PayNowForm } from '../payload-section-types';

export const PaynowEditor = ({
  payNowForm,
  payload,
  setPayNowForm,
  t,
}: Readonly<{
  payNowForm: PayNowForm;
  payload: QRState['payload'];
  setPayNowForm: React.Dispatch<React.SetStateAction<PayNowForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.proxyType')}</HighlightedLabel>
      </Label>
      <Select
        value={payNowForm.type}
        onValueChange={(v) => setPayNowForm((prev) => ({ ...prev, type: v as 'mobile' | 'uen' }))}
      >
        <SelectTrigger
          data-testid={DynamicTestId.resolve(
            'payload-paynow-type-select',
            'payload-paynow-type-select'
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="uen">UEN (Business)</SelectItem>
          <SelectItem value="mobile">{t('payload.mobileNumber')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.uenMobile')}</HighlightedLabel>
      </Label>
      <Input
        value={payNowForm.value}
        onChange={(e) => setPayNowForm((prev) => ({ ...prev, value: e.target.value }))}
        placeholder="201234567X or +65..."
        data-testid={DynamicTestId.resolve(
          'payload-paynow-value-input',
          'payload-paynow-value-input'
        )}
        className={
          payload.validate &&
          payNowForm.value &&
          payNowForm.type === 'mobile' &&
          !isValidPhone(payNowForm.value)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate &&
        payNowForm.value &&
        payNowForm.type === 'mobile' &&
        !isValidPhone(payNowForm.value) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidPhone', 'Enter a valid phone number (at least 3 digits)')}
          </p>
        )}
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.amountSgd')}</HighlightedLabel>
      </Label>
      <Input
        type="number"
        step="0.01"
        value={payNowForm.amount}
        onChange={(e) => setPayNowForm((prev) => ({ ...prev, amount: e.target.value }))}
        placeholder="50.00"
        data-testid={DynamicTestId.resolve(
          'payload-paynow-amount-input',
          'payload-paynow-amount-input'
        )}
      />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.referenceOptional')}</HighlightedLabel>
      </Label>
      <Input
        value={payNowForm.reference}
        onChange={(e) => setPayNowForm((prev) => ({ ...prev, reference: e.target.value }))}
        placeholder="Invoice 123"
        data-testid={DynamicTestId.resolve(
          'payload-paynow-reference-input',
          'payload-paynow-reference-input'
        )}
      />
    </div>
    <p className="text-xs text-muted-foreground">{t('hints.paynowNote')}</p>
  </div>
);
