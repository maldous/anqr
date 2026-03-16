import { HighlightedLabel } from '@/features/generator/search/search-context';
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

export function RemovedOtpauthEditor({
  payload,
  setPayloadOtpAuth,
  t,
}: Readonly<Pick<EditorProps, 'payload' | 'setPayloadOtpAuth' | 't'>>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.otpType')}</HighlightedLabel>
        </Label>
        <Select
          value={payload.otpauth.type || 'totp'}
          onValueChange={(v) => setPayloadOtpAuth({ type: v as 'totp' | 'hotp' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="totp">TOTP (Time-based)</SelectItem>
            <SelectItem value="hotp">HOTP (Counter-based)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.issuer')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.otpauth.issuer || ''}
          onChange={(e) => setPayloadOtpAuth({ issuer: e.target.value })}
          placeholder="MyApp"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.accountName')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.otpauth.account || ''}
          onChange={(e) => setPayloadOtpAuth({ account: e.target.value })}
          placeholder="user@anqr.link"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.secretBase32')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.otpauth.secret || ''}
          onChange={(e) => setPayloadOtpAuth({ secret: e.target.value })}
          placeholder="JBSWY3DPEHPK3PXP"
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.algorithm')}</HighlightedLabel>
        </Label>
        <Select
          value={payload.otpauth.algorithm || 'SHA1'}
          onValueChange={(v) => setPayloadOtpAuth({ algorithm: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SHA1">SHA1</SelectItem>
            <SelectItem value="SHA256">SHA256</SelectItem>
            <SelectItem value="SHA512">SHA512</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
