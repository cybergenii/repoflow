# RepoFlow Project Structure

This document outlines the organized structure of the RepoFlow project.

## 📁 Directory Structure

```
repoflow/
├── 📁 config/                    # Configuration files
│   └── tsconfig.json            # TypeScript configuration
├── 📁 docs/                     # Documentation files
│   ├── ad.md                   # Advanced directory script docs
│   ├── adv.md                  # Advanced script docs
│   ├── commit_repo.md          # Commit repository script docs
│   ├── complex_commit.md       # Complex commit script docs
│   ├── complex_create.md       # Complex create script docs
│   ├── create_repo.md          # Create repository script docs
│   └── simp_push.md            # Simple push script docs
├── 📁 examples/                 # Example scripts and usage
│   ├── run-examples.bat        # Windows example runner
│   └── run-examples.sh         # Unix example runner
├── 📁 scripts/                  # All shell and batch scripts
│   ├── ad.sh                   # Advanced directory script
│   ├── adv.sh                  # Advanced repository management
│   ├── commit_repo.sh          # Commit repository script
│   ├── complex_commit.sh       # Complex commit operations
│   ├── complex_create.sh       # Complex repository creation
│   ├── create_repo.sh          # Simple repository creation
│   ├── create-release.bat      # Windows release creation
│   ├── create-release.js       # Node.js release creation
│   ├── create-release.sh       # Unix release creation
│   ├── diagnose.sh             # System diagnosis script
│   ├── repoflow-js.ps1         # PowerShell alias script
│   └── simp_push.sh            # Simple push operations
├── 📁 src/                      # Source code
│   ├── 📁 __tests__/           # Test files
│   ├── 📁 repoflow/            # Python package
│   ├── 📁 services/            # TypeScript services
│   ├── 📁 types/               # TypeScript type definitions
│   ├── 📁 utils/               # Utility functions
│   ├── cli.ts                  # Main CLI application
│   ├── ui-server.ts            # Web UI server
│   └── *.rs                    # Rust source files
├── 📁 tests/                    # Python test files
├── 📁 ui/                       # React web UI
│   ├── 📁 src/                 # React source code
│   ├── 📁 dist/                # Built UI assets
│   └── package.json            # UI dependencies
├── 📁 dist/                     # Compiled TypeScript output
├── 📁 target/                   # Rust build output
├── 📁 node_modules/             # Node.js dependencies
├── 📄 package.json              # Node.js package configuration
├── 📄 pyproject.toml            # Python package configuration
├── 📄 Cargo.toml                # Rust package configuration
├── 📄 README.md                 # Main project documentation
├── 📄 TERMINAL_USAGE.md         # Terminal usage guide
├── 📄 COMMAND_CONFLICT_RESOLUTION.md # Command conflict resolution
├── 📄 RELEASE_GUIDE.md          # Release creation guide
└── 📄 .gitignore               # Git ignore rules
```

## 🎯 Organization Principles

### 1. **Scripts Folder** (`/scripts/`)
- All shell scripts (`.sh`)
- All batch files (`.bat`)
- All PowerShell scripts (`.ps1`)
- All build and release scripts

### 2. **Documentation Folder** (`/docs/`)
- Individual script documentation
- Feature documentation
- Usage guides

### 3. **Examples Folder** (`/examples/`)
- Example usage scripts
- Demo files
- Tutorial materials

### 4. **Configuration Folder** (`/config/`)
- TypeScript configuration
- Build configurations
- Environment files

### 5. **Source Code** (`/src/`)
- TypeScript source files
- Python package
- Rust source files
- Organized by language and purpose

## 🔧 Build Configuration Updates

The build system has been updated to work with the new structure:

- **TypeScript**: Uses `config/tsconfig.json`
- **Build Script**: `tsc --project config/tsconfig.json`
- **Development**: `tsc -w --project config/tsconfig.json`

## 📋 Benefits of This Structure

1. **Clarity**: Easy to find specific types of files
2. **Maintainability**: Related files are grouped together
3. **Scalability**: Easy to add new files in appropriate locations
4. **Professional**: Follows industry best practices
5. **Documentation**: Clear separation of docs and code

## 🚀 Usage

All scripts can now be found in the `scripts/` folder:

```bash
# Run advanced script
./scripts/adv.sh

# Run examples
./examples/run-examples.sh

# Build project
npm run build
```

This structure makes the project more professional and easier to navigate!
