# UI/UX Critical Flows

## Objective
Define the journeys that matter most for launch and ongoing UX review.

---

# Critical user journeys

---

# 1. First visit / landing

**User goal**

- Understand immediately what ANQR does
- Generate a QR code quickly
- Explore examples if unsure

**Success condition**

- User generates their first QR code within the same session

**Friction points**

- Confusing landing message
- Too many options before first generation
- Slow initial load
- Ad placement interfering with first action

**Accessibility expectations**

- Clear headings
- keyboard navigation
- readable contrast
- alt text for gallery previews

**Mobile expectations**

- Landing must load fast
- clear "generate QR" action above the fold
- thumb-friendly controls

**Analytics events**

- `landing_view`
- `start_generation`
- `gallery_view`
- `session_start`

**Performance expectations**

- page load < 2s on broadband
- first interaction < 1s
- mobile page weight minimized

---

# 2. Create QR

**User goal**

- Enter content and generate a QR code immediately

**Success condition**

- QR generated correctly on first attempt

**Friction points**

- confusing input types
- unclear supported formats
- generation delay

**Accessibility expectations**

- labelled inputs
- clear error messaging
- keyboard input support

**Mobile expectations**

- fast keyboard input
- responsive generation
- no UI blocking during generation

**Analytics events**

- `qr_generate_start`
- `qr_generate_success`
- `qr_generate_failure`
- `payload_type_selected`

**Performance expectations**

- QR generation < 500ms typical
- no UI freeze during generation

---

# 3. Customize QR

**User goal**

- visually customize QR without breaking scannability

**Success condition**

- user can modify style and QR remains scannable

**Friction points**

- overlays breaking QR readability
- too many customization controls
- unclear preview feedback

**Accessibility expectations**

- color contrast warnings
- assistive text describing controls

**Mobile expectations**

- simple controls
- sliders or presets rather than complex menus
- smooth preview updates

**Analytics events**

- `qr_style_change`
- `overlay_applied`
- `color_change`
- `animation_selected`

**Performance expectations**

- preview refresh < 500ms
- smooth updates on mobile GPUs

---

# 4. Preview / validate

**User goal**

- confirm QR code is scannable and correct

**Success condition**

- user trusts the QR output and proceeds to export

**Friction points**

- unclear scan reliability
- preview not matching exported output
- poor scan safety guidance

**Accessibility expectations**

- readable validation messages
- visual indicators not relying only on color

**Mobile expectations**

- large preview
- easy zoom
- scan safety feedback visible

**Analytics events**

- `preview_view`
- `scan_validation_pass`
- `scan_validation_warning`

**Performance expectations**

- validation analysis < 1s
- preview rendering smooth

---

# 5. Export / share

**User goal**

- save or distribute QR code

**Success condition**

- QR exported successfully

**Friction points**

- confusing export formats
- blocked downloads on mobile
- social share failures

**Accessibility expectations**

- clearly labelled export buttons
- file type descriptions

**Mobile expectations**

- share sheet integration
- download compatible with mobile browsers
- minimal extra steps

**Analytics events**

- `export_png`
- `export_svg`
- `share_action`
- `download_complete`

**Performance expectations**

- export generation < 500ms
- immediate download or share trigger

---

# 6. Gallery exploration

**User goal**

- discover examples of QR capabilities

**Success condition**

- user interacts with examples and generates their own

**Friction points**

- too many categories
- slow gallery loading
- unclear link between example and generator

**Accessibility expectations**

- descriptive labels
- image alt text
- keyboard navigation

**Mobile expectations**

- scrollable grid
- lightweight thumbnails
- lazy loading

**Analytics events**

- `gallery_open`
- `gallery_example_view`
- `gallery_example_generate`

**Performance expectations**

- gallery loads quickly
- images lazy loaded
- scroll remains smooth

---

# 7. Premium prompt / monetization

**User goal**

- optionally support platform or unlock premium features

**Success condition**

- user views monetization without feeling forced

**Friction points**

- intrusive ads
- confusing premium prompts
- paywalls blocking core functionality

**Accessibility expectations**

- ads clearly identifiable
- accessible dismissal controls

**Mobile expectations**

- ads not blocking controls
- minimal intrusive formats

**Analytics events**

- `ad_impression`
- `ad_click`
- `premium_prompt_view`

**Performance expectations**

- ads must not degrade generation speed
- minimal layout shift

---

# 8. Support / feedback path

**User goal**

- report problems or give feedback

**Success condition**

- user can contact support easily

**Friction points**

- hidden contact path
- unclear feedback form
- slow response expectations

**Accessibility expectations**

- readable contact instructions
- simple forms

**Mobile expectations**

- quick feedback submission
- minimal typing required

**Analytics events**

- `feedback_open`
- `feedback_submit`
- `support_contact`

**Performance expectations**

- feedback forms load instantly
- submission < 1s
