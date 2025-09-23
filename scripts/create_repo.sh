#!/bin/bash

# Enhanced GitHub Push Script with Auto Repository Creation and Smart Commit Messages
# Usage: ./script.sh [-d directory] [-r repo_name_or_url] [-m message] [-t date] [-p private]

# Get environment variables with defaults
USER_NAME="${GIT_USER_NAME:-${USER_NAME}}"
USER_EMAIL="${GIT_USER_EMAIL:-${USER_EMAIL}}"
BRANCH="main"  # Default branch name

# Get token from environment variable
TOKEN="${GITHUB_TOKEN:-${TOKEN}}"

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
    echo "❌ Error: GitHub token not found. Set GITHUB_TOKEN or TOKEN environment variable"
    exit 1
fi

# Default values
TARGET_DIR=""
REPO_INPUT=""
COMMIT_MESSAGE=""
COMMIT_DATE=""
PRIVATE_REPO=false
FORCE_COMMIT=false

# Disable Git pager to prevent hanging
export GIT_PAGER=""

# Function to generate automatic commit message
generate_commit_message() {
    local dir="$1"
    local files_added=$(git status --porcelain | grep "^A" | wc -l)
    local files_modified=$(git status --porcelain | grep "^M" | wc -l)
    local files_deleted=$(git status --porcelain | grep "^D" | wc -l)
    local total_files=$(git status --porcelain | wc -l)
    
    # Get project name from directory
    local project_name=$(basename "$dir")
    
    # Check if this is initial commit
    if ! git log --oneline -1 >/dev/null 2>&1; then
        echo "🎉 Initial commit for $project_name project"
        return
    fi
    
    # Generate message based on changes
    local message=""
    if [ "$files_added" -gt 0 ] && [ "$files_modified" -eq 0 ] && [ "$files_deleted" -eq 0 ]; then
        message="✨ Add $files_added new files to $project_name"
    elif [ "$files_modified" -gt 0 ] && [ "$files_added" -eq 0 ] && [ "$files_deleted" -eq 0 ]; then
        message="🔧 Update $files_modified files in $project_name"
    elif [ "$files_deleted" -gt 0 ] && [ "$files_added" -eq 0 ] && [ "$files_modified" -eq 0 ]; then
        message="🗑️ Remove $files_deleted files from $project_name"
    else
        message="🚀 Update $project_name ($files_added added, $files_modified modified, $files_deleted deleted)"
    fi
    
    echo "$message"
}

# Function to extract JSON value more reliably
extract_json_value() {
    local json="$1"
    local key="$2"
    
    # Method 1: Using python if available
    if command -v python3 >/dev/null 2>&1; then
        echo "$json" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('$key', ''))" 2>/dev/null
        return
    fi
    
    # Method 2: Using jq if available
    if command -v jq >/dev/null 2>&1; then
        echo "$json" | jq -r ".$key // empty" 2>/dev/null
        return
    fi
    
    # Method 3: Multiple sed attempts
    local result=""
    
    # Try different sed patterns
    result=$(echo "$json" | sed -n "s/.*\"$key\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p")
    if [ -n "$result" ]; then
        echo "$result"
        return
    fi
    
    # Try with different spacing
    result=$(echo "$json" | sed -n "s/.*\"$key\":\"\\([^\"]*\\)\".*/\\1/p")
    if [ -n "$result" ]; then
        echo "$result"
        return
    fi
    
    # Try grep + cut approach
    result=$(echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | cut -d'"' -f4)
    if [ -n "$result" ]; then
        echo "$result"
        return
    fi
    
    echo ""
}

