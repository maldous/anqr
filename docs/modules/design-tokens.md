# Design Tokens

ANQR uses CSS custom properties in `src/index.css` as the canonical design-token source for shared UI primitives.

## Token Groups

### Color

- Semantic colors are defined in `@theme` with light/dark variants (`--color-background`, `--color-foreground`, `--color-primary`, `--color-border`, etc.).
- Components should consume semantic classes (`bg-primary`, `text-muted-foreground`, `border-input`) instead of hard-coded hex values.

### Typography

- `--font-sans`: global multilingual font stack.
- `--type-size-xs|sm|base`: baseline text scales for controls and metadata.
- `--type-line-tight|normal`: line-height baselines.

### Spacing and Sizing

- `--space-1..6`: spacing scale used for padding, gaps, and offsets.
- `--size-control-sm|md|lg`: standard interactive control heights.
- `--radius-control-sm|md`: shared corner radii for form controls and surfaces.

### Motion

- `--motion-duration-fast|base|slow`: timing durations.
- `--motion-ease-standard`: default easing for interactive transitions.

## Usage Rules

- Shared primitives in `src/components/ui/*` must use tokenized dimensions and motion, not raw `px`/`rem` literals for standard control sizing.
- Prefer semantic Tailwind color utilities (`bg-primary`, `text-foreground`) over explicit color values.
- Keep one control-height scale (`sm/md/lg`) across Button/Input/Textarea/Select to reduce visual drift.

## Cross-Platform Parity Guidance

Use this mapping when implementing equivalent native controls:

| Token                     | Web (CSS)         | iOS guideline                      | Android guideline       |
| ------------------------- | ----------------- | ---------------------------------- | ----------------------- |
| `--size-control-sm`       | `2.25rem` (36px)  | 36pt compact controls              | 36dp compact controls   |
| `--size-control-md`       | `2.5rem` (40px)   | 40pt default controls              | 40dp default controls   |
| `--size-control-lg`       | `2.75rem` (44px)  | 44pt touch target baseline         | 44dp touch target floor |
| `--type-size-sm`          | `0.875rem` (14px) | 14pt body/controls                 | 14sp body/controls      |
| `--space-1..6`            | 4px..24px scale   | 4pt modular spacing increments     | 4dp modular spacing     |
| `--motion-duration-fast`  | 150ms             | 120-180ms micro-interaction window | 150ms short motion      |
| `--motion-duration-base`  | 200ms             | 180-220ms state transitions        | 200ms standard motion   |
| `--motion-ease-standard`  | cubic-bezier      | ease-out dominant timing           | fast-out-slow-in family |

When parity tests expose drift, adjust token values first, then component-specific overrides.
