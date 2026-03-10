.PHONY: all ci smoke release help dev build bootstrap pristine gallery gallery\:fresh gallery\:gif gallery\:auto gallery\:nooverlay gallery\:qrart gallery\:remote gallery\:api gallery\:local gallery\:browser gallery\:all gallery\:compare gallery\:parity gallery\:parity\:deploy gallery\:publish gallery\:merge sitemap screenshots deploy indexnow android android\:init android\:sync android\:build android\:release android\:upload android\:open install hooks clean fix lint format check pull push i18n\:pull i18n\:push i18n\:xlate i18n\:xlate\:static i18n\:xlate\:locales i18n\:fill i18n\:fill\:static i18n\:fill\:locales i18n\:check signoff icons icons\:android android\:run android\:keystore android\:bump zip dep sonar sonar-report _quality-gates quality test test\:full test\:unit test\:unit\:coverage test\:coverage\:gap test\:unit\:ci test\:ids test\:required test\:required\:strict test\:required\:gap test\:testid test\:testid\:refs test\:bundle\:budget report\:payload\:matrix report\:i18n\:txt test\:basic test\:advanced test\:pro test\:tiers test\:ui test\:permutations test\:report test\:report\:settings test\:qr\:artifact test\:overlay\:audit gallery\:overlay resources validate\:services check\:sentry qr\:art harness harness\:quick harness\:continuous ops\:guardian ops\:continuous ops\:nightly ops\:groq ops\:gemini ops\:hugging ops\:install paid\:approval notify\:test email\:ingest ops\:email\:install monitor\:ci issue\:create issue\:create\:child issue\:cleanup\:comments board\:hygiene ios ios\:sync ios\:build ios\:open ios\:archive ios\:beta ios\:release ios\:metadata ios\:screenshots test\:appium test\:appium\:android test\:appium\:ios test\:api test\:parity

# ============================================
# Help
# ============================================

help:
	@echo ""
	@echo "ANQR Makefile - Sectioned Targets"
	@echo ""
	@echo "  1) Meta + Help"
	@echo "    make help"
	@echo ""
	@echo "  2) Global Config / Exports"
	@echo "    Defined in this file via HOST_*, RESOURCE_*, SCAN_MATRIX_*, PLAYWRIGHT_* vars"
	@echo ""
	@echo "  3) Discovery / Tool Checks"
	@echo "    make resources"
	@echo "    make validate:services"
	@echo "    make check:sentry"
	@echo ""
	@echo "  4) Pipeline Entry Points"
	@echo "    make all             Full 16-step production pipeline"
	@echo "    make ci              CI-safe gate (check + unit:ci + basic UI)"
	@echo "    make smoke           Fast smoke (build + basic UI)"
	@echo "    make release         Alias for make all"
	@echo ""
	@echo "  5) Setup & Housekeeping"
	@echo "    make bootstrap pristine install hooks clean pull push zip dep"
	@echo ""
	@echo "  6) Web"
	@echo "    make dev build preview"
	@echo ""
	@echo "  7) Quality"
	@echo "    make quality lint format fix check"
	@echo ""
	@echo "  8) Testing"
	@echo "    make test test:full test:unit test:ui test:report"
	@echo "    make test:basic test:advanced test:pro test:tiers test:permutations"
	@echo "    make test:unit:coverage test:coverage:gap test:unit:ci"
	@echo "    make test:api test:parity (Playwright API + cross-platform parity)"
	@echo "    make test:appium test:appium:android test:appium:ios"
	@echo ""
	@echo "  9) Assets"
	@echo "    make assets icons icons:android sitemap screenshots"
	@echo ""
	@echo " 10) Gallery"
	@echo "    make gallery gallery:fresh gallery:gif gallery:auto"
	@echo "    make gallery:api gallery:remote gallery:local gallery:browser gallery:all gallery:merge"
	@echo "    make gallery:compare gallery:parity gallery:parity:deploy gallery:publish"
	@echo "    make gallery:overlay gallery:nooverlay gallery:qrart"
	@echo "    Tunables: GALLERY_API_URL, GALLERY_CATEGORY, GALLERY_IDS,"
	@echo "              GALLERY_LOCAL_CONCURRENCY, GALLERY_BROWSER_CONCURRENCY, GALLERY_REMOTE_CONCURRENCY"
	@echo "              GALLERY_SHARD (e.g. 2/8), GALLERY_SHARD_INDEX + GALLERY_SHARD_TOTAL,"
	@echo "              GALLERY_SHARD_COUNT (auto-parallel shard fanout)"
	@echo ""
	@echo " 11) i18n"
	@echo "    make i18n:pull i18n:xlate i18n:fill i18n:check i18n:push"
	@echo ""
	@echo " 12) Deploy / Validation"
	@echo "    make deploy signoff validate:services check:sentry indexnow sonar"
	@echo "    NOTE: deploy/indexnow/android:upload require ALLOW_PAID_ACTIONS=1"
	@echo ""
	@echo " 13) Android"
	@echo "    make android android:init android:sync android:build android:release"
	@echo "    make android:upload android:run android:open android:keystore android:bump"
	@echo ""
	@echo " 14) Reports / Misc Utilities"
	@echo "    make report:payload:matrix report:i18n:txt sonar-report qr:art resources"
	@echo ""
	@echo " 15) Automation Ops"
	@echo "    make ops:guardian ops:continuous ops:nightly ops:groq ops:gemini ops:hugging"
	@echo "    make ops:install   Install all systemd timers from repo definitions"
	@echo ""
	@echo " 16) Harness (Autonomous Best Practice Framework)"
	@echo "    make harness harness:quick harness:continuous"
	@echo ""
	@echo " 17) Email Notifications & Ingest"
	@echo "    make notify:test       Send a test notification email"
	@echo "    make email:ingest      Process inbound emails → Linear issues"
	@echo "    make monitor:ci        Monitor GitHub CI emails → create/close Linear issues"
	@echo "    make ops:email:install  Install systemd timer for email ingest (every 5 min)"
	@echo ""
	@echo " 18) Linear Issue Management"
	@echo "    make issue:create      Show usage for standalone issue creation"
	@echo "    make issue:create:child Show usage for child issue creation"
	@echo "    make issue:cleanup:comments  List/delete noise comments from issues"
	@echo "    make board:hygiene           Run board hygiene check (dry-run)"
	@echo "    node scripts/ops/create-issue.mjs --title 'Fix bug' --priority 2 --label reliability"
	@echo ""

# ============================================
# Environment variables
# ============================================
export ENV := PROD
ALLOW_PAID_ACTIONS ?= 0

# Node binary directory (auto-detected from nvm). Used for systemd service PATH.
NVM_NODE_BIN ?= $(shell dirname "$$(command -v node)" 2>/dev/null)

# Host resource autodetection used for reusable max-utilization defaults.
# Override any value on invocation when needed.
HOST_CPU_CORES ?= $(shell \
	if command -v nproc >/dev/null 2>&1; then \
		nproc; \
	elif command -v sysctl >/dev/null 2>&1; then \
		sysctl -n hw.ncpu 2>/dev/null || echo 1; \
	else \
		echo 1; \
	fi)
HOST_MEM_GIB ?= $(shell \
	if [ -r /proc/meminfo ]; then \
		awk '/MemTotal/ {printf "%d\n", $$2 / 1024 / 1024}' /proc/meminfo; \
	elif command -v sysctl >/dev/null 2>&1; then \
		bytes=$$(sysctl -n hw.memsize 2>/dev/null || echo 0); \
		awk "BEGIN {v=$$bytes/1024/1024/1024; if (v < 1) v = 1; printf \"%d\n\", v}"; \
	else \
		echo 1; \
	fi)
HOST_DISK_FREE_GIB ?= $(shell \
	val=$$(df -Pk . 2>/dev/null | awk 'NR==2 {print int($$4/1024/1024)}'); \
	if [ -n "$$val" ] && [ "$$val" -gt 0 ] 2>/dev/null; then \
		echo $$val; \
	else \
		echo 1; \
	fi)

# Global utilization strategy for heavy jobs.
# Example: make gallery:overlay RESOURCE_UTILIZATION_PCT=98 RESOURCE_RESERVED_CORES=0
RESOURCE_UTILIZATION_PCT ?= 95
RESOURCE_RESERVED_CORES ?= 1

# Gallery scan matrix tuning.
# Auto shards are bounded by CPU, memory, and free disk budgets.
SCAN_MATRIX_ESTIMATED_SHARD_GIB ?= 18
SCAN_MATRIX_ESTIMATED_SHARD_DISK_GIB ?= 1
SCAN_MATRIX_KEEP_SHARDS ?= 0
SCAN_MATRIX_AUTO_SHARDS ?= $(shell \
	cpu=$(HOST_CPU_CORES); \
	mem=$(HOST_MEM_GIB); \
	disk=$(HOST_DISK_FREE_GIB); \
	util=$(RESOURCE_UTILIZATION_PCT); \
	reserve=$(RESOURCE_RESERVED_CORES); \
	mem_per=$(SCAN_MATRIX_ESTIMATED_SHARD_GIB); \
	disk_per=$(SCAN_MATRIX_ESTIMATED_SHARD_DISK_GIB); \
	cpu_budget=$$((cpu * util / 100)); \
	[ $$cpu_budget -lt 1 ] && cpu_budget=1; \
	cpu_budget=$$((cpu_budget - reserve)); \
	[ $$cpu_budget -lt 1 ] && cpu_budget=1; \
	mem_budget=$$((mem * util / 100)); \
	[ $$mem_budget -lt 1 ] && mem_budget=1; \
	disk_budget=$$((disk * util / 100)); \
	[ $$disk_budget -lt 1 ] && disk_budget=1; \
	[ $$mem_per -lt 1 ] && mem_per=1; \
	[ $$disk_per -lt 1 ] && disk_per=1; \
	by_mem=$$((mem_budget / mem_per)); \
	[ $$by_mem -lt 1 ] && by_mem=1; \
	by_disk=$$((disk_budget / disk_per)); \
	[ $$by_disk -lt 1 ] && by_disk=1; \
	shards=$$cpu_budget; \
	[ $$by_mem -lt $$shards ] && shards=$$by_mem; \
	[ $$by_disk -lt $$shards ] && shards=$$by_disk; \
	echo $$shards)
