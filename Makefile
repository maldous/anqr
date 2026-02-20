.PHONY: all help dev build gallery gallery\:fresh gallery\:gif gallery\:auto gallery\:nooverlay gallery\:qrart sitemap screenshots deploy indexnow android android\:init android\:sync android\:build android\:release android\:upload android\:open install hooks clean fix lint format check pull push i18n\:pull i18n\:push i18n\:xlate i18n\:xlate\:static i18n\:xlate\:locales i18n\:fill i18n\:fill\:static i18n\:fill\:locales i18n\:check signoff icons icons\:android android\:run android\:keystore android\:bump zip dep sonar sonar-report _quality-gates quality test test\:unit test\:unit\:coverage test\:coverage\:gap test\:unit\:ci test\:ids test\:required test\:required\:strict test\:required\:gap test\:testid test\:testid\:refs test\:bundle\:budget report\:payload\:matrix report\:i18n\:txt test\:basic test\:advanced test\:pro test\:tiers test\:ui test\:permutations test\:report test\:report\:settings test\:qr\:artifact test\:overlay\:audit gallery\:overlay resources validate\:services check\:sentry qr\:art

# ============================================
# Help
# ============================================

help:
	@echo ""
	@echo "ANQR Makefile - Available targets:"
	@echo ""
	@echo "  FULL PIPELINE"
	@echo "    make all            Complete fresh-to-production pipeline"
	@echo "                         1. install    — npm install + hooks + Playwright browsers"
	@echo "                         2. i18n:pull  — pull community translations (non-blocking)"
	@echo "                         3. i18n:xlate — auto-translate missing strings (free Google)"
	@echo "                         4. i18n:fill  — regenerate all i18n TS/JSON from txt"
	@echo "                         5. assets     — PWA icons + Android icons + sitemap"
	@echo "                         6. build      — production bundle (tsc + Vite)"
	@echo "                         7. gallery    — gallery images + PWA screenshots (serve → Playwright)"
	@echo "                         8. test       — quality gates + unit + E2E (19 checks)"
	@echo "                         9. validate   — overlay audit + scan matrix + signoff"
	@echo "                        10. gallery    — copy Tier A scan-validated overlays back"
	@echo "                        11. reports    — payload matrix + unit coverage + coverage gap"
	@echo "                        12. sonar      — SonarQube code analysis (non-blocking)"
	@echo "                        13. deploy     — rebuild with Sentry + Netlify deploy + IndexNow"
	@echo "                        14. android    — release AAB + upload (if SDK available)"
	@echo "                        15. services   — third-party service checks (non-blocking)"
	@echo "                        16. i18n:push  — push translations + final summary"
	@echo ""
	@echo "  WEB DEVELOPMENT"
	@echo "    make install        Install npm dependencies + git hooks"
	@echo "    make hooks          Install git hooks (lefthook + commitlint + lint-staged)"
	@echo "    make dev            Start development server"
	@echo "    make build          Build production bundle"
	@echo "    make clean          Remove dist, node_modules, and Android build files"
	@echo ""
	@echo "  CODE QUALITY (Biome)"
	@echo "    make fix            Fix all: format, lint with auto-fix, organize imports"
	@echo "    make lint           Lint only (no formatting)"
	@echo "    make format         Format only (no linting)"
	@echo "    make check          Check all without changes (for CI)"
	@echo ""
	@echo "  ASSET GENERATION"
	@echo "    make icons          Generate PWA icons"
	@echo "    make icons:android  Generate Android launcher icons"
	@echo "    make gallery        Generate gallery images (PNG)"
	@echo "    make gallery:fresh  Clean + regenerate all gallery images from scratch"
	@echo "    make gallery:gif    Generate gallery images (with GIFs)"
	@echo "    make gallery:auto   Run scan matrix → copy approved artifacts to gallery"
	@echo "    make gallery:nooverlay  Generate non-overlay gallery QR codes via API (styles, colors, gradients, frames)"
	@echo "    make gallery:qrart     Generate QR Art gallery images via API (4 styles × 6 fixtures)"
	@echo "    make sitemap        Generate sitemap.xml"
	@echo "    make screenshots    Generate PWA screenshots (desktop + mobile) via Playwright"
	@echo ""
	@echo "  DEPLOYMENT"
	@echo "    make deploy         Deploy to Netlify (anqr.link)"
	@echo "    make indexnow       Submit URLs to search engines via IndexNow (post-deploy)"
	@echo ""
	@echo "  ANDROID APP (Capacitor)"
	@echo "    make android        Full production build (bump + release AAB)"
	@echo "    make android:init   Initialize Android platform (run once)"
	@echo "    make android:sync   Sync web assets to Android project"
	@echo "    make android:build  Build debug APK"
	@echo "    make android:release Build release AAB for Play Store"
	@echo "    make android:upload Full build + upload AAB to Play Store"
	@echo "    make android:run    Run on connected device/emulator"
	@echo "    make android:open   Open in Android Studio"
	@echo "    make android:keystore Generate release keystore (run once)"
	@echo "    make android:bump   Bump version code and name"
	@echo ""
	@echo "  GIT & i18n SYNC"
	@echo "    make pull           Pull from origin + pull i18n translations"
	@echo "    make push           Push i18n translations + push to origin"
	@echo "    make i18n:pull      Pull translations from public anqr-i18n repo"
	@echo "    make i18n:push      Push translations to public anqr-i18n repo"
	@echo ""
	@echo "  i18n TRANSLATION TOOLS"
	@echo "    make i18n:xlate              Translate all languages (static + locales)"
	@echo "    make i18n:xlate:static       Translate static content only"
	@echo "    make i18n:xlate:locales      Translate UI strings only"
	@echo "    make i18n:fill               Generate TS/JSON from all txt files"
	@echo "    make i18n:fill:static        Generate static TS files only"
	@echo "    make i18n:fill:locales       Generate locales JSON files only"
	@echo "    make i18n:check              Check i18n regressions vs baseline"
	@echo ""
	@echo "    Use LANGS=\"fr-FR de-DE\" to process specific languages:"
	@echo "      make i18n:xlate LANGS=\"fr-FR de-DE\""
	@echo "      make i18n:fill LANGS=\"en-GB fr-FR\""
	@echo ""
	@echo "  UTILITIES"
	@echo "    make zip            Create git archive zip of the project"
	@echo "    make dep            Generate dependency graph (deps.png)"
	@echo "    make resources      Show auto-detected CPU/mem/disk tuning values"
	@echo "    make validate:services  Validate all third-party services (Netlify, Sentry, Cloudflare, etc.)"
	@echo "    make check:sentry       Check Sentry for unresolved issues (regression monitor)"
	@echo "    make qr:art         Generate QR-Art PNG from image (IMG=path OUT=path)"
	@echo ""
	@echo "  CODE ANALYSIS (SonarQube)"
	@echo "    make sonar          Run SonarQube analysis (requires local server)"
	@echo "    make sonar-report   Get full issues report from SonarQube"
	@echo ""
	@echo "  TESTING & QUALITY"
	@echo "    make quality        Run comprehensive quality gate (19 checks: lint, types, coverage, deps, security, spelling, bundle)"
	@echo "    make signoff        Run full production sign-off checker"
	@echo "    make test:unit      Run all Vitest unit tests"
	@echo "    make test:qr:artifact  Run dithered scan gate and save current tsunami/king artifacts"
	@echo "    make test:overlay:audit  Run overlay preservation wiring audit (heavyweight, ~2min)"
	@echo "    make gallery:overlay    Generate overlay gallery QR codes via anqr.link API for all scenarios × fixtures"
	@echo "                            Tunables: GALLERY_API_URL, GALLERY_CONCURRENCY,"
	@echo "                                      SCAN_MATRIX_SCENARIOS, SCAN_MATRIX_FIXTURES"
	@echo "    make gallery:nooverlay  Generate non-overlay QR codes via API (38 scenarios)"
	@echo "                            Tunables: GALLERY_API_URL, GALLERY_CONCURRENCY, NOOVERLAY_SCENARIOS"
	@echo "    make gallery:qrart     Generate QR Art images via API (4 styles × 6 fixtures)"
	@echo "                            Tunables: GALLERY_API_URL, GALLERY_CONCURRENCY, QRART_SCENARIOS, QRART_FIXTURES"
	@echo "    make gallery:auto        Full pipeline: scan matrix → copy approved → gallery manifest"
	@echo "    make test:unit:coverage  Run Vitest with strict 100% coverage gate"
	@echo "    make test:coverage:gap  Generate coverage debt report"
	@echo "    make test:unit:ci   Run CI-safe Vitest subset (excludes missing local fixture tests)"
	@echo "    make test:ids       Generate canonical tests/ids.txt inventory"
	@echo "    make test:required  Generate tests/required.txt requirement matrix"
	@echo "    make test:required:strict  Fail if requirements are not direct-id backed"
	@echo "    make test:required:gap  Generate required mapping debt report"
	@echo "    make test:testid:refs  Validate tests only use managed test IDs"
	@echo "    make test:bundle:budget Build + enforce bundle budgets (main/non-i18n/i18n)"
	@echo "    make report:payload:matrix Generate per-kind payload wiring verification report"
	@echo "    make report:i18n:txt Check i18n txt files for untranslated strings and line-count mismatches"
	@echo "    make test           Run ALL tests: comprehensive quality gates + full unit suite + E2E"
	@echo "    make test:basic     Run basic tier UI tests only"
	@echo "    make test:advanced  Run advanced tier UI tests only"
	@echo "    make test:pro       Run professional tier UI tests only"
	@echo "    make test:tiers     Run tier tests only (excludes permutations)"
	@echo "    make test:ui        Open Playwright UI mode"
	@echo "    make test:permutations  Run ONLY exhaustive permutation tests"
	@echo "    make test:report        Show HTML test report"
	@echo ""

