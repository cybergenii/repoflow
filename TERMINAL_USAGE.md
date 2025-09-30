# RepoFlow Terminal Usage Guide

## 🚀 How to Run RepoFlow in Terminal

After installing RepoFlow as a package, you can use it in several ways:

### 1. **NPM Package Installation & Usage**

```bash
# Install globally
npm install -g repoflow

# Or use with npx (no installation required)
npx repoflow --help
```

**Available Commands:**
```bash
# Configure RepoFlow
repoflow config --token YOUR_GITHUB_TOKEN --username cybergenii --email your@email.com

# Create a new repository
repoflow create my-awesome-repo --description "My awesome project" --private

# Push changes
repoflow push --message "Add new features" --multiple 5 --spread 24

# Check repository status
repoflow status

# Interactive mode
repoflow interactive

# Start web UI
repoflow ui
```

### 2. **Python Package Installation & Usage**

```bash
# Install from PyPI
pip install repoflow

# Or with pipx for isolated installation
pipx install repoflow
```

**Available Commands:**
```bash
# Configure RepoFlow
repoflow config --token YOUR_GITHUB_TOKEN --username cybergenii --email your@email.com

# Create a new repository
repoflow create my-awesome-repo --description "My awesome project" --private

# Push changes
repoflow push --message "Add new features" --multiple 5 --spread 24

# Check repository status
repoflow status

# Interactive mode
repoflow interactive

# Start web UI
repoflow ui
```

### 3. **Rust Crate Installation & Usage**

```bash
# Install from crates.io
cargo install repoflow

# Or build from source
git clone https://github.com/cybergenii/repoflow.git
cd repoflow
cargo build --release
```

**Available Commands:**
```bash
# Configure RepoFlow
repoflow config --token YOUR_GITHUB_TOKEN --username cybergenii --email your@email.com

# Create a new repository
repoflow create my-awesome-repo --description "My awesome project" --private

# Push changes
repoflow push --message "Add new features" --multiple 5 --spread 24

# Check repository status
repoflow status

# Interactive mode
repoflow interactive

# Start web UI
repoflow ui
```

### 4. **Pre-built Executables**

Download from [GitHub Releases](https://github.com/cybergenii/repoflow/releases) and run:

**Windows:**
```cmd
# Run installer
install-windows.bat

# Or run directly
repoflow.exe --help
```

**Linux:**
```bash
# Run installer
./install-linux.sh

# Or run directly
./repoflow-linux-x64 --help
```

**macOS:**
```bash
# Run installer
./install-macos.sh

# Or run directly
./repoflow-darwin-x64 --help
```

## 🌐 Web UI Usage

### Start the Web UI Server

```bash
# Start on default port (3000)
repoflow ui

# Start on custom port
repoflow ui --port 8080

# Start on all interfaces (accessible from other machines)
repoflow ui --host 0.0.0.0 --port 3000

# Start and open browser automatically
repoflow ui --open
```

### Access the Web UI

Once started, open your browser and go to:
- **Local access**: http://localhost:3000
- **Network access**: http://YOUR_IP:3000 (when using --host 0.0.0.0)

## 🔧 Configuration

### Environment Variables

Set these environment variables for automatic configuration:

```bash
# GitHub Configuration
export GITHUB_TOKEN=your_token_here
export GITHUB_USERNAME=cybergenii
export GITHUB_EMAIL=your@email.com

# Git Configuration
export GIT_USER_NAME="Your Name"
export GIT_USER_EMAIL=your@email.com
```

### Configuration File

RepoFlow stores configuration in:
- **Windows**: `%USERPROFILE%\.repoflow\config.json`
- **Linux/macOS**: `~/.repoflow/config.json`

## 📋 Command Examples

### Basic Repository Operations

```bash
# Create a new repository
repoflow create my-project --description "My awesome project" --private

# Push current changes
repoflow push --message "Initial commit"

# Check repository status
repoflow status

# Push with custom date
repoflow push --message "Backdated work" --date "2024-01-15"
```

### Advanced Features

```bash
# Create multiple commits spread over time
repoflow push --message "Project development" --multiple 10 --spread 72

# Force commit even if no changes
repoflow push --message "Update repository" --force

# Push to specific branch
repoflow push --message "Feature update" --branch feature-branch

# Interactive mode for guided usage
repoflow interactive
```

### Web UI Management

```bash
# Start UI server
repoflow ui

# Start on specific port
repoflow ui --port 8080

# Start and open browser
repoflow ui --open

# Start on all network interfaces
repoflow ui --host 0.0.0.0 --port 3000
```

## 🛠️ Development Mode

### Local Development

```bash
# Clone the repository
git clone https://github.com/cybergenii/repoflow.git
cd repoflow

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Start UI in development mode
npm run dev:ui
```

### Testing

```bash
# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

## 🔍 Troubleshooting

### Common Issues

1. **Command not found**
   - Make sure the package is installed globally
   - Check your PATH environment variable
   - Try using `npx repoflow` instead

2. **Permission denied**
   - On Linux/macOS, you may need to run with `sudo`
   - Check file permissions on the executable

3. **GitHub token issues**
   - Ensure your token has the correct permissions
   - Test the token with `repoflow config --token YOUR_TOKEN`

4. **Web UI not accessible**
   - Check if the port is already in use
   - Try a different port with `--port`
   - Check firewall settings

### Getting Help

```bash
# Show help
repoflow --help

# Show specific command help
repoflow create --help
repoflow push --help
repoflow ui --help
```

## 📚 Additional Resources

- **Documentation**: [GitHub Wiki](https://github.com/cybergenii/repoflow/wiki)
- **Issues**: [GitHub Issues](https://github.com/cybergenii/repoflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cybergenii/repoflow/discussions)

---

**Note**: Replace `cybergenii` with your actual GitHub username in all URLs and commands.