SCAN_MATRIX_SHARDS ?= $(SCAN_MATRIX_AUTO_SHARDS)

# Playwright default worker pool — conservative to avoid thermal throttling.
# Too many parallel Chromium instances heat the CPU, causing thermal
# throttling that slows everything down and triggers test timeouts.
PLAYWRIGHT_WORKERS ?= $(shell \
	cpu=$(HOST_CPU_CORES); \
	workers=$$((cpu / 2)); \
	[ $$workers -lt 2 ] && workers=2; \
	[ $$workers -gt 16 ] && workers=16; \
	echo $$workers)

# Vitest worker policy for heavyweight suites.
VITEST_MAX_WORKERS ?= 100%

# Bundle budget gates (KiB). i18n has warning and hard-fail thresholds.
BUNDLE_BUDGET_MAIN_ENTRY_KIB ?= 1000
BUNDLE_BUDGET_NON_I18N_TOTAL_KIB ?= 10000
BUNDLE_BUDGET_I18N_WARN_KIB ?= 25000
BUNDLE_BUDGET_I18N_MAX_KIB ?= 30000

# Gallery generation server port (default matches dev server).
GALLERY_PORT ?= 5173
GALLERY_LOCAL_CONCURRENCY ?= 12
GALLERY_BROWSER_CONCURRENCY ?= 3
GALLERY_REMOTE_CONCURRENCY ?= 2
GALLERY_BROWSER_CAPTURE_MODE ?= api
GALLERY_SCENARIO_TIMEOUT_MS ?= 900000
GALLERY_SHARD ?=
GALLERY_SHARD_INDEX ?=
GALLERY_SHARD_TOTAL ?=
GALLERY_SHARD_COUNT ?= 1
ANQR_LOG_LEVEL ?= error

# PWA screenshot generation server port (default matches dev server).
SCREENSHOT_PORT ?= 5173

validate\:services:
	node scripts/validate-third-party.mjs

check\:sentry:
	npm run check:sentry

resources:
	@echo ""
	@echo "ANQR Resource Profile (auto-detected)"
	@echo "  CPU cores:            $(HOST_CPU_CORES)"
	@echo "  Memory (GiB):         $(HOST_MEM_GIB)"
	@echo "  Free disk (GiB):      $(HOST_DISK_FREE_GIB)"
	@echo "  Utilization target:   $(RESOURCE_UTILIZATION_PCT)%"
	@echo "  Reserved CPU cores:   $(RESOURCE_RESERVED_CORES)"
	@echo "  Matrix shard memory:  $(SCAN_MATRIX_ESTIMATED_SHARD_GIB) GiB/shard"
	@echo "  Matrix shard disk:    $(SCAN_MATRIX_ESTIMATED_SHARD_DISK_GIB) GiB/shard"
	@echo "  Matrix auto shards:   $(SCAN_MATRIX_AUTO_SHARDS)"
	@echo "  Matrix run shards:    $(SCAN_MATRIX_SHARDS)"
	@echo "  Playwright workers:   $(PLAYWRIGHT_WORKERS)"
	@echo ""

# ============================================
# Full Production Pipeline
# ============================================
# Complete pipeline from fresh git checkout to production-ready deploy.
#
# Steps:
#   1. install     — npm install + lefthook git hooks + Playwright browsers
#   2. i18n:pull   — pull community translations from anqr-i18n (non-blocking)
#   3. i18n:xlate  — auto-translate missing strings (free Google Translate, no API key)
#   4. i18n:fill   — regenerate all i18n TS/JSON from txt sources
#   5. assets      — PWA icons + Android icons (if SDK) + sitemap.xml
#   6. build       — production bundle (tsc + Vite + compression)
#   7. test        — full quality gates (19 checks, incl. fix) + Vitest unit + Playwright E2E
#   8. gallery:local — render 1000 local gallery permutations into reports/gallery-artifacts/local/
#   9. gallery:publish — select curated 300-item showcase (10 sections × 5 rows × 6 cols)
#  10. reports     — payload verification matrix + unit coverage + coverage gap report
#  11. sonar       — SonarQube code analysis (non-blocking, requires localhost:9000)
#  12. deploy      — rebuild with Sentry sourcemap upload + Netlify production deploy + IndexNow
#  13. android     — release AAB + upload to Play Store (skipped if SDK/Java unavailable)
#  14. services    — third-party service checks (non-blocking)
#  15. i18n:push   — push translations to public repo
#  16. summary     — final status banner
#
# Gallery publishing is artifact-driven: it uses make gallery:local outputs and
# regenerates src/data/gallery-showcase.generated.ts plus public/gallery manifests.

all:
	@echo ""
	@echo "============================================"
	@echo "ANQR — Full Production Pipeline"
	@echo "============================================"
	@echo ""
	@echo "[1/16] Installing dependencies..."
	$(MAKE) install
	npx playwright install chromium
	@echo ""
	@echo "[2/16] Pulling community translations..."
	@$(MAKE) i18n:pull || echo "⚠️  i18n:pull failed (no remote access?) — continuing with local translations"
	@echo ""
	@echo "[3/16] Auto-translating missing strings (free Google Translate)..."
	@$(MAKE) i18n:xlate || echo "⚠️  i18n:xlate failed — continuing with existing translations"
	@echo ""
	@echo "[4/16] Regenerating i18n output files..."
	$(MAKE) i18n:fill
	@echo ""
	@echo "[5/16] Generating assets (icons + sitemap)..."
	$(MAKE) icons
	@if [ -d android ]; then $(MAKE) icons:android; fi
	$(MAKE) sitemap
	@echo ""
	@echo "[6/16] Building production bundle..."
	$(MAKE) build
	@echo ""
	@echo "[7/16] Running full test suite (quality gates + unit + E2E)..."
	# Note: test includes fix, bundle budget (which rebuilds), and Playwright (which starts its own dev server)
	$(MAKE) test
	@echo ""
	@echo "[8/16] Rendering local gallery permutations..."
	$(MAKE) gallery:local
	@echo ""
	@echo "[9/16] Publishing curated gallery from local artifacts..."
	$(MAKE) gallery:publish GALLERY_PUBLISH_SOURCE=local
	@echo ""
	@echo "[10/16] Generating reports + coverage..."
	$(MAKE) report:payload:matrix
	$(MAKE) report:i18n:txt
	@$(MAKE) test:unit:coverage || echo "⚠️  Coverage below 100% threshold — see coverage gap report"
	$(MAKE) test:coverage:gap
	@echo ""
	@echo "[11/16] Running SonarQube analysis..."
	@$(MAKE) sonar || echo "⚠️  SonarQube not available (localhost:9000) — skipping"
	@echo ""
	@echo "[12/16] Deploying web to production (Netlify) + IndexNow..."
	# Deploy rebuilds with SENTRY_UPLOAD=true for sourcemap upload, then pushes to Netlify.
	# This final build includes curated gallery assets from step 9.
	$(MAKE) deploy
	@$(MAKE) indexnow || echo "⚠️  IndexNow submission failed — see reports/indexnow-submission.json"
	@echo ""
	@echo "[13/16] Bumping version + building Android release AAB + uploading..."
	@if [ -d android ] && command -v java >/dev/null 2>&1 && [ -n "$$ANDROID_HOME" ]; then \
		$(MAKE) android:bump; \
		$(MAKE) android:release; \
		if [ -f play-store-key.json ]; then \
			echo "Uploading to Play Store..."; \
			python3 scripts/upload-to-play-store.py || echo "⚠️  Play Store upload failed"; \
		else \
			echo "Skipping Play Store upload (play-store-key.json not found)"; \
		fi; \
	else \
		echo "Skipping Android build (SDK/Java not available)"; \
	fi
	@echo ""
	@echo "[14/16] Validating third-party services..."
	@$(MAKE) validate:services || echo "⚠️  Some third-party validations failed — see reports/third-party-validation.json"
	@$(MAKE) check:sentry || echo "⚠️  Sentry regression check failed — see reports/sentry-regression.json"
	@echo ""
	@echo "[15/16] Pushing translations"
	@$(MAKE) i18n:push || echo "⚠️  i18n:push failed (no remote access?) — skipping"
	@echo ""
	@echo "[16/16] Final summary"
	@echo ""
	@echo "============================================"
	@echo "ANQR — Production pipeline complete!"
	@echo "============================================"
	@echo ""
	@echo "Post-deploy manual checklist: see docs/operations/launch-checklist.md"
	@echo "Reports generated in: reports/"

# ============================================
# AdSense Configuration (for Web - anqr.link)
# ============================================
# Publisher ID: ca-pub-2270701384951162 (from ads.txt)
# 
# Create ad units at: https://www.google.com/adsense
#   -> Ads -> By ad unit -> Display ads -> Create new
#   After creating, copy the numeric slot ID to the variable below
#
export VITE_ADSENSE_ENABLED := true
export VITE_ADSENSE_PUBLISHER_ID := ca-pub-2270701384951162
# Test Mode - show placeholder ads in production before AdSense approval
# Set to 'true' to show test placeholders, 'false' or remove when AdSense is approved
export VITE_ADSENSE_TEST_MODE := true

# HIGH PRIORITY - Main app ads
export VITE_ADSENSE_SLOT_LEFT_SKYSCRAPER := 7394019600
export VITE_ADSENSE_SLOT_RIGHT_SKYSCRAPER := 2450289467
export VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM := 3247547575

# MEDIUM PRIORITY - Gallery page ads
export VITE_ADSENSE_SLOT_GALLERY_LEFT := 2684618407
export VITE_ADSENSE_SLOT_GALLERY_RIGHT := 3454774598
export VITE_ADSENSE_SLOT_GALLERY_TOP := 5862086716
export VITE_ADSENSE_SLOT_GALLERY_BOTTOM := 9557805050

