# Advanced GitHub Push Script (ad.sh)

An enhanced GitHub push script with advanced commit graph manipulation capabilities.

## Features

- Create new or use existing GitHub repositories
- Support for multiple commits with varied messages
- Advanced commit date manipulation
- Smart commit message generation
- Private/Public repository support
- Robust error handling and debugging
- Support for Windows and Unix paths

## Usage

```bash
./ad.sh [OPTIONS]
```

### Options

- `-d, --dir` : Target directory (default: current directory)
- `-r, --repo` : Repository name or full URL
  - Just name: creates new repo (e.g., 'my-project')
  - Full URL: uses existing repo (e.g., 'https://github.com/user/repo.git')
- `-m, --message` : Base commit message (auto-generated varied messages if not provided)
- `-t, --date` : Start date for commits (format: YYYY-MM-DD or 'YYYY-MM-DD HH:MM:SS')
- `-p, --private` : Create private repository (only for new repos)
- `-f, --force` : Force commit even if no changes detected
- `--backdate` : Enable advanced backdating for commit graph manipulation
- `--multiple N` : Create N multiple commits with varied messages (default: 1)
- `--spread H` : Time span in hours from start date to now (default: auto-calculated)
- `-h, --help` : Show help message

### Environment Variables

- `GITHUB_TOKEN` or `TOKEN` - GitHub personal access token (required)

## Examples

1. Create new repository with multiple commits:
```bash
./ad.sh -r my-project --multiple 10 -t '2024-01-15'
```

2. Spread commits over time period:
```bash
./ad.sh -r my-project --multiple 5 --spread 72 -t '2024-01-10'
```

3. Use existing repository:
```bash
./ad.sh -r https://github.com/user/repo.git --multiple 3
```

## Notes

- For commit graph manipulation, the script uses both author and committer dates
- Multiple commits include varied, realistic-looking commit messages
- Token requires 'repo' scope for repository operations
- Private repositories may not show in GitHub contribution graph
