import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/app/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { generateSocialProfile } from '@/modules/payload-generators';
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

export const SocialProfileEditor = ({
  payload,
  setPayloadSocialProfile,
  t,
}: Readonly<{
  payload: QRState['payload'];
  setPayloadSocialProfile: QRState['setPayloadSocialProfile'];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.platform')}</HighlightedLabel>
        </Label>
        <Select
          value={payload.socialProfile.platform}
          onValueChange={(value) =>
            setPayloadSocialProfile({ platform: value as typeof payload.socialProfile.platform })
          }
        >
          <SelectTrigger
            data-testid={DynamicTestId.resolve(
              'payload-social-platform-select',
              'payload-social-platform-select'
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linkedin">{t('payload.linkedin')}</SelectItem>
            <SelectItem value="twitter">X (Twitter)</SelectItem>
            <SelectItem value="instagram">{t('payload.instagram')}</SelectItem>
            <SelectItem value="facebook">{t('payload.facebook')}</SelectItem>
            <SelectItem value="tiktok">{t('payload.tiktok')}</SelectItem>
            <SelectItem value="youtube">{t('payload.youtube')}</SelectItem>
            <SelectItem value="github">{t('payload.github')}</SelectItem>
            <SelectItem value="other">{t('payload.other')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t('payload.username')}</HighlightedLabel>
        </Label>
        <Input
          value={payload.socialProfile.username || ''}
          onChange={(e) => setPayloadSocialProfile({ username: e.target.value })}
          placeholder={
            {
              linkedin: 'johndoe',
              twitter: 'johndoe',
              instagram: 'johndoe',
              facebook: 'johndoe',
              tiktok: 'johndoe',
              youtube: 'johndoe',
              github: 'johndoe',
              other: 'username',
            }[payload.socialProfile.platform] || 'username'
          }
          data-testid={DynamicTestId.resolve(
            'payload-social-username-input',
            'payload-social-username-input'
          )}
        />
        <p className="text-xs text-muted-foreground">
          {t('hints.socialProfileGenerated', 'URL will be generated: ')}
          {payload.socialProfile.username
            ? generateSocialProfile(payload.socialProfile.platform, payload.socialProfile.username)
            : `https://${payload.socialProfile.platform}.com/...`}
        </p>
      </div>
    </div>
  );
};