# LOWER PRIORITY - Static page ads
export VITE_ADSENSE_SLOT_STATIC_LEFT := 1934465907
export VITE_ADSENSE_SLOT_STATIC_RIGHT := 9997606994
export VITE_ADSENSE_SLOT_GUIDE_TOP := 6006391093
export VITE_ADSENSE_SLOT_GUIDE_BOTTOM := 4693309421
export VITE_ADSENSE_SLOT_LEARN_TOP := 2440505008
export VITE_ADSENSE_SLOT_LEARN_BOTTOM := 5784853643
export VITE_ADSENSE_SLOT_EXAMPLES_TOP := 4735495853
export VITE_ADSENSE_SLOT_EXAMPLES_BOTTOM := 6439459766
export VITE_ADSENSE_SLOT_ABOUT_TOP := 8437113318
export VITE_ADSENSE_SLOT_ABOUT_BOTTOM := 2067146087
export VITE_ADSENSE_SLOT_PRIVACY_TOP := 9754064417
export VITE_ADSENSE_SLOT_PRIVACY_BOTTOM := 8440982741
export VITE_ADSENSE_SLOT_TERMS_TOP := 5810949978
export VITE_ADSENSE_SLOT_TERMS_BOTTOM := 5814819407
export VITE_ADSENSE_SLOT_CONTACT_TOP := 4497868307
export VITE_ADSENSE_SLOT_CONTACT_BOTTOM := 9562492724
export VITE_ADSENSE_SLOT_TRANSLATE_TOP := 4497868307
export VITE_ADSENSE_SLOT_TRANSLATE_BOTTOM := 9562492724

# Gallery section divider ads (between gallery sections)
export VITE_ADSENSE_SLOT_GALLERY_AFTER_PLAIN := 5862086716
export VITE_ADSENSE_SLOT_GALLERY_AFTER_CONTENT_TYPES := 2993214945
export VITE_ADSENSE_SLOT_GALLERY_AFTER_STYLES := 6193275118
export VITE_ADSENSE_SLOT_GALLERY_AFTER_COLORS := 2254030108
export VITE_ADSENSE_SLOT_GALLERY_AFTER_IMAGE_OVERLAY := 3432198644
export VITE_ADSENSE_SLOT_GALLERY_AFTER_ANIMATION_OVERLAY := 6001703423
export VITE_ADSENSE_SLOT_GALLERY_AFTER_BLEND_MODES := 5382099781
export VITE_ADSENSE_SLOT_GALLERY_AFTER_COLOR_MODES := 2062458418
export VITE_ADSENSE_SLOT_GALLERY_AFTER_PREPROCESSING := 8436295070
export VITE_ADSENSE_SLOT_GALLERY_AFTER_ENCODING := 4497050062
export VITE_ADSENSE_SLOT_GALLERY_AFTER_DITHERING := 9557805050
export VITE_ADSENSE_SLOT_GALLERY_AFTER_POWER_COMBOS := 9557805050
export VITE_ADSENSE_SLOT_GALLERY_AFTER_QR_ART := 1648360241

# ============================================
# AdMob Configuration (for native Android/iOS apps)
# ============================================
# Android App ID: ca-app-pub-2270701384951162~3067761782
# iOS App ID:     ca-app-pub-2270701384951162~2718285064
# Ad units: https://admob.google.com -> Apps -> ANQR -> Ad units
#
# Banner Ads
export VITE_ADMOB_BANNER_BOTTOM := ca-app-pub-2270701384951162/3063892358
export VITE_ADMOB_BANNER_TOP := ca-app-pub-2270701384951162/6312694619
#
# Interstitial Ads
export VITE_ADMOB_INTERSTITIAL_EXPORT := ca-app-pub-2270701384951162/4365188125
export VITE_ADMOB_INTERSTITIAL_GALLERY := ca-app-pub-2270701384951162/5434727214
export VITE_ADMOB_INTERSTITIAL_GENERATION := ca-app-pub-2270701384951162/7051061212
#
# Rewarded Video Ads
export VITE_ADMOB_REWARDED_PREMIUM := ca-app-pub-2270701384951162/8325432672
export VITE_ADMOB_REWARDED_EXPORT_HD := ca-app-pub-2270701384951162/4911983037
#
# Set to 'true' to show test ads while waiting for approval, 'false' for production
export VITE_ADMOB_TESTING := true

# Android SDK path (adjust for your system)
export ANDROID_HOME ?= $(HOME)/Android/Sdk
export PATH := $(ANDROID_HOME)/tools:$(ANDROID_HOME)/platform-tools:$(PATH)

# ============================================
# Web Development
# ============================================

# Password for bootstrap.zip (override: make bootstrap BOOTSTRAP_PASSWORD=xxx)
BOOTSTRAP_PASSWORD ?= anqr

# Full environment setup from scratch (run after git clone or git clean -xfd).
# Extracts secrets from bootstrap.zip, installs Node.js + npm deps,
# sets up git hooks, and installs Playwright browsers for E2E testing.
bootstrap:
	@echo ""
	@echo "============================================"
	@echo "ANQR — Full Environment Bootstrap"
	@echo "============================================"
	@echo ""
	scripts/bootstrap.sh -p $(BOOTSTRAP_PASSWORD)
	$(MAKE) hooks
	npx playwright install chromium
	@echo ""
	@echo "============================================"
	@echo "✅ Bootstrap complete!"
	@echo "============================================"
	@echo ""
	@echo "  Run:  source env"
	@echo "  Then: make build"
	@echo ""

# Nuclear reset: wipe everything not tracked by git, then fully bootstrap.
# Equivalent to a fresh clone + make bootstrap.
pristine:
	@echo "⚠️  This will remove ALL untracked and ignored files (git clean -xfd)."
	@echo "   Only bootstrap.zip and git-tracked files will survive."
	@echo ""
	@read -p "Press Enter to continue or Ctrl+C to abort... " _
	git clean -xfd
	$(MAKE) bootstrap

install:
	npm install --include=optional
	$(MAKE) hooks

hooks:
	npx lefthook install
	@echo "Git hooks installed (pre-commit: lint-staged + typecheck, commit-msg: commitlint)"

dev:
	npm run dev

build:
	npm run build

clean:
	rm -rf dist node_modules android/app/build

# ============================================
# Code Quality (oxlint + oxfmt — OXC-powered linter + formatter)
# ============================================

# Fix all: lint with auto-fix and format
fix:
	npx oxlint --fix --fix-suggestions --tsconfig ./tsconfig.json .
	npx oxfmt --write .

# Lint only (no formatting)
lint:
	npx oxlint --deny-warnings --tsconfig ./tsconfig.json .

# Format only (no linting)
format:
	npx oxfmt --write .

# Check all without making changes (for CI)
check:
	npx oxlint --deny-warnings --tsconfig ./tsconfig.json .
	npx oxfmt .
	npx oxfmt --check .

# ============================================
# PWA Icons Generation
# ============================================

icons:
	node scripts/generate-pwa-icons.mjs

icons\:android:
	node scripts/generate-android-icons.mjs

# ============================================
# Gallery Generation
# ============================================

gallery:
	GALLERY_PORT=$(GALLERY_PORT) node scripts/generate-gallery.mjs

gallery\:fresh:
	@curl -sf -o /dev/null http://localhost:$(GALLERY_PORT)/ || \
		(echo "ERROR: No server on :$(GALLERY_PORT). Run 'make dev' first, or use 'make all'." && exit 1)
	@echo "Cleaning gallery directory..."
	rm -rf public/gallery
	mkdir -p public/gallery
	@echo "Generating gallery from scratch..."
	GALLERY_PORT=$(GALLERY_PORT) node scripts/generate-gallery.mjs
	@echo ""
	@echo "Gallery generation complete."
	@echo "  Images: public/gallery/"
	@echo "  Manifest: public/gallery/manifest.json"

gallery\:gif:
	GALLERY_PORT=$(GALLERY_PORT) node scripts/generate-gallery.mjs --gif

# ============================================
# Gallery Scan Pipeline (heavyweight — not in regular test:unit)
# ============================================
# These targets are isolated from fast local loops.
# Run explicitly or wire into nightly CI.

# Run overlay preservation wiring audit across all modes × toggle cases
test\:overlay\:audit:
	ANQR_LOG_LEVEL=error npx vitest run --maxWorkers=$(VITEST_MAX_WORKERS) tests/unit/overlay-preservation-mode-audit.spec.ts

# Generate overlay gallery images via the deployed anqr.link API.
# Produces reports/gallery-scan-matrix.json, reports/gallery-scan-summary.md,
# and image artifacts in reports/gallery-artifacts/tier-a/.
gallery\:overlay:
	npx tsx scripts/generate-gallery-matrix.mjs

# Generate non-overlay gallery QR codes via the deployed anqr.link API.
# Produces reports/gallery-artifacts/nooverlay/ with passed.txt/failed.txt.
gallery\:nooverlay:
	npx tsx scripts/generate-gallery-nooverlay.mjs

# Generate QR Art gallery images via the deployed anqr.link API.
# Produces reports/gallery-artifacts/qrart/ with passed.txt/failed.txt.
gallery\:qrart:
	npx tsx scripts/generate-gallery-qrart.mjs

