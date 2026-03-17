import { HighlightedLabel } from "../../../search/search-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../../../packages/ui/web/src/primitives/select";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";
import { LabeledInputField } from "./labeled-input-field";
import { PayloadFormShell } from "./payload-form-shell";
import type { PayloadTextEditorProps } from "./payload-text-editor.types";
import { TrailingUrlField } from "./trailing-url-field";

export const RemovedInventoryEditor = ({
  payload,
  setPayloadText,
  t,
}: Readonly<PayloadTextEditorProps>) => (
  <PayloadFormShell>
    <LabeledInputField
      label={t("payload.assetItemId")}
      value={payload.text}
      onChange={setPayloadText}
      placeholder="ASSET-001234"
    />
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t("payload.assetType")}</HighlightedLabel>
      </Label>
      <Select defaultValue="equipment">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="equipment">{t("payload.equipment")}</SelectItem>
          <SelectItem value="furniture">{t("payload.furniture")}</SelectItem>
          <SelectItem value="it">IT Asset</SelectItem>
          <SelectItem value="vehicle">{t("payload.vehicle")}</SelectItem>
          <SelectItem value="inventory">{t("payload.inventoryItem")}</SelectItem>
          <SelectItem value="other">{t("payload.other")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <LabeledInputField label={t("payload.location")} placeholder="Building A, Room 101" />
    <LabeledInputField label={t("payload.description")} placeholder="Dell Laptop 15-inch" />
    <TrailingUrlField
      label={t("payload.lookupUrl")}
      placeholder="https://inventory.anqr.link/asset/"
    />
  </PayloadFormShell>
);
