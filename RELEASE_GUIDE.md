# 🚀 RepoFlow Release Guide

This guide explains how to create releases for RepoFlow with appropriate downloads for different platforms.

## 📋 Prerequisites

Before creating a release, ensure you have:

- Node.js 16+ installed
- Python 3.8+ installed
- Rust 1.70+ installed
- Git configured
- GitHub CLI installed (optional, for automated releases)

## 🎯 Release Methods

### Method 1: Automated GitHub Actions (Recommended)

The easiest way to create releases is using GitHub Actions:

#### Create a Release via GitHub UI:
1. Go to your repository: https://github.com/cybergenii/repoflow
2. Click on "Releases" → "Create a new release"
3. Create a new tag (e.g., `v1.0.0`)
4. The GitHub Action will automatically build and create the release

#### Create a Release via GitHub CLI:
```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# The GitHub Action will automatically trigger
```

#### Manual Trigger via GitHub UI:
1. Go to "Actions" tab
2. Select "Create Release" workflow
3. Click "Run workflow"
4. Enter version (e.g., `v1.0.0`)
5. Click "Run workflow"

### Method 2: Manual Release Creation

#### Using the Release Scripts:

**Windows:**
```cmd
# Create release v1.0.0
create-release.bat v1.0.0

# Or with custom version
create-release.bat v1.2.3
```

**Linux/macOS:**
```bash
# Make script executable
chmod +x create-release.sh

# Create release v1.0.0
./create-release.sh v1.0.0

# Or with custom version
./create-release.sh v1.2.3
```

**Direct Node.js:**
```bash
# Create release v1.0.0
node create-release.js v1.0.0

# Or with custom version
node create-release.js v1.2.3
```

#### Manual Steps:

1. **Build all packages:**
   ```bash
   # Build TypeScript
   npm run build
   
   # Build React UI
   cd ui && npm run build && cd ..
   
   # Build executables
   node build.js
   
   # Build Python package
   python -m pip install --upgrade pip build twine
   python -m build
   
   # Build Rust package
   cargo build --release
   ```

2. **Create release directory:**
   ```bash
   mkdir release-v1.0.0
   ```

3. **Copy files to release directory:**
   - Copy executables from `dist-packages/`
   - Copy Python packages from `dist/`
   - Copy Rust executable from `target/release/`
   - Copy install scripts

4. **Create platform-specific packages:**
   - Windows: `repoflow-windows.zip`
   - Linux: `repoflow-linux.tar.gz`
   - macOS: `repoflow-macos.tar.gz`

## 📦 Release Contents

Each release includes:

### Platform-Specific Packages
- **repoflow-windows.zip** - Windows executables and installer
- **repoflow-linux.tar.gz** - Linux executable and installer
- **repoflow-macos.tar.gz** - macOS executables and installer

### Individual Executables
- **repoflow-win32-x64.exe** - Windows 64-bit executable
- **repoflow-linux-x64** - Linux 64-bit executable
- **repoflow-darwin-x64** - macOS Intel executable
- **repoflow-darwin-arm64** - macOS Apple Silicon executable

### Package Manager Files
- **Python**: `*.whl` and `*.tar.gz` files
- **NPM**: Available via `npm install -g repoflow`
- **Rust**: Available via `cargo install repoflow`

### Documentation
- **README.md** - Main documentation
- **RELEASE_NOTES.md** - Release-specific notes
- **TERMINAL_USAGE.md** - Terminal usage guide

## 🏷️ Versioning

Follow semantic versioning (SemVer):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

Examples:
- `v1.0.0` - First stable release
- `v1.1.0` - New features added
- `v1.1.1` - Bug fixes
- `v2.0.0` - Breaking changes

## 🚀 Publishing to Package Registries

### NPM (Node.js)
```bash
# Login to NPM
npm login

# Publish
npm publish
```

### PyPI (Python)
```bash
# Install twine
pip install twine

# Upload to PyPI
twine upload dist/*
```

### Crates.io (Rust)
```bash
# Login to crates.io
cargo login

# Publish
cargo publish
```

## 🔧 GitHub Release Settings

When creating a GitHub release:

1. **Tag version**: Use format `v1.0.0`
2. **Release title**: `RepoFlow v1.0.0`
3. **Description**: Copy from `RELEASE_NOTES.md`
4. **Attach files**: Upload all files from release directory
5. **Set as latest**: Check if this is the latest release
6. **Pre-release**: Uncheck for stable releases

## 📋 Release Checklist

Before creating a release:

- [ ] Update version in `package.json`
- [ ] Update version in `pyproject.toml`
- [ ] Update version in `Cargo.toml`
- [ ] Update version in `ui/package.json`
- [ ] Update `CHANGELOG.md` (if exists)
- [ ] Test all builds locally
- [ ] Update documentation
- [ ] Create release notes
- [ ] Tag the release
- [ ] Push to GitHub
- [ ] Publish to package registries

## 🐛 Troubleshooting

### Common Issues:

1. **Build fails**: Check all dependencies are installed
2. **Executables not created**: Ensure `pkg` is installed globally
3. **Python build fails**: Check Python version and dependencies
4. **Rust build fails**: Check Rust toolchain is up to date
5. **GitHub Action fails**: Check workflow file syntax

### Getting Help:

- Check the [GitHub Issues](https://github.com/cybergenii/repoflow/issues)
- Review the [GitHub Actions logs](https://github.com/cybergenii/repoflow/actions)
- Check the [Documentation](https://github.com/cybergenii/repoflow#readme)

## 🎉 Example Release Process

```bash
# 1. Update versions
npm version patch  # Updates package.json

# 2. Create release
node create-release.js v1.0.1

# 3. Review files
ls release-v1.0.1/

# 4. Create GitHub release
gh release create v1.0.1 --title "RepoFlow v1.0.1" --notes-file release-v1.0.1/RELEASE_NOTES.md release-v1.0.1/*

# 5. Publish to registries
npm publish
twine upload dist/*
cargo publish
```

---

**Happy Releasing! 🚀**