# Function to get actual GitHub username
get_github_username() {
    local response=$(curl -s -H "Authorization: token $TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user 2>/dev/null)
    
    local username=$(extract_json_value "$response" "login")
    
    if [ -n "$username" ]; then
        echo "$username"
    else
        echo "$USER_NAME"
    fi
}

# Function to create GitHub repository
create_github_repo() {
    local repo_name="$1"
    local is_private="$2"
    
    echo "🔨 Creating new GitHub repository: $repo_name" >&2
    
    # Validate repository name (GitHub requirements)
    if [[ ! "$repo_name" =~ ^[a-zA-Z0-9._-]+$ ]]; then
        echo "❌ Invalid repository name. Use only letters, numbers, hyphens, underscores, and dots." >&2
        exit 1
    fi
    
    local privacy_flag="false"
    if [ "$is_private" = true ]; then
        privacy_flag="true"
        echo "🔒 Repository will be private" >&2
    else
        echo "🌐 Repository will be public" >&2
    fi
    
    # Test GitHub API access first
    echo "🔍 Testing GitHub API access..." >&2
    local test_response=$(curl -s -w "%{http_code}" \
        -H "Authorization: token $TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user \
        -o /dev/null)
    
    if [ "$test_response" -ne 200 ]; then
        echo "❌ GitHub API access failed. Check your token permissions." >&2
        echo "Token needs 'repo' scope for repository creation." >&2
        exit 1
    fi
    
    # Get actual username first
    local actual_username=$(get_github_username)
    echo "🔍 Using GitHub username: $actual_username" >&2
    
    # Create repository using GitHub API
    local response=$(curl -s \
        -H "Authorization: token $TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -X POST \
        -d "{\"name\":\"$repo_name\",\"private\":$privacy_flag}" \
        https://api.github.com/user/repos)
    
    echo "🔍 API Response received" >&2
    
    # Check for errors first
    local error_message=$(extract_json_value "$response" "message")
    
    if echo "$response" | grep -q '"clone_url"'; then
        echo "✅ Repository created successfully!" >&2
        
        # Extract clone_url using improved method
        local clone_url=$(extract_json_value "$response" "clone_url")
        
        if [ -n "$clone_url" ]; then
            echo "🔍 Extracted clone URL: $clone_url" >&2
            echo "$clone_url"
        else
            # Fallback to constructed URL
            echo "🔍 Using constructed URL with actual username" >&2
            echo "https://github.com/$actual_username/$repo_name.git"
        fi
        
    elif echo "$response" | grep -q "already exists"; then
        echo "⚠️ Repository '$repo_name' already exists, using existing repository" >&2
        echo "https://github.com/$actual_username/$repo_name.git"
    else
        echo "❌ Failed to create repository." >&2
        if [ -n "$error_message" ]; then
            echo "Error: $error_message" >&2
        fi
        echo "Attempting to use constructed URL anyway..." >&2
        echo "https://github.com/$actual_username/$repo_name.git"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dir)
            TARGET_DIR="$2"
            shift 2
            ;;
        -r|--repo)
            REPO_INPUT="$2"
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
        -p|--private)
            PRIVATE_REPO=true
            shift
            ;;
        -f|--force)
            FORCE_COMMIT=true
            shift
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "OPTIONS:"
            echo "  -d, --dir       Target directory (default: current directory)"
            echo "  -r, --repo      Repository name or full URL"
            echo "                  - Just name: creates new repo (e.g., 'my-project')"
            echo "                  - Full URL: uses existing repo (e.g., 'https://github.com/user/repo.git')"
            echo "  -m, --message   Commit message (auto-generated if not provided)"
            echo "  -t, --date      Commit date (format: YYYY-MM-DD or 'YYYY-MM-DD HH:MM:SS')"
            echo "  -p, --private   Create private repository (only for new repos)"
            echo "  -f, --force     Force commit even if no changes detected"
            echo "  -b, --branch    Branch name (default: main)"
            echo "  -h, --help      Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  GITHUB_TOKEN or TOKEN     - GitHub personal access token (required)"
            echo "  GIT_USER_NAME            - Git user name for commits (required)"
            echo "  GIT_USER_EMAIL           - Git user email for commits (required)"
            echo ""
            echo "Examples:"
            echo "  $0 -r my-new-project                    # Create new repo"
            echo "  $0 -r https://github.com/user/repo.git  # Use existing repo"
            echo "  $0 -d /path/to/project -r my-project -p # Create private repo"
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Get missing parameters interactively
if [ -z "$TARGET_DIR" ]; then
    TARGET_DIR="$(pwd)"
fi

if [ -z "$REPO_INPUT" ]; then
    echo "Enter repository name or full URL:"
    read REPO_INPUT
fi

# Convert Windows path to Unix format if needed
if [[ "$TARGET_DIR" =~ ^[A-Za-z]:\\ ]]; then
    TARGET_DIR=$(echo "$TARGET_DIR" | sed 's|\\|/|g' | sed 's|^\([A-Za-z]\):|/\L\1|')
fi

# Determine if REPO_INPUT is a name or URL and construct REPO_URL
if [[ "$REPO_INPUT" =~ ^https?:// ]]; then
    # It's a full URL - use existing repository
    REPO_URL="$REPO_INPUT"
    REPO_NAME=$(basename "$REPO_URL" .git)
    echo "📁 Using existing repository: $REPO_URL"
else
    # It's just a name - create new repository
    REPO_NAME="$REPO_INPUT"
    echo "🔨 Creating repository: $REPO_NAME"
    
    # Create the repository and capture the URL
    REPO_URL=$(create_github_repo "$REPO_NAME" "$PRIVATE_REPO")
    
    echo "🔍 Repository creation result: '$REPO_URL'" >&2
    
    # Validate that we got a proper URL back
    if [[ -z "$REPO_URL" ]]; then
        echo "❌ Failed to get repository URL, using fallback method..."
        ACTUAL_USERNAME=$(get_github_username)
        REPO_URL="https://github.com/$ACTUAL_USERNAME/$REPO_NAME.git"
    fi
    
    echo "✅ Repository URL: $REPO_URL"
fi

echo "🚀 Starting push to $REPO_URL"
echo "📁 Target directory: $TARGET_DIR"

# Handle commit date - Git needs ISO 8601 format
if [ -z "$COMMIT_DATE" ]; then
    COMMIT_DATE=$(date "+%Y-%m-%d %H:%M:%S")
    GIT_COMMIT_DATE=$(date --iso-8601=seconds 2>/dev/null || date -Iseconds 2>/dev/null || date "+%Y-%m-%dT%H:%M:%S%z")
    echo "⏰ Using current date: $COMMIT_DATE"
else
    # Add time if only date is provided
    if [[ "$COMMIT_DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        COMMIT_DATE="$COMMIT_DATE 12:00:00"
    fi
    
    # Convert to Git-compatible format (ISO 8601)
    if command -v date >/dev/null 2>&1; then
        # Try to parse and convert the date
        if date -d "$COMMIT_DATE" >/dev/null 2>&1; then
            GIT_COMMIT_DATE=$(date -d "$COMMIT_DATE" --iso-8601=seconds 2>/dev/null || date -d "$COMMIT_DATE" -Iseconds 2>/dev/null || echo "$COMMIT_DATE")
            echo "⏰ Using custom commit date: $COMMIT_DATE"
            echo "📅 Git format: $GIT_COMMIT_DATE"
        else
            echo "⚠️ Invalid date format '$COMMIT_DATE', using current time"
            COMMIT_DATE=$(date "+%Y-%m-%d %H:%M:%S")
            GIT_COMMIT_DATE=$(date --iso-8601=seconds 2>/dev/null || date -Iseconds 2>/dev/null || date "+%Y-%m-%dT%H:%M:%S%z")
        fi
    else
        # Fallback for systems without GNU date
        echo "⚠️ Advanced date parsing not available, trying direct format"
        GIT_COMMIT_DATE="$COMMIT_DATE"
    fi
fi

# Change to target directory
if [ "$TARGET_DIR" != "$(pwd)" ]; then
    cd "$TARGET_DIR" || {
        echo "❌ Failed to change to directory '$TARGET_DIR'"
        exit 1
    }
fi

echo "🔍 Working in directory: $(pwd)"

# Create authenticated URL with proper escaping
REPO_OWNER=$(echo "$REPO_URL" | sed 's|https://github.com/||' | sed 's|/.*||')
REPO_NAME_FROM_URL=$(echo "$REPO_URL" | sed 's|.*github.com/[^/]*/||' | sed 's|\.git$||')
AUTH_URL="https://$TOKEN@github.com/$REPO_OWNER/$REPO_NAME_FROM_URL.git"

echo "🔍 Testing repository connectivity..."
if ! curl -s -f -H "Authorization: token $TOKEN" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME_FROM_URL" \
    > /dev/null 2>&1; then
    echo "⚠️ Repository may not exist or token lacks access"
    echo "Repository: $REPO_OWNER/$REPO_NAME_FROM_URL"
fi

# Initialize or configure git
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git branch -M "$BRANCH"
    
    echo "📝 Adding remote origin..."
    git remote add origin "$AUTH_URL"
    
    # Test the remote connection immediately
    echo "🔍 Testing remote connection..."
    if ! timeout 10 git ls-remote origin HEAD >/dev/null 2>&1; then
        echo "❌ Cannot connect to remote repository."
        echo "🔍 Debugging information:"
        echo "  - Repository URL: $REPO_URL"
        echo "  - Token length: ${#TOKEN} characters"
        echo "  - Owner/Repo: $REPO_OWNER/$REPO_NAME_FROM_URL"
        
        # Try to check if repo exists via API
        echo "🔍 Checking repository via GitHub API..."
        local api_response=$(curl -s -H "Authorization: token $TOKEN" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME_FROM_URL")
        
        if echo "$api_response" | grep -q '"clone_url"'; then
            echo "✅ Repository exists via API, but git connection failed"
            echo "🔍 This might be a temporary network issue"
        else
            echo "❌ Repository doesn't exist or token lacks access"
            local api_error=$(extract_json_value "$api_response" "message")
            if [ -n "$api_error" ]; then
                echo "API Error: $api_error"
            fi
        fi
        exit 1
    fi
    
    echo "✅ Git repository initialized and connected"
else
    echo "📁 Using existing git repository..."
    
    # Force update the remote URL with token
    echo "📝 Updating remote origin with authentication..."
    git remote set-url origin "$AUTH_URL"
    
    # Test the connection
    echo "🔍 Testing remote connection..."
    if ! timeout 10 git ls-remote origin HEAD >/dev/null 2>&1; then
        echo "❌ Cannot connect to remote repository."
        echo "🔍 This might be a network issue or repository access problem"
        exit 1
    fi
    
    # Handle branch
    current_branch=$(git branch --show-current 2>/dev/null || echo "")
    
    if [ -z "$current_branch" ]; then
        # No commits yet, create initial branch
        git checkout -b "$BRANCH"
    elif [ "$current_branch" != "$BRANCH" ]; then
        if git show-ref --verify --quiet refs/heads/$BRANCH; then
            echo "📝 Switching to existing branch: $BRANCH"
            git checkout "$BRANCH"
        else
            echo "📝 Creating new branch: $BRANCH"
            git checkout -b "$BRANCH"
        fi
    fi
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

# Check status and add files
echo "📊 Checking repository status..."
echo "📝 Adding all files to git..."
git add -A

# Check what's staged
staged_count=$(git diff --cached --name-only | wc -l)
echo "📊 Files staged for commit: $staged_count"

# Check for unpushed commits
current_branch=$(git branch --show-current)
unpushed_commits=$(git rev-list --count origin/$current_branch..$current_branch 2>/dev/null || git rev-list --count $current_branch 2>/dev/null || echo "0")
echo "📈 Unpushed commits: $unpushed_commits"

# Determine if we need to commit or push
if [ "$staged_count" -gt 0 ]; then
    # Generate commit message if not provided
    if [ -z "$COMMIT_MESSAGE" ]; then
        COMMIT_MESSAGE=$(generate_commit_message "$TARGET_DIR")
        echo "🤖 Auto-generated commit message: $COMMIT_MESSAGE"
    else
        echo "📝 Using provided commit message: $COMMIT_MESSAGE"
    fi

    # Show some of the files being committed
    echo "📋 Files to be committed (showing first 10):"
    git diff --cached --name-only | head -10

    # Commit with custom date - use both GIT_AUTHOR_DATE and GIT_COMMITTER_DATE
    echo "💾 Committing changes..."
    echo "⏰ Setting commit date to: $COMMIT_DATE"
    
    # Set both author and committer date environment variables
    export GIT_AUTHOR_DATE="$GIT_COMMIT_DATE"
    export GIT_COMMITTER_DATE="$GIT_COMMIT_DATE"
    
    # Commit with the environment variables set
    git commit -m "$COMMIT_MESSAGE"
    
    # Clean up environment variables
    unset GIT_AUTHOR_DATE
    unset GIT_COMMITTER_DATE

    if [ $? -ne 0 ]; then
        echo "❌ Commit failed"
        exit 1
    fi

    echo "✅ Commit created successfully"
    
    # Show commit details with actual date
    echo "📋 Commit created:"
    git --no-pager log -1 --format="%h - %s (%ci) [Author: %ai]"
    unpushed_commits=$((unpushed_commits + 1))
elif [ "$unpushed_commits" -eq 0 ]; then
    if [ "$FORCE_COMMIT" = true ]; then
        echo "🔄 Force flag enabled, creating empty commit..."
        COMMIT_MESSAGE="${COMMIT_MESSAGE:-"🔄 Force update repository"}"
        
        # Set both author and committer date environment variables
        export GIT_AUTHOR_DATE="$GIT_COMMIT_DATE"
        export GIT_COMMITTER_DATE="$GIT_COMMIT_DATE"
        
        git commit --allow-empty -m "$COMMIT_MESSAGE"
        
        # Clean up environment variables
        unset GIT_AUTHOR_DATE
        unset GIT_COMMITTER_DATE
        
        unpushed_commits=1
    else
        echo "ℹ️ No changes to commit and no unpushed commits"
        echo "💡 Use --force (-f) flag to create an empty commit"
        
        # Clean up URL before exit
        CLEAN_URL=$(echo "$AUTH_URL" | sed "s|https://[^@]*@|https://|")
        git remote set-url origin "$CLEAN_URL"
        exit 0
    fi
fi

# Push changes with enhanced error handling
echo "🚀 Pushing to $BRANCH..."

# Set git timeout configurations
git config http.timeout 30
git config http.postBuffer 524288000

# Check if upstream exists
upstream_exists=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
remote_branch_exists=$(git ls-remote --heads origin "$BRANCH" 2>/dev/null | wc -l)

# Try to get more details about what might be causing push failures
echo "🔍 Pre-push diagnostics..."
echo "  - Upstream exists: $([ -n "$upstream_exists" ] && echo "yes" || echo "no")"
echo "  - Remote branch exists: $([ "$remote_branch_exists" -gt 0 ] && echo "yes" || echo "no")"
echo "  - Local commits to push: $unpushed_commits"

if [ -z "$upstream_exists" ] || [ "$remote_branch_exists" -eq 0 ]; then
    echo "🚀 Setting upstream and pushing..."
    
    # Try push with verbose output
    if timeout 120 git push --set-upstream origin "$BRANCH" --verbose; then
        echo "✅ Push with upstream successful!"
    else
        push_exit_code=$?
        echo "❌ Push failed with exit code: $push_exit_code"
        
        # Try to get more information about the failure
        echo "🔍 Attempting to diagnose push failure..."
        
        # Check if it's a file size issue
        echo "🔍 Checking for large files..."
        git ls-files | xargs ls -la | awk '{if ($5 > 50000000) print $9 " (" $5 " bytes)"}'
        
        # Check if remote still exists
        echo "🔍 Checking remote repository status..."
        if curl -s -f -H "Authorization: token $TOKEN" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME_FROM_URL" > /dev/null; then
            echo "✅ Remote repository is accessible"
        else
            echo "❌ Cannot access remote repository via API"
        fi
        
        # Try a different push method
        echo "🔄 Trying alternative push method..."
        if timeout 120 git push origin "$BRANCH" --verbose; then
            echo "✅ Alternative push successful!"
        else
            echo "❌ All push attempts failed"
            exit 1
        fi
    fi
else
    echo "🚀 Pushing to existing upstream..."
    if timeout 120 git push --verbose; then
        echo "✅ Push successful!"
    else
        push_exit_code=$?
        echo "❌ Push failed with exit code: $push_exit_code"
        
        # Try force push as last resort (be careful with this)
        echo "⚠️ Trying force push (this might overwrite remote changes)..."
        if timeout 120 git push --force --verbose; then
            echo "✅ Force push successful!"
        else
            echo "❌ All push attempts failed"
            exit 1
        fi
    fi
fi

# Clean up the URL (remove token for security)
echo "🔒 Cleaning up authentication from remote URL..."
CLEAN_URL=$(echo "$AUTH_URL" | sed "s|https://[^@]*@|https://|")
git remote set-url origin "$CLEAN_URL"

echo ""
echo "🎉 Operation completed successfully!"
echo "🌐 Repository: $REPO_URL"
echo "📊 Pushed $unpushed_commits commits to $BRANCH"
echo "⏰ Commit date: $COMMIT_DATE"

# Show final status
echo "📋 Final git status:"
git status -sb