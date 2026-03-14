import { BarChart3 } from 'lucide-react';
import { CapacityByModeTable } from '@/features/analyze/components/capacity-by-mode-table';
import { CollapsibleSection } from '@/features/analyze/components/collapsible-section';
import { EncodingEfficiency } from '@/features/analyze/components/encoding-efficiency';
import type { QRAnalysisResult } from '@/modules/qr-analyzer';

export function AnalyzeCapacityGrid({ result }: Readonly<{ result: QRAnalysisResult }>) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {result.version !== null && result.eccLevel && (
        <CollapsibleSection title="Capacity by Mode" icon={<BarChart3 className="w-4 h-4" />}>
          <CapacityByModeTable
            version={result.version}
            eccLevel={result.eccLevel}
            currentBytes={result.payloadBytes?.length}
          />
        </CollapsibleSection>
      )}
      {result.payload && (
        <CollapsibleSection title="Encoding Efficiency" icon={<BarChart3 className="w-4 h-4" />}>
          <EncodingEfficiency
            payload={result.payload}
            payloadBytes={result.payloadBytes}
            encodingMode={result.encodingMode}
          />
        </CollapsibleSection>
      )}
    </div>
  );
}
