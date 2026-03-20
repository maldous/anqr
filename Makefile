.DEFAULT_GOAL := help

QUALITY_FAST_TARGETS := \
	openapi-generate format-check cspell knip typecheck-all lint-all lint-boundaries \
	depcruise-all contracts-check audit-ast test-unit build-web

QUALITY_RELEASE_TARGETS := \
	quality-fast test-basic test-advanced sonar-scan sonar-export

QUALITY_HARNESS_TARGETS := \
	harness-quick harness-full guardian-dry-run queue-check queue-all-dry-run \
	symphony-status nightly-dry-run

QUALITY_MOBILE_TARGETS := \
	test-appium-android test-appium-ios

.PHONY: \
  help fix \
  dev build build-web preview \
  typecheck lint lint-fix lint-boundaries format format-check depcruise cspell knip \
  test test-unit test-unit-coverage test-e2e test-basic test-advanced \
  test-appium test-appium-android test-appium-ios \
  openapi-generate \
  audit-ast sonar-export sonar-audit sonar-mail sonar-scan \
  harness-quick harness-continuous harness-full \
  guardian-run guardian-dry-run \
  queue-check queue-feed queue-enforce queue-all queue-all-dry-run queue-continuous \
  symphony-run symphony-run-dry-run symphony-status \
  email-ingest email-ingest-dry-run notify-test nightly nightly-dry-run \
  quality quality-fast quality-release quality-harness quality-mobile quality-full \
  install hooks clean zip \
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

sonar-scan: ## Run SonarQube analysis
	npm run sonar:scan

harness-quick: ## Run the quick harness report
	npm run harness:quick

harness-continuous: ## Run the continuous harness report
	npm run harness:continuous

harness-full: ## Run the full harness report
	npm run harness:full

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

quality: quality-release ## Run the default current-platform quality target

quality-full: quality-release quality-harness ## Run current-platform quality plus harness/ops

install: ## Install dependencies
	npm install --legacy-peer-deps

hooks: ## Install git hooks
	npm run prepare

clean: ## Remove build and cache artifacts
	rm -rf dist coverage node_modules/.cache

zip: ## Create a source archive excluding generated/runtime artifacts
	rm -f anqr.zip && zip -r apps commitlint.config.js cspell.json docs eslint.config.js index.html knip.json lefthook.yml Makefile netlify netlify.toml oxlint.json package.json packages playwright.config.ts postcss.config.mjs scripts services sonar-project.properties src tests tsconfig.json tsconfig.node.json tsconfig.node.tsbuildinfo vite-config vite.config.ts vitest.config.ts .dependency-cruiser.cjs .editorconfig .gitignore -x 'src/i18n/static/*' 'src/i18n/locales/*' 'src/content/generated/*' 'public/*' 'ios/*' 'android/*' 'reports/*' 'dist/*' 'coverage/*' 'node_modules/*' '.git/*'

verify-migration: ## Run the legacy migration verification bundle
	npm run typecheck:all && npm run lint:all && npm run depcruise:all && npm run test:unit && npm run harness:quick
