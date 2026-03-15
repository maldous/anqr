import { prepareRewardedAd, showRewardedAd } from '@/modules/platform';
import { createLogger } from '@/infra/logging/logger';

const log = createLogger('HELP');

export async function requestProfessionalAccess(
  activatePremiumAccess: () => void,
  setLoadingAd: (loading: boolean) => void
): Promise<boolean> {
  setLoadingAd(true);
  try {
    const reward = await showRewardedAd('premium');
    if (!reward) {
      setLoadingAd(false);
      return false;
    }
    activatePremiumAccess();
  } catch (error) {
    log.error('Failed to show rewarded ad', { error });
    setLoadingAd(false);
    return false;
  }
  setLoadingAd(false);
  prepareRewardedAd('premium');
  return true;
}
