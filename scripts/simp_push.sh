#!/bin/bash

# Simple Git Push Script for Existing Repository
# Usage: ./simple_push.sh [directory] [token]

TARGET_DIR="${1:-$(pwd)}"
TOKEN="${2:-$GITHUB_TOKEN}"

if [ -z "$TOKEN" ]; then
    echo "❌ Error: GitHub token required"
    echo "Usage: $0 [directory] [token]"
    echo "Or set GITHUB_TOKEN environment variable"
    exit 1
fi

# Change to target directory
cd "$TARGET_DIR" || {
    echo "❌ Failed to change to directory '$TARGET_DIR'"
    exit 1
}

echo "🔍 Working in: $(pwd)"

# Check if it's a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository"
    exit 1
fi

# Get current remote URL
current_remote=$(git remote get-url origin 2>/dev/null)
if [ -z "$current_remote" ]; then
    echo "❌ No remote 'origin' configured"
    exit 1
fi

echo "📡 Current remote: $current_remote"

# Extract repo info from URL
REPO_OWNER=$(echo "$current_remote" | sed 's|.*github.com/||' | sed 's|/.*||')
REPO_NAME=$(echo "$current_remote" | sed 's|.*github.com/[^/]*/||' | sed 's|\.git.*||')

echo "👤 Repository: $REPO_OWNER/$REPO_NAME"

# Update remote URL with token for authentication
echo "🔐 Adding authentication to remote..."
AUTH_URL="https://$TOKEN@github.com/$REPO_OWNER/$REPO_NAME.git"
git remote set-url origin "$AUTH_URL"

# Check repository status
echo "📊 Repository status:"
git status --short

# Check if we have commits to push
current_branch=$(git branch --show-current)
echo "🌿 Current branch: $current_branch"

# Check for unpushed commits
unpushed_commits=$(git rev-list --count origin/$current_branch..$current_branch 2>/dev/null || git rev-list --count $current_branch 2>/dev/null)

echo "📈 Unpushed commits: $unpushed_commits"

if [ "$unpushed_commits" -gt 0 ]; then
    echo "🚀 Pushing $unpushed_commits commits..."
    
    # Try different push methods
    if git push origin $current_branch 2>&1; then
        echo "✅ Push successful!"
    elif git push --set-upstream origin $current_branch 2>&1; then
        echo "✅ Push with upstream successful!"
    elif git push --force origin $current_branch 2>&1; then
        echo "✅ Force push successful!"
    else
        echo "❌ All push attempts failed"
        exit 1
    fi
else
    echo "ℹ️ No commits to push"
    
    # Check if remote branch exists
    if ! git ls-remote --heads origin $current_branch | grep -q $current_branch; then
        echo "🔄 Remote branch doesn't exist, pushing current branch..."
        if git push --set-upstream origin $current_branch 2>&1; then
            echo "✅ Initial push successful!"
        else
            echo "❌ Initial push failed"
            exit 1
        fi
    else
        echo "✅ Repository is up to date"
    fi
fi

# Clean up authentication from remote URL
echo "🔒 Cleaning up authentication..."
CLEAN_URL=$(echo "$AUTH_URL" | sed "s|https://$TOKEN@|https://|")
git remote set-url origin "$CLEAN_URL"

echo "🎉 Done!"
echo "🌐 Repository: https://github.com/$REPO_OWNER/$REPO_NAME"