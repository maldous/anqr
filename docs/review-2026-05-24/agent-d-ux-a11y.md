# ANQR Web App - UX & Accessibility Review

## What's already good

The shell is competently built: skip-link to main content (`app-content.tsx:312-318`), proper RTL handling on language change (`app-content.tsx:210-212`), a global error boundary with a translated retry+home fallback (`error-fallback-ui.tsx`), a properly-keyboarded mobile divider with arrow-key support (`mobile-divider.tsx:125-131`), live preview that emits `anqr:render-start`/`anqr:render-complete` CustomEvents for test detection (`preview.tsx:62-77`), an in-canvas WCAG contrast badge that surfaces AA/AAA in plain language and offers a heatmap toggle (`preview.tsx:295-326`), distinct `Draft`/`Simulating` badges so users know when the preview is non-final, a cancellable busy overlay with progress (`busy-overlay.tsx`), a complete dark-mode token set (`index.css:65-86`), a multi-script font stack (`index.css:6-19`), and a horizontally-scrollable header with smart scroll indicators (`header.tsx:96-117`). Search-driven auto-expand of matching sections (`sidebar.tsx:157-168`) and accordion state persistence in sessionStorage (`sidebar.tsx:97-104`) show real care for the power-user path. The Capacitor Android back-press flow even implements double-back-to-exit on the root editor (`app-content.tsx:149-186`).

## Findings

### F1. Search is English-only across 88 locales [discoverability, a11y]
**Confidence:** ⚡ measured. **Risk:** low. **Effort:** medium.

`apps/web/src/features/generator/components/section-keywords.const.ts:1-663` is a hardcoded English keyword list (`text`, `url`, `wifi`, `phone`, `vcard`, …). `get-visible-section-ids.ts:16-21` matches the search query against `translate(section.labelKey)` plus these English keywords. For 87 of 88 locales, a user typing in their own language can only match section *titles* (already translated), never the synonyms — so most of the listed keywords are dead weight outside English. Combined with the prominent sidebar search bar (`sidebar.tsx:253-288`), this is the highest-ROI discoverability problem.

**Recommendation:** Move the keyword list to `i18n` (one key per section, e.g. `sections.payload.searchKeywords`) as comma-separated synonyms, and read them via `t()` like everything else. Alternatively, accept English as a fallback set (lowercase match remains) but add per-locale supplementary keywords in the JSON files. This is fully compatible with the i18n constraint and uses existing tooling.

### F2. Reset uses `confirm()` and `location.reload()` — destructive, untranslated, drops URL config [intuitive use, a11y]
**Confidence:** ⚡ measured. **Risk:** medium (regresses ability to recover from "I broke it"). **Effort:** low.

`sidebar.tsx:146-150` opens a native `confirm("Reset all settings to defaults?")` (untranslated literal string, violates the locale matrix rule) and on confirm calls `globalThis.location.reload()`. That nukes any URL parameters carrying a shared/imported config (the entire purpose of `parseUrlParams()` in `app-content.tsx:277-307`) without an undo path and without resetting the in-memory store directly. Also: native `confirm()` cannot be styled, is unreachable for some assistive tech configurations, and is blocked in some Capacitor WebView configurations.

**Recommendation:** Replace with an in-app confirmation (existing button/dialog primitives), wire it to a `useQRStore.getState().resetAll()` action that resets the store and strips query params via `history.replaceState`, and translate the strings via `t("common.resetConfirm", ...)`.

### F3. Touch targets fail 44×44px minimum on multiple critical controls [a11y, intuitive use]
**Confidence:** ⚡ measured. **Risk:** low. **Effort:** low.

Tailwind sizes from CSS classes I read:
- Sidebar inline icon buttons (search-clear, reset, close) — `className="h-4 w-4 …"` (`sidebar.tsx:263-287`) = **16×16 px**.
- Header dark-mode toggle, language menu trigger, mobile menu — `Button size="icon"` with `className="h-9 w-9"` (`header.tsx:454, 471-482`) = **36×36 px**.
- Default `Button` size is `h-10 px-4 py-2` (`button.tsx:20`) = **40×?**.
- Hex color picker input — `className="w-10 h-10 …"` (`hex-color-field.tsx:33`) = **40×40 px**, plus the small swatch is also the only large-area hit target.
- Header settings toggle — `w-8 h-8` (`header.tsx:250`) = **32×32 px**.
- "Help link" 14px icons next to labels are visually clickable but invisible on touch.

