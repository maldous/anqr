# 07. Native shells, public assets, docs, and runtime state

## 7.1 `android/` and `ios/`

These are transitional native build scaffolds.

### Allowed

- build files
- manifests
- resources
- fastlane metadata
- native plugin glue
- screenshots and store metadata

### Forbidden

- business logic
- domain logic
- cross-cutting product logic
- ad hoc product utilities

### Long-term target

- `apps/android/`
- `apps/ios/`

Do not attempt this move in the same phase as core package extraction.

## 7.2 `public/`

This remains the web static asset surface.

### Keep here

- gallery images
- icons
- screenshots
- OG images
- static schema files
- robots/sitemap/redirect assets
- PWA/static files

### Do not do

- do not create runtime logic here
- do not move reusable source logic here

### Long-term note

`public/` may later become `apps/web/public/`, but that is a web-delivery relocation, not a contract package extraction.

## 7.3 `docs/`

These are canonical standards and workflow doctrine.

### Rule

When a standard exists in `docs/standards` or `docs/workflows`, the migration must reference it rather than invent a parallel rule in source comments.

## 7.4 `reports/`

Operational state only.

### Rule

Never package-extract this root.

Keep as runtime state and machine memory.
