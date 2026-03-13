import { ArrowRight, Eye, Palette } from 'lucide-react';
import type { QRAnalysisResult } from '@/modules/qr-analyzer';
import { CollapsibleSection } from '@/features/analyze/components/collapsible-section';
import { ColorSwatch } from '@/features/analyze/components/color-swatch';
import { DetailRow } from '@/features/analyze/components/detail-row';
import { WCAGBadge } from '@/features/analyze/components/wcag-badge';
import { wcagComplianceClass } from '@/features/analyze/lib/formatters';

type ColorsWcagSectionProps = {
  detectedColors: NonNullable<QRAnalysisResult['detectedColors']>;
  dominantColors: QRAnalysisResult['dominantColors'];
};

export const ColorsWcagSection = ({
  detectedColors,
  dominantColors,
}: Readonly<ColorsWcagSectionProps>) => {
  return (
    <CollapsibleSection
      title="Colors & WCAG Compliance"
      icon={<Palette className="w-4 h-4" />}
      badge={<WCAGBadge ratio={detectedColors.contrastRatio} size="sm" />}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <ColorSwatch color={detectedColors.foreground} label="Foreground" />
          <div className="flex flex-col items-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">contrast</span>
          </div>
          <ColorSwatch color={detectedColors.background} label="Background" />
        </div>

        {dominantColors && dominantColors.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Dominant Palette
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {dominantColors.map((entry, idx) => (
                <div key={`${entry.color}-${idx}`} className="p-2 rounded-md bg-muted/50">
                  <ColorSwatch color={entry.color} label={`#${idx + 1} • ${entry.percentage}%`} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-muted/50 space-y-2 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">WCAG Compliance</span>
            <WCAGBadge ratio={detectedColors.contrastRatio} size="md" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`p-2 rounded ${wcagComplianceClass(detectedColors.contrastRatio, 3)}`}>
              <div className="font-bold">AA-Large</div>
              <div className="text-[10px]">≥3:1</div>
            </div>
            <div
              className={`p-2 rounded ${wcagComplianceClass(detectedColors.contrastRatio, 4.5)}`}
            >
              <div className="font-bold">AA</div>
              <div className="text-[10px]">≥4.5:1</div>
            </div>
            <div className={`p-2 rounded ${wcagComplianceClass(detectedColors.contrastRatio, 7)}`}>
              <div className="font-bold">AAA</div>
              <div className="text-[10px]">≥7:1</div>
            </div>
          </div>
        </div>

        <DetailRow
          label="Contrast Ratio"
          value={`${detectedColors.contrastRatio.toFixed(2)}:1`}
          icon={<Eye className="w-3.5 h-3.5" />}
        />
      </div>
    </CollapsibleSection>
  );
};