# Render all 1000 gallery permutation configs via the deployed anqr.link API.
# Produces reports/gallery-artifacts/remote/ with passed.txt/failed.txt/report.json.
gallery\:remote:
	@set -e; \
	count="$(GALLERY_SHARD_COUNT)"; \
	if [ "$$count" -le 1 ]; then \
		ANQR_LOG_LEVEL=$(ANQR_LOG_LEVEL) GALLERY_SCENARIO_TIMEOUT_MS=$(GALLERY_SCENARIO_TIMEOUT_MS) GALLERY_CONCURRENCY=$(GALLERY_REMOTE_CONCURRENCY) GALLERY_SHARD="$(GALLERY_SHARD)" GALLERY_SHARD_INDEX="$(GALLERY_SHARD_INDEX)" GALLERY_SHARD_TOTAL="$(GALLERY_SHARD_TOTAL)" node --import tsx scripts/generate-gallery-remote.mjs; \
		exit $$?; \
	fi; \
	if [ -n "$(GALLERY_SHARD)" ] || [ -n "$(GALLERY_SHARD_INDEX)" ] || [ -n "$(GALLERY_SHARD_TOTAL)" ]; then \
		echo "ERROR: GALLERY_SHARD_COUNT>1 cannot be combined with GALLERY_SHARD / GALLERY_SHARD_INDEX / GALLERY_SHARD_TOTAL."; \
		exit 1; \
	fi; \
	echo "[gallery:remote] starting $$count shards in parallel"; \
	pids=""; \
	failed=0; \
	i=1; \
	while [ $$i -le $$count ]; do \
		echo "[gallery:remote] shard $$i/$$count"; \
		(ANQR_LOG_LEVEL=$(ANQR_LOG_LEVEL) GALLERY_SCENARIO_TIMEOUT_MS=$(GALLERY_SCENARIO_TIMEOUT_MS) GALLERY_CONCURRENCY=$(GALLERY_REMOTE_CONCURRENCY) GALLERY_SHARD="$$i/$$count" node --import tsx scripts/generate-gallery-remote.mjs) & \
		pids="$$pids $$!"; \
		i=$$((i + 1)); \
	done; \
	for pid in $$pids; do \
		wait $$pid || failed=1; \
	done; \
	exit $$failed

# Alias for remote API renderer target
gallery\:api: gallery\:remote

# Render all 1000 gallery permutation configs locally via QRGenerator + @napi-rs/canvas.
# Produces reports/gallery-artifacts/local/ with passed.txt/failed.txt/report.json.
gallery\:local:
	@set -e; \
	count="$(GALLERY_SHARD_COUNT)"; \
	if [ "$$count" -le 1 ]; then \
		ANQR_LOG_LEVEL=$(ANQR_LOG_LEVEL) GALLERY_SCENARIO_TIMEOUT_MS=$(GALLERY_SCENARIO_TIMEOUT_MS) GALLERY_CONCURRENCY=$(GALLERY_LOCAL_CONCURRENCY) GALLERY_SHARD="$(GALLERY_SHARD)" GALLERY_SHARD_INDEX="$(GALLERY_SHARD_INDEX)" GALLERY_SHARD_TOTAL="$(GALLERY_SHARD_TOTAL)" node --import tsx scripts/generate-gallery-local.mjs; \
		exit $$?; \
	fi; \
	if [ -n "$(GALLERY_SHARD)" ] || [ -n "$(GALLERY_SHARD_INDEX)" ] || [ -n "$(GALLERY_SHARD_TOTAL)" ]; then \
		echo "ERROR: GALLERY_SHARD_COUNT>1 cannot be combined with GALLERY_SHARD / GALLERY_SHARD_INDEX / GALLERY_SHARD_TOTAL."; \
		exit 1; \
	fi; \
	echo "[gallery:local] starting $$count shards in parallel"; \
	pids=""; \
	failed=0; \
	i=1; \
	while [ $$i -le $$count ]; do \
		echo "[gallery:local] shard $$i/$$count"; \
		(ANQR_LOG_LEVEL=$(ANQR_LOG_LEVEL) GALLERY_SCENARIO_TIMEOUT_MS=$(GALLERY_SCENARIO_TIMEOUT_MS) GALLERY_CONCURRENCY=$(GALLERY_LOCAL_CONCURRENCY) GALLERY_SHARD="$$i/$$count" node --import tsx scripts/generate-gallery-local.mjs) & \
		pids="$$pids $$!"; \
		i=$$((i + 1)); \
	done; \
	for pid in $$pids; do \
		wait $$pid || failed=1; \
	done; \
	exit $$failed

# Render all 1000 gallery permutation configs via Playwright browser screenshots.
# Requires a dev server running on GALLERY_PORT (default: 5173).
# Produces reports/gallery-artifacts/browser/ with passed.txt/failed.txt/report.json.
gallery\:browser:
	@if [ "$(GALLERY_BROWSER_CAPTURE_MODE)" != "api" ]; then \
		curl -sf -o /dev/null http://localhost:$(GALLERY_PORT)/ || \
			(echo "ERROR: No server on :$(GALLERY_PORT). Run 'make dev' first, or set GALLERY_BROWSER_CAPTURE_MODE=api." && exit 1); \
	fi
	@set -e; \
	count="$(GALLERY_SHARD_COUNT)"; \
	if [ "$$count" -le 1 ]; then \
		ANQR_LOG_LEVEL=$(ANQR_LOG_LEVEL) GALLERY_BROWSER_CAPTURE_MODE=$(GALLERY_BROWSER_CAPTURE_MODE) GALLERY_SCENARIO_TIMEOUT_MS=$(GALLERY_SCENARIO_TIMEOUT_MS) GALLERY_PORT=$(GALLERY_PORT) GALLERY_CONCURRENCY=$(GALLERY_BROWSER_CONCURRENCY) GALLERY_SHARD="$(GALLERY_SHARD)" GALLERY_SHARD_INDEX="$(GALLERY_SHARD_INDEX)" GALLERY_SHARD_TOTAL="$(GALLERY_SHARD_TOTAL)" node --import tsx scripts/generate-gallery-browser.mjs; \
		exit $$?; \
	fi; \
	if [ -n "$(GALLERY_SHARD)" ] || [ -n "$(GALLERY_SHARD_INDEX)" ] || [ -n "$(GALLERY_SHARD_TOTAL)" ]; then \
		echo "ERROR: GALLERY_SHARD_COUNT>1 cannot be combined with GALLERY_SHARD / GALLERY_SHARD_INDEX / GALLERY_SHARD_TOTAL."; \
		exit 1; \
	fi; \
	echo "[gallery:browser] starting $$count shards in parallel"; \
	pids=""; \
	failed=0; \
	i=1; \
	while [ $$i -le $$count ]; do \
		echo "[gallery:browser] shard $$i/$$count"; \
		(ANQR_LOG_LEVEL=$(ANQR_LOG_LEVEL) GALLERY_BROWSER_CAPTURE_MODE=$(GALLERY_BROWSER_CAPTURE_MODE) GALLERY_SCENARIO_TIMEOUT_MS=$(GALLERY_SCENARIO_TIMEOUT_MS) GALLERY_PORT=$(GALLERY_PORT) GALLERY_CONCURRENCY=$(GALLERY_BROWSER_CONCURRENCY) GALLERY_SHARD="$$i/$$count" node --import tsx scripts/generate-gallery-browser.mjs) & \
		pids="$$pids $$!"; \
		i=$$((i + 1)); \
	done; \
	for pid in $$pids; do \
		wait $$pid || failed=1; \
	done; \
	exit $$failed

# Compare local/browser/remote artifacts for consistency:
# decode validity + payload parity + dimension parity + size-ratio parity.
gallery\:compare:
	node --import tsx scripts/compare-gallery-artifacts.mjs

# Copy curated gallery image set from reports/gallery-artifacts/* to public/gallery/.
gallery\:publish:
	node --import tsx scripts/publish-gallery-showcase.ts

# Merge sharded gallery reports/passed/failed files into single local index files.
gallery\:merge:
	GALLERY_MERGE_ONLY=1 GALLERY_PUBLISH_SOURCE=$(GALLERY_PUBLISH_SOURCE) node --import tsx scripts/publish-gallery-showcase.ts

# Run all three gallery renderers: remote API + local QRGenerator + browser screenshots.
# Produces 3000 total images across reports/gallery-artifacts/{remote,local,browser}/.
gallery\:all:
	$(MAKE) gallery:remote || echo 'gallery:remote failed'
	$(MAKE) gallery:local || echo 'gallery:local failed'
	$(MAKE) gallery:browser || echo 'gallery:browser failed'

# Full parity run (local high parallel, browser normal, remote minimal) + consistency report.
gallery\:parity:
	rm -rf reports/gallery-artifacts/local reports/gallery-artifacts/browser reports/gallery-artifacts/remote
	mkdir -p reports/gallery-artifacts/local reports/gallery-artifacts/browser reports/gallery-artifacts/remote
	$(MAKE) gallery:local
	$(MAKE) gallery:browser
	$(MAKE) gallery:remote
	$(MAKE) gallery:compare

# Same as gallery:parity but deploys first so remote API run uses latest netlify/functions code.
gallery\:parity\:deploy:
	$(MAKE) deploy
	$(MAKE) gallery:parity

# Full gallery auto-generation pipeline:
# 1. Render all local permutation artifacts (1000 scenarios)
# 2. Select and publish curated showcase set (300 items)
gallery\:auto: gallery\:local
	$(MAKE) gallery:publish GALLERY_PUBLISH_SOURCE=local
	@echo ""
	@echo "Gallery auto-generation complete."
	@echo "  - Local artifacts: reports/gallery-artifacts/local/"
	@echo "  - Merged report:   reports/gallery-artifacts/local/report.merged.json"
	@echo "  - Gallery:     public/gallery/"
	@echo "  - Manifest:    public/gallery/showcase-manifest.json"
	@echo "  - Data file:   src/data/gallery-showcase.generated.ts"

# ============================================
# Sitemap Generation
# ============================================

sitemap:
	node scripts/generate-sitemap.mjs

# ============================================
# PWA Screenshots Generation
# ============================================

screenshots:
	@curl -sf -o /dev/null http://localhost:$(SCREENSHOT_PORT)/ || \
		(echo "ERROR: No server on :$(SCREENSHOT_PORT). Run 'make dev' first, or use 'make all'." && exit 1)
	SCREENSHOT_PORT=$(SCREENSHOT_PORT) node scripts/generate-pwa-screenshots.mjs

# ============================================
# Deployment
# ============================================

