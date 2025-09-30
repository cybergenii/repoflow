# Complex Create Script (complex_create.sh)

A script for creating and managing GitHub repositories with advanced configuration options.

## Features

- Repository creation and initialization
- Public/Private repository support
- Custom git configuration
- Directory management
- Secure token handling
- Automatic README generation
- Comprehensive error handling

## Usage

```bash
./complex_create.sh [OPTIONS]
```

### Options

- `-n, --name NAME` : Repository name
- `-o, --owner OWNER` : Repository owner (GitHub username)
- `-t, --token TOKEN` : Personal Access Token
- `-b, --branch BRANCH` : Branch to push to (default: main)
- `-m, --message MSG` : Commit message
- `-u, --user NAME` : Git user name for commits
- `-e, --email EMAIL` : Git user email for commits
- `-d, --dir DIRECTORY` : Local directory to push (default: current directory)
- `-p, --private` : Create private repository
- `-c, --create` : Create repository if it doesn't exist
- `-h, --help` : Show help message

## Examples

1. Create new public repository and push current directory:
```bash
./complex_create.sh -n my-repo -o username -t ghp_token -m "Initial commit" -u "John Doe" -e "john@example.com" -c
```

2. Create private repository:
```bash
./complex_create.sh -n private-repo -o username -t ghp_token -m "Initial commit" -u "John Doe" -e "john@example.com" -c -p
```

3. Push specific directory to new repo:
```bash
./complex_create.sh -n project-repo -o username -t ghp_token -m "Project files" -d ./my-project -c
```

## Features in Detail

### Repository Management
- Automatic repository creation
- Public/Private visibility control
- Repository existence checking
- Custom branch naming

### Git Operations
- Local repository initialization
- Remote origin configuration
- Automatic README creation for empty repos
- Branch tracking setup

### Security
- Secure token handling
- Clean URL management
- Token cleanup after operations

## Important Notes

- Token must have appropriate permissions
- Owner (username) must be specified
- Repository name is required
- Supports both new and existing repositories
- Automatically creates README.md for empty directories
- Cleans up authentication information after pushing
