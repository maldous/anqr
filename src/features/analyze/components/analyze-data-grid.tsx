import { Binary, Grid3x3, Settings } from "lucide-react";
import { CollapsibleSection } from "@/features/analyze/components/collapsible-section";
import { HexDumpView } from "@/features/analyze/components/hex-dump-view";
import { ModuleMatrixView } from "@/features/analyze/components/module-matrix-view";
import type { QRAnalysisResult } from "@/modules/qr-analyzer";

export function AnalyzeDataGrid({ result }: Readonly<{ result: QRAnalysisResult }>) {
  return (
    <div className="grid md:grid-cols-1 gap-4">
      {result.payloadBytes && result.payloadBytes.length > 0 && (
        <CollapsibleSection
          title="Binary Data (Hex Dump)"
          icon={<Binary className="w-4 h-4" />}
          badge={
            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-muted">
              {result.payloadBytes.length} bytes
            </span>
          }
        >
          <HexDumpView bytes={result.payloadBytes} maxRows={8} />
        </CollapsibleSection>
      )}
      {result.moduleMatrix && result.moduleMatrix.length > 0 && (
        <CollapsibleSection
          title="Module Matrix"
          icon={<Grid3x3 className="w-4 h-4" />}
          testId="analyze-section-module-matrix"
          badge={
            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-muted">
              {result.moduleMatrix.length}x{result.moduleMatrix.length}
            </span>
          }
        >
          <ModuleMatrixView
            matrix={result.moduleMatrix}
            version={result.version}
            fgColor={result.detectedColors?.foreground}
            bgColor={result.detectedColors?.background}
          />
        </CollapsibleSection>
      )}
      {result.debugLog && (
        <CollapsibleSection
          title="Debug Log"
          icon={<Settings className="w-4 h-4" />}
          defaultOpen={false}
        >
          <pre className="text-xs font-mono bg-muted/50 p-3 rounded-lg overflow-x-auto max-h-64 whitespace-pre-wrap break-all">
            {result.debugLog}
          </pre>
        </CollapsibleSection>
      )}
    </div>
  );
}