paid\:approval:
	@if [ "$(ALLOW_PAID_ACTIONS)" != "1" ]; then \
		echo "ERROR: paid/external-release action blocked."; \
		echo "Set ALLOW_PAID_ACTIONS=1 only after explicit human approval."; \
		exit 1; \
	fi

# Deploy rebuilds with SENTRY_UPLOAD=true to upload sourcemaps.
# This is intentionally separate from the earlier build steps.
deploy: paid\:approval
	SENTRY_UPLOAD=true npm run build
	netlify deploy --prod --site anqr.link --dir=dist

# Submit all canonical URLs to search engines via IndexNow protocol.
# Notifies Bing, Yandex, Naver, DuckDuckGo, and all participating engines.
# Run after deploy to inform search engines of updated content.
indexnow: paid\:approval
	node scripts/submit-indexnow.mjs

# ============================================
# Android App (Capacitor)
# ============================================

# Initialize Android platform (run once)
android\:init:
	npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/splash-screen
	npx cap add android
	@echo "Android platform initialized. Run 'make android:sync' after building."

# Sync web assets to Android project
android\:sync:
	CAPACITOR_PLATFORM=android npm run build
	# Remove pre-compressed files that cause Android asset merger conflicts
	find dist -name '*.gz' -delete 2>/dev/null || true
	find dist -name '*.br' -delete 2>/dev/null || true
	# Remove large assets not needed in mobile app (images load from anqr.link)
	rm -rf dist/gallery dist/images dist/king.gif dist/tsunami.jpg 2>/dev/null || true
	npx cap sync android

# Open in Android Studio for development
android\:open:
	npx cap open android

# Build debug APK
android\:build:
	CAPACITOR_PLATFORM=android npm run build
	# Remove pre-compressed files that cause Android asset merger conflicts
	find dist -name '*.gz' -delete 2>/dev/null || true
	find dist -name '*.br' -delete 2>/dev/null || true
	# Remove gallery folder to reduce APK size (gallery is web-only feature)
	rm -rf dist/gallery 2>/dev/null || true
	# Remove source maps if any
	find dist -name '*.map' -delete 2>/dev/null || true
	# Remove large demo files not needed in mobile app (images load from anqr.link)
	rm -rf dist/king.gif dist/tsunami.jpg dist/images 2>/dev/null || true
	npx cap sync android
	cd android && ./gradlew assembleDebug
	@echo "Debug APK: android/app/build/outputs/apk/debug/app-debug.apk"

# Build release AAB for Play Store
android\:release:
	SENTRY_UPLOAD=true CAPACITOR_PLATFORM=android npm run build
	# Remove pre-compressed files that cause Android asset merger conflicts
	find dist -name '*.gz' -delete 2>/dev/null || true
	find dist -name '*.br' -delete 2>/dev/null || true
	# Remove gallery folder to reduce APK size (gallery is web-only feature)
	rm -rf dist/gallery 2>/dev/null || true
	# Remove source maps if any
	find dist -name '*.map' -delete 2>/dev/null || true
	# Remove large demo files not needed in mobile app (images load from anqr.link)
	rm -rf dist/king.gif dist/tsunami.jpg dist/images 2>/dev/null || true
	npx cap sync android
	cd android && ./gradlew bundleRelease
	@echo "Release AAB: android/app/build/outputs/bundle/release/app-release.aab"

# Run on connected device or emulator
android\:run:
	CAPACITOR_PLATFORM=android npm run build
	# Remove pre-compressed files that cause Android asset merger conflicts
	find dist -name '*.gz' -delete 2>/dev/null || true
	find dist -name '*.br' -delete 2>/dev/null || true
	npx cap sync android
	npx cap run android

# Generate release keystore (run once, keep safe!)
android\:keystore:
	@echo "Generating release keystore..."
	keytool -genkey -v -keystore android/app/release-key.keystore -alias anqr -keyalg RSA -keysize 2048 -validity 10000
	@echo "Keystore generated at android/app/release-key.keystore"
	@echo "IMPORTANT: Back up this file and remember your passwords!"

# Bump version across all locations: package.json + Android build.gradle
# Versioning convention: 1.0.{versionCode} — see knowledge.md §Version Management
android\:bump:
	@echo "Bumping version..."
	@CURRENT_CODE=$$(grep -oP 'versionCode \K[0-9]+' android/app/build.gradle); \
	NEW_CODE=$$((CURRENT_CODE + 1)); \
	NEW_VER="1.0.$$NEW_CODE"; \
	CURRENT_NAME=$$(grep -oP 'versionName "\K[^"]+' android/app/build.gradle); \
	CURRENT_PKG=$$(grep -oP '"version": "\K[^"]+' package.json); \
	sed -i "s/versionCode $$CURRENT_CODE/versionCode $$NEW_CODE/" android/app/build.gradle; \
	sed -i "s/versionName \"$$CURRENT_NAME\"/versionName \"$$NEW_VER\"/" android/app/build.gradle; \
	sed -i "s/\"version\": \"$$CURRENT_PKG\"/\"version\": \"$$NEW_VER\"/" package.json; \
	echo "Version bumped: $$CURRENT_PKG (code $$CURRENT_CODE) -> $$NEW_VER (code $$NEW_CODE)"; \
	echo "  package.json:    $$NEW_VER"; \
	echo "  versionName:     $$NEW_VER"; \
	echo "  versionCode:     $$NEW_CODE"

# Full Android production build
android: build android\:bump android\:release
	@echo ""
	@echo "============================================"
	@echo "Android production build complete!"
	@echo "AAB file: android/app/build/outputs/bundle/release/app-release.aab"
	@echo ""
	@echo "Run 'make android:upload' to upload to Play Store."
	@echo "============================================"

# Full build + upload to Google Play Store
android\:upload: paid\:approval android
	python3 scripts/upload-to-play-store.py

# ============================================
# Utilities
# ============================================

zip:
	@rm -f anqr.zip
	@git archive \
		--format=zip \
		--prefix=anqr/ \
		HEAD \
		:\(exclude\)public/images \
		:\(exclude\)public/sitemap.xml \
		:\(exclude\)ios \
		:\(exclude\)android \
		:\(exclude\)package-lock.json \
		:\(exclude\)src/i18n/static/txt \
		:\(exclude\)src/i18n/locales/txt \
		-o anqr.zip
	@echo "anqr.zip: $$(du -h anqr.zip | cut -f1) (excludes images, ios, android, lockfile, i18n txt)"

# Generate QR-Art PNG from a target image
# Usage: make qr:art IMG=public/tsunami.jpg OUT=qr-art.png
IMG ?= public/tsunami.jpg
OUT ?= qr-art-output.png
qr\:art:
	npx tsx scripts/run-qr-art.ts $(IMG) $(OUT)

# ============================================
# Harness Report — Autonomous Best Practice Framework
# ============================================
# Unified health report across 22 check domains.
# Profiles: quick (4 checks, ~30s), continuous (9, ~3min), full (22, ~15min).
# Output: reports/harness/latest.json + timestamped history.

harness:
	node scripts/ops/harness-report.mjs --profile=full

harness\:quick:
	node scripts/ops/harness-report.mjs --profile=quick

harness\:continuous:
	node scripts/ops/harness-report.mjs --profile=continuous

ops\:guardian:
	node scripts/ops/linear-guardian.mjs --apply

ops\:continuous:
	node scripts/ops/nightly-ops-pass.mjs --profile=continuous

ops\:nightly:
	node scripts/ops/nightly-ops-pass.mjs --profile=full

ops\:groq:
	node scripts/ops/groq-free-audit.mjs

ops\:gemini:
	node scripts/ops/gemini-free-audit.mjs

ops\:hugging:
	node scripts/ops/hugging-free-audit.mjs

# ============================================
# Ops Service Installation (all timers)
# ============================================
# Installs all systemd user services and timers from repo definitions.
# This is the single source of truth for the runtime platform.
# Re-run after changing service commands, cadences, or environment.

