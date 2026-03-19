import { Grid3x3, Hash, Layers, Shield } from "lucide-react";
import { CollapsibleSection } from "./collapsible-section";
import { DetailRow } from "./detail-row";
import { ECC_DESCRIPTIONS } from "./ecc-descriptions";
import { MASK_DESCRIPTIONS } from "./mask-descriptions";
import type { ECCLevel } from "@/contracts/analyze";

export function QrStructurePanel({
  version,
  moduleCount,
  eccLevel,
  maskPattern,
}: Readonly<{
  version: number | null;
  moduleCount: number;
  eccLevel: ECCLevel | null;
  maskPattern: number | null;
}>) {
  return (
    <CollapsibleSection
      title="QR Structure"
      icon={<Grid3x3 className="w-4 h-4" />}
      testId="analyze-section-qr-structure"
    >
      <div className="space-y-2">
        <DetailRow
          label="Version"
          value={version === null ? "—" : `${version} (${moduleCount}×${moduleCount} modules)`}
          icon={<Hash className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Error Correction"
          value={
            eccLevel ? (
              <div className="text-right">
                <div>Level {eccLevel}</div>
                <div className="text-xs text-muted-foreground">
                  {ECC_DESCRIPTIONS[eccLevel].recovery} recovery
                </div>
              </div>
            ) : (
              "—"
            )
          }
          icon={<Shield className="w-3.5 h-3.5" />}
        />
        <DetailRow
          label="Mask Pattern"
          value={
            maskPattern === null ? (
              "—"
            ) : (
              <div className="text-right">
                <div>Pattern {maskPattern}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {MASK_DESCRIPTIONS[maskPattern]}
                </div>
              </div>
            )
          }
          icon={<Layers className="w-3.5 h-3.5" />}
        />
      </div>
    </CollapsibleSection>
  );
}
