# Command Conflict Resolution

## Problem
There are two different versions of the `repoflow` command installed:
1. **Rust version** (`repoflow.exe`) - installed via Python/pip
2. **NPM version** (`repoflow.cmd`) - installed via npm

The Rust version takes precedence in the PATH, causing the npm version's `ui` command to be unavailable.

## Solutions

### Option 1: Use Different Binary Names (Recommended)
The npm package now uses `repoflow-js` instead of `repoflow`:

```bash
# Use the npm version
repoflow-js --help
repoflow-js ui --port 3001
repoflow-js config
repoflow-js create my-repo
```

### Option 2: Use Full Path
```bash
# Use full path to npm version
& "C:\Users\cybergenii\AppData\Roaming\npm\repoflow.cmd" ui --port 3001
& "C:\Users\cybergenii\AppData\Roaming\npm\repoflow.cmd" --help
```

### Option 3: Create PowerShell Alias
Add this to your PowerShell profile:
```powershell
Set-Alias repoflow-js "C:\Users\cybergenii\AppData\Roaming\npm\repoflow.cmd"
```

### Option 4: Uninstall Conflicting Version
```bash
# Uninstall the Rust version (if not needed)
pip uninstall repoflow

# Or uninstall the npm version (if not needed)
npm uninstall -g repoflow
```

## Available Commands

### NPM Version (repoflow-js)
- `repoflow-js ui` - Start web UI server
- `repoflow-js config` - Configure settings
- `repoflow-js create` - Create repository
- `repoflow-js push` - Push changes
- `repoflow-js status` - Show status
- `repoflow-js interactive` - Interactive mode

### Rust Version (repoflow)
- `repoflow config` - Configure settings
- `repoflow create` - Create repository
- `repoflow push` - Push changes
- `repoflow status` - Show status
- `repoflow interactive` - Interactive mode
- `repoflow ui` - Start web UI server (if implemented)

## Recommendation
Use `repoflow-js` for the full-featured npm version with web UI support.
