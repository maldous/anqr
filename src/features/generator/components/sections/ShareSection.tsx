import { Check, Code, Copy, Link, MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/primitives/button';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Switch } from '@/ui/primitives/switch';
import { HighlightedLabel } from '@/app/search/search-context';
import { trackEvent } from '@/infra/telemetry/zaraz';
import { copyToClipboard } from '@/platform/browser/clipboard';
import {
  generateImageEmbed,
  generateMarkdownEmbed,
  getShareableUrl,
  getSocialShareUrls,
} from '@/modules/share-links';
import { useQRStore } from '@/store/qr-store';
import { buildShareConfig } from './share-section-config';

export function ShareSection() {
  const {
    share,
    setShare,
    getPayloadText,
    qr,
    render,
    overlay,
    animation,
    output,
    safety,
    qa,
    auto,
    watermark,
    metadata,
  } = useQRStore();
  const { t, i18n } = useTranslation();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Build shareable URL from current config
  const shareableUrl = useMemo(() => {
    const config = {
      ...buildShareConfig(
        getPayloadText,
        qr,
        render,
        overlay,
        animation,
        output,
        safety,
        qa,
        auto,
        watermark,
        metadata
      ),
      lang: i18n.language,
    };
    return getShareableUrl(config);
  }, [
    getPayloadText,
    qr,
    render,
    overlay,
    animation,
    output,
    safety,
    qa,
    auto,
    watermark,
    metadata,
    i18n.language,
  ]);

  const embedCode = useMemo(() => {
    return generateImageEmbed(shareableUrl, 'QR Code', { width: 200, height: 200 });
  }, [shareableUrl]);

  const markdownEmbed = useMemo(() => {
    return generateMarkdownEmbed(shareableUrl, 'QR Code');
  }, [shareableUrl]);

  const socialUrls = useMemo(() => {
    return getSocialShareUrls(shareableUrl, 'Check out this QR code!');
  }, [shareableUrl]);

  // Count the number of URL parameters being shared
  const _paramCount = useMemo(() => {
    try {
      const url = new URL(shareableUrl);
      return url.searchParams.size;
    } catch {
      return 0;
    }
  }, [shareableUrl]);

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      trackEvent('share', { method: field });
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Direct Link */}
      <div className="flex items-center justify-between">
        <div>
          <Label>
            <HighlightedLabel>{t('share.directLink')}</HighlightedLabel>
          </Label>
          <p className="text-xs text-muted-foreground">{t('share.directLinkDesc')}</p>
        </div>
        <Switch
          data-testid={DynamicTestId.resolve(
            'share-direct-link-switch',
            'share-direct-link-switch'
          )}
          checked={share.directLink}
          onCheckedChange={(checked) => setShare({ directLink: checked })}
        />
      </div>

      {share.directLink && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              data-testid={DynamicTestId.resolve(
                'share-direct-link-input',
                'share-direct-link-input'
              )}
              readOnly
              value={shareableUrl}
              className="flex-1 text-xs"
            />
            <Button
              data-testid={DynamicTestId.resolve(
                'share-copy-link-button',
                'share-copy-link-button'
              )}
              variant="outline"
              size="icon"
              onClick={() => handleCopy(shareableUrl, 'link')}
            >
              {copiedField === 'link' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Embed HTML */}
      <div className="flex items-center justify-between">
        <div>
          <Label>
            <HighlightedLabel>{t('share.embedHtml')}</HighlightedLabel>
          </Label>
          <p className="text-xs text-muted-foreground">{t('share.embedHtmlDesc')}</p>
        </div>
        <Switch
          data-testid={DynamicTestId.resolve('share-embed-html-switch', 'share-embed-html-switch')}
          checked={share.embedHtml}
          onCheckedChange={(checked) => setShare({ embedHtml: checked })}
        />
      </div>

      {share.embedHtml && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              data-testid={DynamicTestId.resolve(
                'share-embed-code-input',
                'share-embed-code-input'
              )}
              readOnly
              value={embedCode}
              className="flex-1 text-xs font-mono"
            />
            <Button
              data-testid={DynamicTestId.resolve(
                'share-copy-embed-button',
                'share-copy-embed-button'
              )}
              variant="outline"
              size="icon"
              onClick={() => handleCopy(embedCode, 'embed')}
            >
              {copiedField === 'embed' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Code className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              data-testid={DynamicTestId.resolve('share-markdown-input', 'share-markdown-input')}
              readOnly
              value={markdownEmbed}
              className="flex-1 text-xs font-mono"
              placeholder={t('share.markdown')}
            />
            <Button
              data-testid={DynamicTestId.resolve(
                'share-copy-markdown-button',
                'share-copy-markdown-button'
              )}
              variant="outline"
              size="icon"
              onClick={() => handleCopy(markdownEmbed, 'markdown')}
            >
              {copiedField === 'markdown' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Encode More Params */}
      <div className="flex items-center justify-between">
        <div>
          <Label>
            <HighlightedLabel>{t('share.encodeAllParams')}</HighlightedLabel>
          </Label>
          <p className="text-xs text-muted-foreground">{t('share.encodeAllParamsDesc')}</p>
        </div>
        <Switch
          data-testid={DynamicTestId.resolve(
            'share-encode-more-params-switch',
            'share-encode-more-params-switch'
          )}
          checked={share.encodeMoreParams}
          onCheckedChange={(checked) => setShare({ encodeMoreParams: checked })}
        />
      </div>

      {/* Quick Share Buttons */}
      <div className="pt-2 border-t space-y-2">
        <Label className="text-muted-foreground">
          <HighlightedLabel>{t('share.quickShare')}</HighlightedLabel>
        </Label>
        <div className="flex gap-2">
          <Button
            data-testid={DynamicTestId.resolve(
              'share-quick-copy-button',
              'share-quick-copy-button'
            )}
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleCopy(shareableUrl, 'quick')}
          >
            {copiedField === 'quick' ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Link className="h-4 w-4 mr-2" />
            )}
            {copiedField === 'quick' ? t('share.copied') : t('share.copyLink')}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            data-testid={DynamicTestId.resolve('share-twitter-button', 'share-twitter-button')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <a
              href={socialUrls.twitter}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('share', { method: 'twitter' })}
            >
              {t('share.twitter')}
            </a>
          </Button>
          <Button
            asChild
            data-testid={DynamicTestId.resolve('share-whatsapp-button', 'share-whatsapp-button')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <a
              href={socialUrls.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('share', { method: 'whatsapp' })}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {t('share.whatsapp')}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
