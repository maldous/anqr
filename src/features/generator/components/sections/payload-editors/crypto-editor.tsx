import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { HighlightedLabel } from '@/features/generator/search/search-context';
import { isValidCryptoAddress } from '@/modules/payload-generators';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/primitives/select';
import type { EditorProps } from '../payload-editor-props';

export function CryptoEditor({
  payload,
  setPayloadCrypto,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadCrypto' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.cryptocurrency')}</HighlightedLabel>
        </Label>
        <Select value={payload.crypto.type} onValueChange={(v) => setPayloadCrypto({ type: v })}>
          <SelectTrigger
            data-testid={DynamicTestId.resolve(
              'payload-crypto-type-select',
              'payload-crypto-type-select'
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bitcoin">{t('payload.bitcoin')}</SelectItem>
            <SelectItem value="ethereum">{t('payload.ethereum')}</SelectItem>
            <SelectItem value="litecoin">{t('payload.litecoin')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.walletAddress')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.crypto.address}
          onChange={(e) => setPayloadCrypto({ address: e.target.value })}
          placeholder="Wallet address"
          data-testid={DynamicTestId.resolve(
            'payload-crypto-address-input',
            'payload-crypto-address-input'
          )}
          className={
            payload.validate &&
            payload.crypto.address &&
            !isValidCryptoAddress(payload.crypto.address, payload.crypto.type)
              ? 'border-destructive focus-visible:ring-destructive'
              : ''
          }
        />
        {payload.validate &&
          payload.crypto.address &&
          !isValidCryptoAddress(payload.crypto.address, payload.crypto.type) && (
            <p className="text-xs text-destructive">
              {t('validation.invalidWalletAddress', 'Enter a valid wallet address')}
            </p>
          )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.amount')}</HighlightedLabel>
        </Label>
        <Input
          type="number"
          step="any"
          value={payload.crypto.amount || ''}
          onChange={(e) =>
            setPayloadCrypto({ amount: Number.parseFloat(e.target.value) || undefined })
          }
          placeholder="0.001"
          data-testid={DynamicTestId.resolve(
            'payload-crypto-amount-input',
            'payload-crypto-amount-input'
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.label')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.crypto.label || ''}
          onChange={(e) => setPayloadCrypto({ label: e.target.value })}
          placeholder={t('placeholders.paymentFor')}
          data-testid={DynamicTestId.resolve(
            'payload-crypto-label-input',
            'payload-crypto-label-input'
          )}
        />
      </div>
    </div>
  );
}
