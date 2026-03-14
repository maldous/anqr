import { isValidPayPalUsername } from '@/modules/payload-generators';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import type { EditorProps } from '../payload-editor-props';

export function PaypalMeEditor({
  payload,
  paypalMeForm,
  setPaypalMeForm,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'paypalMeForm' | 'setPaypalMeForm' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('placeholders.paypalMeUsername')}</Label>
        <Input
          placeholder={t('placeholders.yourname')}
          value={paypalMeForm.username}
          onChange={(e) => setPaypalMeForm({ ...paypalMeForm, username: e.target.value })}
          className={
            payload.validate &&
            paypalMeForm.username &&
            !isValidPayPalUsername(paypalMeForm.username)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          paypalMeForm.username &&
          !isValidPayPalUsername(paypalMeForm.username) && (
            <p className="text-xs text-destructive">
              {t(
                'validation.invalidPayPalUsername',
                'Enter a valid PayPal.Me username (4-20 alphanumeric characters)'
              )}
            </p>
          )}
        <p className="text-xs text-muted-foreground">{t('placeholders.paypalMeHint')}</p>
      </div>
      <div className="space-y-2">
        <Label>
          {t('payload.amount')} {t('common.optional')}
        </Label>
        <Input
          type="number"
          placeholder="0.00"
          value={paypalMeForm.amount}
          onChange={(e) => setPaypalMeForm({ ...paypalMeForm, amount: e.target.value })}
        />
      </div>
    </div>
  );
}