# ============================================
# Environment variables
# ============================================
export ENV := PROD

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
	workers=$$((cpu / 8)); \
	[ $$workers -lt 2 ] && workers=2; \
	[ $$workers -gt 4 ] && workers=4; \
	echo $$workers)

# Vitest worker policy for heavyweight suites.
VITEST_MAX_WORKERS ?= 100%

# Bundle budget gates (KiB). i18n has warning and hard-fail thresholds.
BUNDLE_BUDGET_MAIN_ENTRY_KIB ?= 700
BUNDLE_BUDGET_NON_I18N_TOTAL_KIB ?= 2200
BUNDLE_BUDGET_I18N_WARN_KIB ?= 22000
BUNDLE_BUDGET_I18N_MAX_KIB ?= 24000

# Gallery generation server port (default matches dev server).
GALLERY_PORT ?= 5173

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
#   7. gallery     — spin up lightweight serve, capture gallery images + PWA screenshots
#   8. test        — full quality gates (19 checks, incl. fix) + Vitest unit + Playwright E2E
#   9. validate    — heavyweight overlay audit + gallery scan matrix + production signoff
#  10. gallery:update — copy Tier A scan-validated overlay artifacts back to public/gallery/
#  11. reports     — payload verification matrix + unit coverage + coverage gap report
#  12. sonar       — SonarQube code analysis (non-blocking, requires localhost:9000)
#  13. deploy      — rebuild with Sentry sourcemap upload + Netlify production deploy + IndexNow
#  14. android     — release AAB + upload to Play Store (skipped if SDK/Java unavailable)
#  15. services    — third-party service checks (non-blocking)
#  16. i18n:push   — push translations to public repo + final status banner
#
# Gallery capture uses `npx serve` (high-performance static server, installed as devDep)
# instead of `vite preview` for faster startup and lower memory overhead.
# After gallery images land in public/gallery/, the deploy step rebuilds to include them.

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
	@echo "[7/16] Generating gallery images + PWA screenshots..."
	@npx serve dist -l 4174 --no-clipboard --single & echo $$! > .gallery-server.pid; \
		for i in 1 2 3 4 5 6 7 8 9 10; do \
			curl -s -o /dev/null http://localhost:4174/ && break; \
			sleep 1; \
		done
	@$(MAKE) gallery:fresh GALLERY_PORT=4174 && \
		$(MAKE) screenshots SCREENSHOT_PORT=4174; \
		step7_exit=$$?; \
		kill $$(cat .gallery-server.pid) 2>/dev/null; rm -f .gallery-server.pid; \
		[ $$step7_exit -eq 0 ] || exit $$step7_exit
	@echo ""
	@echo "[8/16] Running full test suite (quality gates + unit + E2E)..."
	# Note: test includes fix, bundle budget (which rebuilds), and Playwright (which starts its own dev server)
	$(MAKE) test
	@echo ""
	@echo "[9/16] Running heavyweight validation..."
	$(MAKE) test:overlay:audit
	$(MAKE) gallery:overlay
	$(MAKE) signoff
	@echo ""
	@echo "[10/16] Copying Tier A scan-validated overlay artifacts to gallery..."
	node scripts/update-gallery-from-scan-matrix.mjs
	@echo ""
	@echo "[11/16] Generating reports + coverage..."
	$(MAKE) report:payload:matrix
	$(MAKE) report:i18n:txt
	@$(MAKE) test:unit:coverage || echo "⚠️  Coverage below 100% threshold — see coverage gap report"
	$(MAKE) test:coverage:gap
	@echo ""
	@echo "[12/16] Running SonarQube analysis..."
	@$(MAKE) sonar || echo "⚠️  SonarQube not available (localhost:9000) — skipping"
	@echo ""
	@echo "[13/16] Deploying web to production (Netlify) + IndexNow..."
	# Deploy rebuilds with SENTRY_UPLOAD=true for sourcemap upload, then pushes to Netlify.
	# This final build includes gallery images (step 7) + Tier A overlays (step 10).
	$(MAKE) deploy
	@$(MAKE) indexnow || echo "⚠️  IndexNow submission failed — see reports/indexnow-submission.json"
	@echo ""
	@echo "[14/16] Bumping version + building Android release AAB + uploading..."
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
	@echo "[15/16] Validating third-party services..."
	@$(MAKE) validate:services || echo "⚠️  Some third-party validations failed — see reports/third-party-validation.json"
	@$(MAKE) check:sentry || echo "⚠️  Sentry regression check failed — see reports/sentry-regression.json"
	@echo ""
	@echo "[16/16] Pushing translations + final summary"
	@$(MAKE) i18n:push || echo "⚠️  i18n:push failed (no remote access?) — skipping"
	@echo ""
	@echo "============================================"
	@echo "ANQR — Production pipeline complete!"
	@echo "============================================"
	@echo ""
	@echo "Post-deploy manual checklist: see tbd.md"
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
# App ID: ca-app-pub-2270701384951162~3067761782
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

