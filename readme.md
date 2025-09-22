# RepoFlow 🚀

A comprehensive GitHub repository management tool with CLI and Web UI support. RepoFlow simplifies GitHub repository operations including creation, commit management, backdating, and automated workflows.

## ✨ Features

- **Repository Management**: Create, configure, and manage GitHub repositories
- **Smart Commits**: Auto-generate commit messages and manage commit history
- **Backdating**: Advanced commit date manipulation for contribution graphs
- **Multiple Commits**: Create realistic commit patterns over time
- **Cross-Platform**: Available as npm, PyPI, Rust, and native executables
- **Web UI**: Modern, responsive web interface for easy management
- **CLI Interface**: Powerful command-line tools for automation
- **Interactive Mode**: User-friendly interactive prompts

## 🚀 Quick Start

### NPM Package
```bash
npm install -g repoflow
repoflow --help
```

### Python Package
```bash
pip install repoflow
repoflow --help
```

### Rust Crate
```bash
cargo install repoflow
repoflow --help
```

### Pre-built Executables
Download from [Releases](https://github.com/cybergenii/repoflow/releases) and run the appropriate installer for your platform.

## 📦 Installation

### NPM (Node.js)
```bash
# Global installation
npm install -g repoflow

# Or use npx
npx repoflow --help
```

### Python (PyPI)
```bash
# Install from PyPI
pip install repoflow

# Or with pipx for isolated installation
pipx install repoflow
```

### Rust (Cargo)
```bash
# Install from crates.io
cargo install repoflow

# Or build from source
git clone https://github.com/cybergenii/repoflow.git
cd repoflow
cargo build --release
```

### Pre-built Executables
1. Download the appropriate executable for your platform from [Releases](https://github.com/cybergenii/repoflow/releases)
2. Run the installer script:
   - **Windows**: `install-windows.bat`
   - **Linux**: `./install-linux.sh`
   - **macOS**: `./install-macos.sh`

## 🎯 Usage

### Command Line Interface

#### Configure RepoFlow
```bash
repoflow config --token YOUR_GITHUB_TOKEN --username cybergenii --email your@email.com
```

#### Create a Repository
```bash
repoflow create my-awesome-repo --description "My awesome project" --private
```

#### Push Changes
```bash
repoflow push --message "Add new features" --multiple 5 --spread 24
```

#### Check Status
```bash
repoflow status
```

#### Interactive Mode
```bash
repoflow interactive
```

### Web UI

Start the web interface:
```bash
repoflow ui
```

Then open http://localhost:3000 in your browser.

### Terminal Usage

After installation, RepoFlow is available as a command-line tool:

```bash
# Check if installed
repoflow --version

# Get help
repoflow --help

# Interactive mode
repoflow interactive

# Start web UI
repoflow ui --open
```

For detailed terminal usage examples, see [TERMINAL_USAGE.md](TERMINAL_USAGE.md).

## 🔧 Configuration

RepoFlow stores configuration in:
- **Windows**: `%USERPROFILE%\.repoflow\config.json`
- **Linux/macOS**: `~/.repoflow/config.json`

### Environment Variables
```bash
export GITHUB_TOKEN=your_token_here
export GITHUB_USERNAME=cybergenii
export GITHUB_EMAIL=your@email.com
export GIT_USER_NAME="Derek Og"
export GIT_USER_EMAIL=your@email.com
```

## 📚 Commands

### Repository Management
- `repoflow create <name>` - Create a new GitHub repository
- `repoflow push` - Push changes to GitHub
- `repoflow status` - Show repository status

### Configuration
- `repoflow config` - Configure RepoFlow settings
- `repoflow interactive` - Run in interactive mode

### Web Interface
- `repoflow ui` - Start the web UI server

## 🎨 Web UI Features (React)

- **Dashboard**: Overview of repository status and quick actions
- **Repository Management**: Create and manage repositories
- **Commit History**: View and manage commit history
- **Settings**: Configure GitHub tokens and preferences
- **Real-time Status**: Live updates of repository status
- **Modern React UI**: Built with React 18, TypeScript, and Tailwind CSS

## 🔄 Advanced Features

### Multiple Commits
Create realistic commit patterns:
```bash
repoflow push --multiple 10 --spread 72 --message "Project development"
```

### Backdating
Manipulate commit dates for contribution graphs:
```bash
repoflow push --backdate --date "2024-01-15" --message "Historical work"
```

### Force Commits
Create empty commits when needed:
```bash
repoflow push --force --message "Update repository"
```

## 🛠️ Development

### Prerequisites
- Node.js 16+ (for TypeScript/JavaScript)
- Python 3.8+ (for Python package)
- Rust 1.70+ (for Rust crate)
- Git

### Building from Source

#### TypeScript/JavaScript
```bash
git clone https://github.com/cybergenii/repoflow.git
cd repoflow
npm install
npm run build
npm run dev
```

#### Python
```bash
git clone https://github.com/cybergenii/repoflow.git
cd repoflow
pip install -e .
```

#### Rust
```bash
git clone https://github.com/cybergenii/repoflow.git
cd repoflow
cargo build --release
```

### Building Executables
```bash
# Build for all platforms
node build.js

# Or build specific platform
npx pkg dist/cli.js --targets node18-win-x64 --output repoflow.exe
```

## 📋 API Reference

### GitHub Service
- `createRepository(config)` - Create a new repository
- `getRepository(owner, repo)` - Get repository information
- `validateToken()` - Validate GitHub token

### Git Service
- `initRepository(branch)` - Initialize git repository
- `addFiles(files)` - Add files to staging
- `commit(options)` - Create commit with options
- `push(options)` - Push changes to remote
- `getStatus()` - Get repository status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GitHub API for repository management
- Git for version control operations
- All contributors and users

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/cybergenii/repoflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cybergenii/repoflow/discussions)
- **Documentation**: [Wiki](https://github.com/cybergenii/repoflow/wiki)

## 🔗 Links

- **Homepage**: https://github.com/cybergenii/repoflow
- **NPM Package**: https://www.npmjs.com/package/repoflow
- **PyPI Package**: https://pypi.org/project/repoflow/
- **Crates.io**: https://crates.io/crates/repoflow

---

Made with ❤️ by [cybergenii](https://github.com/cybergenii)