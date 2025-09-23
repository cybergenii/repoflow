# 🚀 RepoFlow - Advanced GitHub Repository Manager

**The ultimate tool for GitHub repository management with advanced commit graph manipulation, automated repository creation, and a beautiful web interface.**

[![npm version](https://badge.fury.io/js/repoflow.svg)](https://badge.fury.io/js/repoflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

### 🎯 **Advanced CLI Commands**
- **Auto Mode**: Automatically detect directory, create repo if needed, and push with advanced features
- **Smart Repository Detection**: Automatically detects if directory has git or creates new repository
- **Commit Graph Manipulation**: Backdate commits, create multiple commits, spread over time
- **Interactive Mode**: Guided step-by-step repository management
- **Directory Selection**: Work with any directory as source
- **Repository Selection**: Fetch and select from your existing repositories

### 🌐 **Web UI Features**
- **Modern React Interface**: Beautiful, responsive web UI
- **Directory Browser**: Select any directory as source
- **Repository Management**: View and select from your GitHub repositories
- **Advanced Commit Options**: Set custom dates, spread commits over time
- **Real-time Status**: Live repository status and commit information
- **Settings Management**: Configure GitHub token, username, and email

### 🔧 **Advanced Features**
- **Multiple Commit Creation**: Create multiple commits for better graph presence
- **Time Spreading**: Spread commits over hours/days for realistic patterns
- **Backdating**: Set custom commit dates for historical commits
- **Auto-Repository Creation**: Automatically create GitHub repositories
- **Smart Commit Messages**: Auto-generate contextual commit messages
- **Cross-Platform**: Works on Windows, Linux, and macOS

## 🚀 Quick Start

## 📁 Project Structure

RepoFlow is organized into clear, logical directories:

```
repoflow/
├── 📁 scripts/          # All shell scripts and batch files
├── 📁 docs/            # Individual script documentation  
├── 📁 examples/        # Example usage scripts
├── 📁 config/          # Configuration files
├── 📁 src/             # Source code (TypeScript, Python, Rust)
├── 📁 ui/              # React web interface
├── 📁 tests/           # Test files
└── 📄 README.md        # This file
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed organization.

### Installation

```bash
# Install globally
npm install -g repoflow@latest

# Or use npx (no installation required)
npx repoflow@latest --help
```

### Configuration

#### **Getting Your GitHub Personal Access Token**

1. **Go to GitHub Settings**:
   - Visit: https://github.com/settings/tokens
   - Or: GitHub Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Create New Token**:
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a descriptive name: "RepoFlow CLI"
   - Set expiration (recommended: 90 days or No expiration)
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (Upload packages to GitHub Package Registry)
     - ✅ `delete:packages` (Delete packages from GitHub Package Registry)

3. **Copy the Token**:
   - Copy the generated token (starts with `ghp_`)
   - **Important**: Save it securely - you won't see it again!

#### **Configure RepoFlow**

```bash
# Set up your GitHub credentials
repoflow-js config --token YOUR_GITHUB_TOKEN
repoflow-js config --username your-username
repoflow-js config --email your-email@example.com

# View current configuration
repoflow-js config --show
```

#### **Web UI Configuration**

When you first start the web UI, you'll be prompted to configure your GitHub credentials:

1. **GitHub Personal Access Token**: Enter your token from the steps above
2. **GitHub Username**: Your GitHub username
3. **Email Address**: Your email address (used for Git commits)

The web UI will guide you through this process with helpful links to GitHub settings.

## 📖 Usage

### 🎯 **Auto Mode (Recommended)**

The `auto` command is the most powerful feature - it automatically handles everything:

```bash
# Basic auto-push (detects directory, creates repo if needed)
repoflow-js auto

# With specific directory and repository
repoflow-js auto --dir /path/to/project --repo my-awesome-project

# With advanced commit manipulation
repoflow-js auto --repo my-project --multiple 5 --spread 24 --date "2024-01-15"

# Create private repository
repoflow-js auto --repo my-private-project --private

# Force commit even if no changes
repoflow-js auto --repo my-project --force
```

### 🔨 **Create Repository**

```bash
# Create a new repository
repoflow-js create my-new-project

# Create private repository
repoflow-js create my-private-project --private

# Create with custom directory
repoflow-js create my-project --dir /path/to/source

# Create with multiple commits and backdating
repoflow-js create my-project --multiple 3 --spread 12 --date "2024-01-01"
```

### 📤 **Push Changes**

```bash
# Push current changes
repoflow-js push

# Push with custom message and date
repoflow-js push --message "Add new features" --date "2024-01-15"

# Push with multiple commits
repoflow-js push --multiple 3 --spread 6

# Force push
repoflow-js push --force
```

### 📊 **Status & Information**

```bash
# Show repository status
repoflow-js status

# Show status for specific directory
repoflow-js status --dir /path/to/project
```

### 🎮 **Interactive Mode**

```bash
# Guided interactive mode
repoflow-js interactive
```

### 🌐 **Web UI**

```bash
# Start web interface
repoflow-js ui

# Start on custom port
repoflow-js ui --port 3001

# Start and open browser
repoflow-js ui --open
```

## 🎨 Web UI Features

### **Dashboard**
- Overview of all your repositories
- Quick access to recent projects
- Repository statistics and insights

### **Repository Management**
- **Directory Selection**: Browse and select any directory as source
- **Repository List**: View all your GitHub repositories
- **Repository Creation**: Create new repositories directly from UI
- **Repository Selection**: Choose existing repository to update

### **Advanced Commit Options**
- **Custom Dates**: Set specific commit dates with date picker
- **Time Spreading**: Configure how commits are spread over time
- **Multiple Commits**: Set number of commits to create
- **Backdating**: Enable/disable commit backdating
- **Force Mode**: Force commits even without changes

### **Real-time Monitoring**
- Live repository status
- Commit history visualization
- Push progress tracking
- Error handling and reporting

## 📋 Command Reference

### **Auto Command**
```bash
repoflow-js auto [options]

Options:
  -d, --dir <directory>        Target directory (default: current)
  -r, --repo <name_or_url>     Repository name or full URL
  -m, --message <message>      Commit message (auto-generated if not provided)
  -t, --date <date>            Commit date (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)
  -p, --private                Create private repository
  -f, --force                  Force commit even if no changes detected
  --backdate                   Enable advanced backdating
  --multiple <count>           Create multiple commits (default: 1)
  --spread <hours>             Spread commits over hours (default: 0)
  --open                       Open browser automatically
```

### **Create Command**
```bash
repoflow-js create <name> [options]

Options:
  -p, --private                Create private repository
  -d, --dir <directory>        Target directory (default: current)
  -m, --message <message>      Initial commit message
  -t, --date <date>            Commit date
  --backdate                   Enable backdating
  --multiple <count>           Create multiple commits (default: 1)
  --spread <hours>             Spread commits over hours (default: 0)
```

### **Push Command**
```bash
repoflow-js push [options]

Options:
  -d, --dir <directory>        Target directory (default: current)
  -m, --message <message>      Commit message
  -t, --date <date>            Commit date
  --backdate                   Enable backdating
  --multiple <count>           Create multiple commits (default: 1)
  --spread <hours>             Spread commits over hours (default: 0)
  --force                      Force push
```

### **Status Command**
```bash
repoflow-js status [options]

Options:
  -d, --dir <directory>        Target directory (default: current)
```

### **Config Command**
```bash
repoflow-js config [options]

Options:
  --token <token>              Set GitHub token
  --username <username>        Set GitHub username
  --email <email>              Set email address
  --show                       Show current configuration
```

### **UI Command**
```bash
repoflow-js ui [options]

Options:
  -p, --port <port>            Port number (default: 3000)
  -h, --host <host>            Host address (default: localhost)
  --open                       Open browser automatically
```

## 🔧 Advanced Usage Examples

### **Create a Project with Historical Commits**
```bash
# Create a project with commits spread over the last month
repoflow-js auto --repo my-project --multiple 10 --spread 720 --date "2024-01-01"
```

### **Backdate Existing Project**
```bash
# Add commits with specific dates
repoflow-js push --date "2024-01-15" --multiple 3 --spread 24
```

### **Work with Existing Repository**
```bash
# Use existing repository URL
repoflow-js auto --repo https://github.com/username/existing-repo.git
```

### **Interactive Setup**
```bash
# Guided setup for complex scenarios
repoflow-js interactive
```

## 🌐 Web UI Usage

### **Access the Web Interface**
1. Start the UI: `repoflow-js ui --open`
2. Open your browser to `http://localhost:3000`
3. Configure your GitHub token in settings
4. Select a directory as source
5. Choose or create a repository
6. Configure commit options (dates, spread, multiple commits)
7. Execute the operation

### **Web UI Features**
- **Repository Browser**: View all your GitHub repositories
- **Directory Picker**: Select any local directory as source
- **Date Picker**: Set custom commit dates with calendar
- **Time Controls**: Configure commit spreading over time
- **Real-time Status**: Monitor operations in real-time
- **Settings Panel**: Manage GitHub credentials and preferences

## 🛠️ Development

### **Prerequisites**
- Node.js 20+
- npm or yarn
- Git

### **Installation**
```bash
# Clone the repository
git clone https://github.com/cybergenii/repoflow.git
cd repoflow

# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev
```

### **Available Scripts**
```bash
npm run build          # Build TypeScript and UI
npm run build:ui       # Build React UI only
npm run dev            # Start development server
npm run test           # Run tests
npm run lint           # Run linter
```

## 📦 Package Structure

```
repoflow/
├── src/                    # TypeScript source
│   ├── cli.ts             # Main CLI implementation
│   ├── services/          # Core services
│   │   ├── git.ts         # Git operations
│   │   └── github.ts      # GitHub API
│   ├── utils/             # Utilities
│   │   ├── config.ts      # Configuration management
│   │   └── commit-messages.ts
│   └── types/             # TypeScript definitions
├── ui/                    # React web interface
│   ├── src/
│   │   ├── App.tsx        # Main React app
│   │   ├── pages/         # UI pages
│   │   └── components/    # React components
│   └── dist/              # Built UI assets
├── dist/                  # Compiled JavaScript
└── package.json
```

## 🔒 Security

- GitHub tokens are stored locally in `~/.repoflow/config.json`
- Tokens are never transmitted to external servers except GitHub API
- All operations are performed locally on your machine
- No data is collected or stored by RepoFlow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js) for CLI
- React UI with [Vite](https://vitejs.dev/) and [Tailwind CSS](https://tailwindcss.com/)
- GitHub API integration
- Inspired by advanced Git workflow automation

## 📚 Documentation & Scripts

### **Main Documentation**
- **[Complete README](https://github.com/cybergenii/repoflow#readme)** - Full feature documentation and usage guide
- **[Terminal Usage Guide](https://github.com/cybergenii/repoflow/blob/main/TERMINAL_USAGE.md)** - Command-line interface examples
- **[Command Conflict Resolution](https://github.com/cybergenii/repoflow/blob/main/COMMAND_CONFLICT_RESOLUTION.md)** - Troubleshooting guide

### **Original Scripts**
- **[Advanced Script (adv.sh)](https://github.com/cybergenii/repoflow/blob/main/adv.sh)** - Original bash script with all features
- **[Complex Commit Script](https://github.com/cybergenii/repoflow/blob/main/complex_commit.sh)** - Advanced commit manipulation
- **[Simple Script (ad.sh)](https://github.com/cybergenii/repoflow/blob/main/ad.sh)** - Basic repository management

### **Example Scripts**
- **[Run Examples (Linux/Mac)](https://github.com/cybergenii/repoflow/blob/main/run-examples.sh)** - Example usage scripts
- **[Run Examples (Windows)](https://github.com/cybergenii/repoflow/blob/main/run-examples.bat)** - Windows batch examples

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/cybergenii/repoflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cybergenii/repoflow/discussions)
- **Documentation**: [Wiki](https://github.com/cybergenii/repoflow/wiki)

---

**Made with ❤️ by [cybergenii](https://github.com/cybergenii)**