install:
	npm install
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
# Code Quality (Biome - modern all-in-one formatter/linter)
# ============================================

# Fix all: format, lint with auto-fix, and organize imports
fix:
	npx @biomejs/biome check src netlify --write --unsafe

# Lint only (no formatting)
lint:
	npx @biomejs/biome lint .

# Format only (no linting)
format:
	npx @biomejs/biome format --write .

# Check all without making changes (for CI)
check:
	npx @biomejs/biome check --max-diagnostics=0 .

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

# Full gallery auto-generation pipeline:
# 1. Run scan matrix test (generates reports + artifacts)
# 2. Copy scan-approved artifacts to public/gallery/
# 3. Generate scan-showcase-manifest.json
gallery\:auto: gallery\:overlay
	node scripts/update-gallery-from-scan-matrix.mjs
	@echo ""
	@echo "Gallery auto-generation complete."
	@echo "  - Scan matrix: reports/gallery-scan-matrix.json"
	@echo "  - Summary:     reports/gallery-scan-summary.md"
	@echo "  - Artifacts:   reports/gallery-artifacts/"
	@echo "  - Gallery:     public/gallery/"
	@echo "  - Manifest:    public/gallery/scan-showcase-manifest.json"

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

# Deploy rebuilds with SENTRY_UPLOAD=true to upload sourcemaps.
# This is intentionally separate from the earlier build steps.
deploy:
	SENTRY_UPLOAD=true npm run build
	netlify deploy --prod --site anqr.link --dir=dist

