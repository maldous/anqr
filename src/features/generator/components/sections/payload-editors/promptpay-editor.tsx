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
import type { PromptPayForm } from '../payload-section-types';

export const PromptpayEditor = ({
  payload,
  promptPayForm,
  setPromptPayForm,
  t,
}: Readonly<{
  payload: QRState['payload'];
  promptPayForm: PromptPayForm;
  setPromptPayForm: React.Dispatch<React.SetStateAction<PromptPayForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.idType')}</HighlightedLabel>
      </Label>
      <Select
        value={promptPayForm.type}
        onValueChange={(v) =>
          setPromptPayForm((prev) => ({ ...prev, type: v as 'mobile' | 'id' | 'ewallet' }))
        }
      >
        <SelectTrigger
          data-testid={DynamicTestId.resolve(
            'payload-promptpay-type-select',
            'payload-promptpay-type-select'
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mobile">{t('payload.mobileNumber')}</SelectItem>
          <SelectItem value="id">{t('payload.nationalIdTaxId')}</SelectItem>
          <SelectItem value="ewallet">E-Wallet ID</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.promptPayId')}</HighlightedLabel>
      </Label>
      <Input
        value={promptPayForm.value}
        onChange={(e) => setPromptPayForm((prev) => ({ ...prev, value: e.target.value }))}
        placeholder="0812345678"
        data-testid={DynamicTestId.resolve(
          'payload-promptpay-value-input',
          'payload-promptpay-value-input'
        )}
        className={
          payload.validate &&
          promptPayForm.value &&
          promptPayForm.type === 'mobile' &&
          !isValidPhone(promptPayForm.value)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate &&
        promptPayForm.value &&
        promptPayForm.type === 'mobile' &&
        !isValidPhone(promptPayForm.value) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidPhone', 'Enter a valid phone number (at least 3 digits)')}
          </p>
        )}
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.amountThb')}</HighlightedLabel>
      </Label>
      <Input
        type="number"
        step="0.01"
        value={promptPayForm.amount}
        onChange={(e) => setPromptPayForm((prev) => ({ ...prev, amount: e.target.value }))}
        placeholder="100.00"
        data-testid={DynamicTestId.resolve(
          'payload-promptpay-amount-input',
          'payload-promptpay-amount-input'
        )}
      />
    </div>
    <p className="text-xs text-muted-foreground">{t('hints.promptpayNote')}</p>
  </div>
);
