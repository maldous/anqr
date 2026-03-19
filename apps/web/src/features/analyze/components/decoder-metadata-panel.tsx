import { Binary, Database, Hash, Layers, Settings, Shield } from "lucide-react";
import {
  formatDecoderErrors,
  formatDecoderErasures,
  formatDecoderMaskPattern,
  formatDecoderNumBits,
  formatDecoderOrientation,
  formatDecoderVersion,
} from "@/application/analyze";
import type { QRAnalysisResult } from "@/contracts/analyze";
import { CollapsibleSection } from "./collapsible-section";
import { DetailRow } from "./detail-row";

export const DecoderMetadataPanel = ({
  decoderMetadata,
}: Readonly<{
  decoderMetadata: NonNullable<QRAnalysisResult["decoderMetadata"]>;
}>) => {
  return (
    <CollapsibleSection
      title="Decoder Metadata"
      icon={<Database className="w-4 h-4" />}
      testId="analyze-section-decoder-metadata"
      defaultOpen={true}
      badge={
        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400">
          Authoritative
        </span>
      }
    >
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted/50 rounded">
          Raw decoder output - authoritative source for reproduction.
        </div>
        <DetailRow
          label="Version"
          value={formatDecoderVersion(decoderMetadata.version)}
          icon={<Hash className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Mask Pattern"
          value={formatDecoderMaskPattern(decoderMetadata.maskPattern)}
          icon={<Layers className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="ECC Level"
          value={
            decoderMetadata.eccLevel ?? <span className="text-amber-500">— (not detected)</span>
          }
          icon={<Shield className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Errors Corrected"
          value={formatDecoderErrors(decoderMetadata.errorsCorrected)}
          icon={<Shield className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Erasures"
          value={formatDecoderErasures(decoderMetadata.erasures)}
          icon={<Shield className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Raw Bits"
          value={formatDecoderNumBits(decoderMetadata.numBits)}
          icon={<Binary className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Orientation"
          value={formatDecoderOrientation(decoderMetadata.orientation)}
          icon={<Settings className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Structured Append"
          value={
            decoderMetadata.hasStructuredAppend
              ? `Seq ${decoderMetadata.structuredAppendSequence}, Parity ${decoderMetadata.structuredAppendParity}`
              : "No"
          }
          icon={<Layers className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Byte Segments"
          value={
            decoderMetadata.byteSegmentCount > 0
              ? `${decoderMetadata.byteSegmentCount} segment(s), ${decoderMetadata.totalByteLength} bytes`
              : "None"
          }
          icon={<Database className="w-3.5 h-3.5" />}
        />
      </div>
    </CollapsibleSection>
  );
};
