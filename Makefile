.PHONY: dev build preview typecheck lint lint-fix format format-check depcruise \
        test test-unit test-e2e cspell knip ast-density sonar sonar-audit quality clean install hooks

# ──────────────────────────────────────────────
# Development
# ──────────────────────────────────────────────

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

# ──────────────────────────────────────────────
# Quality gates
# ──────────────────────────────────────────────

typecheck:
	npm run typecheck

lint:
	npx oxlint -c oxlint.json src/ packages/ apps/

lint-fix:
	npx oxlint -c oxlint.json --fix src/ packages/ apps/

format:
	npx oxfmt --write src/ packages/ apps/

format-check:
	npx oxfmt --check src/ packages/ apps/

depcruise:
	npx depcruise src --config .dependency-cruiser.cjs

cspell:
	npx cspell "src/**/*.{ts,tsx}" "docs/**/*.md" --no-progress

knip:
	npx knip

ast-density:
	npm run audit:ast

sonar:
	sonar-scanner

sonar-audit: sonar
	npm run sonar:audit

quality: typecheck lint depcruise test-unit
	@echo "\n✅ All quality gates passed"

# ──────────────────────────────────────────────
# Testing
# ──────────────────────────────────────────────

test-unit:
	npm run test:unit

test-unit-coverage:
	npm run test:unit:coverage

test-e2e:
	npm run test

test: test-unit test-e2e

# ──────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────

install:
	npm install

hooks:
	npx lefthook install

# ──────────────────────────────────────────────
# Cleanup
# ──────────────────────────────────────────────

clean:
	rm -rf dist coverage node_modules/.cache
