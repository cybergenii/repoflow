#!/bin/bash

# Improved GitHub Push Script with Better Date Handling and Remote Setup
# Edit the variables below with your details

# Get environment variables with defaults
USER_NAME="${GIT_USER_NAME:-${USER_NAME}}"
USER_EMAIL="${GIT_USER_EMAIL:-${USER_EMAIL}}"
TOKEN="${GITHUB_TOKEN:-${TOKEN}}"
REPO_URL="${REPO_URL:-""}"  # Must be provided via environment or command line
BRANCH="main"  # Default branch name

# Validate required environment variables
if [ -z "$USER_NAME" ]; then
    echo "❌ Error: Git user name not found. Set GIT_USER_NAME environment variable"
    exit 1
fi

if [ -z "$USER_EMAIL" ]; then
    echo "❌ Error: Git user email not found. Set GIT_USER_EMAIL environment variable"
    exit 1
fi

if [ -z "$TOKEN" ]; then
    echo "❌ Error: GitHub token not found. Set GITHUB_TOKEN environment variable"
    exit 1
fi

# Default values
TARGET_DIR=""
COMMIT_MESSAGE=""
COMMIT_DATE=""

# Disable Git pager to prevent hanging
export GIT_PAGER=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dir)
            TARGET_DIR="$2"
            shift 2
            ;;
        -r|--repo)
            REPO_URL="$2"
            shift 2
            ;;
        -m|--message)
            COMMIT_MESSAGE="$2"
            shift 2
            ;;
        -t|--date)
            COMMIT_DATE="$2"
            shift 2
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -d, --dir DIRECTORY    Target directory (default: current directory)"
            echo "  -r, --repo URL         Repository URL (https://github.com/user/repo.git)"
            echo "  -m, --message MESSAGE   Commit message"
            echo "  -t, --date DATE        Commit date (YYYY-MM-DD or 'YYYY-MM-DD HH:MM:SS')"
            echo "  -b, --branch BRANCH    Branch name (default: main)"
            echo ""
            echo "Environment Variables:"
            echo "  GIT_USER_NAME         - Git user name for commits (required)"
            echo "  GIT_USER_EMAIL        - Git user email for commits (required)"
            echo "  GITHUB_TOKEN          - GitHub personal access token (required)"
            echo "  REPO_URL             - Repository URL (can be provided via -r option)"
            exit 0
            ;;
        *)
            if [ -z "$COMMIT_MESSAGE" ]; then
                COMMIT_MESSAGE="$1"
            fi
            shift
            ;;
    esac
done

# Get missing parameters
if [ -z "$REPO_URL" ]; then
    echo "Enter repository URL (https://github.com/user/repo.git):"
    read REPO_URL
fi

if [ -z "$COMMIT_MESSAGE" ]; then
    echo "Enter commit message:"
    read COMMIT_MESSAGE
fi

if [ -z "$TARGET_DIR" ]; then
    TARGET_DIR="$(pwd)"
fi

