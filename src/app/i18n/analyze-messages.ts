import i18n from '@/i18n';
import type { AnalyzeMessage, AnalyzeMessageCode } from '@/domain/qr/analyze/message-codes';

const KEY_BY_CODE: Record<AnalyzeMessageCode, string> = {
  qr_analyze_ok: 'analyze.ok',
  qr_analyze_invalid: 'analyze.invalid',
  qr_analyze_unreadable: 'analyze.noCodeDetectedInImage',
  qr_analyze_low_contrast: 'analyze.lowContrast',
  qr_analyze_quiet_zone_failed: 'analyze.quietZoneFailed',
  qr_analyze_payload_unsupported: 'analyze.payloadUnsupported',
  qr_analyze_decoder_error: 'analyze.decoderError',
};

export function translateAnalyzeMessage(message: AnalyzeMessage): string {
  return i18n.t(KEY_BY_CODE[message.code], message.params ?? {});
}
