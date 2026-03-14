import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/app/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { isValidGTIN } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';

export const Gs1DigitalLinkEditor = ({
  payload,
  setPayloadGS1,
  t,
}: Readonly<{
  payload: QRState['payload'];
  setPayloadGS1: QRState['setPayloadGS1'];
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.gtin')}</HighlightedLabel>
      </Label>
      <Input
        value={payload.gs1.gtin || ''}
        onChange={(e) => setPayloadGS1({ gtin: e.target.value })}
        placeholder="01234567890128"
        data-testid={DynamicTestId.resolve('payload-gs1-gtin-input', 'payload-gs1-gtin-input')}
        className={
          payload.validate && payload.gs1.gtin && !isValidGTIN(payload.gs1.gtin)
            ? 'border-destructive focus-visible:ring-destructive'
            : ''
        }
      />
      {payload.validate && payload.gs1.gtin && !isValidGTIN(payload.gs1.gtin) && (
        <p className="text-xs text-destructive">
          {t('validation.invalidGTIN', 'Enter a valid GTIN (8, 12, 13, or 14 digits)')}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.serialNumber')}</HighlightedLabel>
      </Label>
      <Input
        value={payload.gs1.serial || ''}
        onChange={(e) => setPayloadGS1({ serial: e.target.value })}
        placeholder="ABC123"
        data-testid={DynamicTestId.resolve('payload-gs1-serial-input', 'payload-gs1-serial-input')}
      />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.batchLot')}</HighlightedLabel>
      </Label>
      <Input
        value={payload.gs1.batch || ''}
        onChange={(e) => setPayloadGS1({ batch: e.target.value })}
        placeholder="LOT123"
        data-testid={DynamicTestId.resolve('payload-gs1-batch-input', 'payload-gs1-batch-input')}
      />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.expiryDate')}</HighlightedLabel>
      </Label>
      <Input
        type="date"
        value={payload.gs1.expiry || ''}
        onChange={(e) => setPayloadGS1({ expiry: e.target.value })}
        data-testid={DynamicTestId.resolve('payload-gs1-expiry-input', 'payload-gs1-expiry-input')}
      />
    </div>
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{t('payload.resolverDomain')}</HighlightedLabel>
      </Label>
      <Input
        value={payload.gs1.resolver || 'id.gs1.org'}
        onChange={(e) => setPayloadGS1({ resolver: e.target.value })}
        placeholder="id.gs1.org"
        data-testid={DynamicTestId.resolve(
          'payload-gs1-resolver-input',
          'payload-gs1-resolver-input'
        )}
      />
    </div>
    <p className="text-xs text-muted-foreground">{t('hints.gs1Note')}</p>
  </div>
);