# Validate repository URL format
if [[ ! "$REPO_URL" =~ ^https://github\.com/[^/]+/[^/]+\.git$ ]]; then
    echo "❌ Invalid repository URL format. Must be: https://github.com/user/repo.git"
    exit 1
fi

# Convert Windows path to Unix format
if [[ "$TARGET_DIR" =~ ^[A-Za-z]:\\ ]]; then
    TARGET_DIR=$(echo "$TARGET_DIR" | sed 's|\\|/|g' | sed 's|^\([A-Za-z]\):|/\L\1|')
fi

echo "🚀 Starting push to $REPO_URL"
echo "📁 Target directory: $TARGET_DIR"
echo "📝 Commit message: $COMMIT_MESSAGE"

# Validate and format commit date for your -t variable
if [ -n "$COMMIT_DATE" ]; then
    # Add time if only date is provided
    if [[ "$COMMIT_DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        COMMIT_DATE="$COMMIT_DATE 12:00:00"
    fi
    
    # Validate the date format
    if command -v date >/dev/null 2>&1; then
        if date -d "$COMMIT_DATE" >/dev/null 2>&1; then
            echo "⏰ Using commit date: $COMMIT_DATE"
        else
            echo "⚠️ Invalid date format '$COMMIT_DATE', using current time"
            COMMIT_DATE=""
        fi
    else
        echo "⚠️ Date command not available, using current time"
        COMMIT_DATE=""
    fi
fi

# Change to target directory
if [ "$TARGET_DIR" != "$(pwd)" ]; then
    cd "$TARGET_DIR" || {
        echo "❌ Failed to change to directory '$TARGET_DIR'"
        exit 1
    }
fi

echo "🔍 DEBUG: Current directory: $(pwd)"

# Create authenticated URL
AUTH_URL=$(echo "$REPO_URL" | sed "s|https://|https://$TOKEN@|")

# Initialize or configure git
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git branch -M "$BRANCH"  # Use -M to force rename if needed
    git remote add origin "$AUTH_URL"
    
    # Set upstream tracking
    echo "📝 Setting up upstream tracking..."
    
else
    echo "📁 Using existing git repository..."
    
    # Force update the remote URL with token
    echo "📝 Updating remote origin with authentication..."
    git remote set-url origin "$AUTH_URL"
    
    # Verify remote is accessible
    echo "🔍 Testing remote connection..."
    if ! git ls-remote origin >/dev/null 2>&1; then
        echo "❌ Cannot connect to remote repository. Check your token and repo URL."
        # Clean up the URL without token for security
        CLEAN_URL=$(echo "$AUTH_URL" | sed "s|https://$TOKEN@|https://|")
        git remote set-url origin "$CLEAN_URL"
        exit 1
    fi
    
    # Handle branch
    current_branch=$(git branch --show-current)
    echo "🔍 Current branch: $current_branch"
    
    if [ "$current_branch" != "$BRANCH" ]; then
        if git show-ref --verify --quiet refs/heads/$BRANCH; then
            echo "📝 Switching to existing branch: $BRANCH"
            git checkout "$BRANCH"
        else
            echo "📝 Creating new branch: $BRANCH"
            git checkout -b "$BRANCH"
        fi
    fi
    
    # Fetch remote info to establish connection
    echo "🔄 Fetching remote information..."
    git fetch origin >/dev/null 2>&1 || echo "⚠️ Could not fetch from remote (this is normal for new repos)"
fi

# Configure git
echo "⚙️ Configuring git..."
git config user.name "$USER_NAME"
git config user.email "$USER_EMAIL"

# Remove nested .git directories
find . -name ".git" -type d | while read gitdir; do
    if [ "$gitdir" != "./.git" ]; then
        echo "🗑️ Removing nested .git in: $(dirname "$gitdir")"
        rm -rf "$gitdir"
    fi
done

# Check status
echo "📊 Checking repository status..."
file_count=$(git status --porcelain | wc -l)
echo "Found $file_count files with changes"

# Add all changes
echo "📝 Adding all changes..."
git add -A

# Check what's staged
staged_count=$(git diff --cached --name-only | wc -l)
if [ "$staged_count" -eq 0 ]; then
    echo "ℹ️ No changes to commit"
    exit 0
fi

echo "📋 Staged $staged_count files for commit"

# Show some of the files being committed (limit output)
echo "Files to be committed (showing first 10):"
git diff --cached --name-only | head -10

# Commit with custom date if provided
echo "💾 Committing changes..."
if [ -n "$COMMIT_DATE" ]; then
    echo "⏰ Setting commit date to: $COMMIT_DATE"
    # Use --date flag directly with your -t variable
    git commit -m "$COMMIT_MESSAGE" --date="$COMMIT_DATE"
else
    git commit -m "$COMMIT_MESSAGE"
fi

if [ $? -ne 0 ]; then
    echo "❌ Commit failed"
    exit 1
fi

# Show commit details
echo "📋 Commit created:"
git log -1 --format="%h - %s (%ci)" --no-pager

# Set upstream and push
echo "🔄 Setting upstream and pushing to $BRANCH..."

# Try to push with upstream setting first
if git push -u origin "$BRANCH" 2>/dev/null; then
    echo "✅ Successfully pushed with upstream set!"
else
    echo "⚠️ Initial push failed, checking if remote branch exists..."
    
    # Check if remote branch exists
    if git ls-remote --heads origin "$BRANCH" | grep -q "$BRANCH"; then
        echo "🔄 Remote branch exists, trying regular push..."
        git push origin "$BRANCH" 2>/dev/null
        if [ $? -ne 0 ]; then
            echo "⚠️ Regular push failed, trying force push..."
            git push -f origin "$BRANCH"
        fi
    else
        echo "🆕 Remote branch doesn't exist, trying force push with upstream..."
        git push -f -u origin "$BRANCH"
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ Push successful!"
    else
        echo "❌ All push attempts failed!"
        # Clean up URL before exit
        CLEAN_URL=$(echo "$AUTH_URL" | sed "s|https://$TOKEN@|https://|")
        git remote set-url origin "$CLEAN_URL"
        exit 1
    fi
fi

# Verify the upstream is set correctly
echo "🔍 Verifying upstream configuration..."
upstream=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
if [ -n "$upstream" ]; then
    echo "✅ Upstream set to: $upstream"
else
    echo "⚠️ Setting upstream manually..."
    git branch --set-upstream-to=origin/$BRANCH $BRANCH
fi

# Clean up the URL (remove token for security)
echo "🔒 Cleaning up authentication from remote URL..."
CLEAN_URL=$(echo "$AUTH_URL" | sed "s|https://$TOKEN@|https://|")
git remote set-url origin "$CLEAN_URL"

echo "🎉 Push completed successfully!"
echo "🌐 Repository: $REPO_URL"
echo "📊 Committed $staged_count files"
echo "🔗 VSCode should now show the repository as connected to remote"

# Show final status
echo "📋 Final git status:"
git status -sb