# Submit all canonical URLs to search engines via IndexNow protocol.
# Notifies Bing, Yandex, Naver, DuckDuckGo, and all participating engines.
# Run after deploy to inform search engines of updated content.
indexnow:
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
android\:upload: android
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
		:\(exclude\)public/sitemap.xml \
		-o anqr.zip

# Generate QR-Art PNG from a target image
# Usage: make qr:art IMG=public/tsunami.jpg OUT=qr-art.png
IMG ?= public/tsunami.jpg
OUT ?= qr-art-output.png
qr\:art:
	npx tsx scripts/run-qr-art.ts $(IMG) $(OUT)

# ============================================
# i18n Public Repo Sync (anqr-i18n)
# ============================================
# The txt translation files are published to a public repo for community contributions.
# Remote: anqr-i18n -> git@github-public:maldous/anqr-i18n.git
# Branches: 'static' (static/txt files), 'locales' (locales/txt files)

# Pull translation updates from public repo (run this after git pull)
i18n\:pull:
	@echo "Pulling i18n translations from public repo..."
	git subtree pull --prefix=src/i18n/static/txt anqr-i18n static --squash -m "Merge i18n static translations" || true
	git subtree pull --prefix=src/i18n/locales/txt anqr-i18n locales --squash -m "Merge i18n locales translations" || true
	@echo "i18n pull complete."

