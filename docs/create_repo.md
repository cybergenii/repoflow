# Create Repository Script (create_repo.sh)

An enhanced GitHub repository creation and push script with smart commit messages and date handling.

## Features

- Automatic repository creation
- Smart commit message generation
- Advanced date handling
- Cross-platform path support
- Enhanced error handling
- GitHub API integration
- Secure token management

## Usage

```bash
./create_repo.sh [OPTIONS]
```

### Options

- `-d, --dir` : Target directory (default: current directory)
- `-r, --repo` : Repository name or full URL
  - Just name: creates new repo (e.g., 'my-project')
  - Full URL: uses existing repo (e.g., 'https://github.com/user/repo.git')
- `-m, --message` : Commit message (auto-generated if not provided)
- `-t, --date` : Commit date (format: YYYY-MM-DD or 'YYYY-MM-DD HH:MM:SS')
- `-p, --private` : Create private repository (only for new repos)
- `-f, --force` : Force commit even if no changes detected
- `-b, --branch` : Branch name (default: main)
- `-h, --help` : Show help message

### Environment Variables

Required environment variables:
- `GIT_USER_NAME` : Git user name for commits
- `GIT_USER_EMAIL` : Git user email for commits
- `GITHUB_TOKEN` or `TOKEN` : GitHub personal access token

Example setup:
```bash
export GIT_USER_NAME="Your Name"
export GIT_USER_EMAIL="your@email.com"
export GITHUB_TOKEN="your_token_here"
```

## Examples

1. Basic setup and repository creation:
```bash
# Set up environment variables
export GIT_USER_NAME="Your Name"
export GIT_USER_EMAIL="your@email.com"
export GITHUB_TOKEN="your_token_here"

# Create new repository
./create_repo.sh -r my-new-project
```

2. Create private repository with custom branch:
```bash
./create_repo.sh -d /path/to/project -r my-project -p -b develop
```

3. Use existing repository with specific branch:
```bash
./create_repo.sh -r https://github.com/user/repo.git -b main
```

4. Create repository with custom commit date:
```bash
./create_repo.sh -r my-project -t "2024-01-15 14:30:00" -b feature-branch
```

## Features in Detail

### Smart Commit Messages
- Auto-generates meaningful commit messages based on changes
- Includes emoji indicators for different types of changes
- Shows file statistics in commit messages

### Date Handling
- Supports custom commit dates
- Handles multiple date formats
- Automatic timezone conversion
- ISO 8601 compliance

### Error Handling
- Repository connectivity checks
- Token permission validation
- Comprehensive error messages
- Network issue detection

## Important Notes

- Requires GitHub personal access token
- Token must have 'repo' scope for repository operations
- Supports both Windows and Unix paths
- Automatically handles nested .git directories
- Includes built-in security measures for token handling
