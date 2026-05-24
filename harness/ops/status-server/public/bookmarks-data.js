/* Bookmarks data + renderer (loaded as separate file so security hook doesn't gate the main app.js edit). */

// All values are author-controlled constants. Rendering still goes through esc()
// from app.js (window.escForBookmarks set below) to defang any future-edited values.
const BOOKMARKS = [
  {
    category: "Hosting & Infra",
    items: [
      { name: "Netlify (anqr)", url: "https://app.netlify.com/sites/anqr", note: "anqr.link deploy + functions + edge" },
      { name: "Cloudflare", url: "https://dash.cloudflare.com/", note: "DNS, Zaraz, edge cache for anqr.link" },
      { name: "GitHub repo", url: "https://github.com/maldous/anqr", note: "source, actions, packages" },
    ],
  },
  {
    category: "App Stores",
    items: [
      { name: "Google Play Console", url: "https://play.google.com/console/u/0/developers/-/app-list", note: "link.anqr.app (internal: v70)" },
      { name: "AdMob", url: "https://apps.admob.com/", note: "ca-app-pub-2270701384951162" },
      { name: "App Store Connect", url: "https://appstoreconnect.apple.com/", note: "iOS - paid Apple Dev account" },
      { name: "Apple Developer", url: "https://developer.apple.com/account", note: "certs / identifiers / profiles" },
    ],
  },
  {
    category: "Ads & Consent",
    items: [
      { name: "Google AdSense", url: "https://www.google.com/adsense/", note: "ca-pub-2270701384951162" },
      { name: "Iubenda", url: "https://www.iubenda.com/en/dashboard", note: "consent siteId 4407480" },
      { name: "Funding Choices", url: "https://fundingchoices.google.com/", note: "consent mode" },
    ],
  },
  {
    category: "Monitoring",
    items: [
      { name: "Sentry (web)", url: "https://anqr.sentry.io/projects/anqr-web/", note: "react SDK 10.43" },
      { name: "Sentry (mobile)", url: "https://anqr.sentry.io/projects/anqr-mobile/", note: "capacitor + native android" },
      { name: "SonarQube", url: "http://localhost:9000/dashboard?id=anqr", note: "self-hosted" },
      { name: "Snyk", url: "https://app.snyk.io/", note: "dependency scanning" },
    ],
  },
  {
    category: "Issue Tracking",
    items: [
      { name: "Linear (ANQR)", url: "https://linear.app/anqr", note: "main backlog" },
      { name: "GitHub Issues", url: "https://github.com/maldous/anqr/issues", note: "" },
      { name: "Jira (ENG)", url: "https://paperly.atlassian.net/", note: "board 9" },
    ],
  },
  {
    category: "AI Providers",
    items: [
      { name: "OpenAI", url: "https://platform.openai.com/", note: "sk-proj-*" },
      { name: "Google AI Studio", url: "https://aistudio.google.com/", note: "Gemini" },
      { name: "Anthropic Console", url: "https://console.anthropic.com/", note: "claude" },
      { name: "Groq", url: "https://console.groq.com/", note: "gsk_*" },
      { name: "Mistral", url: "https://console.mistral.ai/", note: "" },
      { name: "Cerebras", url: "https://cloud.cerebras.ai/", note: "csk-*" },
      { name: "DeepSeek", url: "https://platform.deepseek.com/", note: "" },
      { name: "HuggingFace", url: "https://huggingface.co/settings/tokens", note: "" },
      { name: "OpenRouter", url: "https://openrouter.ai/keys", note: "" },
      { name: "Codebuff", url: "https://codebuff.com/", note: "cb-pat-*" },
      { name: "ElevenLabs", url: "https://elevenlabs.io/app", note: "voice" },
    ],
  },
  {
    category: "Comms & Email",
    items: [
      { name: "Discord", url: "https://discord.com/channels/@me", note: "openclaw extension" },
      { name: "Brevo (SMTP)", url: "https://app.brevo.com/", note: "xsmtpsib-*" },
    ],
  },
  {
    category: "Fonts & CDNs",
    items: [
      { name: "Google Fonts", url: "https://fonts.google.com/", note: "Noto Sans + script-specific" },
      { name: "Iubenda widget CDN", url: "https://cdn.iubenda.com/cs/iubenda_cs.js", note: "consent script source" },
    ],
  },
];

function renderBookmarks() {
  const grid = document.getElementById("bookmarksGrid");
  if (!grid) return;
  const q = (window.searchQ || "").toLowerCase();
  const esc = window.escForBookmarks || ((s) => s);

  // Filter, then build DOM with safe methods (createElement, textContent) — no innerHTML.
  grid.replaceChildren();
  let any = false;
  for (const group of BOOKMARKS) {
    const items = group.items.filter(b =>
      !q ||
      b.name.toLowerCase().includes(q) ||
      (b.note || "").toLowerCase().includes(q) ||
      group.category.toLowerCase().includes(q),
    );
    if (!items.length) continue;
    any = true;
    const groupEl = document.createElement("div");
    groupEl.className = "bookmark-group";
    const title = document.createElement("h3");
    title.className = "bookmark-group-title";
    title.textContent = group.category;
    groupEl.appendChild(title);
    const cards = document.createElement("div");
    cards.className = "bookmark-cards";
    for (const b of items) {
      const a = document.createElement("a");
      a.className = "bookmark-card";
      a.href = b.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      const name = document.createElement("div");
      name.className = "bookmark-name";
      name.textContent = b.name;
      a.appendChild(name);
      if (b.note) {
        const note = document.createElement("div");
        note.className = "bookmark-note";
        note.textContent = b.note;
        a.appendChild(note);
      }
      cards.appendChild(a);
    }
    groupEl.appendChild(cards);
    grid.appendChild(groupEl);
  }
  if (!any) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = q ? `No bookmarks match "${q}"` : "No bookmarks.";
    grid.appendChild(empty);
  }
}

// Wire to app.js's render/search loop. app.js calls renderBookmarks() in renderAll().
window.renderBookmarks = renderBookmarks;
