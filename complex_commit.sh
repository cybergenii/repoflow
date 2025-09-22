#!/bin/bash

# GitHub Push Script
# Usage: ./push_to_repo.sh [OPTIONS]

# Default values
REPO_URL=""
TOKEN=""
BRANCH="main"
COMMIT_MESSAGE=""
USER_NAME=""
USER_EMAIL=""
REPO_DIR=""

# Function to display usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -r, --repo URL          GitHub repository URL (https://github.com/user/repo.git)"
    echo "  -t, --token TOKEN       Personal Access Token"
    echo "  -b, --branch BRANCH     Branch to push to (default: main)"
    echo "  -m, --message MSG       Commit message"
    echo "  -n, --name NAME         Git user name for commits"
    echo "  -e, --email EMAIL       Git user email for commits"
    echo "  -d, --dir DIRECTORY     Repository directory (if already cloned)"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -r https://github.com/user/repo.git -t ghp_xxx -m \"Update files\" -n \"John Doe\" -e \"john@example.com\""
    echo "  $0 -d ./existing-repo -t ghp_xxx -m \"Fix bugs\""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--repo)
            REPO_URL="$2"
            shift 2
            ;;
        -t|--token)
            TOKEN="$2"
            shift 2
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -m|--message)
            COMMIT_MESSAGE="$2"
            shift 2
            ;;
        -n|--name)
            USER_NAME="$2"
            shift 2
            ;;
        -e|--email)
            USER_EMAIL="$2"
            shift 2
            ;;
        -d|--dir)
            REPO_DIR="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validation
if [[ -z "$TOKEN" ]]; then
    echo "Error: Token is required (-t or --token)"
    exit 1
fi

if [[ -z "$REPO_DIR" && -z "$REPO_URL" ]]; then
    echo "Error: Either repository URL (-r) or directory (-d) is required"
    exit 1
fi

if [[ -z "$COMMIT_MESSAGE" ]]; then
    echo "Error: Commit message is required (-m or --message)"
    exit 1
fi

# Function to setup git credentials for the repository
setup_git_config() {
    local dir=$1
    
    if [[ -n "$USER_NAME" ]]; then
        echo "Setting git user.name to: $USER_NAME"
        git -C "$dir" config user.name "$USER_NAME"
    fi
    
    if [[ -n "$USER_EMAIL" ]]; then
        echo "Setting git user.email to: $USER_EMAIL"
        git -C "$dir" config user.email "$USER_EMAIL"
    fi
}

# Function to extract repo info from URL
extract_repo_info() {
    local url=$1
    # Remove .git suffix if present
    url=${url%.git}
    # Extract username/repo from URL
    echo "$url" | sed 's|https://github.com/||'
}

# Main execution
if [[ -n "$REPO_DIR" ]]; then
    # Use existing directory
    if [[ ! -d "$REPO_DIR" ]]; then
        echo "Error: Directory $REPO_DIR does not exist"
        exit 1
    fi
    
    if [[ ! -d "$REPO_DIR/.git" ]]; then
        echo "Error: $REPO_DIR is not a git repository"
        exit 1
    fi
    
    WORK_DIR="$REPO_DIR"
    echo "Using existing repository: $WORK_DIR"
    
else
    # Clone repository
    if [[ -z "$REPO_URL" ]]; then
        echo "Error: Repository URL is required when not using existing directory"
        exit 1
    fi
    
    # Extract repository name for directory
    REPO_INFO=$(extract_repo_info "$REPO_URL")
    REPO_NAME=$(basename "$REPO_INFO")
    WORK_DIR="./$REPO_NAME"
    
    # Create authenticated URL
    AUTH_URL=$(echo "$REPO_URL" | sed "s|https://|https://$TOKEN@|")
    
    echo "Cloning repository: $REPO_URL"
    
    # Remove existing directory if it exists
    if [[ -d "$WORK_DIR" ]]; then
        echo "Removing existing directory: $WORK_DIR"
        rm -rf "$WORK_DIR"
    fi
    
    git clone "$AUTH_URL" "$WORK_DIR"
    if [[ $? -ne 0 ]]; then
        echo "Error: Failed to clone repository"
        exit 1
    fi
fi

# Setup git configuration
setup_git_config "$WORK_DIR"

# Check if there are changes to commit
cd "$WORK_DIR"
if git diff --quiet && git diff --cached --quiet; then
    echo "No changes to commit"
    exit 0
fi

# Add all changes
echo "Adding changes..."
git add .

# Commit changes
echo "Committing changes with message: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

if [[ $? -ne 0 ]]; then
    echo "Error: Failed to commit changes"
    exit 1
fi

# Push changes
echo "Pushing to branch: $BRANCH"

# Create authenticated remote URL if we're working with existing repo
if [[ -n "$REPO_DIR" ]]; then
    # Get the current remote URL
    CURRENT_REMOTE=$(git remote get-url origin)
    if [[ -n "$CURRENT_REMOTE" ]]; then
        # Create authenticated URL
        AUTH_URL=$(echo "$CURRENT_REMOTE" | sed "s|https://|https://$TOKEN@|")
        git remote set-url origin "$AUTH_URL"
    fi
fi

git push origin "$BRANCH"

if [[ $? -eq 0 ]]; then
    echo "✅ Successfully pushed changes to $BRANCH"
else
    echo "❌ Failed to push changes"
    exit 1
fi

# Clean up authentication from remote URL for security
if [[ -n "$REPO_DIR" ]]; then
    CLEAN_URL=$(echo "$AUTH_URL" | sed "s|https://$TOKEN@|https://|")
    git remote set-url origin "$CLEAN_URL"
    echo "Cleaned up authentication from remote URL"
fi

echo "Script completed successfully!"