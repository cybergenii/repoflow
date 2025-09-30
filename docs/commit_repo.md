# Commit Repository Script (commit_repo.sh)

A script for pushing changes to an existing GitHub repository with improved date handling and remote setup.

## Features

- Custom commit date support
- Automatic git repository initialization
- Secure token handling
- Path compatibility for Windows and Unix
- Nested .git directory cleanup
- Flexible branch management
- Enhanced error handling and debugging
- Environment-based configuration

## Usage

```bash
./commit_repo.sh [OPTIONS]
```

### Options

- `-d, --dir` : Target directory (default: current directory)
- `-r, --repo` : Repository URL (https://github.com/user/repo.git)
- `-m, --message` : Commit message
- `-t, --date` : Commit date (format: YYYY-MM-DD or 'YYYY-MM-DD HH:MM:SS')
- `-b, --branch` : Branch name (default: main)
- `-h, --help` : Show help message

### Environment Variables

Required environment variables:
```bash
# Git credentials
export GIT_USER_NAME="Your Name"
export GIT_USER_EMAIL="your@email.com"

# GitHub authentication
export GITHUB_TOKEN="your_token_here"

# Optional: Repository URL (can also be provided via -r option)
export REPO_URL="https://github.com/username/repo.git"
```

## Examples

1. Basic setup and commit:
```bash
# Set up environment variables
export GIT_USER_NAME="Your Name"
export GIT_USER_EMAIL="your@email.com"
export GITHUB_TOKEN="your_token_here"

# Basic commit
./commit_repo.sh -r https://github.com/user/repo.git -m "Update files"
```

2. Commit with specific date and branch:
```bash
./commit_repo.sh -r https://github.com/user/repo.git -m "Fix bugs" -t "2024-01-15 14:30:00" -b feature-branch
```

3. Commit from specific directory with custom branch:
```bash
./commit_repo.sh -d ./my-project -r https://github.com/user/repo.git -m "Project update" -b develop
```

4. Using environment variable for repository URL:
```bash
export REPO_URL="https://github.com/user/repo.git"
./commit_repo.sh -m "Quick update" -b main
```

## Important Notes

- Requires GitHub personal access token
- Automatically handles branch creation and tracking
- Supports Windows and Unix paths
- Includes automatic nested .git cleanup
- Verifies remote connection before pushing
