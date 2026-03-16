import type { TFunction } from 'i18next';
import { HighlightedLabel } from '@/features/generator/search/search-context';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { generateSocialProfile } from '@/modules/payload-generators';
import type { QRState } from '@/store/qr-store';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { PlatformSelectField } from './platform-select-field';

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
      <PlatformSelectField
        label={t('payload.platform')}
        value={payload.socialProfile.platform}
        onValueChange={(value) =>
          setPayloadSocialProfile({ platform: value as typeof payload.socialProfile.platform })
        }
        dataTestId="payload-social-platform-select"
        options={[
          { value: 'linkedin', label: t('payload.linkedin') },
          { value: 'twitter', label: 'X (Twitter)' },
          { value: 'instagram', label: t('payload.instagram') },
          { value: 'facebook', label: t('payload.facebook') },
          { value: 'tiktok', label: t('payload.tiktok') },
          { value: 'youtube', label: t('payload.youtube') },
          { value: 'github', label: t('payload.github') },
          { value: 'other', label: t('payload.other') },
        ]}
      />
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
