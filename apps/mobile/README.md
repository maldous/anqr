# Mobile app contract

This is the Capacitor/mobile delivery shell.

## Own here

- mobile bootstrap
- mobile shell composition
- mobile route composition
- mobile-only feature composition
- mobile-only state composition
- integration with native bridge packages

## Do not own here

- reusable native adapters
- reusable domain logic
- reusable application orchestration

## Primary legacy inflow

- delivery-specific mobile composition currently spread through `src/app/*`, `src/features/*`, and root native scaffolds
