#!/usr/bin/env bash
set -euo pipefail

PMD_BIN="${PMD_BIN:-/opt/pmd/bin/pmd}"

"$PMD_BIN" cpd \
  -d src/app \
  -d src/domain \
  -d src/features \
  -d src/hooks \
  -d src/infra \
  -d src/platform \
  -d src/store \
  -l typescript \
  --minimum-tokens 90 \
  -f text
