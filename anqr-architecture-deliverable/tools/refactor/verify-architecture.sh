#!/usr/bin/env bash
set -euo pipefail

echo "==> Typecheck"
npm run typecheck

echo "==> Architecture policy"
npm run depcruise

echo "==> AST inventory"
npm run extract:ast

echo "==> Done"
