export type AnalyzeMessageCode =
  | 'qr_analyze_ok'
  | 'qr_analyze_invalid'
  | 'qr_analyze_unreadable'
  | 'qr_analyze_low_contrast'
  | 'qr_analyze_quiet_zone_failed'
  | 'qr_analyze_payload_unsupported'
  | 'qr_analyze_decoder_error';
