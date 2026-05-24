.DEFAULT_GOAL := help

QUALITY_FAST_TARGETS := \
	openapi-generate format-check cspell knip typecheck-all lint-all lint-boundaries \
	depcruise-all contracts-check audit-ast test-unit build-web

QUALITY_RELEASE_TARGETS := \
	quality-fast test-basic test-advanced sonar-export

QUALITY_HARNESS_TARGETS := \
	harness-quick harness-full harness-doctor guardian-dry-run queue-check queue-all-dry-run \  symphony-status nightly-dry-run \
	linear-status linear-reconciler linear-reconciler-once

QUALITY_MOBILE_TARGETS := \
	test-appium-android test-appium-ios

.PHONY: \
  help fix update-metrics reset-metrics reset-health show-metrics \
  dev build build-web build-android preview \
  typecheck lint lint-fix lint-boundaries format format-check depcruise cspell knip \
  test test-unit test-unit-coverage test-e2e test-basic test-advanced \
  test-appium test-appium-android test-appium-ios \
  openapi-generate \
  audit-ast sonar-audit sonar-mail sonar-scan \
  harness-quick harness-continuous harness-full \
  guardian-run guardian-dry-run \
  queue-check queue-feed queue-enforce queue-all queue-all-dry-run queue-continuous \
  symphony-run symphony-run-dry-run symphony-status symphony-bridge symphony-router \
  email-ingest email-ingest-dry-run notify-test nightly nightly-dry-run \
  quality quality-fast quality-release quality-harness quality-mobile quality-full \
  install install-services hooks bootstrap clean zip \
  typecheck-all lint-all depcruise-all contracts-check verify-migration \
  i18n-diff i18n-coverage i18n-check i18n-sync-xlate \
  ship ship-dry-run deploy-web deploy-android prerender-gallery

help: ## Show grouped Makefile targets
	@printf "\nANQR Makefile\n\n"
	@awk 'BEGIN {FS = ":.*## "}; /^[a-zA-Z0-9_.-]+:.*## / {printf "  %-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

fix: lint-fix format ## Run safe auto-fixes

dev: ## Start the local development server
	npm run dev

build: ## Build the web app
	npm run build

build-web: ## Build the web app using the package script
	npm run build:web

build-android: build-web ## Sync web bundle into Android and build debug APK
	npx cap sync android
	@find android/app/src/main/assets/public -name "*.gz" -delete
	cd android && ./gradlew assembleDebug
	@echo ""
	@echo "APK: android/app/build/outputs/apk/debug/app-debug.apk"

preview: ## Preview the production build locally
	npm run preview

typecheck: ## Run the default typecheck target
	npm run typecheck

typecheck-all: ## Run all TypeScript checks across the repo
	npm run typecheck:all

lint: ## Run the default lint target
	npm run lint

lint-all: ## Run repo-wide linting
	npm run lint:all

lint-fix: ## Run lint fixes
	npm run lint:fix

lint-boundaries: ## Run legacy src/ boundary lint checks
	npm run lint:boundaries

format: ## Format the repository
	npm run format
	npm run format:reports

format-check: ## Check formatting without changing files
	npm run format:check

depcruise: ## Run the default dependency-cruiser pass
	npm run depcruise

depcruise-all: ## Run all dependency-cruiser gates
	npm run depcruise:all

cspell: ## Run spellcheck on configured repo surfaces
	npm run cspell

knip: ## Run the full Knip dead-code and hygiene analysis
	npm run knip

test-unit: ## Run unit tests
	npm run test:unit

test-unit-coverage: ## Run unit tests with V8 coverage (generates coverage/lcov.info)
	npm run test:unit:coverage

test-e2e: ## Run the default end-to-end test suite
	npm run test

test-basic: ## Run the basic Playwright suite
	npm run test:basic

test-advanced: ## Run the advanced Playwright suite
	npm run test:advanced

test-appium: ## Run all Appium tests
	npm run test:appium

test-appium-android: ## Run Android Appium tests
	npm run test:appium:android

