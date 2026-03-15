import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/app/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { isValidUrl } from '@/modules/payload-generators';
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

export const AppLinkEditor = ({
  payload,
  setPayloadAppLink,
  setPayloadText,
  t,
}: Readonly<{
  payload: QRState['payload'];
  setPayloadAppLink: QRState['setPayloadAppLink'];
  setPayloadText: QRState['setPayloadText'];
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.platform')}</HighlightedLabel>
      </Label>
      <Select
        value={payload.appLink.platform}
        onValueChange={(v) => setPayloadAppLink({ platform: v as typeof payload.appLink.platform })}
      >
        <SelectTrigger
          data-testid={DynamicTestId.resolve(
            'payload-applink-platform-select',
            'payload-applink-platform-select'
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="universal">{t('payload.universalLink')}</SelectItem>
          <SelectItem value="android">{t('payload.androidIntent')}</SelectItem>
          <SelectItem value="ios">iOS URL Scheme</SelectItem>
          <SelectItem value="custom">{t('payload.customScheme')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    {payload.appLink.platform === 'universal' ? (
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.deepLinkUrl')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.text}
          onChange={(e) => setPayloadText(e.target.value)}
          placeholder="https://myapp.com/path/to/content"
          data-testid={DynamicTestId.resolve(
            'payload-applink-url-input',
            'payload-applink-url-input'
          )}
          className={
            payload.validate && payload.text && !isValidUrl(payload.text)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate && payload.text && !isValidUrl(payload.text) && (
          <p className="text-xs text-destructive">
            {t('validation.invalidUrl', 'Enter a valid URL (must start with http:// or https://)')}
          </p>
        )}
      </div>
    ) : (
      <>
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.scheme')}</HighlightedLabel>
          </Label>
          <Input
            value={payload.appLink.scheme || ''}
            onChange={(e) => setPayloadAppLink({ scheme: e.target.value })}
            placeholder={payload.appLink.platform === 'android' ? 'https' : 'myapp'}
            data-testid={DynamicTestId.resolve(
              'payload-applink-scheme-input',
              'payload-applink-scheme-input'
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('payload.host')}</HighlightedLabel>
            </Label>
            <Input
              value={payload.appLink.host || ''}
              onChange={(e) => setPayloadAppLink({ host: e.target.value })}
              placeholder="myapp.com"
              data-testid={DynamicTestId.resolve(
                'payload-applink-host-input',
                'payload-applink-host-input'
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('payload.path')}</HighlightedLabel>
            </Label>
            <Input
              value={payload.appLink.path || ''}
              onChange={(e) => setPayloadAppLink({ path: e.target.value })}
              placeholder="/page/content"
              data-testid={DynamicTestId.resolve(
                'payload-applink-path-input',
                'payload-applink-path-input'
              )}
            />
          </div>
        </div>
        {payload.appLink.platform === 'android' && (
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('payload.packageName')}</HighlightedLabel>
            </Label>
            <Input
              value={payload.appLink.package || ''}
              onChange={(e) => setPayloadAppLink({ package: e.target.value })}
              placeholder="com.example.myapp"
              data-testid={DynamicTestId.resolve(
                'payload-applink-package-input',
                'payload-applink-package-input'
              )}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t('payload.fallbackUrl')}</HighlightedLabel>
          </Label>
          <Input
            type="url"
            value={payload.appLink.fallbackUrl || ''}
            onChange={(e) => setPayloadAppLink({ fallbackUrl: e.target.value })}
            placeholder="https://anqr.link/app"
            data-testid={DynamicTestId.resolve(
              'payload-applink-fallback-input',
              'payload-applink-fallback-input'
            )}
          />
        </div>
      </>
    )}
    <p className="text-xs text-muted-foreground">{t('hints.appLinkNote')}</p>
  </div>
);
