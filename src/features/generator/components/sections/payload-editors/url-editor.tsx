import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/features/generator/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import type { QRState } from '@/store/qr-store';
import { Label } from '@/ui/primitives/label';
import { Switch } from '@/ui/primitives/switch';
import { ValidatedUrlField } from './validated-url-field';

export const UrlEditor = ({
  payload,
  setPayloadUrl,
  t,
  tier,
}: Readonly<{
  payload: QRState['payload'];
  setPayloadUrl: QRState['setPayloadUrl'];
  t: TFunction;
  tier: string;
}>) => {
  return (
    <div className="space-y-4">
      <ValidatedUrlField
        label={t('payload.url')}
        value={payload.url.href}
        onChange={(value) => setPayloadUrl({ href: value })}
        placeholder="https://anqr.link"
        title={t('hints.enterUrlContent')}
        dataTestId={DynamicTestId.resolve('payload-url-input', 'payload-url-input')}
        validate={payload.validate}
        invalidMessage={t(
          'validation.invalidUrl',
          'Enter a valid URL (must start with http:// or https://)'
        )}
      />
      {(tier === 'advanced' || tier === 'professional') && (
        <div className="flex items-center justify-between">
          <Label>
            <HighlightedLabel>{t('payload.forceHttps')}</HighlightedLabel>
          </Label>
          <Switch
            checked={payload.url.forceHttps}
            onCheckedChange={(checked) => setPayloadUrl({ forceHttps: checked })}
            title={t('hints.forceHttps')}
            data-testid={DynamicTestId.resolve(
              'payload-url-force-https-switch',
              'payload-url-force-https-switch'
            )}
          />
        </div>
      )}
      {tier === 'professional' && (
        <p className="text-xs text-muted-foreground">
          {t('hints.utmNote', 'For marketing tracking (UTM parameters), use UTM Campaign Link.')}
        </p>
      )}
    </div>
  );
};