WCAG 2.5.5 (Level AAA) calls for 44×44 px; WCAG 2.5.8 (AA, WCAG 2.2) calls for 24×24 px minimum. The 16×16 search-clear / reset / close trio violates even AA.

**Recommendation:** Promote `Button` `size="icon"` to `h-11 w-11` (44px) on mobile breakpoints, replace the bare 16×16 buttons in the sidebar search row with `Button` `variant="ghost"` `size="icon"`, and ensure the help-link icons have at least an invisible 32px hit area.

### F4. BusyOverlay and copy/share/export success are silent to assistive tech [a11y]
**Confidence:** ⚡ measured. **Risk:** low. **Effort:** low.

`busy-overlay.tsx:38-89` renders a stage label, progress %, and cancel button with no `role="status"`, no `aria-live`, no `aria-busy` on the underlying main region. Screen readers won't announce "Rendering animation frames…" or completion. Similarly the Share/Export "Copied" affordance (`header.tsx:404-421`) and Analyze copy buttons swap icons + label text in-place but with no live region — sighted users see the green check; SR users get nothing. The render lifecycle CustomEvents exist for tests but never reach AT.

**Recommendation:** Add `role="status" aria-live="polite"` to the BusyOverlay's stage container; render a single visually-hidden `<output aria-live="polite">` near the main region that mirrors stage label + "Copied"/"Exported" announcements.

### F5. Tier badges (ADV/PRO) have zero upsell or explanation [intuitive use, discoverability]
**Confidence:** ⚡ measured. **Risk:** low. **Effort:** medium.

`sidebar.tsx:313-323` renders "ADV" / "PRO" pills next to advanced/pro accordions, but I8n strings exist only for the names themselves — `tiers.basic/advanced/professional` (`en-US.json:1303-1308`). There is no description string, no tooltip explaining what each tier unlocks, and the only forward-facing tier copy I can find is `watchAdForPro: "Watch ad to unlock Professional features for 24 hours"`. A Basic user sees badges on hidden accordions with no incentive — there is no "see what Advanced unlocks" hover state on the tier `<TabsTrigger>` either (only the localized tier name as `title`). The mobile selector is a 72-px `Select` (`header.tsx:355`) with no description content.

**Recommendation:** Add `tiers.basicDesc / advancedDesc / professionalDesc` strings (e.g. "Forms for tel/email/wifi/vcard, rendering controls") and surface them in the Tabs `title`/`aria-label` and the mobile `SelectItem` body. Optionally: a single "Compare tiers" link inside the sidebar (above the accordion) for true discoverability.

### F6. Sidebar shows no empty state when search has no matches [intuitive use]
**Confidence:** ⚡ measured. **Risk:** low. **Effort:** low.

`sidebar.tsx:289-342` maps `visibleSections` directly into the Accordion — when the query matches nothing, the body collapses to blank space below the search row with no `t("search.noResults")` message and no "clear search" prompt. Combined with F1 (locale-specific search broken), users on non-English locales will frequently land here.

**Recommendation:** When `searchQuery && visibleSections.length === 0`, render a friendly card with a "Clear search" button (already wired in `setSearchQuery("")`).

### F7. Overlay & Analyze advertise drag-and-drop but don't implement it [intuitive use, polish]
**Confidence:** ⚡ measured. **Risk:** low. **Effort:** low.

`file-upload-card.tsx:39-41` literally renders "Click or drop", but the surrounding `<label>` has no `onDragOver`/`onDrop` handlers — I grep-confirmed there are *no* drag/drop handlers anywhere under `apps/web/src/features/`. The overlay source picker (`overlay-source-picker.tsx`) is similarly click-only.

**Recommendation:** Either implement drop handlers on the upload container (preventDefault, read file from `dataTransfer.files`) or change the hint to "Tap to upload" / `t("analyze.uploadHint", "Tap to choose a file")`. Drop is web-only; native Capacitor users will not benefit, so the implementation should also keep the click path.

