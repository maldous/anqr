# Payload Verification Matrix

Generated: 2026-02-15T06:08:32.203Z

## Summary
- Total payload kinds: 41
- PASS: 41
- REVIEW: 0
- Text-driven kinds: epc_sepa, paynow, pix, promptpay, upi
- Missing selector wiring: none
- Missing generation path: none

## Matrix
| Kind | Selector | Generation Path | Test Refs | Status | Notes |
| --- | --- | --- | ---: | --- | --- |
| `app_link` | yes | store-switch | 7 | PASS |  |
| `auspaynet` | yes | store-switch | 3 | PASS |  |
| `bharatqr` | yes | store-switch | 2 | PASS |  |
| `bizcard` | yes | store-switch | 1 | PASS |  |
| `calendar_subscription` | yes | store-switch | 2 | PASS |  |
| `cashapp` | yes | store-switch | 2 | PASS |  |
| `crypto` | yes | store-switch | 1 | PASS |  |
| `custom` | yes | store-switch | 8 | PASS |  |
| `duitnow` | yes | store-switch | 2 | PASS |  |
| `email` | yes | store-switch | 4 | PASS |  |
| `emv_generic` | yes | store-switch | 3 | PASS |  |
| `epc_sepa` | yes | ui-text-generator | 2 | PASS | Generated in PayloadSection useEffect via setPayloadText. |
| `ethereum_eip681` | yes | store-switch | 2 | PASS |  |
| `event` | yes | store-switch | 1 | PASS |  |
| `event_rsvp` | yes | store-switch | 3 | PASS |  |
| `geo` | yes | store-switch | 2 | PASS |  |
| `gs1_digital_link` | yes | store-switch | 3 | PASS |  |
| `hkqr` | yes | store-switch | 2 | PASS |  |
| `jpqr` | yes | store-switch | 2 | PASS |  |
| `lightning` | yes | store-switch | 2 | PASS |  |
| `mecard` | yes | store-switch | 2 | PASS |  |
| `messaging_link` | yes | store-switch | 1 | PASS |  |
| `paynow` | yes | ui-text-generator | 1 | PASS | Generated in PayloadSection useEffect via setPayloadText. |
| `paypal_me` | yes | store-switch | 2 | PASS |  |
| `pix` | yes | ui-text-generator | 1 | PASS | Generated in PayloadSection useEffect via setPayloadText. |
| `plain_text` | yes | store-switch | 3 | PASS |  |
| `promptpay` | yes | ui-text-generator | 1 | PASS | Generated in PayloadSection useEffect via setPayloadText. |
| `qris` | yes | store-switch | 2 | PASS |  |
| `qrph` | yes | store-switch | 2 | PASS |  |
| `short_link` | yes | store-switch | 1 | PASS |  |
| `sms` | yes | store-switch | 3 | PASS |  |
| `social_profile` | yes | store-switch | 1 | PASS |  |
| `swiss_qr_bill` | yes | store-switch | 3 | PASS |  |
| `tel` | yes | store-switch | 2 | PASS |  |
| `twqr` | yes | store-switch | 2 | PASS |  |
| `upi` | yes | ui-text-generator | 2 | PASS | Generated in PayloadSection useEffect via setPayloadText. |
| `url` | yes | store-switch | 8 | PASS |  |
| `utm_link` | yes | store-switch | 2 | PASS |  |
| `vcard` | yes | store-switch | 2 | PASS |  |
| `vietqr` | yes | store-switch | 2 | PASS |  |
| `wifi` | yes | store-switch | 4 | PASS |  |
