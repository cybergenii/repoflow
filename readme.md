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
- **Account Management**: Login, logout, and switch between GitHub accounts easily

### 🌐 **Web UI Features**
- **Modern React Interface**: Beautiful, responsive web UI
- **Directory Browser**: Select any directory as source
- **Repository Management**: View and select from your GitHub repositories
- **Advanced Commit Options**: Set custom dates, spread commits over time
- **Real-time Status**: Live repository status and commit information
- **Settings Management**: Configure GitHub token, username, and email
- **Logout Feature**: Clear all saved credentials securely

### 🔧 **Advanced Features**
- **Multiple Commit Creation**: Create multiple commits for better graph presence
- **Time Spreading**: Spread commits over hours/days for realistic patterns
- **Backdating**: Set custom commit dates for historical commits
- **Auto-Repository Creation**: Automatically create GitHub repositories
- **Human-Like Commit Messages**: 50+ professional, varied commit messages (no more "Update project (1/10)")
- **Smart Branch Detection**: Automatically detects and uses current branch (master/main/custom)
- **Token-Based Authentication**: Secure push authentication using your GitHub token
- **Upstream Tracking**: Automatically sets upstream branch on first push
- **Remote Origin Management**: Handles missing or misconfigured remotes automatically
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
# Set up your GitHub credentials (all in one command)
repoflow-js config --token YOUR_GITHUB_TOKEN --username your-username --email your-email@example.com

# Or set them individually
repoflow-js config --token YOUR_GITHUB_TOKEN
repoflow-js config --username your-username
repoflow-js config --email your-email@example.com

# View current configuration
repoflow-js config --show

# Logout and clear all configuration
repoflow-js logout
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

### **Logout Command**
```bash
repoflow-js logout

Description:
  Logout and clear all saved configuration including token, username, and email
  
Example:
  repoflow-js logout
  # ✅ Successfully logged out!
  # 🗑️  All saved configuration has been cleared.
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

### **Human-Like Commit Messages**
RepoFlow automatically generates natural, varied commit messages instead of robotic ones:

```bash
# Instead of: "Update project (1/10)", "Update project (2/10)", etc.
# You get:
# ✅ Initial commit
# ✅ Implement user authentication system
# ✅ Add responsive design for mobile
# ✅ Update documentation and README
# ✅ Optimize performance and loading speed
```

50+ different professional commit message templates are used automatically!

### **Backdate Existing Project**
```bash
# Add commits with specific dates
repoflow-js push --date "2024-01-15" --multiple 3 --spread 24
```

### **Work with Existing Repository**
```bash
# Use existing repository URL
repoflow-js auto --repo https://github.com/username/existing-repo.git

# Or work with directory that already has a repo
cd /path/to/existing/project
repoflow-js auto --multiple 5 --spread 12
```

### **Smart Branch Detection**
RepoFlow automatically detects your current branch (main, master, or custom):

```bash
# Works with any branch - no need to specify!
repoflow-js auto --repo my-project
# Automatically detects: master, main, develop, etc.
```

### **Interactive Setup**
```bash
# Guided setup for complex scenarios
repoflow-js interactive
```

### **Account Management**
```bash
# Switch between different GitHub accounts
repoflow-js logout
repoflow-js config --token NEW_TOKEN --username new-user --email new@email.com

# Check current account
repoflow-js config --show
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
- **[Terminal Usage Guide](TERMINAL_USAGE.md)** - Command-line interface examples
- **[Command Conflict Resolution](COMMAND_CONFLICT_RESOLUTION.md)** - Troubleshooting guide
- **[Project Structure](PROJECT_STRUCTURE.md)** - Detailed project organization
- **[Release Guide](RELEASE_GUIDE.md)** - Instructions for creating releases

### **Available Shell Scripts** (`scripts/` directory)

All scripts are located in the `scripts/` directory and provide various automation features:

