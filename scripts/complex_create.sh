#!/bin/bash

# GitHub Push Script with Repository Creation
# Usage: ./push_to_repo.sh [OPTIONS]

# Default values
REPO_NAME=""
OWNER=""
TOKEN=""
BRANCH="main"
COMMIT_MESSAGE=""
USER_NAME=""
USER_EMAIL=""
LOCAL_DIR=""
PRIVATE_REPO=false
CREATE_REPO=false

# Function to display usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -n, --name NAME         Repository name"
    echo "  -o, --owner OWNER       Repository owner (GitHub username)"
    echo "  -t, --token TOKEN       Personal Access Token"
    echo "  -b, --branch BRANCH     Branch to push to (default: main)"
    echo "  -m, --message MSG       Commit message"
    echo "  -u, --user NAME         Git user name for commits"
    echo "  -e, --email EMAIL       Git user email for commits"
    echo "  -d, --dir DIRECTORY     Local directory to push (default: current directory)"
    echo "  -p, --private           Create private repository"
    echo "  -c, --create            Create repository if it doesn't exist"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  # Create new repo and push current directory"
    echo "  $0 -n my-repo -o username -t ghp_xxx -m \"Initial commit\" -u \"John Doe\" -e \"john@example.com\" -c"
    echo ""
    echo "  # Push to existing repo"
    echo "  $0 -n existing-repo -o username -t ghp_xxx -m \"Update files\" -d ./my-project"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            REPO_NAME="$2"
            shift 2
            ;;
        -o|--owner)
            OWNER="$2"
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
        -u|--user)
            USER_NAME="$2"
            shift 2
            ;;
        -e|--email)
            USER_EMAIL="$2"
            shift 2
            ;;
        -d|--dir)
            LOCAL_DIR="$2"
            shift 2
            ;;
        -p|--private)
            PRIVATE_REPO=true
            shift
            ;;
        -c|--create)
            CREATE_REPO=true
            shift
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

# Set default directory to current if not specified
if [[ -z "$LOCAL_DIR" ]]; then
    LOCAL_DIR="$(pwd)"
fi

# Validation
if [[ -z "$TOKEN" ]]; then
    echo "Error: Token is required (-t or --token)"
    exit 1
fi

if [[ -z "$REPO_NAME" ]]; then
    echo "Error: Repository name is required (-n or --name)"
    exit 1
fi

if [[ -z "$OWNER" ]]; then
    echo "Error: Repository owner is required (-o or --owner)"
    exit 1
fi

if [[ -z "$COMMIT_MESSAGE" ]]; then
    echo "Error: Commit message is required (-m or --message)"
    exit 1
fi

# Function to check if repository exists
check_repo_exists() {
    local owner=$1
    local repo=$2
    local token=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: token $token" \
        "https://api.github.com/repos/$owner/$repo")
    
    if [[ "$response" == "200" ]]; then
        return 0  # Repository exists
    else
        return 1  # Repository doesn't exist
    fi
}

# Function to create repository
create_repository() {
    local owner=$1
    local repo=$2
    local token=$3
    local is_private=$4
    
    echo "🏗️ Creating repository $owner/$repo..."
    
    # Prepare JSON payload
    local privacy="false"
    if [[ "$is_private" == true ]]; then
        privacy="true"
    fi
    
    local json_payload="{\"name\":\"$repo\",\"private\":$privacy,\"auto_init\":false}"
    
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Authorization: token $token" \
        -H "Accept: application/vnd.github.v3+json" \
        -d "$json_payload" \
        "https://api.github.com/user/repos")
    
    http_code="${response: -3}"
    
    if [[ "$http_code" == "201" ]]; then
        echo "✅ Repository created successfully!"
        return 0
    else
        echo "❌ Failed to create repository. HTTP Code: $http_code"
        echo "Response: ${response%???}"
        return 1
    fi
}

# Function to setup git credentials
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

# Function to initialize git repository
init_git_repo() {
    local dir=$1
    
    cd "$dir"
    
    if [[ ! -d ".git" ]]; then
        echo "📁 Initializing git repository..."
        git init
        
        # Create initial branch
        git checkout -b "$BRANCH" 2>/dev/null || git branch -M "$BRANCH"
    fi
    
    setup_git_config "$dir"
}

# Main execution
echo "🚀 Starting GitHub push process..."
echo "📍 Local directory: $LOCAL_DIR"
echo "📍 Target repository: $OWNER/$REPO_NAME"

# Check if local directory exists
if [[ ! -d "$LOCAL_DIR" ]]; then
    echo "Error: Local directory $LOCAL_DIR does not exist"
    exit 1
fi

# Check if repository exists
if check_repo_exists "$OWNER" "$REPO_NAME" "$TOKEN"; then
    echo "✅ Repository $OWNER/$REPO_NAME already exists"
else
    echo "ℹ️ Repository $OWNER/$REPO_NAME does not exist"
    
    if [[ "$CREATE_REPO" == true ]]; then
        if ! create_repository "$OWNER" "$REPO_NAME" "$TOKEN" "$PRIVATE_REPO"; then
            exit 1
        fi
        # Wait a moment for repository to be fully created
        sleep 2
    else
        echo "❌ Repository doesn't exist. Use -c or --create to create it automatically."
        exit 1
    fi
fi

# Initialize git in local directory
init_git_repo "$LOCAL_DIR"

# Create repository URL with authentication
REPO_URL="https://$TOKEN@github.com/$OWNER/$REPO_NAME.git"

# Add remote origin
echo "🔗 Setting up remote origin..."
if git remote get-url origin &>/dev/null; then
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi

# Check if there are any files to commit
if [[ -z "$(ls -A . | grep -v '^\.git$')" ]]; then
    echo "ℹ️ Directory is empty, creating README.md"
    echo "# $REPO_NAME" > README.md
fi

# Add all files
echo "📝 Adding files..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "ℹ️ No changes to commit"
else
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "$COMMIT_MESSAGE"
    
    # Push to repository
    echo "🔄 Pushing to $BRANCH..."
    git push -u origin "$BRANCH"
    
    if [[ $? -eq 0 ]]; then
        echo "✅ Successfully pushed to https://github.com/$OWNER/$REPO_NAME"
    else
        echo "❌ Failed to push changes"
        exit 1
    fi
fi

# Clean up token from remote URL for security
CLEAN_URL="https://github.com/$OWNER/$REPO_NAME.git"
git remote set-url origin "$CLEAN_URL"

echo "🎉 Process completed successfully!"
echo "🌐 Repository URL: https://github.com/$OWNER/$REPO_NAME"