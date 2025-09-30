# Advanced GitHub Repository Management (adv.sh)

A script for managing GitHub repositories with enhanced commit control and backdating capabilities.

## Features

- Repository creation and management
- Advanced commit date manipulation
- Multiple commit generation
- Customizable commit messages
- Robust error handling
- GitHub API integration
- Cross-platform support

## Usage

```bash
./adv.sh [OPTIONS]
```

### Options

- `-d, --dir` : Target directory (default: current directory)
- `-r, --repo` : Repository name or full URL
- `-m, --message` : Commit message (auto-generated if not provided)
- `-t, --date` : Commit date (format: YYYY-MM-DD or 'YYYY-MM-DD HH:MM:SS')
- `-p, --private` : Create private repository
- `-f, --force` : Force commit even if no changes detected
- `--backdate` : Enable advanced backdating
- `--multiple N` : Create N multiple commits for better graph presence
- `--spread H` : Spread multiple commits over H hours
- `-h, --help` : Show help message

### Environment Variables

- `GITHUB_TOKEN` or `TOKEN` - GitHub personal access token (required)

## Examples

1. Basic repository creation:
```bash
./adv.sh -r my-new-project
```

2. Backdate commits:
```bash
./adv.sh -r my-project -t '2024-01-15' --backdate
```

3. Multiple commits with time spread:
```bash
./adv.sh -r my-project --multiple 5 --spread 24
```

## Important Notes

- Ensure your GitHub token has appropriate permissions
- Private repositories won't show in public contribution graphs
- Wait a few minutes for GitHub to process commit graph changes
- Author email must match GitHub account for contributions to show