test-appium-ios: ## Run iOS Appium tests
	npm run test:appium:ios

test: test-unit test-e2e ## Run unit and default end-to-end tests

openapi-generate: ## Regenerate OpenAPI artifacts
	npm run openapi:generate
	npx oxfmt docs/api/qr-api.openapi.json

audit-ast: ## Run the AST density audit
	npm run audit:ast

sonar-export: sonar-scan ## Export Sonar data into sonar-report.json (requires fresh scan)
	npm run sonar:export

sonar-mail: ## Mail the latest Sonar summary
	npm run sonar:mail

sonar-scan: test-unit-coverage ## Run SonarQube analysis (requires fresh coverage)
	@test -f coverage/lcov.info || { echo "ERROR: coverage/lcov.info missing — run test-unit-coverage first"; exit 1; }
	npm run sonar:scan

harness-quick: ## Run the quick harness report
	npm run harness:quick

harness-continuous: ## Run the continuous harness report
	npm run harness:continuous

harness-full: ## Run the full harness report
	npm run harness:full

harness-doctor: ## Run harness runtime diagnostics
	npm run harness:doctor

guardian-run: ## Run the Linear guardian
	npm run guardian:run

guardian-dry-run: ## Dry-run the Linear guardian
	npm run guardian:dry-run

queue-check: ## Check queue state without mutation
	npm run queue:check

queue-feed: ## Feed queued work
	npm run queue:feed

queue-enforce: ## Enforce queue policy
	npm run queue:enforce

queue-all: ## Run the full queue control loop
	npm run queue:all

queue-all-dry-run: ## Dry-run the full queue control loop
	npm run queue:all:dry-run

queue-continuous: ## Run the continuous queue loop
	npm run queue:continuous

symphony-run: ## Run the symphony runner once on all worktrees
	@echo "=== Running Symphony on all worktrees ===" && \
	for wt in wt1 wt2 wt3 wt4 wt5 wt6 wt7 wt8; do \
		ANQR_WORKTREE_ID=$$wt npm run symphony:run 2>&1 | sed "s/^/$$wt: /" & \
	done; \
	wait

symphony-run-dry-run: ## Dry-run the symphony runner on all worktrees
	@echo "=== Dry-run Symphony on all worktrees ===" && \
	for wt in wt1 wt2 wt3 wt4 wt5 wt6 wt7 wt8; do \
		ANQR_WORKTREE_ID=$$wt npm run symphony:run:dry-run 2>&1 | sed "s/^/$$wt: /" & \
	done; \
	wait

linear-status: ## Show Linear processing status (queue, worktrees, capacity)
	npm run linear:status

linear-reconciler: ## Run the Linear reconciler daemon
	npm run linear:reconciler

linear-reconciler-once: ## Run a single Linear reconciliation cycle
	npm run linear:reconciler:once

symphony-status: ## Show symphony status
	@echo "=== Symphony Worktrees Status ===" && \
	for wt in wt1 wt2 wt3 wt4 wt5 wt6 wt7 wt8; do \
		echo ""; \
		ANQR_WORKTREE_ID=$$wt npm run symphony:status 2>&1 | sed "s/^/  /"; \
	done

symphony-router: ## Start the Symphony agent router (control plane)
	node harness/ops/integrations/model/symphony-agent-router.mjs

symphony-bridge: ## Start a worktree-local Symphony execution bridge
	node harness/ops/integrations/model/symphony-openai-bridge.mjs

show-metrics: ## Show provider metrics in formatted columns
	@python3 harness/show-metrics.py

update-metrics: ## Run a full provider probe and show results
	@npm run probe:providers
	@echo ""
	@python3 harness/show-metrics.py

