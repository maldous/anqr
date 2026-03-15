import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/app/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import type { PIXForm } from '../payload-section-types';
import { ValidatedTextField } from './validated-text-field';

export const PixEditor = ({
  payload,
  pixForm,
  setPixForm,
  t,
}: Readonly<{
  payload: QRState['payload'];
  pixForm: PIXForm;
  setPixForm: React.Dispatch<React.SetStateAction<PIXForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <ValidatedTextField
      label={t('payload.pixKey')}
      placeholder="CPF, CNPJ, Email, Phone, or Random Key"
      value={pixForm.key}
      onChange={(value) => setPixForm((prev) => ({ ...prev, key: value }))}
      invalid={payload.validate && pixForm.key !== '' && pixForm.key.length < 3}
      invalidMessage={t(
        'validation.invalidPixKey',
        'Enter a valid PIX key (at least 3 characters)'
      )}
    />
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.merchantName')}</HighlightedLabel>
      </Label>
      <Input
        value={pixForm.name}
        onChange={(e) => setPixForm((prev) => ({ ...prev, name: e.target.value }))}
        placeholder="João Silva"
        data-testid={DynamicTestId.resolve('payload-pix-name-input', 'payload-pix-name-input')}
      />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.cityOptional')}</HighlightedLabel>
      </Label>
      <Input
        value={pixForm.city}
        onChange={(e) => setPixForm((prev) => ({ ...prev, city: e.target.value }))}
        placeholder="São Paulo"
        data-testid={DynamicTestId.resolve('payload-pix-city-input', 'payload-pix-city-input')}
      />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.amountBrl')}</HighlightedLabel>
      </Label>
      <Input
        type="number"
        step="0.01"
        value={pixForm.amount}
        onChange={(e) => setPixForm((prev) => ({ ...prev, amount: e.target.value }))}
        placeholder="100.00"
        data-testid={DynamicTestId.resolve('payload-pix-amount-input', 'payload-pix-amount-input')}
      />
    </div>
    <p className="text-xs text-muted-foreground">{t('hints.pixNote')}</p>
  </div>
);
