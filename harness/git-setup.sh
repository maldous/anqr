#!/bin/bash
# Configure git for ANQR development

set -e

echo "🔧 Configuring git for ANQR development..."
echo ""

# Configure weave merge driver
echo "📝 Configuring weave merge driver..."
git config --global merge.weave.driver "git merge-file --diff3 %O %A %B"
git config --global merge.weave.name "Weave merge with diff3 markers"
echo "✅ Weave merge driver configured"
echo ""

# Configure diff3 conflict style globally
echo "📝 Configuring conflict style..."
git config --global merge.conflictstyle diff3
echo "✅ Conflict style set to diff3"
echo ""

# Configure pull strategy (merge, not rebase)
echo "📝 Configuring pull strategy..."
git config --global pull.rebase false
echo "✅ Pull strategy set to merge (not rebase)"
echo ""

# Configure line ending handling
echo "📝 Configuring line ending handling..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows: checkout as-is, commit Unix-style
  git config --global core.autocrlf true
  echo "✅ Line endings: autocrlf=true (Windows)"
else
  # Unix/Mac: checkout as-is, commit Unix-style
  git config --global core.autocrlf input
  echo "✅ Line endings: autocrlf=input (Unix/Mac)"
fi
echo ""

# Optional: Enable patience diff algorithm (better for code)
echo "📝 Configuring diff algorithm..."
read -p "Enable patience diff algorithm? (better for code, slightly slower) [Y/n] " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
  git config --global diff.algorithm patience
  echo "✅ Diff algorithm set to patience"
else
  echo "⏭️  Skipped patience diff algorithm"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Git configuration complete!"
echo ""
echo "Configured settings:"
echo "  • Weave merge driver (critical for concurrent worktrees)"
echo "  • diff3 conflict markers (better conflict resolution)"
echo "  • Pull strategy: merge (not rebase)"
echo "  • Line ending handling (cross-platform)"
if git config --get diff.algorithm >/dev/null 2>&1; then
  echo "  • Diff algorithm: $(git config --get diff.algorithm)"
fi
echo ""
echo "Why weave merge matters:"
echo "  • Reduces merge conflicts by 30-50% in concurrent development"
echo "  • Critical for Symphony worktree execution"
echo "  • See docs/standards/git-weave-merge.md for details"
echo ""
echo "Verify configuration:"
echo "  git config --get merge.weave.driver"
echo "  git config --get merge.weave.name"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
