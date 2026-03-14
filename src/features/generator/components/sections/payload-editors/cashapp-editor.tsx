import { isValidCashtag } from '@/modules/payload-generators';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import type { EditorProps } from '../payload-editor-props';

export function CashappEditor({
  cashappForm,
  payload,
  setCashappForm,
  t,
}: Readonly<Pick<EditorProps, 'cashappForm' | 'payload' | 'setCashappForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('placeholders.cashtag')}</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            placeholder={t('placeholders.yourname')}
            className={`pl-7 ${
              payload.validate && cashappForm.cashtag && !isValidCashtag(cashappForm.cashtag)
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            }`}
            value={cashappForm.cashtag}
            onChange={(e) =>
              setCashappForm({ ...cashappForm, cashtag: e.target.value.replace(/^\$/, '') })
            }
          />
          {payload.validate && cashappForm.cashtag && !isValidCashtag(cashappForm.cashtag) && (
            <p className="text-xs text-destructive">
              {t(
                'validation.invalidCashtag',
                'Enter a valid $cashtag (starts with letter, alphanumeric)'
              )}
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t('placeholders.cashappHint')}</p>
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.amount')} {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder="0.00"
          value={cashappForm.amount}
          onChange={(e) => setCashappForm({ ...cashappForm, amount: e.target.value })}
        />
      </div>
    </div>
  );
}