reset-metrics: ## Reset all provider state, run full probe, and show results
	@echo "🔄 Clearing provider health state and probe cache..."
	@rm -f reports/symphony/provider-health.json
	@rm -f reports/symphony/provider-probe-cache.json
	@echo "🔄 Resetting in-memory stats (if bridge is running)..."
	@curl -s -X POST http://127.0.0.1:4321/v1/stats/reset \
		-H "Authorization: Bearer local-symphony" 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "   (bridge not reachable — skipped)"
	@echo "\n🔍 Running full provider probe..."
	@npm run probe:providers
	@echo ""
	@python3 harness/show-metrics.py

reset-health: ## Delete health state + probe cache files directly (no running bridge needed)
	@echo "🔄 Deleting provider health state and probe cache files..."
	@rm -f reports/symphony/provider-health.json
	@rm -f reports/symphony/provider-probe-cache.json
	@echo "✅ Health state and probe cache deleted."
	@echo "   Restart executors for a clean probe: systemctl --user restart anqr-symphony-executor@1"

email-ingest: ## Run email ingest
	npm run email:ingest

email-ingest-dry-run: ## Dry-run email ingest
	npm run email:ingest:dry-run

notify-test: ## Send a test notification
	npm run notify:test

nightly: ## Run nightly ops
	npm run nightly

nightly-dry-run: ## Dry-run nightly ops
	npm run nightly:dry-run

contracts-check: ## Run contracts structural checks
	npm run contracts:check

# ============================================
# i18n Targets
# ============================================

I18N_TOOLS := tools/i18n

i18n-diff: ## Show keys present in en-US.json but missing from xlate.json
	@python3 $(I18N_TOOLS)/diff.py

i18n-coverage: ## Show translation coverage (leaf key count) for each locale
	@python3 $(I18N_TOOLS)/coverage.py

i18n-check: ## Fail if xlate.json is missing any keys relative to en-US.json
	@python3 $(I18N_TOOLS)/check.py

i18n-sync-xlate: ## Add missing keys to xlate.json from en-US.json, then show diff
	@python3 $(I18N_TOOLS)/sync-xlate.py && make i18n-diff

quality-fast: $(QUALITY_FAST_TARGETS) ## Run the fast, non-interactive quality baseline

quality-release: $(QUALITY_RELEASE_TARGETS) ## Run release-grade current-platform checks

quality-harness: $(QUALITY_HARNESS_TARGETS) ## Run deeper harness and ops dry-run checks

quality-mobile: $(QUALITY_MOBILE_TARGETS) ## Run mobile Appium checks

quality: fix quality-release ## Run the default current-platform quality target

quality-full: fix quality-release quality-harness ## Run current-platform quality plus harness/ops

install: ## Install dependencies
	npm install --legacy-peer-deps

