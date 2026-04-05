import { getApiKey } from '../codebuff-direct/get-api-key.mjs';
import { isRecoverableError } from '../codebuff-direct/is-recoverable-error.mjs';
import { normalizeCwd } from '../codebuff-direct/normalize-cwd.mjs';

import { classifyCodebuffProbeError } from './classify-codebuff-probe-error.mjs';
import { createCodebuffProbeTimeout } from './create-codebuff-probe-timeout.mjs';
import { providerProbeStage } from './provider-probe-stage.mjs';
import { runCodebuffProbeMode } from './run-codebuff-probe-mode.mjs';

export async function probeCodebuffDetailed(provider = {}, options = {}) {
  const apiKey = getApiKey();
  const startedAt = Date.now();
  const stages = [];
  const model = provider.model || process.env.CODEBUFF_MODEL_ID || 'codebuff/base';
  const progress = options.progress || null;
  if (!apiKey) {
    stages.push(providerProbeStage('env_missing', { envVar: 'CODEBUFF_API_KEY' }));
    return {
      providerName: provider.name || 'codebuff',
      model,
      available: false,
      status: 'auth_missing',
      reason: 'CODEBUFF_API_KEY is not set',
      durationMs: Date.now() - startedAt,
      stages,
      mode: null,
      message: 'CODEBUFF_API_KEY is not set',
    };
  }
  const cwd = normalizeCwd(process.cwd());
  const prompt = 'Reply with exactly: ok';
  const paidTimeout = createCodebuffProbeTimeout();
  try {
    const paidResult = await paidTimeout.race(runCodebuffProbeMode({ apiKey, cwd, prompt, costMode: undefined, stages, progress }));
    const text = String(paidResult?.text || '').trim();
    return {
      providerName: provider.name || 'codebuff',
      model,
      available: text.length > 0,
      status: text.length > 0 ? 'success' : 'unavailable',
      reason: text.length > 0 ? 'paid mode probe succeeded' : 'paid mode returned no text',
      durationMs: Date.now() - startedAt,
      stages,
      mode: paidResult?.mode || 'paid',
      message: text,
    };
  } catch (error) {
    const initial = classifyCodebuffProbeError(error);
    stages.push(providerProbeStage('mode_failed', { mode: 'paid', status: initial.status, message: initial.message }));
    progress?.({ type: 'stage', providerName: 'codebuff', stage: `mode:paid:failed:${initial.status}` });
    if (!isRecoverableError(initial.message)) {
      return {
        providerName: provider.name || 'codebuff',
        model,
        available: false,
        status: initial.status,
        reason: initial.reason,
        durationMs: Date.now() - startedAt,
        stages,
        mode: 'paid',
        message: initial.message,
      };
    }
    stages.push(providerProbeStage('fallback_started', { fromMode: 'paid', toMode: 'free' }));
    progress?.({ type: 'stage', providerName: 'codebuff', stage: 'fallback:paid->free' });
    const freeTimeout = createCodebuffProbeTimeout();
    try {
      const freeResult = await freeTimeout.race(runCodebuffProbeMode({ apiKey, cwd, prompt, costMode: 'free', stages, progress }));
      const text = String(freeResult?.text || '').trim();
      return {
        providerName: provider.name || 'codebuff',
        model,
        available: text.length > 0,
        status: text.length > 0 ? 'degraded' : 'unavailable',
        reason: text.length > 0 ? `paid mode ${initial.status}, free mode succeeded` : 'free mode returned no text after paid-mode fallback',
        durationMs: Date.now() - startedAt,
        stages,
        mode: freeResult?.mode || 'free',
        message: text || initial.message,
      };
    } catch (fallbackError) {
      const finalError = classifyCodebuffProbeError(fallbackError);
      stages.push(providerProbeStage('fallback_failed', { fromMode: 'paid', toMode: 'free', status: finalError.status, message: finalError.message }));
      progress?.({ type: 'stage', providerName: 'codebuff', stage: `mode:free:failed:${finalError.status}` });
      return {
        providerName: provider.name || 'codebuff',
        model,
        available: false,
        status: finalError.status,
        reason: `paid mode failed (${initial.status}), free mode failed (${finalError.status})`,
        durationMs: Date.now() - startedAt,
        stages,
        mode: 'free',
        message: finalError.message,
      };
    } finally {
      freeTimeout.clear();
    }
  } finally {
    paidTimeout.clear();
  }
}
