# Analytics, Ads, and Attribution

## Objective
Define what you measure and why.

---

# Analytics goals

### Product usage
Measure how often the platform is used and which capabilities matter.

Metrics:

- QR generations per session
- sessions per day
- payload types used
- customization usage
- platform usage (web / android / iOS / API)

Tools:

- Google Analytics
- internal event logging

---

### UX funnel

Primary funnel:

```

landing → generator → qr generated → preview → export/share

```

Key metrics:

- generator open rate
- generation success rate
- export/share completion rate

Purpose:

Identify friction points in the core journey.

---

### Conversion

Conversion proxies include:

- QR export
- QR share
- repeat generation within same session

Future conversion:

- premium upgrade
- ad click revenue

---

### Retention

Measured via:

- returning users
- repeat QR generation sessions
- session frequency

Key signals:

- day-1 return
- day-7 return
- session depth

---

### Revenue

Revenue sources:

- Google AdSense (web)
- AdMob (mobile)

Metrics:

- ad impressions
- ad click rate
- revenue per 1k sessions
- revenue per generation session

---

### Support signals

Measure user friction and product issues.

Signals:

- support email volume
- feedback submissions
- Sleekplan feedback entries
- error reports

---

# Event catalog starters

| Event | Description |
|---|---|
| landing_viewed | User lands on homepage |
| generator_opened | Generator interface opened |
| qr_render_start | QR generation initiated |
| qr_render_success | QR successfully generated |
| qr_render_failure | QR generation error |
| qr_preview_viewed | Preview/validation panel opened |
| qr_export_png | PNG export triggered |
| qr_export_svg | SVG export triggered |
| qr_share | Share action initiated |
| gallery_viewed | Gallery opened |
| gallery_example_opened | Example QR opened |
| gallery_example_generate | Example used to generate QR |
| premium_prompt_viewed | Premium monetization prompt shown |
| premium_conversion | Premium feature purchased |
| ad_impression | Ad displayed |
| ad_click | Ad clicked |
| feedback_opened | Feedback form opened |
| feedback_submitted | Feedback submitted |
| support_requested | User requested support |

---

# Ads / monetization

### Ad placements

Web:

- generator page sidebar
- gallery pages
- footer placements

Mobile:

- AdMob placements
- non-intrusive banner or native ads

Rules:

- ads must never block generator controls
- ads must not interfere with QR rendering

---

### Premium flows

Potential premium features:

- ad-free mode
- advanced export formats
- advanced animation features
- batch QR generation

Premium prompts must:

- appear after value is demonstrated
- not block core generation functionality

---

### Ad/test environments

Ad environments:

- production ads in prod
- test ads in dev / staging

Rules:

- never generate real ad impressions during testing
- test ad IDs required in non-prod environments

---

### Trust constraints

Must not violate core product trust goals.

Rules:

- QR generation must remain anonymous
- no tracking tied to QR content
- minimal personal data collection
- clear consent via Iubenda

---

### Experimentation rules

Allowed:

- A/B tests for layout
- ad placement testing
- UX flow improvements

Restrictions:

- experiments must not degrade QR reliability
- experiments must not introduce performance regressions

---

# Attribution / marketing

### SEO

SEO strategy focuses on:

- QR generator discovery
- gallery content
- long-tail search queries

Key signals:

- organic traffic growth
- search rankings

Tools:

- Google Search Console
- Bing Webmaster Tools

---

### Search console

Used for:

- index coverage
- query analytics
- page performance

Metrics:

- impressions
- click-through rate
- ranking position

---

### Public mentions

Track:

- media coverage
- social media mentions
- external links

Sources:

- backlink monitoring
- social monitoring

---

### Reviews

Monitor reviews on:

- Google Play
- Apple App Store

Metrics:

- rating trends
- review sentiment
- feature requests

---

### Campaign tracking

Campaigns use:

- UTM parameters
- analytics event tagging

Examples:

```

utm_source
utm_medium
utm_campaign
utm_content

```

Purpose:

Measure acquisition effectiveness across marketing channels.