ops\:install:
	@mkdir -p ~/.config/systemd/user
	@echo ""
	@echo "Installing ANQR systemd services and timers..."
	@echo "  Node binary dir: $(NVM_NODE_BIN)"
	@echo "  Working dir:     $(CURDIR)"
	@echo ""
	@# --- Guardian (every 5 min) ---
	@printf '[Unit]\nDescription=ANQR Linear Guardian\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=oneshot\nEnvironment=PATH=$(NVM_NODE_BIN):/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nWorkingDirectory=%s\nExecStart=/usr/bin/env bash -lc '"'"'set -a; [ -f "$$HOME/.config/symphony/anqr.env" ] && source "$$HOME/.config/symphony/anqr.env"; set +a; cd %s && node scripts/ops/linear-guardian.mjs --apply'"'"'\nStandardOutput=journal\nStandardError=journal\n' "$(CURDIR)" "$(CURDIR)" > ~/.config/systemd/user/anqr-linear-guardian.service
	@printf '[Unit]\nDescription=ANQR Linear Guardian Timer (every 5 minutes)\n\n[Timer]\nOnBootSec=1min\nOnUnitActiveSec=5min\nPersistent=true\n\n[Install]\nWantedBy=timers.target\n' > ~/.config/systemd/user/anqr-linear-guardian.timer
	@# --- Ops Continuous (every 1 hour) ---
	@printf '[Unit]\nDescription=ANQR Ops Continuous\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=oneshot\nEnvironment=PATH=$(NVM_NODE_BIN):/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nWorkingDirectory=%s\nExecStart=/usr/bin/env bash -lc '"'"'set -a; [ -f "$$HOME/.config/symphony/anqr.env" ] && source "$$HOME/.config/symphony/anqr.env"; set +a; cd %s && node scripts/ops/nightly-ops-pass.mjs --profile=continuous'"'"'\nStandardOutput=journal\nStandardError=journal\n' "$(CURDIR)" "$(CURDIR)" > ~/.config/systemd/user/anqr-ops-continuous.service
	@printf '[Unit]\nDescription=ANQR Ops Continuous Timer (every 1 hour)\n\n[Timer]\nOnBootSec=5min\nOnUnitActiveSec=1h\nPersistent=true\n\n[Install]\nWantedBy=timers.target\n' > ~/.config/systemd/user/anqr-ops-continuous.timer
	@# --- Ops Nightly (daily at 02:30) ---
	@printf '[Unit]\nDescription=ANQR Ops Nightly\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=oneshot\nEnvironment=PATH=$(NVM_NODE_BIN):/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nWorkingDirectory=%s\nExecStart=/usr/bin/env bash -lc '"'"'set -a; [ -f "$$HOME/.config/symphony/anqr.env" ] && source "$$HOME/.config/symphony/anqr.env"; set +a; cd %s && node scripts/ops/nightly-ops-pass.mjs --profile=full'"'"'\nStandardOutput=journal\nStandardError=journal\n' "$(CURDIR)" "$(CURDIR)" > ~/.config/systemd/user/anqr-ops-nightly.service
	@printf '[Unit]\nDescription=ANQR Ops Nightly Timer (daily at 02:30)\n\n[Timer]\nOnCalendar=*-*-* 02:30:00\nPersistent=true\n\n[Install]\nWantedBy=timers.target\n' > ~/.config/systemd/user/anqr-ops-nightly.timer
	@# --- Email Ingest (every 5 min) ---
	@printf '[Unit]\nDescription=ANQR Email Ingest\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=oneshot\nEnvironment=PATH=$(NVM_NODE_BIN):/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nWorkingDirectory=%s\nExecStart=/usr/bin/env bash -lc '"'"'set -a; [ -f "$$HOME/.config/symphony/anqr.env" ] && source "$$HOME/.config/symphony/anqr.env"; set +a; cd %s && node scripts/ops/email-ingest.mjs'"'"'\nStandardOutput=journal\nStandardError=journal\n' "$(CURDIR)" "$(CURDIR)" > ~/.config/systemd/user/anqr-email-ingest.service
	@printf '[Unit]\nDescription=ANQR Email Ingest Timer (every 5 minutes)\n\n[Timer]\nOnBootSec=2min\nOnUnitActiveSec=5min\nPersistent=true\n\n[Install]\nWantedBy=timers.target\n' > ~/.config/systemd/user/anqr-email-ingest.timer
	@# --- CI Monitor (every 5 min) ---
	@printf '[Unit]\nDescription=ANQR CI Monitor\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=oneshot\nEnvironment=PATH=$(NVM_NODE_BIN):/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nWorkingDirectory=%s\nExecStart=/usr/bin/env bash -lc '"'"'set -a; [ -f "$$HOME/.config/symphony/anqr.env" ] && source "$$HOME/.config/symphony/anqr.env"; set +a; cd %s && node scripts/ops/ci-failure-monitor.mjs'"'"'\nStandardOutput=journal\nStandardError=journal\n' "$(CURDIR)" "$(CURDIR)" > ~/.config/systemd/user/anqr-ci-monitor.service
	@printf '[Unit]\nDescription=ANQR CI Monitor Timer (every 5 minutes)\n\n[Timer]\nOnBootSec=3min\nOnUnitActiveSec=5min\nPersistent=true\n\n[Install]\nWantedBy=timers.target\n' > ~/.config/systemd/user/anqr-ci-monitor.timer
	@# --- Enable all timers ---
	systemctl --user daemon-reload
	systemctl --user enable --now anqr-linear-guardian.timer
	systemctl --user enable --now anqr-ops-continuous.timer
	systemctl --user enable --now anqr-ops-nightly.timer
	systemctl --user enable --now anqr-email-ingest.timer
	systemctl --user enable --now anqr-ci-monitor.timer
	@echo ""
	@echo "✅ All ANQR timers installed and enabled:"
	@echo "  - anqr-linear-guardian.timer  (every 5 min)"
	@echo "  - anqr-ops-continuous.timer   (every 1 hour)"
	@echo "  - anqr-ops-nightly.timer      (daily at 02:30)"
	@echo "  - anqr-email-ingest.timer     (every 5 min)"
	@echo "  - anqr-ci-monitor.timer       (every 5 min)"

# ============================================
# Email Notifications & Ingest
# ============================================
# Bidirectional email interface:
#   Outbound: ops scripts send notifications on failures/milestones
#   Inbound:  emails from/to email@anqr.link → Linear issues

notify\:test:
	@printf 'To: matthew.aldous@gmail.com\nFrom: matthew.aldous@gmail.com\nSubject: [ANQR] Notification system test\nContent-Type: text/plain; charset=utf-8\n\nThis is a test notification from the ANQR ops notification system.\nTimestamp: %s\n\nIf you receive this, outbound email notifications are working.\n' "$$(date -Iseconds)" | msmtp matthew.aldous@gmail.com
	@echo "✅ Test notification sent to matthew.aldous@gmail.com"

email\:ingest:
	node scripts/ops/email-ingest.mjs

# Monitor GitHub Actions CI notification emails.
# Creates Linear issues for "Run failed:" and auto-closes them on "Run succeeded:".
# One unique issue per workflow name — deduplicates repeat failures.
monitor\:ci:
	node scripts/ops/ci-failure-monitor.mjs

ops\:email\:install:
	@mkdir -p ~/.config/systemd/user
	@printf '[Unit]\nDescription=ANQR Email Ingest (mbsync + notmuch → Linear issues)\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=oneshot\nEnvironment=PATH=$(NVM_NODE_BIN):/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nWorkingDirectory=%s\nExecStart=/usr/bin/env bash -lc '"'"'set -a; [ -f "$$HOME/.config/symphony/anqr.env" ] && source "$$HOME/.config/symphony/anqr.env"; set +a; cd %s && node scripts/ops/email-ingest.mjs'"'"'\nStandardOutput=journal\nStandardError=journal\n' "$(CURDIR)" "$(CURDIR)" > ~/.config/systemd/user/anqr-email-ingest.service
	@printf '[Unit]\nDescription=ANQR Email Ingest Timer (every 5 minutes)\n\n[Timer]\nOnBootSec=2min\nOnUnitActiveSec=5min\nPersistent=true\n\n[Install]\nWantedBy=timers.target\n' > ~/.config/systemd/user/anqr-email-ingest.timer
	@printf '[Unit]\nDescription=ANQR CI Monitor (GitHub CI email → Linear)\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=oneshot\nEnvironment=PATH=$(NVM_NODE_BIN):/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nWorkingDirectory=%s\nExecStart=/usr/bin/env bash -lc '"'"'set -a; [ -f "$$HOME/.config/symphony/anqr.env" ] && source "$$HOME/.config/symphony/anqr.env"; set +a; cd %s && node scripts/ops/ci-failure-monitor.mjs'"'"'\nStandardOutput=journal\nStandardError=journal\n' "$(CURDIR)" "$(CURDIR)" > ~/.config/systemd/user/anqr-ci-monitor.service
	@printf '[Unit]\nDescription=ANQR CI Monitor Timer (every 5 minutes)\n\n[Timer]\nOnBootSec=3min\nOnUnitActiveSec=5min\nPersistent=true\n\n[Install]\nWantedBy=timers.target\n' > ~/.config/systemd/user/anqr-ci-monitor.timer
	systemctl --user daemon-reload
	systemctl --user enable --now anqr-email-ingest.timer
	systemctl --user enable --now anqr-ci-monitor.timer
	@echo "✅ Email ingest + CI monitor timers installed and enabled (every 5 minutes)"

# ============================================
# i18n Public Repo Sync (anqr-i18n)
# ============================================
# The txt translation files are published to a public repo for community contributions.
# Remote: anqr-i18n -> git@github-public:maldous/anqr-i18n.git
# Branches: 'static' (static/txt files), 'locales' (locales/txt files)

# Pull translation updates from public repo (run this after git pull)
# Stashes any working-tree changes first because git-subtree requires a clean tree.
i18n\:pull:
	@echo "Pulling i18n translations from public repo..."
	@STASHED=0; \
	if ! git diff --quiet || ! git diff --cached --quiet; then \
		echo "  Stashing uncommitted changes before subtree pull..."; \
		git stash push -m "i18n:pull auto-stash" --include-untracked; \
		STASHED=1; \
	fi; \
	LEFTHOOK=0 git subtree pull --prefix=src/i18n/static/txt anqr-i18n static --squash -m "Merge i18n static translations" || true; \
	LEFTHOOK=0 git subtree pull --prefix=src/i18n/locales/txt anqr-i18n locales --squash -m "Merge i18n locales translations" || true; \
	if [ $$STASHED -eq 1 ]; then \
		echo "  Restoring stashed changes..."; \
		git stash pop; \
	fi
	@echo "i18n pull complete."

# Push translation updates to public repo (uses force push to handle diverged histories)
# Stashes any working-tree changes first because git-subtree requires a clean tree.
i18n\:push:
	@echo "Pushing i18n translations to public repo..."
	@STASHED=0; \
	if ! git diff --quiet || ! git diff --cached --quiet; then \
		echo "  Stashing uncommitted changes before subtree split/push..."; \
		git stash push -m "i18n:push auto-stash" --include-untracked; \
		STASHED=1; \
	fi; \
	echo "  Splitting static subtree (this may take a moment)..."; \
	STATIC_SHA=$$(LEFTHOOK=0 git subtree split --prefix=src/i18n/static/txt); \
	if [ -n "$$STATIC_SHA" ]; then \
		echo "  Pushing static branch..."; \
		git push anqr-i18n "$$STATIC_SHA":static 2>/dev/null || git push anqr-i18n "$$STATIC_SHA":static --force; \
	fi; \
	echo "  Splitting locales subtree (this may take a moment)..."; \
	LOCALES_SHA=$$(LEFTHOOK=0 git subtree split --prefix=src/i18n/locales/txt); \
	if [ -n "$$LOCALES_SHA" ]; then \
		echo "  Pushing locales branch..."; \
		git push anqr-i18n "$$LOCALES_SHA":locales 2>/dev/null || git push anqr-i18n "$$LOCALES_SHA":locales --force; \
	fi; \
	if [ $$STASHED -eq 1 ]; then \
		echo "  Restoring stashed changes..."; \
		git stash pop; \
	fi
	@echo "i18n push complete."

