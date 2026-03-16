import { BarChart3, Code2 } from "lucide-react";
import { useMemo } from "react";
import { DetailRow } from "@/features/analyze/components/detail-row";

export function EncodingEfficiency({
  payload,
  payloadBytes,
  encodingMode,
}: Readonly<{
  payload: string;
  payloadBytes?: Uint8Array;
  encodingMode: string | null;
}>) {
  const analysis = useMemo(() => {
    const numericChars = (payload.match(/\d/g) || []).length;
    const alphanumericChars = (payload.match(/[0-9A-Z $%*+\-./:]/gi) || []).length;
    const byteChars = payload.length;
    const byteBits = byteChars * 8;
    const numericPercentage = byteChars > 0 ? Math.round((numericChars / byteChars) * 100) : 0;
    const alphanumericPercentage =
      byteChars > 0 ? Math.round((alphanumericChars / byteChars) * 100) : 0;
    let optimalMode = "byte";
    if (numericPercentage === 100) optimalMode = "numeric";
    else if (alphanumericPercentage === 100) optimalMode = "alphanumeric";
    else if (numericPercentage > 50 || alphanumericPercentage > 50) optimalMode = "mixed";
    return {
      numericPercentage,
      alphanumericPercentage,
      optimalMode,
      bytesUsed: payloadBytes?.length ?? new TextEncoder().encode(payload).length,
      estimatedBits: Math.round(byteBits),
    };
  }, [payload, payloadBytes]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-muted/50">
          <div className="text-lg font-bold text-primary">{analysis.numericPercentage}%</div>
          <div className="text-[10px] text-muted-foreground">Numeric</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {analysis.alphanumericPercentage}%
          </div>
          <div className="text-[10px] text-muted-foreground">Alphanumeric</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {analysis.bytesUsed}
          </div>
          <div className="text-[10px] text-muted-foreground">Bytes</div>
        </div>
      </div>
      <DetailRow
        label="Current Mode"
        value={<span className="capitalize">{encodingMode || "Unknown"}</span>}
        icon={<Code2 className="w-3.5 h-3.5" />}
      />
      <DetailRow
        label="Optimal Mode"
        value={
          <span
            className={`capitalize ${
              analysis.optimalMode === encodingMode
                ? "text-green-600 dark:text-green-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {analysis.optimalMode}
            {analysis.optimalMode === encodingMode && " ✓"}
          </span>
        }
        icon={<BarChart3 className="w-3.5 h-3.5" />}
      />
      <DetailRow label="Estimated Size" value={`${analysis.estimatedBits} bits`} />
    </div>
  );
}