### F8. Untranslated literal strings in user-visible chrome [a11y, intuitive use]
**Confidence:** ⚡ measured. **Risk:** low. **Effort:** low.

- `sidebar.tsx:147` — `confirm("Reset all settings to defaults?")` (also F2).
- `sidebar.tsx:218` — `<span className="sr-only">Close sidebar</span>` (screen-reader text not translated; `accessibility.closeSidebar` already exists at en-US.json:1343).
- `sidebar.tsx:223` — `aria-label="QR code settings"` literal.
- `sidebar.tsx:304` — `title={...settings - Click to expand}` mixes translated + English suffix.
- `app-content.tsx:177` — `showNativeToast("Press back again to exit", "short")` Android toast literal.
- `mobile-divider.tsx:105` — `aria-label="Resize panels. Use arrow keys to adjust."`.
- `header-mobile-nav.tsx:31` — `aria-label="Mobile navigation"`.
- `header-mobile-nav.tsx:50` — `` title={`Go to ${t(link.labelKey, link.defaultLabel)}`} `` (the "Go to " prefix is hardcoded English; same on line 94).

**Recommendation:** Move each through `t()`. The "Go to X" pattern should use a single translation key with interpolation: `t("accessibility.goToPage", { page: ... })`.

### F9. Sidebar order doesn't match a typical user task flow [intuitive use, polish]
**Confidence:** 🔍 inferred. **Risk:** medium (some users have muscle memory). **Effort:** low.

Order is currently `payload → overlay → qr → render → animation → output → watermark → metadata → share → safety` (`sidebar.tsx:62-78`). For most QR creation flows the "what does it look like" step (render/colors) is more common than "do I want an image overlay", and **safety** sits at the bottom — meaning a Pro user who flagged a low-contrast warning has to scroll past Watermark, Metadata, Share to reach the fix. Also: `metadata` and `share` are top-of-funnel for embedding/sharing and bottom-of-funnel logically, but `share` after `metadata` is fine.

**Recommendation:** Reorder to `payload → render → overlay → qr → animation → safety → output → watermark → metadata → share`. Place `safety` immediately above export-related sections so users can act on warnings before exporting. Not as dramatic as merging sections — preserves all existing accordion IDs and sessionStorage state.

### F10. Discoverability after Welcome dismissed — no in-app re-entry [discoverability]
**Confidence:** ⚡ measured. **Risk:** low. **Effort:** low.

`welcome-modal.tsx:38-43` gates by `localStorage` key `anqr-welcome-seen`. There is no "What's New / How does this work?" trigger anywhere in `Header`, `HeaderDesktopNav`, `HeaderMobileNav`, or `Sidebar`. Once dismissed, the only way back to feature awareness is a guide page (`footer` link) which is a separate route. Users who clicked through reflexively can't replay.

**Recommendation:** Add a small `?` or `Sparkles` icon in `Header` (next to dark-mode toggle) that re-opens the WelcomeModal. Implementation should NOT modify `welcome-modal.tsx` itself — it already accepts `onClose?` and could accept a parent `forceOpen` prop, OR simply clear the localStorage key + reload (cheap and the same code path).

### F11. Color/hex inputs lose value parity on invalid text [polish]
**Confidence:** ⚡ measured. **Risk:** low. **Effort:** low.

`hex-color-field.tsx:36-43` binds both the `<input type="color">` and the `<input type="text">` to the same `value` with the same `onChange`. When a user types `#ZZZ` in the text input, the color input silently snaps to black with no feedback, and the rendered QR uses the invalid string. No `aria-invalid`, no error helper text.

**Recommendation:** Validate hex on text input (`/^#?[0-9a-f]{3,8}$/i`), set `aria-invalid` and keep the last valid value when invalid; show a tiny inline hint.

### F12. Mobile split divider hit area is 16 px (`h-4`) [a11y]
**Confidence:** ⚡ measured. **Risk:** low. **Effort:** low.

`mobile-divider.tsx:107` — `h-4 w-full` is a 16-pixel-tall horizontal grip on mobile, well below 44 px touch minimum. The arrow-key keyboard support is great, but the touch grip is fiddly.

**Recommendation:** Bump to `h-6` or add `py-2 -my-2` to extend the hit area without changing visual size.

