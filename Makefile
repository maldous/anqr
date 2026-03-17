.PHONY: \
  dev build preview \
  typecheck lint lint-fix lint-boundaries format format-check depcruise cspell knip \
  test test-unit test-unit-coverage test-e2e test-appium test-appium-android test-appium-ios \
  audit-ast sonar-export sonar-audit \
  harness-quick harness-continuous harness-full \
  guardian-run guardian-dry-run \
  queue-check queue-feed queue-enforce queue-all queue-all-dry-run queue-continuous \
  symphony-run symphony-run-dry-run symphony-status \
  email-ingest email-ingest-dry-run notify-test nightly nightly-dry-run \
  quality install hooks clean zip

fix: lint-fix format

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

typecheck:
	npm run typecheck

lint:
	npm run lint

lint-fix:
	npm run lint:fix

lint-boundaries:
	npm run lint:boundaries

format:
	npm run format

format-check:
	npm run format:check

depcruise:
	npm run depcruise

cspell:
	npm run cspell

knip:
	npm run knip

test-unit:
	npm run test:unit

test-e2e:
	npm run test

test-appium:
	npm run test:appium

test-appium-android:
	npm run test:appium:android

test-appium-ios:
	npm run test:appium:ios

test: test-unit test-e2e

audit-ast:
	npm run audit:ast

sonar-export:
	npm run sonar:export

sonar-audit:
	npm run sonar:audit

sonar-scan:
	npm run sonar:scan

harness-quick:
	npm run harness:quick

harness-continuous:
	npm run harness:continuous

harness-full:
	npm run harness:full

guardian-run:
	npm run guardian:run

guardian-dry-run:
	npm run guardian:dry-run

queue-check:
	npm run queue:check

queue-feed:
	npm run queue:feed

queue-enforce:
	npm run queue:enforce

queue-all:
	npm run queue:all

queue-all-dry-run:
	npm run queue:all:dry-run

queue-continuous:
	npm run queue:continuous

symphony-run:
	npm run symphony:run

symphony-run-dry-run:
	npm run symphony:run:dry-run

symphony-status:
	npm run symphony:status

email-ingest:
	npm run email:ingest

email-ingest-dry-run:
	npm run email:ingest:dry-run

notify-test:
	npm run notify:test

nightly:
	npm run nightly

nightly-dry-run:
	npm run nightly:dry-run

quality:
	npm run quality

install:
	npm install

hooks:
	npm run prepare

clean:
	rm -rf dist coverage node_modules/.cache

zip:
	rm -f anqr.zip && zip -r apps commitlint.config.js cspell.json docs eslint.config.js index.html knip.json lefthook.yml Makefile netlify netlify.toml oxlint.json package.json packages playwright.config.ts postcss.config.mjs scripts services sonar-project.properties src tests tsconfig.json tsconfig.node.json tsconfig.node.tsbuildinfo vite-config vite.config.ts vitest.config.ts .dependency-cruiser.cjs .editorconfig .gitignore -x 'src/i18n/static/*' 'src/i18n/locales/*' 'src/content/generated/*' 'public/*' 'ios/*' 'android/*' 'reports/*' 'dist/*' 'coverage/*' 'node_modules/*' '.git/*'
