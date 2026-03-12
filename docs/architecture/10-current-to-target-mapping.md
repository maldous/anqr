# 10. Current-to-target mapping

This is the high-level current-to-target mapping that underpins the file move manifest.

| Current area                        | Target area                                                                           | Notes                        |
| ----------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| `src/App.tsx`                       | `src/app/shell/` + `src/features/generator/application/url-import/`                   | Split                        |
| `src/main.tsx`                      | `src/app/boot/main.tsx`                                                               | Move                         |
| `src/components/ui/**`              | `src/ui/primitives/**`                                                                | Move, except testing helpers |
| `src/components/sections/**`        | `src/features/generator/components/sections/**`                                       | Move                         |
| `src/components/analyze/**`         | `src/features/analyze/components/**`                                                  | Move                         |
| `src/components/Analyze.tsx`        | `src/features/analyze/components/AnalyzeScreen.tsx` + feature application/model files | Split                        |
| `src/components/Gallery.tsx`        | `src/features/gallery/components/GalleryScreen.tsx`                                   | Move                         |
| `src/components/WelcomeModal.tsx`   | `src/features/onboarding/components/WelcomeModal.tsx`                                 | Move                         |
| `src/components/Ad*.tsx`            | `src/features/monetization/components/**`                                             | Move                         |
| `src/hooks/useQRGenerator.ts`       | `src/features/generator/hooks/**` + feature application files                         | Split                        |
| `src/store/qr-store.ts`             | `src/state/**` + `src/domain/**` + monetization model                                 | Split                        |
| `src/data/gallery-*`                | `src/content/gallery/**` or `src/content/generated/**`                                | Move                         |
| `src/i18n/index.ts`                 | `src/app/i18n/index.ts`                                                               | Move                         |
| `src/i18n/static/**`                | `src/content/i18n/static/**`                                                          | Move as content              |
| `src/lib/logger*.ts`                | `src/infra/logging/**` and `src/infra/telemetry/**`                                   | Move                         |
| `src/lib/auto-testid.ts`            | `src/infra/testing/auto-testid.ts`                                                    | Move                         |
| `src/lib/utils.ts`                  | owning modules                                                                        | Split                        |
| `src/modules/browser-clipboard/**`  | `src/platform/browser/clipboard/**`                                                   | Move                         |
| `src/modules/browser-io/**`         | `src/platform/browser/io/**` and `src/platform/browser/canvas/**`                     | Move                         |
| `src/modules/platform/**`           | `src/platform/native/**` and `src/platform/browser/boot/**`                           | Move / split                 |
| `src/modules/qr-spec/**`            | `src/domain/qr/spec/**`                                                               | Move / narrow public API     |
| `src/modules/qr-encoder/**`         | `src/domain/qr/encode/**`                                                             | Move / narrow public API     |
| `src/modules/qr-decoder/**`         | `src/domain/qr/decode/**`                                                             | Move / narrow public API     |
| `src/modules/qr-analyzer/**`        | `src/domain/qr/analyze/**` and `src/platform/worker/analyze/**`                       | Move / split                 |
| `src/modules/qr-art/**`             | `src/domain/qr/qart/**` and `src/platform/worker/qart/**`                             | Move / split                 |
| `src/modules/dither-algorithms/**`  | `src/domain/render/dither/**`                                                         | Move / split                 |
| `src/modules/overlay/**`            | `src/domain/render/overlay/**`                                                        | Move / split                 |
| `src/modules/animation/**`          | `src/domain/render/animation/**`                                                      | Move / split                 |
| `src/modules/exporter/**`           | `src/domain/render/export/**`                                                         | Move / split                 |
| `src/modules/payload-generators/**` | `src/domain/payload/**`                                                               | Move / split                 |
| `src/modules/share-links/**`        | `src/domain/share/**`                                                                 | Move / split                 |
| `src/modules/core/**`               | `src/domain/render/color/**`, `src/domain/render/primitives/**`, or owning contexts   | Move / split                 |
| `src/modules/qr-generator/**`       | `src/domain/render/**`, `src/domain/qr/**`, and `src/platform/browser/canvas/**`      | Major decomposition          |
| `src/modules/index.ts`              | removed                                                                               | Delete                       |
