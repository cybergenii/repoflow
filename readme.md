# GitHub Repository Management Scripts

A collection of Bash scripts for advanced GitHub repository management and commit manipulation.

## Available Scripts

### 1. [Advanced GitHub Push Script (ad.sh)](docs/ad.md)
- Enhanced GitHub push script with advanced commit graph manipulation
- Support for multiple commits with varied messages
- Smart commit message generation
- Advanced date manipulation features

### 2. [Advanced Repository Management (adv.sh)](docs/adv.md)
- Repository creation and management
- Commit backdating capabilities
- Multiple commit generation
- Enhanced error handling and debugging

### 3. [Commit Repository Script (commit_repo.sh)](docs/commit_repo.md)
- Custom commit date support
- Automatic git repository initialization
- Path compatibility for Windows and Unix
- Enhanced error handling and debugging

### 4. [Complex Commit Script (complex_commit.sh)](docs/complex_commit.md)
- Flexible repository handling
- Custom git configuration per repository
- Secure token management
- Detailed error reporting

### 5. [Complex Create Script (complex_create.sh)](docs/complex_create.md)
- Repository creation and initialization
- Public/Private repository support
- Automatic README generation
- Comprehensive error handling

### 6. [Create Repository Script (create_repo.sh)](docs/create_repo.md)
- Automatic repository creation
- Smart commit message generation
- Advanced date handling
- Cross-platform path support

### 7. [Simple Push Script (simp_push.sh)](docs/simp_push.md)
- Minimal configuration required
- Automatic token handling
- Smart push strategy selection
- Quick and efficient for simple pushes

## General Setup

1. Make scripts executable:
```bash
chmod +x *.sh
```

2. Set up GitHub token:
```bash
export GITHUB_TOKEN=your_token_here
# or
export TOKEN=your_token_here
```

## Quick Start Examples

### Creating a New Repository
```bash
# Create and push to a new repository
./ad.sh -r my-new-repo -m "Initial commit"

# Create a private repository
./ad.sh -r private-repo -p -m "Initial setup"
```

### Multiple Commits and Backdating
```bash
# Create 5 commits spread over 2 days
./ad.sh -r my-repo -t "2024-01-15" --multiple 5 --spread 48

# Backdate a single commit
./ad.sh -r my-repo -t "2024-01-15" --backdate

# Backdate with custom message
./ad.sh -r my-repo -t "2024-01-15 14:30:00" -m "Updated project" --backdate
```

## Important Notes

- All scripts require a GitHub personal access token with appropriate permissions
- Private repositories won't show in public contribution graphs
- Author email in commits must match GitHub account for contributions to show
- Allow a few minutes for GitHub to process commit graph changes

## Documentation

- [Advanced GitHub Push Script Documentation](docs/ad.md)
- [Advanced Repository Management Documentation](docs/adv.md)

## Requirements

- Git installed and configured
- GitHub account and personal access token
- Bash shell (Git Bash on Windows)
- curl for API requests
- Basic understanding of Git and GitHub

## Contributing

Feel free to submit issues and enhancement requests!