### F13. Click-outside closes the sidebar on tablet/desktop ≥768px [intuitive use]
**Confidence:** ⚡ measured. **Risk:** medium (existing tablet/desktop muscle memory). **Effort:** low.

`sidebar.tsx:107-143` closes the sidebar on any `mousedown` outside it when `innerWidth >= 768`. The exclusion list is broad (Radix portals, dialogs, header) but excludes the *preview canvas itself* — so a tap on the QR canvas to "see it better" dismisses settings on desktop. The desktop sidebar isn't a transient overlay (it has `lg:ms-96` left margin baked into header/main/footer), so dismiss-on-canvas-click is surprising UX. On a lg breakpoint where the sidebar is pinned, this becomes especially weird.

**Recommendation:** On `lg+` keep the sidebar pinned by default (do not auto-close); on `md` tablet keep the current overlay-close behavior. Or: only close when the click is on the backdrop element specifically.

### F14. Footer overlaps preview on mobile native; ad/footer/share-bar stack is dense [polish]
**Confidence:** 🔍 inferred. **Risk:** medium (paddings are already carefully computed). **Effort:** medium.

`app-content.tsx:372-378` computes `paddingBottom = bannerHeight + 88` on native editor mode (AdMob + ~48px share-bar + ~40px footer). The fixed footer with copyright + 4 links in `text-[10px]` (`app-content.tsx:395-453`) sits between the share-bar and the ad — three horizontal bars stacked. On a 360×640 device that's ~140px of chrome before any QR.

**Recommendation:** On native, hide the copyright footer (move links to a settings/about screen) and rely on the mobile share-bar only. The web/desktop footer is fine.

### F15. Dark mode token set is complete; visual parity solid [polish]
**Confidence:** ⚡ measured. **Risk:** low. **Effort:** n/a.

`index.css:65-86` defines all semantic colors for `.dark`, and `header.tsx:168-173` persists `darkMode` to `localStorage`. I did not spot dark-only contrast breakages in the code paths I read. The yellow highlight (`bg-yellow-200 dark:bg-yellow-800`) in `highlight-text.tsx` is the kind of thing that's easy to forget and is handled here. **No action — investigated and looks correct.**

### F16. Help-link tier-upgrade flow is well-thought-out [polish]
**Confidence:** ⚡ measured. **Risk:** n/a. **Effort:** n/a.

`packages/ui/web/src/primitives/help-link.tsx` + `handle-help-link-tier-upgrade.ts` + `parse-help-link-tier-from-url.ts` form a coherent system: help URLs encode the required tier and trigger upgrade-prompts contextually. **No action — investigated.**

---

## Recommendations ranked by ROI

1. **F1 — Move sidebar search keywords to i18n.** [discoverability] — biggest reach (87 locales gain function for one mechanical move).
2. **F2 — Replace `confirm()` + `location.reload()` reset with an in-store reset action and a styled dialog.** [intuitive use]
3. **F3 — Bump touch targets to 44×44 px on the sidebar's reset/close/search-clear trio and on icon buttons.** [a11y]
4. **F4 — Add `role="status" aria-live="polite"` to BusyOverlay; add a hidden live region for "Copied"/"Exported".** [a11y]
5. **F5 — Add tier description strings + tooltips so Basic users understand what ADV/PRO unlock.** [discoverability]
6. **F6 — Render a "no results" state when search filters everything out.** [intuitive use]
7. **F8 — Translate the remaining literal strings (`Reset…`, `Close sidebar`, `Press back again to exit`, `Go to …`, etc.).** [a11y]
8. **F10 — Add a header icon to re-open the welcome modal (without modifying welcome-modal.tsx).** [discoverability]
9. **F13 — Stop auto-closing the desktop sidebar on canvas/main clicks at `lg+`.** [intuitive use]
10. **F9 — Reorder sidebar so `safety` sits between `animation` and `output`.** [intuitive use]
11. **F7 — Either implement drag-and-drop on upload cards or change copy from "drop" to "tap/click to upload".** [intuitive use]
12. **F11 — Validate hex text input with `aria-invalid` and keep last valid value.** [polish]
13. **F12 — Increase mobile divider hit-area to 44 px via padding.** [a11y]
14. **F14 — On native editor, hide the legal-links footer to reduce stacked chrome above the QR.** [polish]
