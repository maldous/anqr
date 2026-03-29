#!/bin/bash
# Configure git for ANQR development

set -e

echo "🔧 Configuring git for ANQR development..."
echo ""

# Configure weave merge driver with diff3 markers
echo "📝 Configuring weave merge driver..."
git config --global merge.weave.driver "git merge-file --diff3 %O %A %B"
git config --global merge.weave.name "Weave merge with diff3 markers"
echo "✅ Weave merge driver configured"
echo ""

# Configure diff3 conflict style for better conflict markers
echo "📝 Configuring conflict style..."
git config --global merge.conflictstyle diff3
echo "✅ Conflict style set to diff3"
echo ""

# Configure pull strategy (recommended: no rebase by default)
echo "📝 Configuring pull strategy..."
git config --global pull.rebase false
echo "✅ Pull strategy set to merge (no rebase)"
echo ""

# Configure core.autocrlf for cross-platform compatibility
echo "📝 Configuring line endings..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    git config --global core.autocrlf true
    echo "✅ Line endings set to auto (Windows)"
else
    git config --global core.autocrlf input
    echo "✅ Line endings set to input (Unix/Mac)"
fi
echo ""

# Optional: Configure patience diff algorithm for better diffs
read -p "🤔 Configure patience diff algorithm? (recommended) [Y/n]: " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    git config --global diff.algorithm patience
    echo "✅ Diff algorithm set to patience"
else
    echo "⏭️  Skipped patience diff algorithm"
fi
echo ""

# Verify configuration
echo "🔍 Verifying configuration..."
echo ""

echo "Weave merge driver:"
git config --get merge.weave.driver
echo ""

echo "Conflict style:"
git config --get merge.conflictstyle
echo ""

echo "Pull strategy:"
git config --get pull.rebase
echo ""

echo "Line ending handling:"
git config --get core.autocrlf
echo ""

if git config --get diff.algorithm &>/dev/null; then
    echo "Diff algorithm:"
    git config --get diff.algorithm
    echo ""
fi

echo "✅ Git configuration complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Test weave merge: see docs/standards/git-weave-merge.md"
echo "  2. For worktree setup: see docs/harness/WORKTREE-QUICKSTART.md"
echo ""