install-services: ## Symlink systemd services and sync openclaw config to system locations
	@echo "Symlinking systemd service and timer files..."
	@mkdir -p ~/.config/systemd/user
	@for f in services/systemd/*.service services/systemd/*.timer; do \
		[ -f "$$f" ] || continue; \
		ln -sf "$$(realpath $$f)" ~/.config/systemd/user/"$$(basename $$f)"; \
	done
	@echo "Syncing openclaw config..."
	@mkdir -p ~/.openclaw
	@for f in harness/ops/runtime/openclaw-config/*.json; do \
		[ -f "$$f" ] || continue; \
		cp "$$f" ~/.openclaw/"$$(basename $$f)"; \
	done
	@echo "Setting env file permissions..."
	@chmod 600 ~/.config/systemd/user/anqr-ops.env ~/.config/symphony/anqr.env ~/.openclaw/.env 2>/dev/null || true
	@echo "Reloading systemd daemon..."
	@systemctl --user daemon-reload
	@echo ""
	@echo "Install complete."
	@echo "  Symlinked: services/systemd/*.service *.timer → ~/.config/systemd/user/"
	@echo "  Synced:    harness/ops/runtime/openclaw-config/*.json → ~/.openclaw/"
	@echo "  Restart services with: systemctl --user restart anqr-symphony-executor@{1..8}.service"

hooks: ## Install git hooks
	npm run prepare

bootstrap: ## Extract bootstrap.zip secrets into local working locations
	@test -f bootstrap.zip || (echo "bootstrap.zip not found"; exit 1)
	@echo "Extracting bootstrap secrets..."
	@rm -rf /tmp/anqr-bootstrap
	@unzip -o -P anqr bootstrap.zip -d /tmp/anqr-bootstrap >/dev/null
	@cp /tmp/anqr-bootstrap/.env .env
	@mkdir -p ~/.ssh
	@chmod 700 ~/.ssh
	@cp /tmp/anqr-bootstrap/ssh/* ~/.ssh/
	@chmod 600 ~/.ssh/id_ed25519 ~/.ssh/id_ed25519_github_private ~/.ssh/id_ed25519_public
	@chmod 644 ~/.ssh/*.pub ~/.ssh/config
	@mkdir -p ~/.config/symphony
	@cp /tmp/anqr-bootstrap/harness/symphony.env ~/.config/symphony/anqr.env
	@mkdir -p ~/.config/systemd/user
	@cp /tmp/anqr-bootstrap/harness/ops.env ~/.config/systemd/user/anqr-ops.env
	@cp /tmp/anqr-bootstrap/signing/play-store-key.json . 2>/dev/null || true
	@cp /tmp/anqr-bootstrap/signing/AuthKey_*.p8 . 2>/dev/null || true
	@mkdir -p android/app
	@cp /tmp/anqr-bootstrap/signing/release-key.keystore android/app/ 2>/dev/null || true
	@cp /tmp/anqr-bootstrap/email/.mbsyncrc ~/ 2>/dev/null || true
	@cp /tmp/anqr-bootstrap/email/.msmtprc ~/ 2>/dev/null || true
	@chmod 600 ~/.msmtprc 2>/dev/null || true
	@cp /tmp/anqr-bootstrap/email/.notmuch-config ~/ 2>/dev/null || true
	@rm -rf /tmp/anqr-bootstrap
	@echo ""
	@echo "Bootstrap complete."
	@echo "  Project: .env installed"
	@echo "  SSH: keys installed to ~/.ssh/"
	@echo "  Harness: ~/.config/symphony/anqr.env"
	@echo "  Systemd: ~/.config/systemd/user/anqr-ops.env"
	@echo "  Signing: play-store-key.json, AuthKey, release-key.keystore"
	@echo "  Email: ~/.mbsyncrc, ~/.msmtprc, ~/.notmuch-config"
	@echo ""
	@echo "Load env vars with: set -a; source .env; set +a"

clean: ## Remove build and cache artifacts
	rm -rf dist coverage node_modules/.cache

verify-migration: ## Run the legacy migration verification bundle
	npm run typecheck:all && npm run lint:all && npm run depcruise:all && npm run test:unit && npm run harness:quick

# ============================================
# Ship: full prod check + deploy + Android
# ============================================

PLAY_TRACK ?= internal
SHIP_NOTES ?= Bug fixes and improvements.

prerender-gallery: ## Prerender all gallery thumbnails using the client renderer
	@echo "→ starting preview server"
	@npm run preview > /tmp/anqr-ship-preview.log 2>&1 & echo $$! > /tmp/anqr-ship-preview.pid
	@for i in 1 2 3 4 5 6 7 8 9 10; do \
	  curl -s -o /dev/null http://localhost:4173/ && break || sleep 1; \
	done
	@PRERENDER_CONCURRENCY=4 npx tsx tools/gallery/prerender-gallery-thumbs.ts || \
	  (kill $$(cat /tmp/anqr-ship-preview.pid) 2>/dev/null; exit 1)
	@kill $$(cat /tmp/anqr-ship-preview.pid) 2>/dev/null || true
	@rm -f /tmp/anqr-ship-preview.pid

deploy-web: build-web ## Build and deploy web to Netlify production
	netlify deploy --filter "@anqr/app-web" \
	  --dir "$$(pwd)/dist" \
	  --functions "$$(pwd)/netlify/functions" \
	  --prod

deploy-android: ## Build signed AAB and upload to Play (PLAY_TRACK=internal by default)
	VITE_SENTRY_RELEASE="anqr@$$(node -p "require('./package.json').version")" $(MAKE) build-web
	npx cap sync android
	@find android/app/src/main/assets/public -name "*.gz" -delete
	cd android && ./gradlew bundleRelease
	python3 tools/android/upload-to-play.py $(PLAY_TRACK) --notes "$(SHIP_NOTES)"

ship-dry-run: ## Full prod readiness check (gates only, no deploy)
	$(MAKE) quality-fast
	$(MAKE) test-unit
	$(MAKE) build-web
	@echo ""
	@echo "✓ Dry run passed. Run 'make ship' to deploy."

ship: ## Full prod check + Netlify deploy + Android Play upload (PLAY_TRACK=internal)
	$(MAKE) quality-fast
	$(MAKE) test-unit
	$(MAKE) prerender-gallery
	$(MAKE) deploy-web
	$(MAKE) deploy-android PLAY_TRACK=$(PLAY_TRACK)
	@echo ""
	@echo "✓ Shipped. Web → https://anqr.link · Play → $(PLAY_TRACK) track"

zip:
	rm -f anqr.zip .zip-openclaw.lst && \
	git ls-files -z \
          .agents .codex .cspell.json .editorconfig .gitattributes .gitignore \
	  .dependency-cruiser.cjs .dependency-cruiser.architecture.cjs \
	  .dependency-cruiser.contracts.cjs .dependency-cruiser.harness.cjs \
	  .github .openclaw \
	  AGENTS.md CLAUDE.md CODEBUFF.md HEARTBEAT.md IDENTITY.md MEMORY.md \
	  README.md SOUL.md TOOLS.md USER.md MCP-MIGRATION.md \
	  commitlint.config.js cspell.json eslint.config.js index.html \
	  knip.json lefthook.yml Makefile netlify.toml oxlint.json package.json \
	  playwright.config.ts postcss.config.mjs sonar-project.properties \
	  tsconfig.json tsconfig.base.json tsconfig.node.json tsconfig.src.json \
	  tsconfig.apps.json tsconfig.packages.json tsconfig.harness.json \
	  tsconfig.netlify.json tsconfig.tests.json vite.config.ts vitest.config.ts \
	  apps packages scripts harness src tests docs netlify vite-config public \
	| tr '\0' '\n' \
	| grep -Ev '^(android/|ios/)' \
	| grep -Ev '^(apps/web/src/i18n/static/|apps/web/src/i18n/locales/|apps/web/src/content/generated/)' \
	| grep -Ev '^apps/ios/App/fastlane/screenshots/' \
	| grep -Eiv '\.(png|jpg|jpeg|gif|webp|avif|ico|mp4|webm|mp3|wav|mov)$$|(^|/)(google-services\.json|release-key\.keystore|local\.properties|tsconfig\.node\.tsbuildinfo)$$|\.((pem|key|p12|p8))$$' \
	| sed '/^$$/d' > .zip-openclaw.lst && \
	printf '%s\n' \
	  '/home/user/.openclaw/agents/main/agent/auth-profiles.json' \
	  '/home/user/.openclaw/agents/main/agent/models.json' \
	  '/home/user/.openclaw/agents/main/sessions.json' \
	  '/home/user/.openclaw/agents/voice/agent/auth-profiles.json' \
	  '/home/user/.openclaw/agents/voice/agent/models.json' \
	  '/home/user/.openclaw/agents/voice/sessions.json' \
	  '/home/user/.openclaw/config.json' \
	  '/home/user/.openclaw/clawdbot.json' \
	  '/home/user/.openclaw/cron/jobs.json' \
	| while read f; do [ -f "$$f" ] && printf '%s\n' "$$f"; done >> .zip-openclaw.lst && \
	sort -u .zip-openclaw.lst -o .zip-openclaw.lst && \
	zip -q -@ anqr.zip < .zip-openclaw.lst && \
	rm -f .zip-openclaw.lst