# Full sync: pull from origin, pull i18n, ready to work
pull:
	@echo "Pulling from origin..."
	git pull
	@echo "Pulling i18n translations..."
	$(MAKE) i18n:pull
	@echo "All pulls complete."

# Full push: push i18n first, then push to origin
push:
	@echo "Pushing i18n translations..."
	$(MAKE) i18n:push
	@echo "Pushing to origin..."
	git push
	@echo "All pushes complete."

# ============================================
# i18n Translation Tools (xlate.py / fill.py)
# ============================================
# Usage:
#   make i18n:xlate                    # Translate all languages (both static and locales)
#   make i18n:xlate LANGS="fr-FR de-DE" # Translate specific languages only
#   make i18n:xlate:static             # Translate static content only
#   make i18n:xlate:locales            # Translate locales only
#   make i18n:fill                     # Generate TS/JSON from all translated txt files
#   make i18n:fill LANGS="en-GB fr-FR" # Generate for specific languages only

# Translate static content (guides, docs) - all languages or LANGS
i18n\:xlate\:static:
	@echo "Translating static content..."
	@cd src/i18n/static && \
	if [ -n "$(LANGS)" ]; then \
		for lang in $(LANGS); do \
			if [ "$$lang" != "en-GB" ]; then \
				python3 xlate.py --workers 4 "$$lang.txt"; \
			fi \
		done; \
	else \
		python3 xlate.py --workers 4; \
	fi

# Translate locales (UI strings) - all languages or LANGS
i18n\:xlate\:locales:
	@echo "Translating locales..."
	@cd src/i18n/locales && \
	if [ -n "$(LANGS)" ]; then \
		for lang in $(LANGS); do \
			if [ "$$lang" != "en-GB" ]; then \
				python3 xlate.py --workers 4 "$$lang.txt"; \
			fi \
		done; \
	else \
		python3 xlate.py --workers 4; \
	fi

# Translate both static and locales
i18n\:xlate: i18n\:xlate\:static i18n\:xlate\:locales
	@echo "All translations complete."

