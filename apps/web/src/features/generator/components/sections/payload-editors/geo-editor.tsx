import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import { HighlightedLabel } from "../../../search/search-context";
import { isValidLatitude, isValidLongitude } from "../../../../../../../../packages/domain/payload/src/payload-generators";
import { Input } from "../../../../../../../../packages/ui/web/src/primitives/input";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";
import { PlusCodeDisplay } from "../payload-plus-code-display";
import type { EditorProps } from "../payload-editor.types";
import { runLookup } from "../run-geo-lookup";

export function GeoEditor({
  payload,
  setPayloadGeo,
  t,
}: Readonly<Pick<EditorProps, "payload" | "setPayloadGeo" | "t">>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.addressLookup", "Address Lookup")}</HighlightedLabel>
        </Label>
        <div className="flex gap-2">
          <Input
            value={payload.geo.query || ""}
            onChange={(e) => setPayloadGeo({ query: e.target.value })}
            placeholder={t("placeholders.placeNameOrAddress", "Enter address or place name")}
            data-testid={DynamicTestId.resolve(
              "payload-geo-query-input",
              "payload-geo-query-input",
            )}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runLookup(payload.geo.query || "", setPayloadGeo);
              }
            }}
          />
          <button
            type="button"
            className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            disabled={!payload.geo.query}
            onClick={() => runLookup(payload.geo.query || "", setPayloadGeo)}
          >
            {t("actions.lookup", "Lookup")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("hints.geoLookup", "Enter an address and click Lookup to find coordinates.")}
        </p>
      </div>
      <PlusCodeDisplay lat={payload.geo.lat} lon={payload.geo.lon} t={t} />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t("payload.latitude")}</HighlightedLabel>
          </Label>
          <Input
            type="number"
            step="any"
            value={payload.geo.lat}
            onChange={(e) => setPayloadGeo({ lat: Number.parseFloat(e.target.value) || 0 })}
            placeholder="0.0"
            data-testid={DynamicTestId.resolve("payload-geo-lat-input", "payload-geo-lat-input")}
            className={
              payload.validate && !isValidLatitude(payload.geo.lat)
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {payload.validate && !isValidLatitude(payload.geo.lat) && (
            <p className="text-xs text-destructive">
              {t("validation.invalidLatitude", "Latitude must be between -90 and 90")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t("payload.longitude")}</HighlightedLabel>
          </Label>
          <Input
            type="number"
            step="any"
            value={payload.geo.lon}
            onChange={(e) => setPayloadGeo({ lon: Number.parseFloat(e.target.value) || 0 })}
            placeholder="0.0"
            data-testid={DynamicTestId.resolve("payload-geo-lon-input", "payload-geo-lon-input")}
            className={
              payload.validate && !isValidLongitude(payload.geo.lon)
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {payload.validate && !isValidLongitude(payload.geo.lon) && (
            <p className="text-xs text-destructive">
              {t("validation.invalidLongitude", "Longitude must be between -180 and 180")}
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("hints.geoNote", "The QR code will contain: geo:{lat},{lon}")}
      </p>
    </div>
  );
}
