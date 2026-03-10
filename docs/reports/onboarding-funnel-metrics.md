# Onboarding Funnel Metrics

This document defines the first-run onboarding funnel events added in ANQ-188.

## Event Schema

- `onboarding_step`
  - `step`: `intro | language | permissions | first_success`
  - `action`: `view | continue | select_language`
  - `language`: optional language code when `action=select_language`
- `onboarding_completed`
  - `reason`: `get_started | close_button | backdrop | escape`
  - `completed_step`: step active at dismissal time
  - `duration_ms`: elapsed milliseconds from onboarding start to completion
- `onboarding_first_success`
  - `source`: `qr_render`
- `onboarding_time_to_first_success`
  - `duration_ms`: elapsed milliseconds from onboarding start to first successful QR render after onboarding completion
  - `duration_seconds`: rounded seconds for easier dashboard bucketing

## Funnel Definition

1. Entry: first `onboarding_step` where `step=intro` and `action=view`
2. Progression: `onboarding_step` with `action=continue` for each step
3. Completion: `onboarding_completed`
4. First success: `onboarding_first_success`
5. Time-to-first-success: `onboarding_time_to_first_success`

## Notes

- Permission handling is point-of-need: onboarding does not request camera permissions up front.
- First success is only emitted once per onboarding cycle using localStorage guards.
