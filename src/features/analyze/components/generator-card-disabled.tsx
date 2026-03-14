import { QrCode } from 'lucide-react';
import type { useTranslation } from 'react-i18next';

export function GeneratorCardDisabled({
  t,
}: Readonly<{ t: ReturnType<typeof useTranslation>['t'] }>) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border opacity-40 h-full shadow-sm">
      <QrCode className="w-6 h-6 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {t('analyze.useCurrentQr', 'Current QR')}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {t('analyze.noQrGenerated', 'Generate one first')}
        </p>
      </div>
    </div>
  );
}
