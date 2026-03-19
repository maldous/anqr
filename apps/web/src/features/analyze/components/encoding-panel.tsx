import { Binary, Database, Shield, Type } from "lucide-react";
import { CollapsibleSection } from "./collapsible-section";
import { DetailRow } from "./detail-row";
import { formatRsErrorCorrection } from "@/application/analyze";

export function EncodingPanel({
  encodingMode,
  payloadBytes,
  errorsCorrected,
}: Readonly<{
  encodingMode: string | null;
  payloadBytes: Uint8Array | undefined;
  errorsCorrected: number | null;
}>) {
  return (
    <CollapsibleSection
      title="Encoding"
      icon={<Binary className="w-4 h-4" />}
      testId="analyze-section-encoding"
      badge={
        errorsCorrected !== null && errorsCorrected > 0 ? (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {errorsCorrected} error
            {errorsCorrected === 1 ? "" : "s"} corrected
          </span>
        ) : null
      }
    >
      <div className="space-y-2">
        <DetailRow
          label="Mode"
          value={<span className="capitalize">{encodingMode || "Unknown"}</span>}
          icon={<Type className="w-3.5 h-3.5" />}
        />
        {payloadBytes && (
          <DetailRow
            label="Raw Bytes"
            value={`${payloadBytes.length} bytes`}
            icon={<Database className="w-3.5 h-3.5" />}
          />
        )}
        <DetailRow
          label="RS Error Correction"
          value={formatRsErrorCorrection(errorsCorrected)}
          icon={<Shield className="w-3.5 h-3.5" />}
        />
      </div>
    </CollapsibleSection>
  );
}
