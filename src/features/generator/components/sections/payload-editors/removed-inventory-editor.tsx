import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/app/search/search-context';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/primitives/select';

export const RemovedInventoryEditor = ({
  payload,
  setPayloadText,
  t,
}: Readonly<{
  payload: QRState['payload'];
  setPayloadText: QRState['setPayloadText'];
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.assetItemId')}</HighlightedLabel>
      </Label>
      <Input
        value={payload.text}
        onChange={(e) => setPayloadText(e.target.value)}
        placeholder="ASSET-001234"
      />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.assetType')}</HighlightedLabel>
      </Label>
      <Select defaultValue="equipment">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="equipment">{t('payload.equipment')}</SelectItem>
          <SelectItem value="furniture">{t('payload.furniture')}</SelectItem>
          <SelectItem value="it">IT Asset</SelectItem>
          <SelectItem value="vehicle">{t('payload.vehicle')}</SelectItem>
          <SelectItem value="inventory">{t('payload.inventoryItem')}</SelectItem>
          <SelectItem value="other">{t('payload.other')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.location')}</HighlightedLabel>
      </Label>
      <Input placeholder="Building A, Room 101" />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.description')}</HighlightedLabel>
      </Label>
      <Input placeholder="Dell Laptop 15-inch" />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.lookupUrl')}</HighlightedLabel>
      </Label>
      <Input type="url" placeholder="https://inventory.anqr.link/asset/" />
    </div>
  </div>
);
