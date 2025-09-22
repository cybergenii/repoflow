# Complex Commit Script (complex_commit.sh)

A comprehensive GitHub repository management script with robust error handling and configuration options.

## Features

- Flexible repository handling (new or existing)
- Custom git configuration per repository
- Secure token management
- Branch configuration
- Detailed error reporting
- Repository validation

## Usage

```bash
./complex_commit.sh [OPTIONS]
```

### Options

- `-r, --repo URL` : GitHub repository URL (https://github.com/user/repo.git)
- `-t, --token TOKEN` : Personal Access Token
- `-b, --branch BRANCH` : Branch to push to (default: main)
- `-m, --message MSG` : Commit message
- `-n, --name NAME` : Git user name for commits
- `-e, --email EMAIL` : Git user email for commits
- `-d, --dir DIRECTORY` : Repository directory (if already cloned)
- `-h, --help` : Show help message

## Examples

1. Push to existing repository:
```bash
./complex_commit.sh -r https://github.com/user/repo.git -t ghp_token -m "Update files" -n "John Doe" -e "john@example.com"
```

2. Use existing local directory:
```bash
./complex_commit.sh -d ./existing-repo -t ghp_token -m "Fix bugs"
```

3. Specify custom branch:
```bash
./complex_commit.sh -r https://github.com/user/repo.git -t ghp_token -m "Feature update" -b "feature-branch"
```

## Important Notes

- Token is required for all operations
- Either repository URL (-r) or directory (-d) must be provided
- Commit message is mandatory
- Script automatically handles cloning if using URL
- Cleans up authentication tokens after operations
- Validates repository existence before operations
