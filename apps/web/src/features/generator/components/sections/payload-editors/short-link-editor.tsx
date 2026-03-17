import type { TFunction } from "i18next";
import { HighlightedLabel } from "../../../search/search-context";
import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import { isValidUrl } from "../../../../../../../../packages/domain/payload/src/payload-generators";
import type { QRState } from "../../../../../state/qr-store";
import { Input } from "../../../../../../../../packages/ui/web/src/primitives/input";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";
import type { ShortLinkForm } from "../payload-section-types";

export const ShortLinkEditor = ({
  payload,
  setPayloadText,
  setShortLinkForm,
  shortLinkForm,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setPayloadText: QRState["setPayloadText"];
  setShortLinkForm: React.Dispatch<React.SetStateAction<ShortLinkForm>>;
  shortLinkForm: ShortLinkForm;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t("payload.longUrl", "Long URL")}</HighlightedLabel>
      </Label>
      <Input
        type="url"
        value={shortLinkForm.longUrl}
        onChange={(e) =>
          setShortLinkForm((prev) => ({ ...prev, longUrl: e.target.value, error: "" }))
        }
        placeholder="https://example.com/very/long/url/that/needs/shortening"
        data-testid={DynamicTestId.resolve(
          "payload-shortlink-long-input",
          "payload-shortlink-long-input",
        )}
      />
    </div>
    <button
      type="button"
      className="w-full px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
      disabled={
        !shortLinkForm.longUrl || shortLinkForm.isLoading || !isValidUrl(shortLinkForm.longUrl)
      }
      onClick={async () => {
        if (!shortLinkForm.longUrl) return;
        setShortLinkForm((prev) => ({ ...prev, isLoading: true, error: "" }));
        try {
          const encodedUrl = encodeURIComponent(shortLinkForm.longUrl);
          const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodedUrl}`);
          if (!response.ok) throw new Error("TinyURL service unavailable");
          const shortUrl = await response.text();
          if (!shortUrl.startsWith("http")) throw new Error("Invalid response from shortener");
          setShortLinkForm((prev) => ({ ...prev, shortUrl, isLoading: false }));
          setPayloadText(shortUrl.trim());
        } catch (err) {
          setShortLinkForm((prev) => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err.message : "Failed to shorten URL",
          }));
        }
      }}
    >
      {shortLinkForm.isLoading
        ? t("actions.shortening", "Shortening...")
        : t("actions.shortenUrl", "Shorten URL")}
    </button>
    {shortLinkForm.error && <p className="text-xs text-destructive">{shortLinkForm.error}</p>}
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t("payload.shortUrl", "Short URL")}</HighlightedLabel>
      </Label>
      <Input
        type="url"
        value={payload.text}
        onChange={(e) => setPayloadText(e.target.value)}
        placeholder={t("placeholders.generatedShortUrl", "Generated short URL will appear here")}
        data-testid={DynamicTestId.resolve("payload-shortlink-input", "payload-shortlink-input")}
        className={
          payload.validate && payload.text && !isValidUrl(payload.text)
            ? "border-destructive focus-visible:ring-destructive"
            : ""
        }
        readOnly={shortLinkForm.shortUrl !== ""}
      />
      {payload.validate && payload.text && !isValidUrl(payload.text) && (
        <p className="text-xs text-destructive">
          {t("validation.invalidUrl", "Enter a valid URL (must start with http:// or https://)")}
        </p>
      )}
    </div>
    <p className="text-xs text-muted-foreground">
      {t(
        "hints.shortLinkAuto",
        'Enter a long URL above and click "Shorten URL" to generate a short link.',
      )}
    </p>
  </div>
);
