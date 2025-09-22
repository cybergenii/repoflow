# Simple Push Script (simp_push.sh)

A lightweight script for quickly pushing changes to an existing GitHub repository.

## Features

- Minimal configuration required
- Automatic token handling
- Smart push strategy selection
- Repository status checking
- Secure credential management

## Usage

```bash
./simp_push.sh [directory] [token]
```

### Arguments

1. `directory` : Target directory (default: current directory)
2. `token` : GitHub personal access token (can also be set via GITHUB_TOKEN environment variable)

## Examples

1. Push from current directory using environment token:
```bash
export GITHUB_TOKEN=your_token_here
./simp_push.sh
```

2. Push from specific directory with token:
```bash
./simp_push.sh /path/to/repo your_token_here
```

## Features in Detail

### Automatic Push Strategy
- Tries regular push first
- Falls back to upstream setup if needed
- Uses force push as last resort
- Handles new and existing branches

### Status Checking
- Verifies git repository status
- Counts unpushed commits
- Checks remote branch existence
- Displays repository information

### Security
- Secure token handling
- Cleans up authentication after push
- No permanent token storage

## Important Notes

- Requires existing git repository
- Must have remote 'origin' configured
- Token must have push permissions
- Handles unpushed commits automatically
- Cleans up authentication information

## Error Handling

- Validates directory existence
- Checks git repository status
- Verifies remote configuration
- Reports detailed error messages
- Multiple push attempt strategies
