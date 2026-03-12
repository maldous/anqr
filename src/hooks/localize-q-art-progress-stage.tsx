export function localizeQArtProgressStage(
  stage: string,
  translateQArtStage: (s: string) => string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => string
): string {
  let localizedStage = translateQArtStage(stage);
  const maskMatch = /^Mask (\d+): (.+)$/.exec(stage);
  if (maskMatch) {
    const translatedInner = translateQArtStage(maskMatch[2]);
    localizedStage = t('preview.busy.qrArt.maskStage', {
      defaultValue: 'Mask {{mask}}: {{stage}}...',
      mask: Number(maskMatch[1]),
      stage: translatedInner.replace(/\.\.\.$/, ''),
    });
  }
  const attemptMaskMatch = /^Attempt (\d+)\/(\d+): Mask (\d+): (.+)$/.exec(stage);
  if (attemptMaskMatch) {
    const translatedInner = translateQArtStage(attemptMaskMatch[4]);
    localizedStage = t('preview.busy.qrArt.attemptMaskStage', {
      defaultValue: 'Attempt {{current}}/{{total}}: Mask {{mask}}: {{stage}}...',
      current: Number(attemptMaskMatch[1]),
      total: Number(attemptMaskMatch[2]),
      mask: Number(attemptMaskMatch[3]),
      stage: translatedInner.replace(/\.\.\.$/, ''),
    });
  } else {
    const attemptMatch = /^Attempt (\d+)\/(\d+): (.+)$/.exec(stage);
    if (attemptMatch) {
      const translatedInner = translateQArtStage(attemptMatch[3]);
      localizedStage = t('preview.busy.qrArt.attemptStage', {
        defaultValue: 'Attempt {{current}}/{{total}}: {{stage}}...',
        current: Number(attemptMatch[1]),
        total: Number(attemptMatch[2]),
        stage: translatedInner.replace(/\.\.\.$/, ''),
      });
    }
  }
  return localizedStage;
}
