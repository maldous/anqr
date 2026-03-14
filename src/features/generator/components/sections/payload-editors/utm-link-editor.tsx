import { HighlightedLabel } from '@/app/search/search-context';
import { isValidUrl } from '@/modules/payload-generators';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import type { EditorProps } from '../payload-editor-props';

export function UtmLinkEditor({
  payload,
  setPayloadUrl,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadUrl' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.baseUrl')}</HighlightedLabel>
        </Label>
        <Input
          type="url"
          value={payload.url.href}
          onChange={(e) => setPayloadUrl({ href: e.target.value })}
          placeholder="https://anqr.link/landing"
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
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.campaignSource')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.url.utmSource || ''}
          onChange={(e) => setPayloadUrl({ utmSource: e.target.value })}
          placeholder="qr_code"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.campaignMedium')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.url.utmMedium || ''}
          onChange={(e) => setPayloadUrl({ utmMedium: e.target.value })}
          placeholder="print"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.campaignName')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.url.utmCampaign || ''}
          onChange={(e) => setPayloadUrl({ utmCampaign: e.target.value })}
          placeholder="summer_sale_2024"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.campaignTerm')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.url.utmTerm || ''}
          onChange={(e) => setPayloadUrl({ utmTerm: e.target.value })}
          placeholder="keyword"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.campaignContent')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.url.utmContent || ''}
          onChange={(e) => setPayloadUrl({ utmContent: e.target.value })}
          placeholder="banner_ad"
        />
      </div>
    </div>
  );
}
