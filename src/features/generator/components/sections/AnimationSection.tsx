import { useTranslation } from 'react-i18next';
import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { HelpLink } from '@/ui/primitives/help-link';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/primitives/select';
import { Slider } from '@/ui/primitives/slider';
import { Switch } from '@/ui/primitives/switch';
import { HighlightedLabel } from '@/app/search/search-context';
import { useQRStore } from '@/store/qr-store';

export function AnimationSection() {
  const {
    tier,
    animation,
    setAnimationSpeedMs,
    setAnimationLoop,
    setAnimationBounce,
    setAnimationStartFrame,
    setAnimationMaxFrames,
    setAnimationFrameStep,
  } = useQRStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Speed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5">
            <HighlightedLabel>{t('animation.speed')}</HighlightedLabel>
            <HelpLink
              href="/guide#section-15"
              requiredTier="advanced"
              title={t('common.learnMore')}
            />
          </Label>
          <span className="text-sm text-muted-foreground">
            {t('qr.nMs', { count: animation.speedMs })}
          </span>
        </div>
        <Slider
          data-testid={DynamicTestId.resolve('animation-speed-slider', 'animation-speed-slider')}
          value={[animation.speedMs]}
          onValueChange={([v]) => setAnimationSpeedMs(v)}
          min={20}
          max={500}
          step={10}
        />
      </div>

      {/* Loop */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Label>
            <HighlightedLabel>{t('animation.loop')}</HighlightedLabel>
          </Label>
          <HelpLink anchor="section-31" />
        </div>
        <Switch
          data-testid={DynamicTestId.resolve('animation-loop-switch', 'animation-loop-switch')}
          checked={animation.loop}
          onCheckedChange={setAnimationLoop}
          title={t('hints.loopAnimation')}
        />
      </div>

      {/* Bounce / Ping-Pong */}
      <div className="flex items-center justify-between">
        <Label>
          <HighlightedLabel>{t('animation.bounce')}</HighlightedLabel>
        </Label>
        <Switch
          data-testid={DynamicTestId.resolve('animation-bounce-switch', 'animation-bounce-switch')}
          checked={animation.bounce}
          onCheckedChange={setAnimationBounce}
          title={t('hints.bounceAnimation')}
        />
      </div>

      {/* Advanced Options */}
      {(tier === 'advanced' || tier === 'professional') && (
        <>
          {/* Start Frame */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t('animation.startFrame')}</HighlightedLabel>
              </Label>
              <span className="text-sm text-muted-foreground">{animation.startFrame}</span>
            </div>
            <Slider
              data-testid={DynamicTestId.resolve(
                'animation-start-frame-slider',
                'animation-start-frame-slider'
              )}
              value={[animation.startFrame]}
              onValueChange={([v]) => setAnimationStartFrame(v)}
              min={0}
              max={100}
              step={1}
            />
          </div>

          {/* Max Frames */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t('animation.maxFrames')}</HighlightedLabel>
              </Label>
              <span className="text-sm text-muted-foreground">
                {animation.maxFrames === 0
                  ? t('animation.auto', { defaultValue: 'Auto' })
                  : animation.maxFrames}
              </span>
            </div>
            <Slider
              data-testid={DynamicTestId.resolve(
                'animation-max-frames-slider',
                'animation-max-frames-slider'
              )}
              value={[animation.maxFrames]}
              onValueChange={([v]) => setAnimationMaxFrames(v)}
              min={0}
              max={100}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              {t('hints.maxFramesAuto', {
                defaultValue: '0 = Auto (uses source frames, max 50 for performance)',
              })}
            </p>
          </div>

          {/* Frame Step */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t('animation.frameStep')}</HighlightedLabel>
              </Label>
              <span className="text-sm text-muted-foreground">
                {t('animation.everyNFrames', { count: animation.frameStep })}
              </span>
            </div>
            <Slider
              data-testid={DynamicTestId.resolve(
                'animation-frame-step-slider',
                'animation-frame-step-slider'
              )}
              value={[animation.frameStep]}
              onValueChange={([v]) => setAnimationFrameStep(v)}
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Interpolation */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('animation.interpolation')}</HighlightedLabel>
            </Label>
            <Select
              value={animation.interpolate}
              onValueChange={(v) =>
                useQRStore.setState((s) => ({
                  animation: { ...s.animation, interpolate: v as typeof animation.interpolate },
                }))
              }
            >
              <SelectTrigger
                data-testid={DynamicTestId.resolve(
                  'animation-interpolation-trigger',
                  'animation-interpolation-trigger'
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                data-testid={DynamicTestId.resolve(
                  'animation-interpolation-content',
                  'animation-interpolation-content'
                )}
              >
                <SelectItem value="none">{t('animation.none')}</SelectItem>
                <SelectItem value="crossfade">{t('animation.crossfade')}</SelectItem>
                <SelectItem value="morph">{t('animation.morph')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Professional Options */}
      {tier === 'professional' && (
        <>
          {/* Temporal Dither */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-1">
              <Label>
                <HighlightedLabel>{t('animation.temporalDither')}</HighlightedLabel>
              </Label>
              <HelpLink anchor="section-67" />
            </div>
            <Select
              value={animation.temporalDither}
              onValueChange={(v) =>
                useQRStore.setState((s) => ({
                  animation: {
                    ...s.animation,
                    temporalDither: v as typeof animation.temporalDither,
                  },
                }))
              }
            >
              <SelectTrigger
                data-testid={DynamicTestId.resolve(
                  'animation-temporal-dither-trigger',
                  'animation-temporal-dither-trigger'
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                data-testid={DynamicTestId.resolve(
                  'animation-temporal-dither-content',
                  'animation-temporal-dither-content'
                )}
              >
                <SelectItem value="off">{t('animation.off')}</SelectItem>
                <SelectItem value="blue_noise">{t('animation.blueNoise')}</SelectItem>
                <SelectItem value="flicker_safe">{t('animation.flickerSafe')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Animation Pattern */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <HighlightedLabel>{t('animation.pattern')}</HighlightedLabel>
              <HelpLink
                href="/guide#section-48"
                requiredTier="professional"
                title={t('common.learnMore')}
              />
            </Label>
            <Select
              value={animation.pattern}
              onValueChange={(v) =>
                useQRStore.setState((s) => ({
                  animation: { ...s.animation, pattern: v as typeof animation.pattern },
                }))
              }
            >
              <SelectTrigger
                data-testid={DynamicTestId.resolve(
                  'animation-pattern-trigger',
                  'animation-pattern-trigger'
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                data-testid={DynamicTestId.resolve(
                  'animation-pattern-content',
                  'animation-pattern-content'
                )}
              >
                <SelectItem value="none">{t('animation.none')}</SelectItem>
                <SelectItem value="pulse">{t('animation.pulse')}</SelectItem>
                <SelectItem value="wave">{t('animation.wave')}</SelectItem>
                <SelectItem value="scanline">{t('animation.scanline')}</SelectItem>
                <SelectItem value="shimmer">{t('animation.shimmer')}</SelectItem>
                <SelectItem value="drift">{t('animation.drift')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Animation Target */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('animation.target')}</HighlightedLabel>
            </Label>
            <Select
              value={animation.target}
              onValueChange={(v) =>
                useQRStore.setState((s) => ({
                  animation: { ...s.animation, target: v as typeof animation.target },
                }))
              }
            >
              <SelectTrigger
                data-testid={DynamicTestId.resolve(
                  'animation-target-trigger',
                  'animation-target-trigger'
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                data-testid={DynamicTestId.resolve(
                  'animation-target-content',
                  'animation-target-content'
                )}
              >
                <SelectItem value="result">{t('animation.targetResult')}</SelectItem>
                <SelectItem value="modules">{t('animation.targetModules')}</SelectItem>
                <SelectItem value="both">{t('animation.targetBoth')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {animation.pattern === 'wave' && (
            <div className="space-y-2">
              <Label>
                <HighlightedLabel>{t('animation.waveAxis')}</HighlightedLabel>
              </Label>
              <Select
                value={animation.waveAxis}
                onValueChange={(v) =>
                  useQRStore.setState((s) => ({
                    animation: { ...s.animation, waveAxis: v as typeof animation.waveAxis },
                  }))
                }
              >
                <SelectTrigger
                  data-testid={DynamicTestId.resolve(
                    'animation-wave-axis-trigger',
                    'animation-wave-axis-trigger'
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  data-testid={DynamicTestId.resolve(
                    'animation-wave-axis-content',
                    'animation-wave-axis-content'
                  )}
                >
                  <SelectItem value="x">{t('animation.waveAxisX')}</SelectItem>
                  <SelectItem value="y">{t('animation.waveAxisY')}</SelectItem>
                  <SelectItem value="xy">{t('animation.waveAxisXY')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Secondary Animation Pattern */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('animation.secondaryPattern')}</HighlightedLabel>
            </Label>
            <Select
              value={animation.pattern2}
              onValueChange={(v) =>
                useQRStore.setState((s) => ({
                  animation: { ...s.animation, pattern2: v as typeof animation.pattern2 },
                }))
              }
            >
              <SelectTrigger
                data-testid={DynamicTestId.resolve(
                  'animation-pattern-2-trigger',
                  'animation-pattern-2-trigger'
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                data-testid={DynamicTestId.resolve(
                  'animation-pattern-2-content',
                  'animation-pattern-2-content'
                )}
              >
                <SelectItem value="none">{t('animation.none')}</SelectItem>
                <SelectItem value="pulse">{t('animation.pulse')}</SelectItem>
                <SelectItem value="wave">{t('animation.wave')}</SelectItem>
                <SelectItem value="scanline">{t('animation.scanline')}</SelectItem>
                <SelectItem value="shimmer">{t('animation.shimmer')}</SelectItem>
                <SelectItem value="drift">{t('animation.drift')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {animation.pattern2 !== 'none' && (
            <div className="space-y-2">
              <Label>
                <HighlightedLabel>{t('animation.secondaryTarget')}</HighlightedLabel>
              </Label>
              <Select
                value={animation.target2}
                onValueChange={(v) =>
                  useQRStore.setState((s) => ({
                    animation: { ...s.animation, target2: v as typeof animation.target2 },
                  }))
                }
              >
                <SelectTrigger
                  data-testid={DynamicTestId.resolve(
                    'animation-target-2-trigger',
                    'animation-target-2-trigger'
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  data-testid={DynamicTestId.resolve(
                    'animation-target-2-content',
                    'animation-target-2-content'
                  )}
                >
                  <SelectItem value="result">{t('animation.targetResult')}</SelectItem>
                  <SelectItem value="modules">{t('animation.targetModules')}</SelectItem>
                  <SelectItem value="both">{t('animation.targetBoth')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {animation.pattern2 === 'wave' && (
            <div className="space-y-2">
              <Label>
                <HighlightedLabel>{t('animation.secondaryWaveAxis')}</HighlightedLabel>
              </Label>
              <Select
                value={animation.waveAxis2}
                onValueChange={(v) =>
                  useQRStore.setState((s) => ({
                    animation: { ...s.animation, waveAxis2: v as typeof animation.waveAxis2 },
                  }))
                }
              >
                <SelectTrigger
                  data-testid={DynamicTestId.resolve(
                    'animation-wave-axis-2-trigger',
                    'animation-wave-axis-2-trigger'
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  data-testid={DynamicTestId.resolve(
                    'animation-wave-axis-2-content',
                    'animation-wave-axis-2-content'
                  )}
                >
                  <SelectItem value="x">{t('animation.waveAxisX')}</SelectItem>
                  <SelectItem value="y">{t('animation.waveAxisY')}</SelectItem>
                  <SelectItem value="xy">{t('animation.waveAxisXY')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Module Jitter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                <HighlightedLabel>{t('animation.moduleJitter')}</HighlightedLabel>
              </Label>
              <span className="text-sm text-muted-foreground">
                {t('qr.nPx', { count: animation.moduleJitterPx })}
              </span>
            </div>
            <Slider
              data-testid={DynamicTestId.resolve(
                'animation-module-jitter-slider',
                'animation-module-jitter-slider'
              )}
              value={[animation.moduleJitterPx]}
              onValueChange={([v]) =>
                useQRStore.setState((s) => ({ animation: { ...s.animation, moduleJitterPx: v } }))
              }
              min={0}
              max={5}
              step={0.5}
            />
            <p className="text-xs text-muted-foreground">{t('hints.moduleJitterWarning')}</p>
          </div>

          {/* Color Cycle */}
          <div className="flex items-center justify-between">
            <Label>
              <HighlightedLabel>{t('animation.colorCycle')}</HighlightedLabel>
            </Label>
            <Switch
              data-testid={DynamicTestId.resolve(
                'animation-color-cycle-switch',
                'animation-color-cycle-switch'
              )}
              checked={animation.colorCycle}
              onCheckedChange={(checked) =>
                useQRStore.setState((s) => ({ animation: { ...s.animation, colorCycle: checked } }))
              }
            />
          </div>

          {/* Seed */}
          <div className="space-y-2">
            <Label>
              <HighlightedLabel>{t('animation.randomSeed')}</HighlightedLabel>
            </Label>
            <Input
              data-testid={DynamicTestId.resolve('animation-seed-input', 'animation-seed-input')}
              type="number"
              value={animation.seed}
              onChange={(e) =>
                useQRStore.setState((s) => ({
                  animation: { ...s.animation, seed: Number.parseInt(e.target.value, 10) || 0 },
                }))
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
