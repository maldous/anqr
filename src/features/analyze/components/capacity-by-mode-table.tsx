import { Binary, Globe, Hash, Type } from "lucide-react";
import type { ECCLevel } from "@/modules/qr-analyzer";
import {
  ECC_CAPACITIES_ALPHANUMERIC,
  ECC_CAPACITIES_BYTE,
  ECC_CAPACITIES_NUMERIC,
} from "@/modules/qr-spec";

export const CapacityByModeTable = ({
  version,
  eccLevel,
  currentBytes,
}: Readonly<{
  version: number;
  eccLevel: ECCLevel;
  currentBytes?: number;
}>) => {
  const versionIndex = version - 1;
  const capacities = [
    {
      mode: "Numeric",
      icon: <Hash className="w-3.5 h-3.5" />,
      capacity: ECC_CAPACITIES_NUMERIC[eccLevel]?.[versionIndex] ?? 0,
      unit: "digits",
    },
    {
      mode: "Alphanumeric",
      icon: <Type className="w-3.5 h-3.5" />,
      capacity: ECC_CAPACITIES_ALPHANUMERIC[eccLevel]?.[versionIndex] ?? 0,
      unit: "chars",
    },
    {
      mode: "Byte",
      icon: <Binary className="w-3.5 h-3.5" />,
      capacity: ECC_CAPACITIES_BYTE[eccLevel]?.[versionIndex] ?? 0,
      unit: "bytes",
      current: currentBytes,
    },
    {
      mode: "Kanji",
      icon: <Globe className="w-3.5 h-3.5" />,
      capacity: Math.floor((ECC_CAPACITIES_BYTE[eccLevel]?.[versionIndex] ?? 0) * 0.6),
      unit: "chars",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground mb-2">
        Maximum capacity for Version {version} with ECC {eccLevel}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {capacities.map((cap) => (
          <div
            key={cap.mode}
            className={`p-2.5 rounded-lg border bg-card ${
              cap.current === undefined ? "" : "ring-1 ring-primary/50"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <div className="text-muted-foreground">{cap.icon}</div>
              <span className="text-xs font-medium">{cap.mode}</span>
            </div>
            <div className="text-lg font-bold">
              {cap.capacity.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground ml-1">{cap.unit}</span>
            </div>
            {cap.current !== undefined && (
              <div className="mt-1">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      cap.current / cap.capacity > 0.9
                        ? "bg-red-500"
                        : cap.current / cap.capacity > 0.7
                          ? "bg-amber-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(100, (cap.current / cap.capacity) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {cap.current} used ({Math.round((cap.current / cap.capacity) * 100)}%)
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
