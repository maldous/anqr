import { Capacitor } from '@capacitor/core';
import { Check, Download, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/primitives/button';

export function HeaderMobileFooter({
  handleShare,
  onExport,
  copied,
  bannerHeight,
}: Readonly<{
  handleShare: () => void;
  onExport?: () => void;
  copied: boolean;
  bannerHeight: number;
}>) {
  const { t } = useTranslation();
  return (
    <div
      className="md:hidden fixed left-0 right-0 z-50 border-t bg-card p-2 shadow-lg"
      style={{
        bottom: Capacitor.isNativePlatform() ? `${bannerHeight + 40}px` : '48px',
        paddingBottom: Capacitor.isNativePlatform() ? '0.25rem' : 'calc(0.5rem + var(--sab, 0px))',
      }}
    >
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 shadow-sm"
          onClick={handleShare}
          title={t('accessibility.copyShareLink')}
          aria-label={
            copied
              ? t('share.copied', 'Link copied')
              : t('accessibility.copyShareLink', 'Copy share link')
          }
        >
          {copied ? (
            <Check className="h-4 w-4 mr-2" aria-hidden="true" />
          ) : (
            <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
          )}
          {copied ? t('share.copied') : t('header.share')}
        </Button>
        <Button
          size="sm"
          className="flex-1 shadow-sm"
          onClick={onExport}
          title={t('accessibility.exportQrCode')}
          aria-label={t('accessibility.exportQrCode', 'Export QR code')}
        >
          <Download className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('header.export')}
        </Button>
      </div>
    </div>
  );
}
