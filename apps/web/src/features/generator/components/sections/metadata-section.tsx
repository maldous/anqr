import { Plus, X } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../../../../packages/ui/web/src/primitives/button";
import { DynamicTestId } from "../../../../lib/dynamic-testid";
import { ConnectedHelpLink as HelpLink } from "./connected-help-link";
import { Input } from "../../../../../../../packages/ui/web/src/primitives/input";
import { Label } from "../../../../../../../packages/ui/web/src/primitives/label";
import { Switch } from "../../../../../../../packages/ui/web/src/primitives/switch";
import { Textarea } from "../../../../../../../packages/ui/web/src/primitives/textarea";
import { HighlightedLabel } from "../../search/search-context";
import { useQRStore } from "../../../../state/qr-store";

// Counter for generating unique IDs for custom key-value pairs
let kvIdCounter = 0;

export function MetadataSection() {
  const { metadata, setMetadata } = useQRStore();
  const { t } = useTranslation();

  // Store stable IDs for each kv item
  const kvIdsRef = useRef<Map<number, string>>(new Map());

  // Ensure each kv item has a stable ID
  const getKvId = (index: number): string => {
    let id = kvIdsRef.current.get(index);
    if (!id) {
      id = `kv-${++kvIdCounter}`;
      kvIdsRef.current.set(index, id);
    }
    return id;
  };

  const addCustomKv = () => {
    setMetadata({ customKv: [...metadata.customKv, { k: "", v: "" }] });
  };

  const updateCustomKv = (index: number, field: "k" | "v", value: string) => {
    const newKv = [...metadata.customKv];
    newKv[index] = { ...newKv[index], [field]: value };
    setMetadata({ customKv: newKv });
  };

  const removeCustomKv = (index: number) => {
    setMetadata({ customKv: metadata.customKv.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label>
            <HighlightedLabel>{t("metadata.title")}</HighlightedLabel>
          </Label>
          <HelpLink href="/guide#section-35" requiredTier="professional" />
        </div>
        <Input
          data-testid={DynamicTestId.resolve("metadata-title-input", "metadata-title-input")}
          value={metadata.title}
          onChange={(e) => setMetadata({ title: e.target.value })}
          placeholder={t("metadata.titlePlaceholder")}
        />
      </div>

      {/* Author */}
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("metadata.author")}</HighlightedLabel>
        </Label>
        <Input
          data-testid={DynamicTestId.resolve("metadata-author-input", "metadata-author-input")}
          value={metadata.author}
          onChange={(e) => setMetadata({ author: e.target.value })}
          placeholder={t("metadata.authorPlaceholder")}
        />
      </div>

      {/* Copyright */}
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("metadata.copyright")}</HighlightedLabel>
        </Label>
        <Input
          data-testid={DynamicTestId.resolve(
            "metadata-copyright-input",
            "metadata-copyright-input",
          )}
          value={metadata.copyright}
          onChange={(e) => setMetadata({ copyright: e.target.value })}
          placeholder={t("metadata.copyrightPlaceholder")}
        />
      </div>

      {/* License */}
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("metadata.license")}</HighlightedLabel>
        </Label>
        <Input
          data-testid={DynamicTestId.resolve("metadata-license-input", "metadata-license-input")}
          value={metadata.license}
          onChange={(e) => setMetadata({ license: e.target.value })}
          placeholder={t("metadata.licensePlaceholder")}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("metadata.description")}</HighlightedLabel>
        </Label>
        <Textarea
          data-testid={DynamicTestId.resolve(
            "metadata-description-textarea",
            "metadata-description-textarea",
          )}
          value={metadata.description}
          onChange={(e) => setMetadata({ description: e.target.value })}
          placeholder={t("metadata.descriptionPlaceholder")}
          rows={3}
        />
      </div>

      {/* Creation Time */}
      <div className="flex items-center justify-between">
        <Label>
          <HighlightedLabel>{t("metadata.includeCreationTime")}</HighlightedLabel>
        </Label>
        <Switch
          data-testid={DynamicTestId.resolve(
            "metadata-creation-time-switch",
            "metadata-creation-time-switch",
          )}
          checked={metadata.creationTime}
          onCheckedChange={(checked) => setMetadata({ creationTime: checked })}
        />
      </div>

      {/* Custom Key-Value Pairs */}
      <div className="space-y-2 pt-2 border-t">
        <Label className="text-muted-foreground">
          <HighlightedLabel>{t("metadata.customMetadata")}</HighlightedLabel>
        </Label>
        {metadata.customKv.map((kv, index) => (
          <div
            key={getKvId(index)}
            className="flex gap-2"
            data-testid={DynamicTestId.resolve(
              `metadata-custom-kv-row-${index}`,
              `metadata-custom-kv-row-${index}`,
            )}
          >
            <Input
              data-testid={DynamicTestId.resolve(
                `metadata-custom-key-input-${index}`,
                `metadata-custom-key-input-${index}`,
              )}
              value={kv.k}
              onChange={(e) => updateCustomKv(index, "k", e.target.value)}
              placeholder={t("metadata.key")}
              className="flex-1"
            />
            <Input
              data-testid={DynamicTestId.resolve(
                `metadata-custom-value-input-${index}`,
                `metadata-custom-value-input-${index}`,
              )}
              value={kv.v}
              onChange={(e) => updateCustomKv(index, "v", e.target.value)}
              placeholder={t("metadata.value")}
              className="flex-1"
            />
            <Button
              data-testid={DynamicTestId.resolve(
                `metadata-custom-remove-button-${index}`,
                `metadata-custom-remove-button-${index}`,
              )}
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => removeCustomKv(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          data-testid={DynamicTestId.resolve(
            "metadata-add-custom-button",
            "metadata-add-custom-button",
          )}
          variant="outline"
          size="sm"
          onClick={addCustomKv}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> {t("metadata.addCustomField")}
        </Button>
      </div>
    </div>
  );
}