#### **Repository Management Scripts**
- **`ad.sh`** - Simple automated deployment script
- **`adv.sh`** - Advanced deployment with multiple options
- **`create_repo.sh`** - Create new GitHub repository
- **`commit_repo.sh`** - Commit and push changes
- **`simp_push.sh`** - Simple push script

#### **Complex Operations Scripts**
- **`complex_commit.sh`** - Advanced commit manipulation with backdating
- **`complex_create.sh`** - Complex repository creation with custom options

#### **Documentation Scripts** (`docs/` directory)
Each script has corresponding documentation:
- `docs/ad.md` - Simple deployment documentation
- `docs/adv.md` - Advanced deployment documentation
- `docs/create_repo.md` - Repository creation guide
- `docs/commit_repo.md` - Commit operations guide
- `docs/simp_push.md` - Simple push guide
- `docs/complex_commit.md` - Complex commit guide
- `docs/complex_create.md` - Complex creation guide

#### **Development Scripts**
- **`create-release.sh`** - Create and publish new releases (Linux/Mac)
- **`create-release.bat`** - Create and publish new releases (Windows)
- **`diagnose.sh`** - Diagnostic script for troubleshooting

#### **Example Scripts**
- **`run-examples.sh`** - Example usage scripts (Linux/Mac)
- **`run-examples.bat`** - Example usage scripts (Windows)
- **`repoflow-js.ps1`** - PowerShell wrapper for Windows

### **Using the Scripts**

#### **Linux/macOS**
```bash
# Make script executable
chmod +x scripts/ad.sh

# Run the script
./scripts/ad.sh

# Or run from scripts directory
cd scripts
./ad.sh
```

#### **Windows**
```powershell
# Run PowerShell script
.\scripts\repoflow-js.ps1

# Or run batch file
.\scripts\run-examples.bat
```

### **Script Features**
- ✅ **Automated Repository Creation**: Create repos directly from scripts
- ✅ **Commit Manipulation**: Backdate commits, spread over time
- ✅ **Multiple Commits**: Generate multiple commits automatically
- ✅ **Branch Management**: Handle main/master branches automatically
- ✅ **Error Handling**: Robust error checking and recovery
- ✅ **Interactive Prompts**: Guided setup when needed

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/cybergenii/repoflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cybergenii/repoflow/discussions)
- **Documentation**: [Wiki](https://github.com/cybergenii/repoflow/wiki)

## 📋 Latest Updates

### Version 1.0.25 (Current)
- ✅ **Logout Feature**: Added `logout` command to clear all saved configuration
- ✅ **Account Management**: Easy switching between GitHub accounts
- ✅ **Security Enhancement**: Secure credential management

### Version 1.0.24
- ✅ **Human-Like Commit Messages**: 50+ professional, varied commit messages
- ✅ **No More Robotic Messages**: Eliminates "Update project (1/10)" pattern
- ✅ **Natural Commit History**: Makes your GitHub profile look authentic

### Version 1.0.23
- ✅ **Complete Remote Origin Handling**: Automatically adds missing remote origins
- ✅ **Upstream Branch Tracking**: Uses `-u` flag on first push
- ✅ **Enhanced Branch Detection**: Works with any branch name

### Version 1.0.22
- ✅ **Token-Based Authentication**: Secure push using GitHub token
- ✅ **Multi-Account Support**: Different tokens for different repositories

### Version 1.0.21
- ✅ **Smart Branch Detection**: Automatically detects current branch
- ✅ **No More "refspec main does not match any" Errors**

### Version 1.0.20
- ✅ **Auto-Push Fix**: Fixed commit staging issues
- ✅ **Multiple Commits**: Properly handles multiple commit creation

## 🎯 Roadmap

- [ ] GitHub Actions Integration
- [ ] Commit Analytics Dashboard
- [ ] Team Collaboration Features
- [ ] Custom Commit Message Templates
- [ ] Git Hooks Support
- [ ] Advanced Conflict Resolution

---

**Made with ❤️ by [cybergenii](https://github.com/cybergenii)**