import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/app/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { isValidUrl } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Switch } from '@/ui/primitives/switch';

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
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.url')}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={payload.url.href}
          onChange={(e) => setPayloadUrl({ href: e.target.value })}
          placeholder="https://anqr.link"
          title={t('hints.enterUrlContent')}
          data-testid={DynamicTestId.resolve('payload-url-input', 'payload-url-input')}
          className={
            payload.validate && payload.url.href && !isValidUrl(payload.url.href)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && payload.url.href && !isValidUrl(payload.url.href) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidUrl', 'Enter a valid URL (must start with http:// or https://)')}
          </p>
        )}
      </div>
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
