import type { TFunction } from 'i18next';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { isValidEmail } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { HighlightedLabel } from '@/app/search/search-context';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Textarea } from '@/ui/primitives/textarea';

interface EmailEditorProps {
  payload: QRState['payload'];
  setPayloadEmail: QRState['setPayloadEmail'];
  t: TFunction;
}

export function EmailEditor({ payload, setPayloadEmail, t }: Readonly<EmailEditorProps>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.email')}</HighlightedLabel>
        </Label>
        <Input
          type="email"
          value={payload.email.to}
          onChange={(e) => setPayloadEmail({ to: e.target.value })}
          placeholder="name@anqr.link"
          data-testid={DynamicTestId.resolve('payload-email-to-input', 'payload-email-to-input')}
          className={
            payload.validate && payload.email.to && !isValidEmail(payload.email.to)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && payload.email.to && !isValidEmail(payload.email.to) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidEmail', 'Enter a valid email address (must contain @)')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.subject')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.email.subject || ''}
          onChange={(e) => setPayloadEmail({ subject: e.target.value })}
          placeholder={t('placeholders.emailSubject')}
          data-testid={DynamicTestId.resolve(
            'payload-email-subject-input',
            'payload-email-subject-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.body')}</HighlightedLabel>
        </Label>
        <Textarea
          value={payload.email.body || ''}
          onChange={(e) => setPayloadEmail({ body: e.target.value })}
          placeholder={t('placeholders.emailBody')}
          rows={3}
          data-testid={DynamicTestId.resolve(
            'payload-email-body-textarea',
            'payload-email-body-textarea'
          )}
        />
      </div>
    </div>
  );
}
