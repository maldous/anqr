.DEFAULT_GOAL := help

QUALITY_FAST_TARGETS := \
	openapi-generate format-check cspell knip typecheck-all lint-all lint-boundaries \
	depcruise-all contracts-check audit-ast test-unit-coverage build-web

QUALITY_RELEASE_TARGETS := \
	quality-fast test-basic test-advanced sonar-scan sonar-export

QUALITY_HARNESS_TARGETS := \
	harness-quick harness-full harness-doctor guardian-dry-run queue-check queue-all-dry-run \
	symphony-status nightly-dry-run

QUALITY_MOBILE_TARGETS := \
	test-appium-android test-appium-ios

.PHONY: \
  help fix update-metrics show-metrics \
  dev build build-web preview \
  typecheck lint lint-fix lint-boundaries format format-check depcruise cspell knip \
  test test-unit test-unit-coverage test-e2e test-basic test-advanced \
  test-appium test-appium-android test-appium-ios \
  openapi-generate \
  audit-ast sonar-export sonar-audit sonar-mail sonar-scan \
  harness-quick harness-continuous harness-full \
  guardian-run guardian-dry-run \
  queue-check queue-feed queue-enforce queue-all queue-all-dry-run queue-continuous \
  symphony-run symphony-run-dry-run symphony-status codebuff-bridge symphony-bridge \
  email-ingest email-ingest-dry-run notify-test nightly nightly-dry-run \
  quality quality-fast quality-release quality-harness quality-mobile quality-full \
  install hooks bootstrap clean zip \
  typecheck-all lint-all depcruise-all contracts-check verify-migration

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

format-check: ## Check formatting without changing files
	npm run format:check

depcruise: ## Run the default dependency-cruiser pass
	npm run depcruise

depcruise-all: ## Run all dependency-cruiser gates
	npm run depcruise:all

cspell: ## Run spellcheck on configured repo surfaces
	npm run cspell

knip: ## Run the scoped Knip hygiene pass
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

sonar-export: ## Export Sonar data into sonar-report.json
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

symphony-run: ## Run the symphony runner once
	npm run symphony:run

symphony-run-dry-run: ## Dry-run the symphony runner
	npm run symphony:run:dry-run

symphony-status: ## Show symphony status
	npm run symphony:status

codebuff-bridge: ## Start the Codebuff OpenAI-compatible bridge
	node scripts/ops/integrations/model/codebuff-openai-bridge.mjs

symphony-bridge: ## Start the Symphony OpenAI-compatible bridge with AI SDK
	node scripts/ops/integrations/model/symphony-openai-bridge.mjs

show-metrics: ## Show provider metrics in formatted columns
	@curl -sf http://127.0.0.1:4319/v1/stats \
		-H "Authorization: Bearer local-symphony" | python3 -c "
import sys, json
data = json.load(sys.stdin)
ranked = data.get('rankedProviders', [])
stats = data.get('providerStats', {})
if not stats:
    print('No provider stats available.'); sys.exit(0)
print()
print('\033[1m' + '  {:3s}  {:<30s} {:<14s} {:>5s} {:>5s} {:>5s} {:>8s} {:>8s} {:>7s} {:>5s} {:>5s} {:>5s}'.format(
    '#', 'PROVIDER', 'TIER', 'SEL', 'OK', 'FAIL', 'RATE', 'AVG MS', 'SCORE', 'pSEL', 'pOK', 'pFAIL') + '\033[0m')
print('  ' + '-' * 120)
rank_map = {r['name']: r.get('rank', '-') for r in ranked}
for name in sorted(stats, key=lambda n: (rank_map.get(n, 999) if isinstance(rank_map.get(n, 999), int) else 999, n)):
    s = stats[name]
    r = rank_map.get(name, '-')
    score = s.get('score', 'pending')
    score_str = '{:.2f}'.format(score) if isinstance(score, (int, float)) else str(score)
    print('  {:>3s}  {:<30s} {:<14s} {:>5d} {:>5d} {:>5d} {:>8s} {:>8s} {:>7s} {:>5d} {:>5d} {:>5d}'.format(
        str(r), name[:30], s.get('tier','?')[:14],
        s.get('selections',0), s.get('successes',0), s.get('failures',0),
        str(s.get('successRate','N/A')), str(s.get('avgDurationMs',0)) + 'ms',
        score_str,
        s.get('probeSelections',0), s.get('probeSuccesses',0), s.get('probeFailures',0)))
print()
total_sel = sum(s.get('selections',0) for s in stats.values())
total_ok = sum(s.get('successes',0) for s in stats.values())
total_fail = sum(s.get('failures',0) for s in stats.values())
ranked_count = len([r for r in ranked if r.get('score') not in (None, 'pending')])
print('  Totals: {} selections, {} successes, {} failures | {} providers ranked'.format(
    total_sel, total_ok, total_fail, ranked_count))
print()
" || echo "\n❌ Symphony bridge not reachable at http://127.0.0.1:4319"

update-metrics: ## Reset provider stats and trigger a fresh probe cycle
	@echo "🔄 Resetting provider stats..."
	@curl -s -X POST http://127.0.0.1:4319/v1/stats/reset \
		-H "Authorization: Bearer local-symphony" | python3 -m json.tool
	@echo "\n🔍 Triggering provider re-probe..."
	@curl -s -X POST http://127.0.0.1:4319/v1/providers/refresh \
		-H "Authorization: Bearer local-symphony" | python3 -m json.tool
	@echo "\n✅ Metrics reset and probe started. Check: curl http://127.0.0.1:4319/v1/stats"

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

quality-fast: $(QUALITY_FAST_TARGETS) ## Run the fast, non-interactive quality baseline

quality-release: $(QUALITY_RELEASE_TARGETS) ## Run release-grade current-platform checks

quality-harness: $(QUALITY_HARNESS_TARGETS) ## Run deeper harness and ops dry-run checks

quality-mobile: $(QUALITY_MOBILE_TARGETS) ## Run mobile Appium checks

quality: fix quality-release ## Run the default current-platform quality target

quality-full: fix quality-release quality-harness ## Run current-platform quality plus harness/ops

install: ## Install dependencies
	npm install --legacy-peer-deps

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

zip: ## Create a source archive excluding generated/runtime artifacts
	rm -f anqr.zip && zip -r anqr.zip AGENTS.md CLAUDE.md CODEBUFF.md README.md MCP-MIGRATION.md commitlint.config.js cspell.json docs eslint.config.js index.html knip.json lefthook.yml Makefile netlify netlify.toml oxlint.json package.json packages playwright.config.ts postcss.config.mjs scripts services sonar-project.properties src tests tsconfig.json tsconfig.base.json tsconfig.node.json tsconfig.node.tsbuildinfo tsconfig.src.json tsconfig.apps.json tsconfig.packages.json tsconfig.harness.json tsconfig.netlify.json tsconfig.tests.json vite-config vite.config.ts vitest.config.ts .dependency-cruiser.cjs .dependency-cruiser.architecture.cjs .dependency-cruiser.contracts.cjs .editorconfig .gitignore .codex -x 'src/i18n/static/*' 'src/i18n/locales/*' 'src/content/generated/*' 'public/*' 'ios/*' 'android/*' 'reports/*' 'dist/*' 'coverage/*' 'node_modules/*' '.git/*'

verify-migration: ## Run the legacy migration verification bundle
	npm run typecheck:all && npm run lint:all && npm run depcruise:all && npm run test:unit && npm run harness:quick
