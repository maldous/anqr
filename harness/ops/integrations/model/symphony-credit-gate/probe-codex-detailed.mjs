import { Codex } from '@openai/codex-sdk';

import { PROJECT_ROOT } from './project-root.mjs';
import { CODEX_PROBE_TIMEOUT_MS } from './codex-probe-timeout-ms.mjs';
import { CODEX_SANDBOX_MODE } from './codex-sandbox-mode.mjs';
import { classifyProviderProbeError } from './classify-provider-probe-error.mjs';
import { providerProbeStage } from './provider-probe-stage.mjs';
import { providerProbeTruncate } from './provider-probe-truncate.mjs';

export async function probeCodexDetailed(provider, apiKey) {
  const startedAt = Date.now();
  const stages = [];

  if (!apiKey?.trim()) {
    return {
      available: false,
      status: 'auth_missing',
      reason: 'OPENAI_API_KEY is not set for Codex SDK',
      durationMs: Date.now() - startedAt,
      message: 'OPENAI_API_KEY is not set',
      stages,
    };
  }

  let timeoutHandle = null;

  try {
    stages.push(
      providerProbeStage('sdk_started', {
        model: provider?.model || null,
      }),
    );

    const codex = new Codex({ env: process.env });
    const thread = codex.startThread({
      model: provider?.model || undefined,
      workingDirectory: PROJECT_ROOT,
      sandboxMode: CODEX_SANDBOX_MODE,
      approvalPolicy: 'never',
      webSearchEnabled: false,
      networkAccessEnabled: false,
    });

    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error(`Codex SDK probe timed out after ${CODEX_PROBE_TIMEOUT_MS}ms`));
      }, CODEX_PROBE_TIMEOUT_MS);
      timeoutHandle.unref?.();
    });

    const result = await Promise.race([
      thread.run('Reply with exactly: ok'),
      timeoutPromise,
    ]);

    const finalResponse = providerProbeTruncate(result?.finalResponse || '');

    stages.push(
      providerProbeStage('sdk_succeeded', {
        responsePreview: finalResponse,
      }),
    );

    return {
      available: Boolean(finalResponse),
      status: finalResponse ? 'success' : 'unavailable',
      reason: finalResponse
        ? 'Codex SDK probe succeeded'
        : 'Codex SDK returned empty response',
      durationMs: Date.now() - startedAt,
      message: finalResponse,
      stages,
    };
  } catch (error) {
    const message = error?.message || String(error);
    const classified = classifyProviderProbeError(message);

    stages.push(
      providerProbeStage('sdk_failed', {
        status: classified.status,
        message: providerProbeTruncate(message),
      }),
    );

    return {
      available: false,
      status: classified.status,
      reason: `Codex probe failed: ${message}`,
      durationMs: Date.now() - startedAt,
      message,
      stages,
    };
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}
