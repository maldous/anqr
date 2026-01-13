.PHONY: help dev build gallery gallery\:gif sitemap deploy android android\:init android\:sync android\:build android\:release android\:open install clean fix lint format check pull push i18n\:pull i18n\:push i18n\:xlate i18n\:xlate\:static i18n\:xlate\:locales i18n\:fill i18n\:fill\:static i18n\:fill\:locales icons icons\:android android\:run android\:keystore android\:bump zip dep sonar sonar-report test test\:basic test\:advanced test\:pro test\:tiers test\:ui test\:permutations test\:report

# ============================================
# Help
# ============================================

help:
	@echo ""
	@echo "ANQR Makefile - Available targets:"
	@echo ""
	@echo "  WEB DEVELOPMENT"
	@echo "    make install        Install npm dependencies"
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
	@echo "    make gallery:gif    Generate gallery images (with GIFs)"
	@echo "    make sitemap        Generate sitemap.xml"
	@echo ""
	@echo "  DEPLOYMENT"
	@echo "    make deploy         Deploy to Netlify (anqr.link)"
	@echo ""
	@echo "  ANDROID APP (Capacitor)"
	@echo "    make android        Full production build (bump + release AAB)"
	@echo "    make android:init   Initialize Android platform (run once)"
	@echo "    make android:sync   Sync web assets to Android project"
	@echo "    make android:build  Build debug APK"
	@echo "    make android:release Build release AAB for Play Store"
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
	@echo ""
	@echo "    Use LANGS=\"fr-FR de-DE\" to process specific languages:"
	@echo "      make i18n:xlate LANGS=\"fr-FR de-DE\""
	@echo "      make i18n:fill LANGS=\"en-GB fr-FR\""
	@echo ""
	@echo "  UTILITIES"
	@echo "    make zip            Create git archive zip of the project"
	@echo "    make dep            Generate dependency graph (deps.png)"
	@echo ""
	@echo "  CODE ANALYSIS (SonarQube)"
	@echo "    make sonar          Run SonarQube analysis (requires local server)"
	@echo "    make sonar-report   Get full issues report from SonarQube"
	@echo ""
	@echo "  UI TESTING (Playwright)"
	@echo "    make test           Run ALL tests (basic + advanced + pro + permutations)"
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

# HIGH PRIORITY - Main app ads
export VITE_ADSENSE_SLOT_LEFT_SKYSCRAPER := 7394019600
export VITE_ADSENSE_SLOT_RIGHT_SKYSCRAPER := 2450289467
export VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM := 3247547575

# MEDIUM PRIORITY - Gallery page ads
export VITE_ADSENSE_SLOT_GALLERY_LEFT := 2684618407
export VITE_ADSENSE_SLOT_GALLERY_RIGHT := 3454774598

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
export VITE_ADMOB_TESTING := false

# Android SDK path (adjust for your system)
export ANDROID_HOME ?= $(HOME)/Android/Sdk
export PATH := $(ANDROID_HOME)/tools:$(ANDROID_HOME)/platform-tools:$(PATH)

# ============================================
# Web Development
# ============================================

install:
	npm install

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
	node scripts/generate-gallery.mjs

gallery\:gif:
	node scripts/generate-gallery.mjs --gif

# ============================================
# Sitemap Generation
# ============================================

sitemap:
	node scripts/generate-sitemap.mjs

# ============================================
# Deployment
# ============================================

deploy:
	netlify deploy --prod --site anqr.link --dir=dist

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

# Bump version code and version name
android\:bump:
	@echo "Bumping Android version..."
	@CURRENT_CODE=$$(grep -oP 'versionCode \K[0-9]+' android/app/build.gradle); \
	NEW_CODE=$$((CURRENT_CODE + 1)); \
	CURRENT_NAME=$$(grep -oP 'versionName "\K[^"]+' android/app/build.gradle); \
	NEW_NAME="1.$$NEW_CODE"; \
	sed -i "s/versionCode $$CURRENT_CODE/versionCode $$NEW_CODE/" android/app/build.gradle; \
	sed -i "s/versionName \"$$CURRENT_NAME\"/versionName \"$$NEW_NAME\"/" android/app/build.gradle; \
	echo "Version bumped: $$CURRENT_NAME ($$CURRENT_CODE) -> $$NEW_NAME ($$NEW_CODE)"

# Full Android production build
android: build android\:bump android\:release
	@echo ""
	@echo "============================================"
	@echo "Android production build complete!"
	@echo "AAB file: android/app/build/outputs/bundle/release/app-release.aab"
	@echo ""
	@echo "To upload to Play Store:"
	@echo "1. Go to https://play.google.com/console"
	@echo "2. Create/select your app"
	@echo "3. Upload the AAB file"
	@echo "============================================"

zip:
	@rm -f anqr.zip
	@git archive \
		--format=zip \
		--prefix=anqr/ \
		HEAD \
		:\(exclude\)public/sitemap.xml \
		-o anqr.zip

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

# Run ALL tests (basic + advanced + professional + permutations)
# This is the comprehensive test target - use for full CI validation
# Outputs to test-report.txt for text-based review (with test names and pass/fail status)
test:
	npx playwright test --project=basic --project=advanced --project=professional --project=permutations --reporter=list 2>&1 | tee test-report.txt

# Run basic tier tests only (tests/basic/*.spec.ts)
test\:basic:
	npx playwright test --project=basic

# Run advanced tier tests only (tests/advanced/*.spec.ts)
test\:advanced:
	npx playwright test --project=advanced

# Run professional tier tests only (tests/professional/*.spec.ts)
test\:pro:
	npx playwright test --project=professional

# Run all tier tests (basic + advanced + professional) but NOT permutations
# Use this for faster feedback during development
test\:tiers:
	npx playwright test --project=basic --project=advanced --project=professional

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
	npx playwright test --project=permutations

# Generate settings QR change report for manual review
test\:report\:settings:
	npx playwright test tests/reports/settings-report.spec.ts --reporter=list 2>&1 | tee test-results/settings-report.txt

# Show test report
test\:report:
	npx playwright show-report
