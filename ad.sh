#!/bin/bash

# Enhanced GitHub Push Script with Advanced Commit Graph Manipulation
# Usage: ./script.sh [-d directory] [-r repo_name_or_url] [-m message] [-t date] [-p private] [--backdate]

# Configuration - EDIT THESE
USER_NAME="chrizfasa424"
USER_EMAIL="chrizfaza@gmail.com"
BRANCH="main"

# Get token from environment variable
TOKEN="${GITHUB_TOKEN:-${TOKEN}}"
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
BACKDATE_MODE=false
MULTIPLE_COMMITS=1
SPREAD_HOURS=0

# Disable Git pager to prevent hanging
export GIT_PAGER=""

# Array of varied commit message templates
declare -a COMMIT_TEMPLATES=(
    "🚀 Launch initial project structure"
    "✨ Add core functionality and features"
    "🔧 Implement configuration and setup"
    "📝 Update documentation and README"
    "🎨 Improve UI/UX and styling"
    "🐛 Fix critical bugs and issues"
    "⚡ Optimize performance and speed"
    "🔒 Enhance security measures"
    "📱 Add responsive design elements"
    "🌟 Introduce new innovative features"
    "🧹 Clean up code and refactor"
    "🔍 Add comprehensive testing"
    "📊 Integrate analytics and monitoring"
    "🎯 Improve user experience flow"
    "🛠️ Upgrade dependencies and tools"
    "💡 Add helpful utility functions"
    "🎉 Celebrate milestone achievements"
    "🔄 Refine existing functionality"
    "📈 Boost application metrics"
    "✅ Complete feature implementation"
)

