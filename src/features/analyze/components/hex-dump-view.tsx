import { useMemo, useState } from "react";
import { Button } from "@/ui/primitives/button";
import { CopyButton } from "@/features/analyze/components/copy-button";

export const HexDumpView = ({
  bytes,
  maxRows = 16,
}: Readonly<{
  bytes: Uint8Array;
  maxRows?: number;
}>) => {
  const [expanded, setExpanded] = useState(false);
  const bytesPerRowDesktop = 16;
  const bytesPerRowMobile = 8;
  const totalRowsMobile = Math.ceil(bytes.length / bytesPerRowMobile);
  const displayRowsMobile = expanded ? totalRowsMobile : Math.min(maxRows, totalRowsMobile);
  const totalRowsDesktop = Math.ceil(bytes.length / bytesPerRowDesktop);
  const displayRowsDesktop = expanded ? totalRowsDesktop : Math.min(maxRows, totalRowsDesktop);

  const hexDumpMobile = useMemo(() => {
    const rows: Array<{ offset: string; hex: string; ascii: string }> = [];
    for (
      let i = 0;
      i < displayRowsMobile * bytesPerRowMobile && i < bytes.length;
      i += bytesPerRowMobile
    ) {
      const slice = bytes.slice(i, Math.min(i + bytesPerRowMobile, bytes.length));
      const hex = Array.from(slice)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
      const ascii = Array.from(slice)
        .map((b) => (b >= 32 && b <= 126 ? String.fromCodePoint(b) : "."))
        .join("");
      rows.push({
        offset: i.toString(16).padStart(4, "0"),
        hex: hex.padEnd(bytesPerRowMobile * 3 - 1, " "),
        ascii: ascii.padEnd(bytesPerRowMobile, " "),
      });
    }
    return rows;
  }, [bytes, displayRowsMobile]);

  const hexDumpDesktop = useMemo(() => {
    const rows: Array<{ offset: string; hex: string; ascii: string }> = [];
    for (
      let i = 0;
      i < displayRowsDesktop * bytesPerRowDesktop && i < bytes.length;
      i += bytesPerRowDesktop
    ) {
      const slice = bytes.slice(i, Math.min(i + bytesPerRowDesktop, bytes.length));
      const hex = Array.from(slice)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
      const ascii = Array.from(slice)
        .map((b) => (b >= 32 && b <= 126 ? String.fromCodePoint(b) : "."))
        .join("");
      rows.push({
        offset: i.toString(16).padStart(4, "0"),
        hex: hex.padEnd(bytesPerRowDesktop * 3 - 1, " "),
        ascii: ascii.padEnd(bytesPerRowDesktop, " "),
      });
    }
    return rows;
  }, [bytes, displayRowsDesktop]);

  const fullHex = useMemo(
    () =>
      Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" "),
    [bytes],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{bytes.length} bytes</span>
        <CopyButton text={fullHex} label="Copy Hex" />
      </div>
      <div className="bg-muted/50 rounded-lg shadow-inner p-2 md:hidden">
        <div className="font-mono text-[9px] leading-relaxed">
          <div className="grid grid-cols-[4ch_1fr_1fr] gap-2 text-muted-foreground mb-1 border-b border-muted pb-1">
            <span>Addr</span>
            <span>Hex</span>
            <span>ASCII</span>
          </div>
          {hexDumpMobile.map((row) => (
            <div key={row.offset} className="grid grid-cols-[4ch_1fr_1fr] gap-2">
              <span className="text-blue-500 dark:text-blue-400">{row.offset}</span>
              <span className="text-foreground">{row.hex}</span>
              <span className="text-green-600 dark:text-green-400">{row.ascii}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-muted/50 rounded-lg shadow-inner p-3 hidden md:block">
        <div className="font-mono text-[10px] leading-relaxed">
          <div className="grid grid-cols-[4ch_1fr_1fr] gap-3 text-muted-foreground mb-1 border-b border-muted pb-1">
            <span>Addr</span>
            <span>Hex</span>
            <span>ASCII</span>
          </div>
          {hexDumpDesktop.map((row) => (
            <div key={row.offset} className="grid grid-cols-[4ch_1fr_1fr] gap-3">
              <span className="text-blue-500 dark:text-blue-400">{row.offset}</span>
              <span className="text-foreground">{row.hex}</span>
              <span className="text-green-600 dark:text-green-400">{row.ascii}</span>
            </div>
          ))}
        </div>
      </div>
      {totalRowsMobile > maxRows && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs shadow-sm"
        >
          {expanded ? "Show Less" : `Show All (${totalRowsMobile} rows)`}
        </Button>
      )}
    </div>
  );
};
