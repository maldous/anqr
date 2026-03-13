import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/app/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { isValidPhone } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';

type TelEditorProps = {
  payload: QRState['payload'];
  setPayloadTel: QRState['setPayloadTel'];
  t: TFunction;
};

export const TelEditor = ({ payload, setPayloadTel, t }: Readonly<TelEditorProps>) => {
  return (
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.phone')}</HighlightedLabel>
      </Label>
      <Input
        type="tel"
        value={payload.tel.number}
        onChange={(e) => setPayloadTel({ number: e.target.value })}
        placeholder="+1234567890"
        data-testid={DynamicTestId.resolve('payload-tel-input', 'payload-tel-input')}
        className={
          payload.validate && payload.tel.number && !isValidPhone(payload.tel.number)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && payload.tel.number && !isValidPhone(payload.tel.number) && (
        <p className="text-xs text-destructive">
          {t('validation.invalidPhone', 'Enter a valid phone number (at least 3 digits)')}
        </p>
      )}
    </div>
  );
};