# Push translation updates to public repo (uses force push to handle diverged histories)
i18n\:push:
	@echo "Pushing i18n translations to public repo..."
	@echo "  Splitting static subtree (this may take a moment)..."
	@STATIC_SHA=$$(git subtree split --prefix=src/i18n/static/txt); \
	if [ -n "$$STATIC_SHA" ]; then \
		echo "  Pushing static branch..."; \
		git push anqr-i18n "$$STATIC_SHA":static 2>/dev/null || git push anqr-i18n "$$STATIC_SHA":static --force; \
	fi
	@echo "  Splitting locales subtree (this may take a moment)..."
	@LOCALES_SHA=$$(git subtree split --prefix=src/i18n/locales/txt); \
	if [ -n "$$LOCALES_SHA" ]; then \
		echo "  Pushing locales branch..."; \
		git push anqr-i18n "$$LOCALES_SHA":locales 2>/dev/null || git push anqr-i18n "$$LOCALES_SHA":locales --force; \
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
SONAR_TOKEN := sqa_d92be6588fb7576a7de0014b7ddc05911d9afc6b

# Run SonarQube analysis (uses sonar-project.properties)
sonar:
	@echo "Running SonarQube analysis..."
	npx sonar-scanner
	@echo ""
	@echo "Analysis complete! View results at: $(SONAR_HOST_URL)/dashboard?id=anqr"

sonar-report:
	@./scripts/sonar-export.sh

# ============================================
# UI Testing (Playwright)
# ============================================
# Runs E2E tests against local dev server with Chrome
# Tests are organized by tier: basic, advanced, professional
# Permutation tests run exhaustive setting combinations (very long!)

# Shared quality gate pipeline used by both 'quality' and 'test'.
# UNIT_CMD is set per-caller: test:unit:ci for quality, test:unit for test.
# 19 checks: biome → tsc → lockfile → licenses → type-coverage → duplication →
#   spelling → inventories → unit-tests → test-ids → i18n → depcruise → audit →
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
	npm run $(UNIT_CMD)
	npm run test:testid
	npm run test:testid:refs
	npm run test:i18n
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

quality: UNIT_CMD = test:unit:ci
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

# Run ALL tests: quality gates + full unit suite + E2E
# This is the comprehensive test target - use for full CI validation
# Order: fix → audits → typecheck → full vitest → test-id checks → i18n → Playwright E2E
# Outputs E2E results to test-report.txt for text-based review
test: UNIT_CMD = test:unit
test: _quality-gates
	bash -o pipefail -c 'npx playwright test --project=basic --project=advanced --project=professional --workers=$(PLAYWRIGHT_WORKERS) --reporter=list 2>&1 | tee test-report.txt'

# Run basic tier tests only (tests/basic/*.spec.ts)
test\:basic:
	npx playwright test --project=basic --workers=$(PLAYWRIGHT_WORKERS)

# Run advanced tier tests only (tests/advanced/*.spec.ts)
test\:advanced:
	npx playwright test --project=advanced --workers=$(PLAYWRIGHT_WORKERS)

# Run professional tier tests only (tests/professional/*.spec.ts)
test\:pro:
	npx playwright test --project=professional --workers=$(PLAYWRIGHT_WORKERS)

# Run all tier tests (basic + advanced + professional) but NOT permutations
# Use this for faster feedback during development
test\:tiers:
	npx playwright test --project=basic --project=advanced --project=professional --workers=$(PLAYWRIGHT_WORKERS)

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