# Function to generate varied commit messages
generate_varied_commit_message() {
    local commit_number="$1"
    local total_commits="$2"
    local base_message="$3"
    local project_name="$4"
    
    # If base message is provided, use it for the first commit
    if [ "$commit_number" -eq 1 ] && [ -n "$base_message" ]; then
        echo "$base_message"
        return
    fi
    
    # Calculate template index (wrap around if more commits than templates)
    local template_index=$(( (commit_number - 1) % ${#COMMIT_TEMPLATES[@]} ))
    local template="${COMMIT_TEMPLATES[$template_index]}"
    
    # Add project context
    if [ -n "$project_name" ]; then
        echo "$template for $project_name"
    else
        echo "$template"
    fi
}

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

# Function to convert date to proper Git format
convert_to_git_date() {
    local input_date="$1"
    local git_date=""
    
    # If no date provided, use current time
    if [ -z "$input_date" ]; then
        git_date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        echo "$git_date"
        return
    fi
    
    # Add time if only date is provided
    if [[ "$input_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        input_date="$input_date 12:00:00"
    fi
    
    # Try different date parsing methods
    if command -v gdate >/dev/null 2>&1; then
        # macOS with GNU coreutils
        git_date=$(gdate -d "$input_date" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null)
    elif date -d "$input_date" >/dev/null 2>&1; then
        # Linux GNU date
        git_date=$(date -d "$input_date" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null)
    elif date -j -f "%Y-%m-%d %H:%M:%S" "$input_date" >/dev/null 2>&1; then
        # macOS BSD date
        git_date=$(date -j -f "%Y-%m-%d %H:%M:%S" "$input_date" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null)
    else
        # Fallback - try to construct a valid ISO date
        echo "⚠️ Advanced date parsing not available, using fallback" >&2
        git_date="$input_date"
    fi
    
    # Validate the result
    if [ -z "$git_date" ]; then
        echo "⚠️ Date conversion failed, using current time" >&2
        git_date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    fi
    
    echo "$git_date"
}

# Function to create multiple commits with improved date distribution
create_multiple_commits() {
    local base_date="$1"
    local commit_count="$2"
    local spread_hours="$3"
    local base_message="$4"
    local project_name="$5"
    
    echo "🕰️ Creating $commit_count commits spread over $spread_hours hours from $base_date to now"
    
    # Get current timestamp
    local now_timestamp=$(date +%s)
    local base_timestamp
    
    # Convert base date to timestamp
    if command -v gdate >/dev/null 2>&1; then
        base_timestamp=$(gdate -d "$base_date" +%s 2>/dev/null)
    elif date -d "$base_date" >/dev/null 2>&1; then
        base_timestamp=$(date -d "$base_date" +%s 2>/dev/null)
    else
        echo "❌ Cannot parse date for commit distribution"
        return 1
    fi
    
    if [ -z "$base_timestamp" ]; then
        echo "❌ Failed to convert date to timestamp"
        return 1
    fi
    
    # Calculate the actual time span from base date to now
    local actual_time_span=$((now_timestamp - base_timestamp))
    
    # Use provided spread_hours if specified, otherwise use the actual time span
    local total_seconds
    if [ "$spread_hours" -gt 0 ]; then
        total_seconds=$((spread_hours * 3600))
    else
        total_seconds=$actual_time_span
    fi
    
    echo "📊 Time distribution: $((total_seconds / 3600)) hours from $(date -d "@$base_timestamp" '+%Y-%m-%d %H:%M') to $(date '+%Y-%m-%d %H:%M')"
    
    # Create commits distributed over time, with the last one being recent
    for i in $(seq 1 $commit_count); do
        local commit_timestamp
        
        if [ "$i" -eq "$commit_count" ]; then
            # Last commit should be recent (within last few hours)
            local recent_offset=$((RANDOM % 7200)) # Random within last 2 hours
            commit_timestamp=$((now_timestamp - recent_offset))
        else
            # Distribute other commits over the time span
            local progress=$((i - 1))
            local max_progress=$((commit_count - 2)) # Exclude the last commit from distribution
            
            if [ "$max_progress" -le 0 ]; then
                # If only 2 commits total, put first one at base date
                commit_timestamp=$base_timestamp
            else
                local time_offset=$((progress * total_seconds / max_progress))
                commit_timestamp=$((base_timestamp + time_offset))
                
                # Add some randomness (±30 minutes) to make it look more natural
                local random_offset=$(((RANDOM % 3600) - 1800))
                commit_timestamp=$((commit_timestamp + random_offset))
            fi
        fi
        
        # Ensure commit_timestamp doesn't exceed now
        if [ "$commit_timestamp" -gt "$now_timestamp" ]; then
            commit_timestamp=$now_timestamp
        fi
        
        # Convert timestamp back to ISO format
        local commit_date
        if command -v gdate >/dev/null 2>&1; then
            commit_date=$(gdate -d "@$commit_timestamp" -u +"%Y-%m-%dT%H:%M:%SZ")
        else
            commit_date=$(date -d "@$commit_timestamp" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -r $commit_timestamp -u +"%Y-%m-%dT%H:%M:%SZ")
        fi
        
        # Generate varied commit message
        local message=$(generate_varied_commit_message "$i" "$commit_count" "$base_message" "$project_name")
        
        local human_date=$(date -d "@$commit_timestamp" '+%Y-%m-%d %H:%M' 2>/dev/null || date -r $commit_timestamp '+%Y-%m-%d %H:%M')
        echo "📝 Creating commit $i/$commit_count at $human_date"
        echo "    Message: $message"
        
        # Set the commit date environment variables
        export GIT_AUTHOR_DATE="$commit_date"
        export GIT_COMMITTER_DATE="$commit_date"
        
        # Create an empty commit with the specific timestamp and unique message
        if git commit --allow-empty -m "$message"; then
            echo "✅ Commit $i created successfully"
        else
            echo "❌ Failed to create commit $i"
            unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE
            return 1
        fi
        
        # Clean up environment variables
        unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE
        
        # Small delay to avoid any potential issues
        sleep 0.2
    done
    
    echo ""
    echo "✅ All $commit_count commits created successfully!"
    echo "📊 Date range: $(date -d "@$base_timestamp" '+%Y-%m-%d %H:%M') → $(date '+%Y-%m-%d %H:%M')"
}

# Function to create multiple backdated commits (legacy version - kept for compatibility)
create_backdated_commits() {
    local base_date="$1"
    local commit_count="$2"
    local spread_hours="$3"
    local base_message="$4"
    
    echo "🕰️ Creating $commit_count backdated commits over $spread_hours hours"
    
    # Convert base date to timestamp
    local base_timestamp
    if command -v gdate >/dev/null 2>&1; then
        base_timestamp=$(gdate -d "$base_date" +%s 2>/dev/null)
    elif date -d "$base_date" >/dev/null 2>&1; then
        base_timestamp=$(date -d "$base_date" +%s 2>/dev/null)
    else
        echo "❌ Cannot parse date for backdating"
        return 1
    fi
    
    if [ -z "$base_timestamp" ]; then
        echo "❌ Failed to convert date to timestamp"
        return 1
    fi
    
    # Create commits spread over the specified time range
    for i in $(seq 1 $commit_count); do
        # Calculate offset in seconds
        local hour_offset=$((i * spread_hours * 3600 / commit_count))
        local commit_timestamp=$((base_timestamp + hour_offset))
        
        # Convert back to ISO format
        local commit_date
        if command -v gdate >/dev/null 2>&1; then
            commit_date=$(gdate -d "@$commit_timestamp" -u +"%Y-%m-%dT%H:%M:%SZ")
        else
            commit_date=$(date -d "@$commit_timestamp" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -r $commit_timestamp -u +"%Y-%m-%dT%H:%M:%SZ")
        fi
        
        local message="$base_message (part $i/$commit_count)"
        
        echo "📝 Creating commit $i at $commit_date"
        
        # Set the commit date environment variables
        export GIT_AUTHOR_DATE="$commit_date"
        export GIT_COMMITTER_DATE="$commit_date"
        
        # Create an empty commit with the backdated timestamp
        if git commit --allow-empty -m "$message"; then
            echo "✅ Backdated commit $i created"
        else
            echo "❌ Failed to create backdated commit $i"
            unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE
            return 1
        fi
        
        # Clean up environment variables
        unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE
        
        # Small delay to avoid any potential issues
        sleep 0.1
    done
}

# Function to fix commit graph by rebasing with new dates
fix_commit_graph() {
    local target_date="$1"
    
    echo "🔧 Attempting to fix commit graph with proper dating..."
    
    # Get the commit hash of the last commit
    local last_commit=$(git rev-parse HEAD)
    
    if [ -z "$last_commit" ]; then
        echo "❌ No commits found to rebase"
        return 1
    fi
    
    # Convert target date to proper Git format
    local git_date=$(convert_to_git_date "$target_date")
    
    echo "🕰️ Setting commit date to: $git_date"
    
    # Use filter-branch to rewrite commit dates (more reliable than rebase for this)
    export FILTER_BRANCH_SQUELCH_WARNING=1
    
    git filter-branch -f --env-filter "
        export GIT_AUTHOR_DATE='$git_date'
        export GIT_COMMITTER_DATE='$git_date'
    " HEAD~1..HEAD
    
    if [ $? -eq 0 ]; then
        echo "✅ Commit graph dates updated successfully"
        return 0
    else
        echo "❌ Failed to update commit dates with filter-branch"
        
        # Fallback: try amend method
        echo "🔄 Trying amend method as fallback..."
        
        export GIT_AUTHOR_DATE="$git_date"
        export GIT_COMMITTER_DATE="$git_date"
        
        git commit --amend --no-edit --date="$git_date"
        local amend_result=$?
        
        unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE
        
        if [ $amend_result -eq 0 ]; then
            echo "✅ Commit date updated using amend method"
            return 0
        else
            echo "❌ All date fixing methods failed"
            return 1
        fi
    fi
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
        --backdate)
            BACKDATE_MODE=true
            shift
            ;;
        --multiple)
            MULTIPLE_COMMITS="$2"
            shift 2
            ;;
        --spread)
            SPREAD_HOURS="$2"
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
            echo "  -m, --message   Base commit message (auto-generated varied messages if not provided)"
            echo "  -t, --date      Start date for commits (format: YYYY-MM-DD or 'YYYY-MM-DD HH:MM:SS')"
            echo "  -p, --private   Create private repository (only for new repos)"
            echo "  -f, --force     Force commit even if no changes detected"
            echo "  --backdate      Enable advanced backdating for commit graph manipulation"
            echo "  --multiple N    Create N multiple commits with varied messages (default: 1)"
            echo "  --spread H      Time span in hours from start date to now (default: auto-calculated)"
            echo "  -h, --help      Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  GITHUB_TOKEN or TOKEN - GitHub personal access token (required)"
            echo ""
            echo "Examples:"
            echo "  $0 -r my-project --multiple 10 -t '2024-01-15'"
            echo "      # Creates 10 commits from Jan 15 to now with varied messages"
            echo ""
            echo "  $0 -r my-project --multiple 5 --spread 72 -t '2024-01-10'"
            echo "      # Creates 5 commits spread over 72 hours from Jan 10"
            echo ""
            echo "  $0 -r https://github.com/user/repo.git --multiple 3"
            echo "      # Creates 3 commits on existing repo from 3 days ago to now"
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
    if [ "$MULTIPLE_COMMITS" -gt 1 ]; then
        # For multiple commits, default to 3 days ago
        COMMIT_DATE=$(date -d "3 days ago" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || date -v-3d "+%Y-%m-%d %H:%M:%S")
        echo "⏰ Using default start date for multiple commits: $COMMIT_DATE"
    else
        COMMIT_DATE=$(date "+%Y-%m-%d %H:%M:%S")
        echo "⏰ Using current date: $COMMIT_DATE"
    fi
    GIT_COMMIT_DATE=$(convert_to_git_date "$COMMIT_DATE")
else
    GIT_COMMIT_DATE=$(convert_to_git_date "$COMMIT_DATE")
    echo "⏰ Using custom start date: $COMMIT_DATE"
    echo "📅 Git format: $GIT_COMMIT_DATE"
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

# Get project name for varied commit messages
PROJECT_NAME=$(basename "$TARGET_DIR")

# Determine if we need to commit or push
if [ "$staged_count" -gt 0 ] || [ "$FORCE_COMMIT" = true ]; then
    # Generate base commit message if not provided (used for first commit only)
    if [ -z "$COMMIT_MESSAGE" ]; then
        COMMIT_MESSAGE=$(generate_commit_message "$TARGET_DIR")
        echo "🤖 Auto-generated base commit message: $COMMIT_MESSAGE"
    else
        echo "📝 Using provided base commit message: $COMMIT_MESSAGE"
    fi

    if [ "$staged_count" -gt 0 ]; then
        # Show some of the files being committed
        echo "📋 Files to be committed (showing first 10):"
        git diff --cached --name-only | head -10
    fi

    # Handle multiple commits with improved distribution
    if [ "$MULTIPLE_COMMITS" -gt 1 ]; then
        echo "🔄 Creating $MULTIPLE_COMMITS commits with varied messages"
        
        # First, commit the actual changes with the first varied message
        if [ "$staged_count" -gt 0 ]; then
            # Use the first varied commit message
            FIRST_COMMIT_MSG=$(generate_varied_commit_message 1 "$MULTIPLE_COMMITS" "$COMMIT_MESSAGE" "$PROJECT_NAME")
            
            export GIT_AUTHOR_DATE="$GIT_COMMIT_DATE"
            export GIT_COMMITTER_DATE="$GIT_COMMIT_DATE"
            
            echo "📝 Creating initial commit with files: $FIRST_COMMIT_MSG"
            git commit -m "$FIRST_COMMIT_MSG"
            
            unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE
            
            if [ $? -ne 0 ]; then
                echo "❌ Initial commit failed"
                exit 1
            fi
            
            # Create additional commits with varied messages and proper date distribution
            if [ "$MULTIPLE_COMMITS" -gt 1 ]; then
                create_multiple_commits "$COMMIT_DATE" $((MULTIPLE_COMMITS - 1)) "$SPREAD_HOURS" "$COMMIT_MESSAGE" "$PROJECT_NAME"
            fi
        else
            # No files to commit, create all commits as empty commits with varied messages
            create_multiple_commits "$COMMIT_DATE" "$MULTIPLE_COMMITS" "$SPREAD_HOURS" "$COMMIT_MESSAGE" "$PROJECT_NAME"
        fi
        
    else
        # Single commit with proper dating
        export GIT_AUTHOR_DATE="$GIT_COMMIT_DATE"
        export GIT_COMMITTER_DATE="$GIT_COMMIT_DATE"
        
        if [ "$staged_count" -gt 0 ]; then
            git commit -m "$COMMIT_MESSAGE"
        else
            git commit --allow-empty -m "$COMMIT_MESSAGE"
        fi
        
        unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE

        if [ $? -ne 0 ]; then
            echo "❌ Commit failed"
            exit 1
        fi
        
        # Apply backdate fixing if requested
        if [ "$BACKDATE_MODE" = true ]; then
            echo "🕰️ Applying advanced backdating..."
            fix_commit_graph "$COMMIT_DATE"
        fi
    fi

    echo "✅ Commit(s) created successfully"
    
    # Show commit details with actual date
    echo "📋 Recent commits:"
    git --no-pager log -10 --format="%h - %s (%ci) [Author: %ai]"
    
elif [ "$unpushed_commits" -eq 0 ]; then
    echo "ℹ️ No changes to commit and no unpushed commits"
    echo "💡 Use --force (-f) flag to create an empty commit"
    
    # Clean up URL before exit
    CLEAN_URL=$(echo "$AUTH_URL" | sed "s|https://[^@]*@|https://|")
    git remote set-url origin "$CLEAN_URL"
    exit 0
fi

# Push changes with enhanced error handling
echo "🚀 Pushing to $BRANCH..."

# Set git timeout configurations
git config http.timeout 60
git config http.postBuffer 524288000

# Check if upstream exists
upstream_exists=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
remote_branch_exists=$(git ls-remote --heads origin "$BRANCH" 2>/dev/null | wc -l)

# Get updated count of unpushed commits
unpushed_commits=$(git rev-list --count origin/$current_branch..$current_branch 2>/dev/null || git rev-list --count $current_branch 2>/dev/null || echo "unknown")

# Try to get more details about what might be causing push failures
echo "🔍 Pre-push diagnostics..."
echo "  - Upstream exists: $([ -n "$upstream_exists" ] && echo "yes" || echo "no")"
echo "  - Remote branch exists: $([ "$remote_branch_exists" -gt 0 ] && echo "yes" || echo "no")"
echo "  - Local commits to push: $unpushed_commits"

# Force push if we've manipulated commit dates or created multiple commits
if [ "$BACKDATE_MODE" = true ] || [ "$MULTIPLE_COMMITS" -gt 1 ]; then
    echo "🔄 Using force push due to commit date manipulation..."
    FORCE_PUSH_FLAG="--force"
else
    FORCE_PUSH_FLAG=""
fi

if [ -z "$upstream_exists" ] || [ "$remote_branch_exists" -eq 0 ]; then
    echo "🚀 Setting upstream and pushing..."
    
    # Try push with verbose output
    if timeout 120 git push --set-upstream origin "$BRANCH" $FORCE_PUSH_FLAG --verbose; then
        echo "✅ Push with upstream successful!"
    else
        push_exit_code=$?
        echo "❌ Push failed with exit code: $push_exit_code"
        
        # Try to get more information about the failure
        echo "🔍 Attempting to diagnose push failure..."
        
        # Check if it's a file size issue
        echo "🔍 Checking for large files..."
        git ls-files | xargs ls -la 2>/dev/null | awk '{if ($5 > 50000000) print $9 " (" $5 " bytes)"}'
        
        # Check if remote still exists
        echo "🔍 Checking remote repository status..."
        if curl -s -f -H "Authorization: token $TOKEN" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME_FROM_URL" > /dev/null; then
            echo "✅ Remote repository is accessible"
        else
            echo "❌ Cannot access remote repository via API"
        fi
        
        # Try a different push method with force if needed
        echo "🔄 Trying alternative push method..."
        if timeout 120 git push origin "$BRANCH" $FORCE_PUSH_FLAG --verbose; then
            echo "✅ Alternative push successful!"
        else
            echo "❌ All push attempts failed"
            exit 1
        fi
    fi
else
    echo "🚀 Pushing to existing upstream..."
    if timeout 120 git push $FORCE_PUSH_FLAG --verbose; then
        echo "✅ Push successful!"
    else
        push_exit_code=$?
        echo "❌ Push failed with exit code: $push_exit_code"
        
        # If not already using force push, try it as last resort
        if [ -z "$FORCE_PUSH_FLAG" ]; then
            echo "⚠️ Trying force push (this might overwrite remote changes)..."
            if timeout 120 git push --force --verbose; then
                echo "✅ Force push successful!"
            else
                echo "❌ All push attempts failed"
                exit 1
            fi
        else
            echo "❌ Force push already attempted, all methods failed"
            exit 1
        fi
    fi
fi

# Clean up the URL (remove token for security)
echo "🔒 Cleaning up authentication from remote URL..."
CLEAN_URL=$(echo "$AUTH_URL" | sed "s|https://[^@]*@|https://|")
git remote set-url origin "$CLEAN_URL"

# Verify that commits appear correctly in the graph
echo "🔍 Verifying commit graph..."
echo "📋 Last 10 commits with timestamps:"
git --no-pager log -10 --graph --format="%h %s %ci %ai" --date-order

# Additional verification for multiple commits
if [ "$MULTIPLE_COMMITS" -gt 1 ]; then
    echo ""
    echo "🕰️ Multiple commits verification:"
    echo "Expected date range: $COMMIT_DATE → now"
    echo "Actual commit dates:"
    git --no-pager log -${MULTIPLE_COMMITS} --format="  %h: %s"
    git --no-pager log -${MULTIPLE_COMMITS} --format="     📅 %ci (committer) | %ai (author)"
    
    echo ""
    echo "💡 GitHub Graph Tips:"
    echo "  - Multiple commits create better graph presence and contribution activity"
    echo "  - Commit graph updates may take a few minutes to appear on GitHub"
    echo "  - GitHub shows commits based on the AUTHOR date, not committer date"
    echo "  - Private repos may not show contributions in your profile"
    echo "  - Check: https://github.com/$REPO_OWNER/$REPO_NAME_FROM_URL/graphs/commit-activity"
elif [ "$BACKDATE_MODE" = true ]; then
    echo ""
    echo "🕰️ Commit dating verification:"
    echo "Expected date: $COMMIT_DATE"
    echo "Actual commit dates:"
    git --no-pager log -1 --format="  %h: %ci (committer) | %ai (author)"
    
    echo ""
    echo "💡 GitHub Graph Tips:"
    echo "  - Commit graph updates may take a few minutes to appear"
    echo "  - GitHub shows commits based on the AUTHOR date, not committer date"
    echo "  - Private repos may not show contributions in your profile"
    echo "  - Check: https://github.com/$REPO_OWNER/$REPO_NAME_FROM_URL/graphs/commit-activity"
fi

echo ""
echo "🎉 Operation completed successfully!"
echo "🌐 Repository: $REPO_URL"
echo "📊 Total commits in branch: $(git rev-list --count $current_branch 2>/dev/null || echo "unknown")"
echo "📈 Commits created this session: $MULTIPLE_COMMITS"
echo "⏰ Date range: $COMMIT_DATE → $(date '+%Y-%m-%d %H:%M')"

# Show final status
echo "📋 Final git status:"
git status -sb

echo ""
echo "🔍 To verify the commit graph on GitHub:"
echo "  1. Visit: https://github.com/$REPO_OWNER/$REPO_NAME_FROM_URL"
echo "  2. Check the commit graph: https://github.com/$REPO_OWNER/$REPO_NAME_FROM_URL/graphs/commit-activity"
echo "  3. View contribution insights: https://github.com/$REPO_OWNER/$REPO_NAME_FROM_URL/pulse"
echo "  4. Check your profile contributions: https://github.com/$REPO_OWNER"

if [ "$MULTIPLE_COMMITS" -gt 1 ] || [ "$BACKDATE_MODE" = true ]; then
    echo ""
    echo "⚠️ Important Notes:"
    echo "  - Ensure your email ($USER_EMAIL) matches your GitHub account for contributions to show"
    echo "  - Public repositories are required for contributions to appear in your profile"
    echo "  - Wait 5-10 minutes for GitHub to process and display the changes"
    echo "  - Multiple commits with varied messages create more realistic activity patterns"
    echo "  - Date distribution from past to present simulates natural development workflow"
fi