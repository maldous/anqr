import type { QRAnalysisResult } from '@/modules/qr-analyzer';
import type { MatrixDiagnostics } from './matrix-diagnostics.type';
import type { ValidEncoderMode } from './reproduction-types';

export function logReproductionResult(params: {
  result: QRAnalysisResult;
  isGeneratorSource: boolean;
  encoderInput: { kind: 'bytes' | 'string'; data: string };
  ecc: string;
  versionToUseFinal: number;
  maskToUse: number | undefined;
  modeToUse: ValidEncoderMode | undefined;
  effectiveMode: ValidEncoderMode | undefined;
  actualVersion: number;
  moduleCount: number;
  marginModules: number;
  modulePx: number;
  size: number;
  diagnostics: MatrixDiagnostics;
  qrState: { borderModulesExtra?: number };
  log: { debug: (msg: string, data?: Record<string, unknown>) => void; warn: (msg: string, data?: Record<string, unknown>) => void };
}) {
  const {
    result,
    isGeneratorSource,
    encoderInput,
    ecc,
    versionToUseFinal,
    maskToUse,
    modeToUse,
    effectiveMode,
    actualVersion,
    moduleCount,
    marginModules,
    modulePx,
    size,
    diagnostics,
    qrState,
    log,
  } = params;

  log.debug('Generated QR code', {
    strategy: isGeneratorSource ? 'exact' : 'detected_only',
    encoderInputKind: encoderInput.kind,
    ecc,
    detectedVersion: result.version,
    usedVersion: versionToUseFinal,
    detectedMaskPattern: result.maskPattern,
    usedMaskPattern: typeof maskToUse === 'number' ? maskToUse : null,
    usedMode: effectiveMode ?? null,
    actualVersion,
    moduleCount,
    marginModules,
    borderModulesExtra: isGeneratorSource ? qrState.borderModulesExtra || 0 : null,
    modulePx,
    canvasSize: size,
    matrix: diagnostics,
  });

  if (diagnostics.regenVsOriginal?.diffCount) {
    log.warn('Matrix mismatch (original vs regenerated)', {
      ecc,
      version: { detected: result.version, used: versionToUseFinal, actual: actualVersion },
      mask: {
        detected: result.maskPattern,
        used: typeof maskToUse === 'number' ? maskToUse : null,
      },
      mode: { requested: modeToUse ?? null, effective: effectiveMode ?? null },
      regenVsDecoded: diagnostics.regenVsDecoded,
      regenVsOriginal: diagnostics.regenVsOriginal,
      bestShift: diagnostics.bestShift,
    });
  }
}