# Generate static TS files from translated txt - all languages or LANGS
i18n\:fill\:static:
	@echo "Generating static TS files..."
	@cd src/i18n/static && \
	if [ -n "$(LANGS)" ]; then \
		for lang in $(LANGS); do \
			python3 fill.py "$$lang.txt"; \
		done; \
	else \
		for f in txt/*.txt; do \
			python3 fill.py "$$(basename $$f)"; \
		done; \
	fi

# Generate locales JSON files from translated txt - all languages or LANGS
i18n\:fill\:locales:
	@echo "Generating locales JSON files..."
	@cd src/i18n/locales && \
	if [ -n "$(LANGS)" ]; then \
		for lang in $(LANGS); do \
			python3 fill.py "$$lang.txt"; \
		done; \
	else \
		for f in txt/*.txt; do \
			python3 fill.py "$$(basename $$f)"; \
		done; \
	fi

# Generate both static TS and locales JSON
i18n\:fill: i18n\:fill\:static i18n\:fill\:locales
	@echo "All fills complete."

i18n\:check:
	npm run test:i18n

dep:
	@npx depcruise src --output-type dot | dot -Tpng > deps.png

# ============================================
# SonarQube Code Analysis
# ============================================
# Configuration in: sonar-project.properties
# Local SonarQube server at http://localhost:9000
# Run `make sonar` to perform analysis, `make sonar-report` to view issues

SONAR_HOST_URL := http://localhost:9000
SONAR_TOKEN ?= $(SONAR_TOKEN)

# Run SonarQube analysis (uses sonar-project.properties)
sonar:
	@echo "Running SonarQube analysis..."
	@if ! curl -fsS --max-time 5 "$(SONAR_HOST_URL)/api/system/status" >/dev/null; then \
		echo "SKIP: SonarQube server unavailable at $(SONAR_HOST_URL); skipping non-blocking local analysis."; \
	else \
		$(MAKE) test:unit:coverage || echo "⚠️  Coverage generation failed — sonar will run without coverage data"; \
		npx sonar-scanner; \
	fi
	@echo ""
	@echo "Analysis complete! View results at: $(SONAR_HOST_URL)/dashboard?id=anqr"

sonar-report:
	@bash ./scripts/sonar-export.sh

SONAR_CLI := /home/user/.local/share/sonarqube-cli/bin/sonar

sonar\:issues:
	@$(SONAR_CLI) list issues -p anqr --page-size 500

sonar\:issues\:reliability:
	@curl -sS -u "$(SONAR_TOKEN):" '$(SONAR_HOST_URL)/api/issues/search?componentKeys=anqr&resolved=false&impactSoftwareQualities=RELIABILITY&ps=500' | jq '{total, issues: [.issues[] | {rule, severity: (.impacts[] | select(.softwareQuality=="RELIABILITY") | .severity), file: (.component | split(":")[1]), line, message}]}'

# ============================================
# UI Testing (Playwright)
# ============================================
# Runs E2E tests against local dev server with Chrome
# Tests are organized by tier: basic, advanced, professional
# Permutation tests run exhaustive setting combinations (very long!)

# Shared static quality gate pipeline used by both 'quality' and 'test'.
# 17 checks: oxlint+oxfmt → tsc → lockfile → licenses → type-coverage → duplication →
#   spelling → inventories → test-ids → depcruise → audit →
#   osv-scanner → semgrep → knip → bundle-budget
_quality-gates:
	$(MAKE) fix
	npm run typecheck
	npx lockfile-lint
	npx license-checker --failOn 'AGPL-1.0-only;AGPL-1.0-or-later;AGPL-3.0-only;AGPL-3.0-or-later;GPL-2.0-only;GPL-3.0-only;GPL-3.0-or-later' --production
	npx type-coverage --at-least 95 --strict --ignore-catch
	npx jscpd src
	npx cspell 'src/**/*.{ts,tsx}' '!src/i18n/**' --no-progress
	npm run test:ids
	npm run test:required
	npm run test:testid
	npm run test:testid:refs
	npx depcruise --config .dependency-cruiser.cjs src
	@AUDIT_LOG=$$(mktemp); \
	if npm audit --audit-level=critical > "$$AUDIT_LOG" 2>&1; then \
		cat "$$AUDIT_LOG"; \
	else \
		cat "$$AUDIT_LOG"; \
		if rg -q 'ENOTFOUND|EAI_AGAIN|ECONNREFUSED|network' "$$AUDIT_LOG"; then \
			echo "npm audit unavailable (network resolution failure), skipping in this run."; \
		else \
			rm -f "$$AUDIT_LOG"; \
			exit 1; \
		fi; \
	fi; \
	rm -f "$$AUDIT_LOG"
	@if which osv-scanner > /dev/null 2>&1; then osv-scanner --lockfile package-lock.json || true; else echo 'osv-scanner not installed, skipping'; fi
	@if which semgrep > /dev/null 2>&1; then semgrep --config auto src/ --exclude 'src/i18n/**' --severity WARNING --severity ERROR --error --quiet || true; else echo 'semgrep not installed, skipping'; fi
	npx knip --include dependencies,unlisted,exports
	$(MAKE) test:bundle:budget

quality: _quality-gates

signoff:
	npm run test:signoff

test\:unit:
	npm run test:unit

test\:qr\:artifact:
	SAVE_QR_ARTIFACT=1 npx vitest run tests/unit/qr-generator-dithered-scan-gate.spec.ts

test\:unit\:coverage:
	npm run test:unit:coverage

test\:coverage\:gap:
	npm run test:coverage:gap

test\:unit\:ci:
	npm run test:unit:ci

test\:ids:
	npm run test:ids

test\:required:
	npm run test:required

test\:required\:strict:
	npm run test:required:strict

test\:required\:gap:
	npm run test:required:gap

test\:testid:
	npm run test:testid

test\:testid\:refs:
	npm run test:testid:refs

test\:bundle\:budget:
	npm run build
	BUNDLE_BUDGET_MAIN_ENTRY_KIB=$(BUNDLE_BUDGET_MAIN_ENTRY_KIB) \
	BUNDLE_BUDGET_NON_I18N_TOTAL_KIB=$(BUNDLE_BUDGET_NON_I18N_TOTAL_KIB) \
	BUNDLE_BUDGET_I18N_WARN_KIB=$(BUNDLE_BUDGET_I18N_WARN_KIB) \
	BUNDLE_BUDGET_I18N_MAX_KIB=$(BUNDLE_BUDGET_I18N_MAX_KIB) \
	npm run test:bundle:budget

report\:payload\:matrix:
	npm run report:payload:matrix

# Check i18n txt files for untranslated strings, line-count mismatches, and English-heavy warnings
report\:i18n\:txt:
	npm run report:i18n:txt || true

# Run ALL tests: quality gates + full unit suite + i18n + E2E
# This is the comprehensive test target - use for full CI validation
# Order: fix → audits → typecheck → full vitest → test-id checks → i18n → Playwright E2E
# Outputs E2E results to test-report.txt for text-based review
test: _quality-gates
	npm run test:unit
	npm run test:i18n
	bash -o pipefail -c 'npx playwright test --project=basic --project=advanced --project=professional --project=api --workers=$(PLAYWRIGHT_WORKERS) --reporter=list 2>&1 | tee test-report.txt'

# Run basic tier tests only (tests/basic/*.spec.ts)
test\:basic:
	npx playwright test --project=basic --workers=$(PLAYWRIGHT_WORKERS)

# Run advanced tier tests only (tests/advanced/*.spec.ts)
test\:advanced:
	npx playwright test --project=advanced --workers=$(PLAYWRIGHT_WORKERS)

# Run professional tier tests only (tests/professional/*.spec.ts)
test\:pro:
	npx playwright test --project=professional --workers=$(PLAYWRIGHT_WORKERS)

# Run all tier tests (basic + advanced + professional + api) but NOT permutations
# Use this for faster feedback during development
test\:tiers:
	npx playwright test --project=basic --project=advanced --project=professional --project=api --workers=$(PLAYWRIGHT_WORKERS)

# Open Playwright UI mode for interactive debugging
test\:ui:
	npx playwright test --ui

# Run ONLY exhaustive permutation tests (tests/permutations/*.spec.ts)
# DEFAULT: Runs ALL tests for ALL settings - designed for overnight CI runs
# Use environment variables to LIMIT scope for faster local testing:
#   PERM_TIER=basic|advanced|professional (filter by tier)
#   PERM_SECTION=payload|overlay|render|etc (filter by section)
#   PERM_MAX=50 (limit tests per section)
test\:permutations:
	npx playwright test --project=permutations --workers=$(PLAYWRIGHT_WORKERS)

# Generate settings QR change report for manual review
test\:report\:settings:
	bash -o pipefail -c 'npx playwright test tests/reports/settings-report.spec.ts --reporter=list 2>&1 | tee test-results/settings-report.txt'

# Show test report
test\:report:
	npx playwright show-report

# ============================================
# Mobile Testing (Appium + WebdriverIO)
# ============================================
# Runs native E2E tests against a real device or emulator via Appium.
# Tests are in tests/appium/ and use WebdriverIO with Mocha.
#
# OS Gates:
#   - macOS (Darwin): runs iOS tests only   → make test:appium:ios
#   - Linux:          runs Android tests only → make test:appium:android
#   - make test:appium auto-detects the OS and picks the right platform.
#
# Prerequisites:
#   - Android (Linux): `make android:build` (debug APK), emulator or device connected
#   - iOS (macOS):     `make ios:build`, Xcode + simulator
#
# Tunables:
#   APPIUM_PLATFORM=android|ios   (auto-detected from OS by default)
#   APPIUM_DEVICE=emulator-5554   (default: emulator-5554)
#   APPIUM_APP=/path/to/app.apk   (default: android/app/build/outputs/apk/debug/app-debug.apk)

# Run Appium tests (auto-detects platform based on OS: macOS→iOS, Linux→Android)
test\:appium:
	@OS=$$(uname -s); \
	if [ "$$OS" = "Darwin" ]; then \
		echo "[appium] Detected macOS — running iOS tests"; \
		APPIUM_PLATFORM=ios npx wdio run wdio.conf.ts; \
	elif [ "$$OS" = "Linux" ]; then \
		echo "[appium] Detected Linux — running Android tests"; \
		ANQR_BASE_URL=http://10.0.2.2:8888 APPIUM_PLATFORM=android npx wdio run wdio.conf.ts; \
	else \
		echo "ERROR: Unsupported OS '$$OS'. Appium tests require macOS (iOS) or Linux (Android)."; \
		exit 1; \
	fi

# Run Appium tests explicitly on Android (Linux only)
test\:appium\:android:
	@OS=$$(uname -s); \
	if [ "$$OS" != "Linux" ]; then \
		echo "ERROR: Android Appium tests must run on Linux (detected $$OS)."; \
		echo "       Use 'make test:appium:ios' on macOS."; \
		exit 1; \
	fi
	ANQR_BASE_URL=http://10.0.2.2:8888 APPIUM_PLATFORM=android npx wdio run wdio.conf.ts

# ============================================
# API Testing (Playwright + netlify dev)
# ============================================
# Tests the /api/qr Netlify Function endpoint and cross-platform QR parity.
# Uses `netlify dev` (port 8888) — started automatically by Playwright webServer.
#
# Targets:
#   test:api    — QR API endpoint tests + browser↔API parity tests
#   test:parity — Alias for test:api (parity tests live in tests/api/)

# Run Playwright API + parity tests (tests/api/*.spec.ts)
test\:api:
	npx playwright test --project=api --workers=$(PLAYWRIGHT_WORKERS)

# Alias: cross-platform parity tests (browser ↔ API visual comparison)
test\:parity: test\:api

# Run Appium tests explicitly on iOS (macOS only — requires Xcode)
test\:appium\:ios:
	@OS=$$(uname -s); \
	if [ "$$OS" != "Darwin" ]; then \
		echo "ERROR: iOS Appium tests must run on macOS (detected $$OS)."; \
		echo "       Use 'make test:appium:android' on Linux."; \
		exit 1; \
	fi
	APPIUM_PLATFORM=ios npx wdio run wdio.conf.ts

# ============================================
# Linear Issue Management
# ============================================
# CLI scripts for creating Linear issues without writing raw GraphQL.
# Usage: node scripts/ops/create-issue.mjs --title "Fix bug" --priority 2 --label reliability

issue\:create:
	@echo "Usage: node scripts/ops/create-issue.mjs --title 'Title' [--description '...'] [--priority 1-4] [--label name] [--state Backlog] [--team ANQ] [--parent ANQ-123]"
	@echo ""
	@echo "Example:"
	@echo "  node scripts/ops/create-issue.mjs --title 'Fix CI flake' --priority 2 --label reliability"

issue\:create\:child:
	@echo "Usage: node scripts/ops/create-child-issue.mjs --parent ANQ-123 --title 'Title' [--description '...'] [--priority 1-4] [--label name] [--state Backlog]"
	@echo ""
	@echo "Example:"
	@echo "  node scripts/ops/create-child-issue.mjs --parent ANQ-151 --title 'Subtask' --priority 3"

# List and delete noise comments (error traces, retry logs) from Linear issues.
# Dry-run by default — use --apply to actually delete.
issue\:cleanup\:comments:
	@echo "Usage: node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-XXX [--apply] [--older-than N] [--pattern 'regex']"
	@echo "       node scripts/ops/linear-cleanup-comments.mjs --all-open [--apply] [--older-than N]"
	@echo ""
	@echo "Examples:"
	@echo "  node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-106"
	@echo "  node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-106 --apply"
	@echo "  node scripts/ops/linear-cleanup-comments.mjs --all-open --older-than 7 --apply"

# Run board hygiene checks: multiple In Progress, stale In Progress, Pending without [HUMAN].
# Dry-run by default. Use APPLY=1 to auto-correct violations.
board\:hygiene:
ifeq ($(APPLY),1)
	@node scripts/ops/linear-guardian.mjs --apply 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); bh=d.get('boardHygiene',{}); print(json.dumps(bh,indent=2))"
else
	@node scripts/ops/linear-guardian.mjs 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); bh=d.get('boardHygiene',{}); print(json.dumps(bh,indent=2))"
endif

# ============================================
# iOS App (Capacitor + Fastlane)
# ============================================

# Sync web assets to iOS project
ios\:sync:
	CAPACITOR_PLATFORM=ios npm run build
	# Remove pre-compressed files not needed in iOS
	find dist -name '*.gz' -delete 2>/dev/null || true
	find dist -name '*.br' -delete 2>/dev/null || true
	# Remove gallery folder to reduce app size (gallery is web-only feature)
	rm -rf dist/gallery 2>/dev/null || true
	# Remove source maps if any
	find dist -name '*.map' -delete 2>/dev/null || true
	# Remove large demo files not needed in mobile app (images load from anqr.link)
	rm -rf dist/king.gif dist/tsunami.jpg dist/images 2>/dev/null || true
	npx cap sync ios

# Open in Xcode for development
ios\:open:
	npx cap open ios

# Build debug app for simulator (no signing required)
ios\:build:
	$(MAKE) ios:sync
	xcodebuild -project ios/App/App.xcodeproj -scheme App \
		-destination 'generic/platform=iOS Simulator' \
		-configuration Debug build \
		CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO
	@echo "Simulator build complete."

# Build signed release archive via Fastlane (no upload)
ios\:archive:
	cd ios/App && bundle exec fastlane archive
	@echo "Release archive: ios/App/build/ANQR.ipa"

# Push beta build to TestFlight via Fastlane (API key auth)
ios\:beta: paid\:approval
	cd ios/App && bundle exec fastlane beta
	@echo "Beta uploaded to TestFlight."

# Push release build to App Store via Fastlane (API key auth)
ios\:release: paid\:approval
	cd ios/App && bundle exec fastlane release
	@echo "Release uploaded to App Store Connect."

# Upload App Store metadata (description, keywords, etc.) without binary
ios\:metadata:
	cd ios/App && bundle exec fastlane metadata
	@echo "Metadata uploaded to App Store Connect."

# Generate App Store screenshots using Playwright at exact Apple-required dimensions
# Requires: production build in dist/ (uses vite preview) or dev server on :5173
ios\:screenshots:
	@if [ -f dist/index.html ]; then \
		echo "Using production build (vite preview)..."; \
		npx vite preview --port 5173 --strictPort & \
		SERVER_PID=$$!; \
		SERVER_READY=0; \
		for i in $$(seq 1 30); do \
			if curl -sf -o /dev/null http://localhost:5173/; then SERVER_READY=1; break; fi; \
			sleep 1; \
		done; \
		if [ $$SERVER_READY -eq 0 ]; then \
			echo "ERROR: vite preview did not start within 30s"; \
			kill $$SERVER_PID 2>/dev/null; \
			exit 1; \
		fi; \
		node scripts/generate-appstore-screenshots.mjs; \
		RET=$$?; \
		kill $$SERVER_PID 2>/dev/null; wait $$SERVER_PID 2>/dev/null; \
		exit $$RET; \
	else \
		curl -sf -o /dev/null http://localhost:5173/ || \
			(echo "ERROR: No build in dist/ and no server on :5173. Run 'make build' or 'make dev' first." && exit 1); \
		node scripts/generate-appstore-screenshots.mjs; \
	fi
	@echo "App Store screenshots generated in ios/App/fastlane/screenshots/en-US/"

# Full iOS production build (archive only — upload separately)
ios: ios\:archive
	@echo ""
	@echo "============================================"
	@echo "iOS production build complete!"
	@echo "IPA file: ios/App/build/ANQR.ipa"
	@echo ""
	@echo "Run 'make ios:beta' to upload to TestFlight."
	@echo "Run 'make ios:release' to upload to App Store."
