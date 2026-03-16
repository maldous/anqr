import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { HighlightedLabel } from '@/features/generator/search/search-context';
import { isValidUpiVpa } from '@/modules/payload-generators';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import type { EditorProps } from '../payload-editor-props';

export function UpiEditor({
  payload,
  setUpiForm,
  t,
  upiForm,
}: Readonly<Pick<EditorProps, 'payload' | 'setUpiForm' | 't' | 'upiForm'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.upiId')}</HighlightedLabel>
        </Label>
        <Input
          value={upiForm.vpa}
          onChange={(e) => setUpiForm((prev) => ({ ...prev, vpa: e.target.value }))}
          placeholder="name@upi"
          data-testid={DynamicTestId.resolve('payload-upi-vpa-input', 'payload-upi-vpa-input')}
          className={
            payload.validate && upiForm.vpa && !isValidUpiVpa(upiForm.vpa)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && upiForm.vpa && !isValidUpiVpa(upiForm.vpa) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidUpiVpa', 'Enter a valid UPI ID (e.g., name@upi)')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.payeeName')}</HighlightedLabel>
        </Label>
        <Input
          value={upiForm.payeeName}
          onChange={(e) => setUpiForm((prev) => ({ ...prev, payeeName: e.target.value }))}
          placeholder="John Doe"
          data-testid={DynamicTestId.resolve(
            'payload-upi-payee-name-input',
            'payload-upi-payee-name-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.amountInr')}</HighlightedLabel>
        </Label>
        <Input
          type="number"
          step="0.01"
          value={upiForm.amount}
          onChange={(e) => setUpiForm((prev) => ({ ...prev, amount: e.target.value }))}
          placeholder="500.00"
          data-testid={DynamicTestId.resolve(
            'payload-upi-amount-input',
            'payload-upi-amount-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.transactionNote')}</HighlightedLabel>
        </Label>
        <Input
          value={upiForm.transactionNote}
          onChange={(e) => setUpiForm((prev) => ({ ...prev, transactionNote: e.target.value }))}
          placeholder="Payment for order"
          data-testid={DynamicTestId.resolve('payload-upi-note-input', 'payload-upi-note-input')}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('hints.upiNote')}</p>
    </div>
  );
}
