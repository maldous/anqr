import { OpenLocationCode } from "open-location-code";
import { useMemo } from "react";
import { createLogger } from "@/lib/logger";
import { HighlightedLabel } from "../../search/search-context";
import { Label } from "@/ui/web";
import type { PlusCodeDisplayProps } from "./plus-code-display.types";

const log = createLogger("PAYLOAD");

export function PlusCodeDisplay({ lat, lon, t }: PlusCodeDisplayProps) {
  const { plusCode, shortCode, error } = useMemo(() => {
    try {
      // @ts-expect-error runtime API is instance-based
      const fullCode = new OpenLocationCode().encode(lat, lon, 10);
      const plusIndex = fullCode.indexOf("+");
      const shortened = plusIndex >= 4 ? fullCode.substring(plusIndex - 4) : fullCode;
      log.debug("Plus Code debug", { lat, lon, fullCode, plusIndex, shortCode: shortened });
      return { plusCode: fullCode, shortCode: shortened, error: null };
    } catch (e) {
      log.error("Plus Code generation error", { error: e });
      return {
        plusCode: null,
        shortCode: null,
        error:
          e instanceof Error
            ? e.message
            : t("payload.plusCodeFailed", "Failed to generate Plus Code"),
      };
    }
  }, [lat, lon, t]);

  const googleMapsUrl = plusCode
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plusCode)}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  const displayText = shortCode || plusCode || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;

  return (
    <div className="space-y-2 pt-2 border-t">
      <Label>
        <HighlightedLabel>
          {plusCode ? t("payload.plusCode", "Plus Code") : t("payload.coordinates", "Coordinates")}
        </HighlightedLabel>
      </Label>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono overflow-hidden text-ellipsis">
          {displayText}
        </code>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 whitespace-nowrap"
        >
          {t("actions.open", "Open")}
        </a>
      </div>
      {error ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {t("hints.plusCodeFallback", "Plus Code unavailable, using coordinates.")}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t(
            "hints.plusCodeShort",
            `Short Plus Code - search in Google Maps with a city name (e.g., "${displayText} Melbourne").`,
          )}
        </p>
      )}
    </div>
  );
}
